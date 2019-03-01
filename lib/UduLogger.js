const FileOutput = require('./FileOutput');
const OutputParser = require('./OutputParser');

const UduLogger = function () {
  // Main logging object. Contains rest of codebase
  const outputs = [];

  this.logOutput = (value) => {
    // const result = out.parseOutput(value);
    const result = value;
    console.log(result);

    outputs.forEach((output) => {
      output.log(result);
    });
  };

  this.createFileOutput = (options) => {
    outputs.push(new FileOutput(options));
  };

  this.createOutputParser = (options) => {

  };
};


UduLogger.createUduLogger = (options) => {
  const logger = new UduLogger();

  if (options.filePath) {
    logger.createFileOutput(options);
  }


  return logger;
};

module.exports = UduLogger;
