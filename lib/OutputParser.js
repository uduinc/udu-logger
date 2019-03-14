const moment = require('moment');

const OutputParser = function (config) {
  let timeFormat = config.timeFormat || 'MM/DD/YYYY kk:mm:ss.SS';
  let defaultMetaData = config.metaData;

  this.parseOutput = (level, data, metaData) => {
    const meta = Object.assign({}, defaultMetaData, metaData);
    let result = {
      time: moment().format(timeFormat), // 'MM/DD/YYYY kk:mm:ss.SS'
      level,
      metaData: meta,
      data
    };
    result = JSON.stringify(result);

    return result;
  };

  this.setTimeFormat = (format) => {
    timeFormat = format;
  };

  this.setDefaultMetaData = (metaData) => {
    defaultMetaData = metaData;
  };
};

module.exports = OutputParser;
