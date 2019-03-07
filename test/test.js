const udu = require('../index');

const logger = udu.createUduLogger({
  timeFormat: 'MM/DD/YYYY',
  transports: [
    new udu.Transports.File({ filePath: 'test/logs/data.log' }),
    new udu.Transports.File({ filePath: 'test/logs/errors.log' }),
  ]
});

logger.log('here is some data');
logger.error('data gave error');

logger.createFile({ filePath: 'test/logs/info.log' });

logger.log('last one');
logger.log('I promise');
