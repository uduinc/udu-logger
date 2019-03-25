const Transports = require('./transports/Transports');
const OutputParser = require('./OutputParser');
const udu = require('./loggerUtil');

const UduLogger = function (options) {
  // Main logging object. Contains all transports
  const transports = options.transports || [];
  const parser = new OutputParser(options);
  let level = udu.setLevel(options.level);

  this.log = (...data) => {
    this.parseLog('log', data);
  };

  this.info = (...data) => {
    this.parseLog('info', data);
  };

  this.warn = (...data) => {
    this.parseLog('warning', data);
  };

  this.error = (...data) => {
    this.parseLog('error', data);
  };

  this.parseLog = (logLevel, data) => {
    if (!udu.checkLevel(logLevel, level)) {
      return;
    }
    let meta;
    if (data[0].metadata) {
      meta = data.splice(0, 1)[0].metadata;
    }

    transports.forEach((transport) => {
      if (transport.getParser()) {
        const result = transport.getParser().parseOutput(logLevel, meta, data);
        transport.log(result, logLevel);
      } else {
        const result = parser.parseOutput(logLevel, meta, data);
        transport.log(result, logLevel);
      }
    });
  };

  this.getMetaData = () => parser.getMetaData();

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

  this.meta = (meta) => {
    const metadata = Object.assign({}, parser.getMetaData(), meta);
    return UduLogger.createUduLogger({
      level,
      timeFormat: parser.getTimeFormat(),
      transports,
      logLimit: parser.getCapLimit(),
      logLimitLevel: parser.getCapLevel(),
      metadata
    });
  };
};


UduLogger.createUduLogger = (options) => {
  if (!options.transports || options.transports.length === 0) {
    console.warn('WARNING - No transports supplied.');
  }
  const logger = new UduLogger(options);

  return logger;
};

UduLogger.Transports = Transports;

module.exports = UduLogger;
