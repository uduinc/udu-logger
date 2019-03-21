const elasticsearch = require('elasticsearch');
const OutputParser = require('../OutputParser');
const udu = require('../loggerUtil');

const Elastic = function (options) {
  const parser = udu.checkOptions(options) && new OutputParser(options);
  let level = udu.setLevel(options.level);

  const client = new elasticsearch.Client({
    host: options.host,
    log: 'error',
    apiVersion: '6.6'
  });

  this.log = async (data, logLevel) => {
    if (!udu.checkLevel(logLevel, level)) {
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
