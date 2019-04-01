const fs = require('fs');
const OutputParser = require('../OutputParser');
const udu = require('../loggerUtil');

const File = function (options) {
  const parser = udu.checkOptions(options) && new OutputParser(options);
  const stream = fs.createWriteStream(options.filePath);
  let level = udu.setLevel(options.level);

  this.log = async (data) => {
    try {
      stream.write(`${data}\n`);
      return data;
    } catch (error) {
      console.log('File logging error: ', error);
      throw error;
    }
  };

  this.setLevel = (value) => {
    level = value;
  };

  this.getLevel = () => level;

  this.getParser = () => parser;
};

module.exports = File;
