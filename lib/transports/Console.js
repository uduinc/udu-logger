const OutputParser = require('../OutputParser');

const Console = function (options) {
  const parser = options.metaConfig && new OutputParser(options.metaConfig);

  this.log = (data) => {
    console.log(data);
  };

  this.info = (data) => {
    console.info(data);
  };

  this.warn = (data) => {
    console.warn(data);
  };

  this.error = (data) => {
    console.error(data);
  };

  this.getParser = () => parser;
};

module.exports = Console;
