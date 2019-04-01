const elasticsearch = require('elasticsearch');
const bodybuilder = require('bodybuilder');
const OutputParser = require('../OutputParser');
const udu = require('../loggerUtil');

/*
const addQuery = (body, query) => {
  if (query.exact) {
    if (query.not) {
      body.notQuery('match', query.key, query.value);
      return;
    }
    body.orQuery('match', query.key, query.value);
  } else {
    if (query.not) {
      body.notQuery('wildcard', query.key, `*${query.value}*`);
      return;
    }
    body.orQuery('wildcard', query.key, `*${query.value}*`); 
  }
};
*/

const addQuery = (body, query) => {
  if (query.exact) {
    body.orQuery('match', query.key, query.value);
  } else {
    body.orQuery('wildcard', query.key, `*${query.value}*`);
  }
};

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
    queries.forEach((query) => {
      if (query.exact) {
        addExactQuery(body, query);
      } else {
        addContainsQuery(body, query);
      }
    });
    body = body.build();
    console.log('BODY: ', JSON.stringify(body));
    const response = await client.search({
      index,
      type: '_doc',
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
