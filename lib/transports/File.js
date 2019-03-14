const fs = require('fs');
const OutputParser = require('../OutputParser');

const File = function (options) {
  const parser = options.metaConfig && new OutputParser(options.metaConfig);
  const stream = fs.createWriteStream(options.filePath);

  this.log = (data) => {
    try {
      stream.write(`${data}\n`);
    } catch (error) {
      console.log('File logging error: ', error);
      throw error;
    }
  };

  this.info = (data) => {
    try {
      stream.write(`${data}\n`);
    } catch (error) {
      console.log('File logging error: ', error);
      throw error;
    }
  };

  this.warn = (data) => {
    try {
      stream.write(`${data}\n`);
    } catch (error) {
      console.log('File logging error: ', error);
      throw error;
    }
  };

  this.error = (data) => {
    try {
      stream.write(`${data}\n`);
    } catch (error) {
      console.log('File logging error: ', error);
      throw error;
    }
  };

  this.getParser = () => parser;
};

module.exports = File;
