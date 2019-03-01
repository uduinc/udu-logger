const log = require('../index');


const dataLogger = log.createUduLogger({
  filePath: 'test/logs/data.txt'
});
const errorLogger = log.createUduLogger({
  filePath: 'test/logs/error.txt'
});


setTimeout(async () => {
  dataLogger.logOutput('success');
}, 500);
errorLogger.logOutput('error');
errorLogger.logOutput('bad error');
dataLogger.logOutput('success-2');

dataLogger.logOutput('success-3');
