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

    if (message.length > logCap) {
      message = `Log of length ${message.length} exceeds cap limit, truncated to ${logCap}.`
        + ` ${message.slice(0, logCap)}`;
    }

    const result = {
      time: moment().format(timeFormat), // 'MM/DD/YYYY kk:mm:ss.SS'
      level,
      metadata: meta,
      message
    };
    // result.level = logCapLevel;

    return result;
  };

  this.setTimeFormat = (format) => {
    timeFormat = format;
  };

  this.setDefaultMetaData = (metadata) => {
    defaultMetaData = metadata;
  };

  this.setCapLimit = (capLimit) => {
    logCap = capLimit;
  };

  this.setCapLevel = (capLevel) => {
    logCapLevel = capLevel;
  };
};


module.exports = OutputParser;


/* this.parseOutputOld = (level, data, metaData) => {
  const meta = Object.assign({}, defaultMetaData, metaData);
  let result = {
    time: moment().format(timeFormat), // 'MM/DD/YYYY kk:mm:ss.SS'
    level,
    metadata: meta,
    data
  };
  result = JSON.stringify(result);

  return result;
}; */
