const udu = require('../index');

const logger = udu.createUduLogger({
  level: 'log',
  timeFormat: 'MM/DD/YYYY kk:mm:ss',
  metadata: {
    header1: 'test1',
    header2: 'test2'
  },
  transports: [
    new udu.Transports.File({
      level: 'info',
      filePath: 'test/logs/data.log'
    }),
    new udu.Transports.File({
      level: 'error',
      filePath: 'test/logs/errors.log',
      timeFormat: 'MM/DD/YYYY kk:mm:ss.SSS',
      metadata: {
        fileHeader: 'fileHeader1',
      },
    }),
    /* new udu.Transports.Elastic({
      level: 'error',
      host: '127.0.0.1:9200',
      index: 'engineers',
      type: '_doc',
      timeFormat: 'MM/DD/YYYY kk:mm:ss.SSS',
      metadata: {
        admin: 'Matthew',
      },
    }) */
  ]
});
logger.addTransport(new udu.Transports.Console({
  level: 'info',
  timeFormat: 'MM/DD/YYYY kk:mm:ss.SSS',
}));

const testObject = { a: { b: { c: { d: 4 } } } };
const testObject2 = { w: { x: { y: { z: 4 } } } };
const testMeta = { meta4: 'test4' };
logger.warn({
  metadata: {
    testMeta,
    meta3: 'test3'
  }
}, 'Here is some data.', testObject, 'Other string', testObject2);
logger.log('No meta data given', 'Will this work?');
logger.info({ metadata: testMeta }, 'Can I append with meta?', 'Lets find out');
logger.error('Major error', 'lots of data', 'and more', 'last bit');
/* logger.error('data gave error', meta4);

logger.createFile({ filePath: 'test/logs/info.log' });

logger.warn('last one');
logger.info('I promise');
logger.error('or is it?'); */
