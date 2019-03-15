const Transports = require('./transports/Transports');
const OutputParser = require('./OutputParser');
const levels = require('./Levels');

const UduLogger = function (options) {
  // Main logging object. Contains all transports
  const transports = options.transports || [];
  const parser = new OutputParser(options);
  let level = options.level || 'log';

  this.log = (data, metaData) => {
    const defaultResult = parser.parseOutput('log', data, metaData);

    if (!levels.checkLevel('log', level)) {
      return;
    }

    transports.forEach((transport) => {
      if (transport.getParser()) {
        const result = transport.getParser().parseOutput('log', data, metaData);
        transport.log(result, 'log');
      } else {
        transport.log(defaultResult, 'log');
      }
    });
  };

  this.info = (data, metaData) => {
    const defaultResult = parser.parseOutput('info', data, metaData);

    if (!levels.checkLevel('info', level)) {
      return;
    }

    transports.forEach((transport) => {
      if (transport.getParser()) {
        const result = transport.getParser().parseOutput('info', data, metaData);
        transport.log(result, 'info');
      } else {
        transport.log(defaultResult, 'info');
      }
    });
  };

  this.warn = (data, metaData) => {
    const defaultResult = parser.parseOutput('warning', data, metaData);

    if (!levels.checkLevel('warning', level)) {
      return;
    }

    transports.forEach((transport) => {
      if (transport.getParser()) {
        const result = transport.getParser().parseOutput('warning', data, metaData);
        transport.log(result, 'warning');
      } else {
        transport.log(defaultResult, 'warning');
      }
    });
  };

  this.error = (data, metaData) => {
    const defaultResult = parser.parseOutput('error', data, metaData);

    if (!levels.checkLevel('error', level)) {
      return;
    }

    transports.forEach((transport) => {
      if (transport.getParser()) {
        const result = transport.getParser().parseOutput('error', data, metaData);
        transport.log(result, 'error');
      } else {
        transport.log(defaultResult, 'error');
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

  this.setLevel = (value) => {
    level = value;
  };
};


UduLogger.createUduLogger = (options) => {
  if (options.level && !(options.level in levels.levels)) {
    console.error(Error('ERROR - Given level is not valid.'));
  }
  if (!options.transports || options.transports.length === 0) {
    console.warn('WARNING - No transports supplied.');
  }
  const logger = new UduLogger(options);

  return logger;
};

UduLogger.Transports = Transports;

module.exports = UduLogger;
