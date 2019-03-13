const udu = require('../index');

const logger = udu.createUduLogger({
  timeFormat: 'MM/DD/YYYY kk:mm:ss.SSS',
  defaultMetaData: {
    header1: 'test1',
    header2: 'test2'
  },
  transports: [
    new udu.Transports.Console(),
    new udu.Transports.File({ filePath: 'test/logs/data.log' }),
    new udu.Transports.File({ filePath: 'test/logs/errors.log' }),
  ]
});
const meta4 = { meta4: 'test4' };
logger.log('here is some data', { meta3: 'test3' });
logger.error('data gave error', meta4);

logger.createFile({ filePath: 'test/logs/info.log' });

logger.warn('last one');
logger.info('I promise');
logger.error('or is it?');
