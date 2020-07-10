const OutputParser = require('../OutputParser');
const udu = require('../loggerUtil');

const Console = function (options) {
  const parser = udu.checkOptions(options) && new OutputParser(options);
  let level = udu.setLevel(options.level);

  this.log = async (data, logLevel) => {
    switch (logLevel) {
      case 'log':
        console.log(data);
        break;
      case 'info':
        console.info(data);
        break;
      case 'notice':
        console.info(data);
        break;
      case 'warning':
        console.warn(data);
        break;
      case 'error':
        console.error(data);
        break;
      default:
        break;
    }
    return data;
  };

  this.setLevel = (value) => {
    level = value;
  };

  this.getLevel = () => level;

  this.getParser = () => parser;
};

module.exports = Console;
