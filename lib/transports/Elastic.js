const elasticsearch = require('elasticsearch');
const OutputParser = require('../OutputParser');
const levels = require('../Levels');

const Elastic = function (options) {
  const parser = options.metaConfig && new OutputParser(options.metaConfig);
  let level = levels.setLevel(options.level);

  const client = new elasticsearch.Client({
    host: options.host,
    log: 'error',
    apiVersion: '6.6'
  });

  this.log = async (data, logLevel) => {
    if (!levels.checkLevel(logLevel, level)) {
      return;
    }

    await client.index({
      index: options.index,
      type: options.type,
      body: data
    });
  };

  this.setLevel = (value) => {
    level = value;
  };

  this.getParser = () => parser;
};

module.exports = Elastic;
