const Transports = require('./transports/Transports');
const OutputParser = require('./OutputParser');

const UduLogger = function (options) {
  // Main logging object. Contains all transports
  const transports = options.transports || [];
  const parser = new OutputParser(options);

  this.log = (data) => {
    const result = parser.parseOutput('log', data);

    transports.forEach((output) => {
      output.log(result);
    });
  };

  this.info = (data) => {
    const result = parser.parseOutput('info', data);

    transports.forEach((output) => {
      output.log(result);
    });
  };

  this.warn = (data) => {
    const result = parser.parseOutput('warning', data);

    transports.forEach((output) => {
      output.log(result);
    });
  };

  this.error = (data) => {
    const result = parser.parseOutput('error', data);

    transports.forEach((output) => {
      output.log(result);
    });
  };

  this.addTransport = (transport) => {
    transports.push(transport);
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
