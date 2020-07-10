const OutputParser = require('../OutputParser');
const udu = require('../loggerUtil');
const cli = require('cli-color');

const origLog = console.log.bind( console );
const origInfo = console.info.bind( console );
const origWarn = console.warn.bind( console );
const origError = console.error.bind( console );

const pad = (str, len, char) => (''+char).repeat(Math.max(0,len-(''+str).length))+str;

const Console = function (options) {
  const parser = udu.checkOptions(options) && new OutputParser(options);
  let level = udu.setLevel(options.level);

  this.formatLevel = (level) => {
    switch (level) {
      case 'log':
        return cli.white('debug');
      case 'info':
        return cli.blue('info');
      case 'notice':
        return cli.yellow('notice');
      case 'warning':
        return cli.xterm(208)('warning');
      case 'error':
        return cli.red('ERROR');
      default:
        return cli.orange('UNKNOWN');
    }
  }

  this.getTimePrefix = (data) => {
    if (options.message_timestamp) {
      const d = new Date( data.time );
      if (options.minimal_timestamp) {
        return '[' + d.toTimeString().split(' ')[0] + '.' + pad(d.getMilliseconds(), 3, '0') + '] ';
      } else {
        return '[' + d.toISOString() + '] ';
      }
    }
    return '';
  }

  this.format = (data) => {
    return `${this.getTimePrefix(data)}${this.formatLevel(data.level)}: ${data.message}`;
  }

  this.log = async (data, logLevel) => {
    switch (logLevel) {
      case 'log':
        origLog(this.format(data));
        break;
      case 'info':
      case 'notice':
        origInfo(this.format(data));
        break;
      case 'warning':
        origWarn(this.format(data));
        break;
      case 'error':
        origError(this.format(data));
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
