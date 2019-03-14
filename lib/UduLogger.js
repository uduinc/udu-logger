const Transports = require('./transports/Transports');
const OutputParser = require('./OutputParser');

const UduLogger = function (options) {
  // Main logging object. Contains all transports
  const transports = options.transports || [];
  const parser = new OutputParser(options);

  this.log = (data, metaData) => {
    const defaultResult = parser.parseOutput('log', data, metaData);

    transports.forEach((transport) => {
      if (transport.getParser()) {
        const result = transport.getParser().parseOutput('log', data, metaData);
        transport.log(result);
      } else {
        transport.log(defaultResult);
      }
    });
  };

  this.info = (data, metaData) => {
    const defaultResult = parser.parseOutput('info', data, metaData);

    transports.forEach((transport) => {
      if (transport.getParser()) {
        const result = transport.getParser().parseOutput('info', data, metaData);
        transport.info(result);
      } else {
        transport.info(defaultResult);
      }
    });
  };

  this.warn = (data, metaData) => {
    const defaultResult = parser.parseOutput('warning', data, metaData);

    transports.forEach((transport) => {
      if (transport.getParser()) {
        const result = transport.getParser().parseOutput('warning', data, metaData);
        transport.warn(result);
      } else {
        transport.warn(defaultResult);
      }
    });
  };

  this.error = (data, metaData) => {
    const defaultResult = parser.parseOutput('error', data, metaData);

    transports.forEach((transport) => {
      if (transport.getParser()) {
        const result = transport.getParser().parseOutput('error', data, metaData);
        transport.error(result);
      } else {
        transport.error(defaultResult);
      }
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
