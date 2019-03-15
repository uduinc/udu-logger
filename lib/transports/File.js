const fs = require('fs');
const OutputParser = require('../OutputParser');
const levels = require('../Levels');

const File = function (options) {
  const parser = options.metaConfig && new OutputParser(options.metaConfig);
  const stream = fs.createWriteStream(options.filePath);
  let level = options.level || 'log';

  this.log = (data, logLevel) => {
    if (!levels.checkLevel(logLevel, level)) {
      return;
    }

    try {
      stream.write(`${data}\n`);
    } catch (error) {
      console.log('File logging error: ', error);
      throw error;
    }
  };

  this.setLevel = (value) => {
    level = value;
  };

  this.getParser = () => parser;
};

module.exports = File;
