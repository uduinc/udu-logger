const elasticsearch = require('elasticsearch');
const bodybuilder = require('bodybuilder');
const OutputParser = require('../OutputParser');
const udu = require('../loggerUtil');

const addQueryStringQuery = (body, query) => {
  const data = {
    query: query.query_string || '*',
    default_operator: 'AND'
  };
  if (query.field) {
    data.fields = [query.field];
  }
  if (query.and){
    body.query('simple_query_string', data);
  } else {
    body.orQuery('simple_query_string', data);
  }
  return body;
};

const addExactQuery = (body, query) => {
  if (query.not) {
    body.notQuery('term', `${query.key}.keyword`, query.value);
  } else {
    if (query.and) {
      body.query('term', `${query.key}.keyword`, query.value);
    } else {
      body.orQuery('term', `${query.key}.keyword`, query.value);
    }
  }
  return body;
};

const addContainsQuery = (body, query) => {
  if (query.not) {
    body.notQuery('wildcard', `${query.key}.keyword`, `*${query.value}*`);
    body.notQuery('term', `${query.key}.keyword`, query.value);
  } else {
    if (query.and) {
      const tmp = { ...query };
      delete tmp.and;
      return body.query('bool', b => addContainsQuery(b, tmp));
    }
    body.orQuery('wildcard', `${query.key}.keyword`, `*${query.value}*`);
    body.orQuery('term', `${query.key}.keyword`, query.value);
  }
  return body;
};

const addTimeQuery = (body, query) => {
  let startTime;
  let endTime;
  if (query.start) {
    startTime = new Date(query.start).toISOString();
  } else {
    startTime = 'now-1d/d';
  }
  if (query.end) {
    endTime = new Date(query.end).toISOString();
  } else {
    endTime = 'now/d';
  }

  if (query.not) {
    body.notQuery('range', 'time', { gte: startTime, lte: endTime });
  } else if (query.and) {
    body.query('range', 'time', { gte: startTime, lte: endTime });
  } else {
    body.orQuery('range', 'time', { gte: startTime, lte: endTime });
  }
  return body;
};

const addExistsQuery = (body, key) => {
  body.filter( 'exists', 'field', key );
  return body;
};

const nestedOrQuery = (body, queries) => {
  // eslint-disable-next-line no-use-before-define
  body.orQuery('bool', b => buildQuery(b, queries));
  return body;
};

const nestedAndQuery = (body, queries) => {
  // eslint-disable-next-line no-use-before-define
  body.query('bool', b => buildQuery(b, queries));
  return body;
};

const nestedNotQuery = (body, queries) => {
  // eslint-disable-next-line no-use-before-define
  body.notQuery('bool', b => buildQuery(b, queries));
  return body;
};

const buildQuery = (body, queries) => {
  if (queries.length <= 0) {
    return;
  }
  const query = queries[ 0 ];

  if (query.hasOwnProperty( 'query_string' ) ) {
    addQueryStringQuery(body, query);
  } else if (query.not && Array.isArray(query.not)) {
    nestedNotQuery(body, query.not);
  } else if (query.and && Array.isArray(query.and)) {
    nestedAndQuery(body, query.and);
  } else if (query.or && Array.isArray(query.or)) {
    nestedOrQuery(body, query.or);
  } else if (query.exists) {
    addExistsQuery(body,query.exists);
  } else if (query.time) {
    addTimeQuery(body, query.time);
  } else if (query.exact) {
    addExactQuery(body, query);
  } else {
    addContainsQuery(body, query);
  }

  buildQuery(body, queries.slice(1));
  return body;
};

const sleep = time => new Promise( resolve => setTimeout( resolve, time ) );

const Elastic = function (options) {
  const parser = udu.checkOptions(options) && new OutputParser(options);
  let level = udu.setLevel(options.level);
  let index = options.index || '';
  let searchIndex = options.searchIndex || null;

  const client = new elasticsearch.Client({
    host: options.host,
    log: 'error',
    apiVersion: '6.6'
  });

  let queryQueueSize = 0;
  const queryQueueMax = 10;
  const queryBacklog = [];
  const addToBacklog = ( func, args ) => {
    return new Promise( ( resolve, reject ) => {
      queryBacklog.push( { func, args, resolve, reject } );
    });
  };
  const runFromBacklog = async ( ) => {
    const next = queryBacklog.pop( );
    if ( next ) {
      try {
        next.resolve( await runQuery( next.func, next.args, true ) );
      } catch ( err ) {
        next.reject( err );
      }
    }
  };

  const runQuery = async ( func, args, SKIP_QUEUE ) => {
    if ( !SKIP_QUEUE && queryQueueSize >= queryQueueMax ) {
      return addToBacklog( func, args );
    } else {
      queryQueueSize++;

      const runQueryInternal = async ( func, args, retryCount ) => {
        retryCount = retryCount || 0;

        try {
          return await func.apply( client, args );
        } catch ( err ) {
          if ( err && err.displayName === 'RequestTimeout' && retryCount < 7 ) {
            // retry: 2s, 4s, 8s, 16s...
            await sleep( Math.pow( 2, retryCount ) * 2000 );
            return runQueryInternal( func, args, retryCount+1 );
          } else {
            throw err;
          }
        }
      };

      try {
        return await runQueryInternal( func, args );
      } finally {
        queryQueueSize--;
        runFromBacklog( );
      }
    }
  };

  let flushResolve;
  let flushReject;
  let flushPromise;
  const resetFlushPromise = ( ) => {
    flushPromise = new Promise( ( resolve, reject ) => {
      flushResolve = resolve;
      flushReject = reject;
    });
  };
  resetFlushPromise( );

  const flushInternal = async ( buf ) => {
    try {
      await runQuery( client.bulk, [{
        index: index,
        type: options.type,
        requestTimeout: 120000,
        body: buf
      }]);
    } catch ( err ) {
      if ( buf.length > 2 && err.message === 'Request Entity Too Large' ) {
        // try again, splitting in half
        // divide by 4, ceil, then multiply by 2 so both arrays are always even numbers
        // ( so we don't split operations in half since each op is 2 elements )
        await flushInternal( buf.splice( 0, Math.ceil( buf.length / 4 ) * 2 ) );
        await flushInternal( buf );
      } else {
        throw err;
      }
    }
  }

  let logBuffer = [];

  this.flush = async ( ) => {
    if ( logBuffer.length ) {
      // console.log( 'Flushing', logBuffer.length/2, 'logs' );
      const tmp = logBuffer;
      logBuffer = [];

      try {
        await flushInternal( tmp );
        flushResolve( );
      } catch ( err ) {
        flushReject( err );
        throw err;
      } finally {
        resetFlushPromise( );
      }
    }
  };

  setInterval( async ( ) => {
    try {
      await this.flush( );
    } catch ( err ) {
      console.error( 'Error flushing logs to Elasticsearch:', err );
    }
  }, 200 );

  this.log = (data) => {
    logBuffer[ logBuffer.length ] = { index: {} };
    logBuffer[ logBuffer.length ] = data;

    return flushPromise;
  };

  this.search = async (queries, size, from) => {
    // Send array as arguments, loop through
    let body = bodybuilder();
    buildQuery(body, queries);
    body = body.build();
    if (size) {
      body.size = size;
    }
    if (from) {
      body.from = from;
    }
    // console.log('BODY: ', JSON.stringify(body, null, 2));

    const response = await client.search({
      index: searchIndex || index,
      type: options.type,
      body,
      sort: 'time:desc',
      requestTimeout: 120000
    });
    return response;
  };

  this.count = async (queries, max) => {
    let body = bodybuilder();
    buildQuery(body, queries);
    body = body.build();

    const opts = {
      index: searchIndex || index,
      type: options.type,
      body,
      requestTimeout: 120000
    };

    if ( max > 0 ) {
      opts.terminate_after = max;
    }

    const response = await client.count(opts);
    return response.count;
  }

  this.getUniqueValues = (queries, field, size) => {
    let body = bodybuilder();
    let q = [{exists: field}];
    if (Array.isArray(queries) && queries.length) {
      q = [ ...queries, { and: q }];
    }
    buildQuery(body, q);
    body = body.build();

    body._source = '';
    body.collapse = {
      field: `${field}.keyword`
    };
    if (size) {
      body.size = size;
    }

    return client.search({
      index: searchIndex || index,
      type: options.type,
      body,
      requestTimeout: 120000
    });
  };

  this.createIndex = async (name) => {
    try {
      const output = await client.indices.create({
        index: name
      });
      index = name;
      return output;
    } catch (error) {
      // console.error('Create index error: '  error);
      throw error;
    }
  };

  this.deleteIndex = async (name) => {
    try {
      const output = await client.indices.delete({
        index: name
      });
      return output;
    } catch (error) {
      // console.error('Delete index error: ', error);
      throw error;
    }
  };

  this.setLevel = (value) => {
    level = value;
  };

  this.getLevel = () => level;

  this.getParser = () => parser;
};

module.exports = Elastic;
