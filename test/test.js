const udu = require('../index');

const logger = udu.createUduLogger({
  timeFormat: 'MM/DD/YYYY kk:mm:ss.SS',
  transports: [
    new udu.Transports.Console(),
    new udu.Transports.File({ filePath: 'test/logs/data.log' }),
    new udu.Transports.File({ filePath: 'test/logs/errors.log' }),
  ]
});

logger.log('here is some data');
logger.error('data gave error');

logger.createFile({ filePath: 'test/logs/info.log' });

logger.warn('last one');
logger.info('I promise');
logger.error('or is it?');
