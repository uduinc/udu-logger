const OutputParser = require('../OutputParser');
const levels = require('../Levels');

const Console = function (options) {
  const parser = options.metadata && new OutputParser(options);
  let level = levels.setLevel(options.level);

  this.log = (data, logLevel) => {
    if (!levels.checkLevel(logLevel, level)) {
      return;
    }

    switch (logLevel) {
      case 'log':
        console.log(data);
        break;
      case 'info':
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
  };

  this.setLevel = (value) => {
    level = value;
  };

  this.getParser = () => parser;
};

module.exports = Console;
