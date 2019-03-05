const udu = require('../index');


const dataLogger = udu.createUduLogger({
  filePath: 'test/logs/data.txt',
  timeFormat: 'MM/DD/YYYY',
  elasticConfig: {
    host: 'localhost:9200',
    index: 'customer',
    type: 'mytype'
  }
});
const errorLogger = udu.createUduLogger({
  filePath: 'test/logs/error.txt'
});


setTimeout(async () => {
  dataLogger.log('success');
}, 500);
errorLogger.log('error');
errorLogger.log('bad error');
