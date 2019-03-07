// const File = require('./transports/File');
const OutputParser = require('./OutputParser');
const Elastic = require('./transports/Elastic');

const UduLogger = function (options) {
  // Main logging object. Contains rest of codebase
  const transports = options.transports || [];
  const parser = new OutputParser(options);

  this.log = (data) => {
    const result = parser.parseOutput('log', data);
    console.log(result);

    transports.forEach((output) => {
      output.log(result);
    });
  };

  this.info = (data) => {

  };

  this.warn = (data) => {

  };

  this.error = (data) => {
    const result = parser.parseOutput('error', data);
    console.error(result);

    transports.forEach((output) => {
      output.log(result);
    });
  };


  this.createFileOutput = (config) => {
    transports.push(new File(config));
  };

  this.createElastic = (config) => {
    transports.push(new Elastic(config));
  };
};


UduLogger.createUduLogger = (options) => {
  const logger = new UduLogger(options);

  /* if (options.filePath) {
    logger.createFileOutput(options);
  } */

  if (options.elasticConfig) {
    logger.createElastic(options.elasticConfig);
  }

  return logger;
};

UduLogger.transports.File = require('./transports/File');

module.exports = UduLogger;
