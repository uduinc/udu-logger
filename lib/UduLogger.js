const FileOutput = require('./transports/FileOutput');
const OutputParser = require('./OutputParser');
const Elastic = require('./transports/Elastic');

const UduLogger = function (options) {
  // Main logging object. Contains rest of codebase
  const outputs = [];
  const parser = new OutputParser(options);


  this.log = (value) => {
    const result = parser.parseOutput(value);
    console.log(result);

    outputs.forEach((output) => {
      output.log(result);
    });
  };

  this.createFileOutput = (config) => {
    outputs.push(new FileOutput(config));
  };

  this.createElastic = (config) => {
    outputs.push(new Elastic(config));
  };
};


UduLogger.createUduLogger = (options) => {
  const logger = new UduLogger(options);

  if (options.filePath) {
    logger.createFileOutput(options);
  }

  if (options.elasticConfig) {
    logger.createElastic(options.elasticConfig);
  }

  return logger;
};

module.exports = UduLogger;
