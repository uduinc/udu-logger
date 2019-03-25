const moment = require('moment');
const util = require('util');
const udu = require('./loggerUtil');

const OutputParser = function (config) {
  let timeFormat = config.timeFormat || 'MM/DD/YYYY kk:mm:ss.SS';
  let defaultMetaData = config.metadata;
  let logCap = config.logLimit;
  let logCapLevel = udu.setCapLevel(config.logLimitLevel);

  this.parseOutput = (level, optionalMeta, data) => {
    const meta = Object.assign({}, defaultMetaData, optionalMeta);
    const dataMap = data.map((x) => {
      if (typeof x === 'string') {
        return x;
      }
      return util.inspect(x, { depth: 2 });
    });
    let message = dataMap.join(' ');

    const result = {
      time: moment().format(timeFormat), // 'MM/DD/YYYY kk:mm:ss.SS'
      level,
      metadata: meta,
      message
    };
    if (message.length > logCap) {
      message = `Log of length ${message.length} exceeds cap limit, truncated to ${logCap}.`
        + ` ${message.slice(0, logCap)}`;
      result.level = logCapLevel;
      result.message = message;
    }

    return result;
  };

  this.setTimeFormat = (format) => {
    timeFormat = format;
  };

  this.setMetaData = (metadata) => {
    defaultMetaData = metadata;
  };

  this.setCapLimit = (capLimit) => {
    logCap = capLimit;
  };

  this.setCapLevel = (capLevel) => {
    logCapLevel = capLevel;
  };

  this.getMetaData = () => defaultMetaData;

  this.getTimeFormat = () => timeFormat;

  this.getCapLimit = () => logCap;

  this.getCapLevel = () => logCapLevel;
};


module.exports = OutputParser;
