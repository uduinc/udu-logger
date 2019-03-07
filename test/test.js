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
const logger = udu.createUduLogger({
  timeFormat: 'MM/DD/YYYY',
  filePath: 'test/logs/data.log'
});


/* setTimeout(async () => {
  dataLogger.log('success');
}, 500); */
logger.log('here is some data');
logger.error('data gave error');
// errorLogger.log('bad error');
// dataLogger.log('success - 2');
// dataLogger.log('success - 3');
