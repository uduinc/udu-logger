const moment = require('moment');

const OutputParser = function (options) {
  const timeFormat = options.timeFormat || 'MM/DD/YYYY kk: mm: ss.SS';

  this.parseOutput = (value) => {
    let result = {
      timeStamp: moment().format(timeFormat), // 'MM/DD/YYYY kk:mm:ss.SS'
      data: value
    };
    result = JSON.stringify(result);

    return result;
  };
};

module.exports = OutputParser;
