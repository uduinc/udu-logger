const elasticsearch = require('elasticsearch');
const bodybuilder = require('bodybuilder');
const OutputParser = require('../OutputParser');
const udu = require('../loggerUtil');

const addExactQuery = (body, query) => {
  if (query.not) {
    body.notQuery('match', query.key, query.value);
  } else {
    if (query.and) {
      body.query('match', query.key, query.value);
      return;
    }
    body.orQuery('match', query.key, query.value);
  }
};

const addContainsQuery = (body, query) => {
  if (query.not) {
    body.notQuery('wildcard', query.key, `*${query.value}*`);
    body.notQuery('match', query.key, `${query.value}`);
  } else {
    if (query.and) {
      body.query('wildcard', query.key, `*${query.value}*`);
      body.query('match', query.key, `${query.value}`);
      return;
    }
    body.orQuery('wildcard', query.key, `*${query.value}*`);
    body.orQuery('match', query.key, `${query.value}`);
  }
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
};

const nestedOrQuery = (body, queries) => {
  // eslint-disable-next-line no-use-before-define
  body.orQuery('bool', b => buildQuery(b, queries));
};

const nestedAndQuery = (body, queries) => {
  // eslint-disable-next-line no-use-before-define
  body.query('bool', b => buildQuery(b, queries));
};

const nestedNotQuery = (body, queries) => {
  // eslint-disable-next-line no-use-before-define
  body.notQuery('bool', b => buildQuery(b, queries));
};

const buildQuery = (body, queries) => {
  if (queries.length <= 0) {
    return;
  }
  const query = queries[0];

  if (query.not && Array.isArray(query.not)) {
    nestedNotQuery(body, query.not);
    return;
  }
  if (query.and && Array.isArray(query.and)) {
    nestedAndQuery(body, query.and);
    return;
  }
  if (query.or && Array.isArray(query.or)) {
    nestedOrQuery(body, query.or);
    return;
  }

  if (query.time) {
    addTimeQuery(body, query.time);
  } else if (query.exact) {
    addExactQuery(body, query);
  } else {
    addContainsQuery(body, query);
  }

  queries.shift();
  buildQuery(body, queries);
  return body;
};

const Elastic = function (options) {
  const parser = udu.checkOptions(options) && new OutputParser(options);
  let level = udu.setLevel(options.level);
  let index = options.index || '';

  const client = new elasticsearch.Client({
    host: options.host,
    log: 'error',
    apiVersion: '6.6'
  });

  this.log = async (data) => {
    const output = await client.index({
      index,
      type: options.type,
      body: data
    });

    return output;
  };

  this.search = async (queries) => {
    // Send array as arguments, loop through
    let body = bodybuilder();
    buildQuery(body, queries);
    body = body.build();
    // console.log('BODY: ', JSON.stringify(body, null, 2));

    const response = await client.search({
      index,
      type: options.type,
      body
    });
    return response;
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
