const Transports = require('./transports/Transports');
const OutputParser = require('./OutputParser');

const UduLogger = function (options) {
  // Main logging object. Contains all transports
  const transports = options.transports || [];
  const parser = new OutputParser(options.timeFormat, options.defaultMetaData);

  this.log = (data, metaData) => {
    const result = parser.parseOutput('log', data, metaData);

    transports.forEach((transport) => {
      transport.log(result);
    });
  };

  this.info = (data, metaData) => {
    const result = parser.parseOutput('info', data, metaData);

    transports.forEach((transport) => {
      transport.log(result);
    });
  };

  this.warn = (data, metaData) => {
    const result = parser.parseOutput('warning', data, metaData);

    transports.forEach((transport) => {
      transport.log(result);
    });
  };

  this.error = (data, metaData) => {
    const result = parser.parseOutput('error', data, metaData);

    transports.forEach((transport) => {
      transport.log(result);
    });
  };

  this.setDefaultMetaData = (config) => {
    parser.setDefaultMetaData(config);
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
