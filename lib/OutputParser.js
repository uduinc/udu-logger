const moment = require('moment');
const util = require('util');
const udu = require('./loggerUtil');

const OutputParser = function (config) {
  // let timeFormat = config.timeFormat || 'MM/DD/YYYY kk:mm:ss.SS';
  const timeFormat = 'MM/DD/YYYYTkk:mm:ss.SSS';
  let metadata = config.metadata;
  let logCap = config.logLimit;
  let logCapLevel = udu.setCapLevel(config.logLimitLevel);

  this.parseOutput = (level, data) => {
    const dataMap = data.map((x) => {
      if (typeof x === 'string') {
        return x;
      }
      return util.inspect(x, { depth: 3 });
    });
    let message = dataMap.join(' ');

    const result = {
      time: new Date().toISOString(), // 'MM/DD/YYYY kk:mm:ss.SS'
      // time: Date.now(),
      level,
      metadata,
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

  /*
  this.setTimeFormat = (format) => {
    timeFormat = format;
  }; */

  this.setMetaData = (metadata) => {
    metadata = metadata;
  };

  this.setCapLimit = (capLimit) => {
    logCap = capLimit;
  };

  this.setCapLevel = (capLevel) => {
    logCapLevel = capLevel;
  };

  this.getMetaData = () => metadata;

  this.getTimeFormat = () => timeFormat;

  this.getCapLimit = () => logCap;

  this.getCapLevel = () => logCapLevel;
};


module.exports = OutputParser;
