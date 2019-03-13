const moment = require('moment');

const OutputParser = function (tf, defaultMD) {
  let timeFormat = tf || 'MM/DD/YYYY kk:mm:ss.SS';
  let defaultMetaData = defaultMD;

  this.parseOutput = (level, data, metaData) => {
    let result = {
      time: moment().format(timeFormat), // 'MM/DD/YYYY kk:mm:ss.SS'
      level,
      defaultMetaData,
      metaData,
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
