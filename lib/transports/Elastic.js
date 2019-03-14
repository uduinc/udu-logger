const elasticsearch = require('elasticsearch');
const OutputParser = require('../OutputParser');

const Elastic = function (options) {
  const parser = options.metaConfig && new OutputParser(options.metaConfig);

  const client = new elasticsearch.Client({
    host: options.host,
    log: 'trace',
    apiVersion: '6.6'
  });

  this.log = async (data) => {
    await client.index({
      index: options.index,
      type: options.type,
      body: data
    });
  };

  this.info = async (data) => {
    await client.index({
      index: options.index,
      type: options.type,
      body: data
    });
  };

  this.warn = async (data) => {
    await client.index({
      index: options.index,
      type: options.type,
      body: data
    });
  };

  this.error = async (data) => {
    await client.index({
      index: options.index,
      type: options.type,
      body: data
    });
  };

  this.getParser = () => parser;
};

module.exports = Elastic;
