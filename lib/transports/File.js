const fs = require('fs');

const File = function (config) {
  const stream = fs.createWriteStream(config.filePath);

  this.log = (data) => {
    try {
      stream.write(`${data}\n`);
    } catch (error) {
      console.log('File log error: ', error);
      throw error;
    }
  };
};

module.exports = File;
