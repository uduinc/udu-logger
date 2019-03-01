const moment = require('moment');

const OutputParser = function (options) {
  this.parseOutput = (value) => {
    let result = {
      timeStamp: moment().format(options.timeFormat), // 'MM/DD/YYYY kk:mm:ss.SS'
      info: value
    };
    result = JSON.stringify(result);

    return result;
  };
};

module.exports = OutputParser;
