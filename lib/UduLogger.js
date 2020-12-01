const Transports = require('./transports/Transports');
const OutputParser = require('./OutputParser');
const udu = require('./loggerUtil');

const UduLogger = function (options) {
  // Main logging object. Contains all transports
  const transports = options.transports || [];
  const parser = new OutputParser(options);
  let level = udu.setLevel(options.level);

  this.log = async (...data) => this.parseLog('log', data);

  this.info = async (...data) => this.parseLog('info', data);

  this.notice = async (...data) => this.parseLog('notice', data);

  this.warn = async (...data) => this.parseLog('warning', data);

  this.error = async (...data) => this.parseLog('error', data);

  this.parseLog = async (logLevel, data) => {
    if (!udu.checkLevel(logLevel, level)) {
      return;
    }

    const output = [];
    transports.forEach((transport) => {
      if (!udu.checkLevel(logLevel, transport.getLevel())) {
        return;
      }
      if (transport.getParser()) {
        const result = transport.getParser().parseOutput(logLevel, data);
        output.push(transport.log(result, logLevel));
      } else {
        const result = parser.parseOutput(logLevel, data);
        output.push(transport.log(result, logLevel));
      }
    });

    // eslint-disable-next-line consistent-return
    return Promise.all(output);
  };

  this.search = async (...args) => {
    const result = [];
    transports.forEach((transport) => {
      if (transport instanceof Transports.Elastic) {
        result.push(transport.search(...args));
      }
    });
    return Promise.all(result);
  };

  this.addTransport = (transport) => {
    transports.push(transport);
  };

  this.setMetaData = (config) => {
    parser.setMetaData(config);
  };

  this.getMetaData = () => parser.getMetaData();

  this.setLevel = (value) => {
    level = value;
  };

  this.getLevel = () => level;

  this.meta = (meta) => {
    // Returns a new logger with identical config, but with updated metadata
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
