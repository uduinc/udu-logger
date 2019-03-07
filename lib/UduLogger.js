const Transports = require('./transports/Transports');
const OutputParser = require('./OutputParser');

const UduLogger = function (options) {
  // Main logging object. Contains all transports
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


  this.createFile = (config) => {
    transports.push(new Transports.File(config));
  };

  this.createElastic = (config) => {
    transports.push(new Transports.Elastic(config));
  };
};


UduLogger.createUduLogger = (options) => {
  const logger = new UduLogger(options);

  return logger;
};

UduLogger.Transports = Transports;

module.exports = UduLogger;
