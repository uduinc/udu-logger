const moment = require('moment');

const OutputParser = function (options) {
  const timeFormat = options.timeFormat || 'MM/DD/YYYY kk: mm: ss.SS';

  this.parseOutput = (level, data) => {
    let result = {
      timeStamp: moment().format(timeFormat), // 'MM/DD/YYYY kk:mm:ss.SS'
      level,
      data
    };
    result = JSON.stringify(result);

    return result;
  };
};

module.exports = OutputParser;
