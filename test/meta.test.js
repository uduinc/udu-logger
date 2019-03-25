const assert = require('assert');
const udu = require('../index');

const logger = udu.createUduLogger({
  metadata: {
    source: 'udu',
  },
  transports: [
    new udu.Transports.Console({}),
  ]
});

describe('Test meta() function', () => {
  describe('meta() test1', () => {
    it('Metadata tag should be source:udu', () => {
      // logger.log('test1');
      assert.deepEqual(logger.getMetaData(), { source: 'udu' });
    });
  });

  const logger2 = logger.meta({ alpha: 'a' });
  describe('meta() test2', () => {
    it('Metadata tags should be source:notudu and alpha:a:', () => {
      // logger2.meta({ source: 'notudu' }).log('test2');
      assert.deepEqual(logger2.meta({ source: 'notudu' }).getMetaData(), { source: 'notudu', alpha: 'a' });
    });
  });

  describe('meta() test3', () => {
    it('Metadata tags should be source:udu and alpha:a:', () => {
      // logger2.log('test3');
      assert.deepEqual(logger2.getMetaData(), { source: 'udu', alpha: 'a' });
    });
  });

  describe('meta() test4', () => {
    it('Metadata tag should be source:udu', () => {
      // logger2.log('test4');
      assert.deepEqual(logger.getMetaData(), { source: 'udu' });
    });
  });
});

/*
const logger2 = logger.meta({ alpha: 'a ' });

logger2.meta({ source: 'notudu' }).log('test2');

logger2.log('test3');

logger.log('test4');
*/
