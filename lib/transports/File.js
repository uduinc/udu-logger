const fs = require('fs');
const OutputParser = require('../OutputParser');
const levels = require('../Levels');

const File = function (options) {
  const parser = options.metadata && new OutputParser(options);
  const stream = fs.createWriteStream(options.filePath);
  let level = levels.setLevel(options.level);

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
