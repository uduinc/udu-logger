const fs = require('fs');

const FileOutput = function (options) {
  const stream = fs.createWriteStream(options.filePath);

  this.log = (value) => {
    try {
      stream.write(value);
    } catch (error) {
      console.log('File log error: ', error);
      throw error;
    }
  };
};

module.exports = FileOutput;
