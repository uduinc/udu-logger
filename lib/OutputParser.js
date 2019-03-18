const moment = require('moment');
const util = require('util');

const OutputParser = function (config) {
  let timeFormat = config.timeFormat || 'MM/DD/YYYY kk:mm:ss.SS';
  let defaultMetaData = config.metadata;

  this.parseOutput = (level, optionalMeta, data) => {
    const meta = Object.assign({}, defaultMetaData, optionalMeta);
    const dataMap = data.map((x) => {
      if (typeof x === 'string') {
        return x;
      }
      return util.inspect(x, { depth: 3 });
    });
    // console.log(testData);
    const message = dataMap.join(' ');
    // console.log(message);

    let result = {
      time: moment().format(timeFormat), // 'MM/DD/YYYY kk:mm:ss.SS'
      level,
      metadata: meta,
      message
    };
    result = JSON.stringify(result, null, 2);

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
