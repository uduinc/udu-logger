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
      return util.inspect(x, { depth: 2 });
    });
    let message = dataMap.join(' ');
    // message = JSON.stringify(message);
    // console.log(message);
    // message = message.replace(/\n/g, '\n');

    let result = {
      time: moment().format(timeFormat), // 'MM/DD/YYYY kk:mm:ss.SS'
      level,
      metadata: meta,
      message
    };
    // console.log('TEST:', result.message);
    // result = JSON.stringify(result, null, 2);
    // result = result.replace(/\\n/g, '\n');
    // console.log(result);
    // result = JSON.parse(result);
    // console.log(result);
    

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
