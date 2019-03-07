const fs = require('fs');

const File = function (config) {
  const stream = fs.createWriteStream(config.filePath);

  this.log = (value) => {
    try {
      stream.write(`${value}\n`);
    } catch (error) {
      console.log('File log error: ', error);
      throw error;
    }
  };
};

module.exports = File;