const assert = require('assert');
const udu = require('../index');


describe('Test Elasticsearch Transport functions', () => {
  const indexName = 'test_index';
  const elastic = new udu.Transports.Elastic({
    host: '127.0.0.1:9200',
    type: '_doc',
    index: indexName
  });

  describe('Create an Elasticsearch index test', () => {
    it('Should create a new test index', async () => {
      const output = await elastic.createIndex(indexName);
      assert.equal(output.acknowledged, true);
      assert.equal(output.index, indexName);
      return output;
    });
  });

  const logger = udu.createUduLogger({
    level: 'log',
    metadata: {
      source: 'udu',
    },
    transports: [
      elastic
    ]
  });

  describe('Logging to Elasticsearch test', () => {
    const logger2 = logger.meta({ alpha: 'a ' });
    it('Logging test1', async () => {
      const test = await logger.log('test');
      assert.equal(test[0].result, 'created');
      return test;
    });
    it('Logging test2', async () => {
      const test = await logger2.meta({ source: 'notudu' }).warn('test2');
      assert.equal(test[0].result, 'created');
      return test;
    });
    it('Logging test3', async () => {
      const test = await logger2.error('test3');
      assert.equal(test[0].result, 'created');
      return test;
    });
    it('Logging test4', async () => {
      const test = await logger.error('test4');
      assert.equal(test[0].result, 'created');
      return test;
    });
    it('Logging test5', async () => {
      const test = await logger.log({
        metadata: {
          user: 'Matthew'
        }
      }, 'test');
      assert.equal(test[0].result, 'created');
      return test;
    });
    it('Logging test6', async () => {
      const test = await logger.info({
        metadata: {
          user: 'Nick',
          source: 'notudu'
        }
      }, 'test6');
      assert.equal(test[0].result, 'created');
      return test;
    });
  });

  describe('Basic Elastic searching tests', () => {
    before((done) => {
      setTimeout(() => {
        done();
      }, 1500);
    });
    it('Searches for log with exact match "message: test" - expect 2', async () => {
      const query = [{ key: 'message', value: 'test', exact: true }];
      const output = await logger.search(query);
      // console.log(output[0]);
      assert.equal(output[0].hits.total, 2);
    });
    it('Search for any log containing "test" - expect 6', async () => {
      const query = [{ key: 'message', value: 'test' }]; // Exact: false should be default
      const query2 = [{ key: 'message', value: 'test', exact: false }];

      const output = await logger.search(query);
      const output2 = await logger.search(query2);
      // console.log(output[0]);
      assert.equal(output[0].hits.total, 6);
      assert.equal(output2[0].hits.total, 6);
    });
    it('Testing not functionality - expect 3', async () => {
      const query = [
        { key: 'message', value: 'test', exact: false },
        {
          key: 'level',
          value: 'error',
          exact: false,
          not: true
        },
        {
          key: 'metadata.user',
          value: 'Matthew',
          exact: true,
          not: true
        }
      ];
      const output = await logger.search(query);
      // console.log(output[0]);
      assert.equal(output[0].hits.total, 3);
    });
    it('Test "and" functionality - should return 1', async () => {
      const query = [
        { key: 'message', value: 'test', exact: false },
        {
          key: 'metadata.user',
          value: 'Matthew',
          exact: true,
          and: true
        }
      ];
      const output = await logger.search(query);
      assert.equal(output[0].hits.total, 1);
    });
  });

  describe('Nested Elastic searching tests', () => {
    it('Test "or" nested functionality - should return 3', async () => {
      const query = [
        { key: 'message', value: 'test', exact: true },
        {
          or: [
            { key: 'level', value: 'error', and: true },
            { key: 'message', value: 'test3', and: true }
          ]
        }
      ];
      const output = await logger.search(query);
      /*
      output[0].hits.hits.forEach((x) => {
        console.log(x._source);
      });
      */
      assert.equal(output[0].hits.total, 3);
    });
    it('Test "and" nested functionality - should return 3', async () => {
      const query = [
        { key: 'message', value: 'test', exact: false },
        {
          and: [
            { key: 'level', value: 'warning', exact: false },
            { key: 'level', value: 'error', exact: false },
            { key: 'metadata.alpha', value: 'a', and: true }
          ]
        }
      ];
      const output = await logger.search(query);

      assert.equal(output[0].hits.total, 2);
    });
    it('Test "not" nested functionality - should return 4', async () => {
      const query = [
        { key: 'message', value: 'test', exact: false },
        { key: 'metadata.user', value: 'Matthew', not: true },
        {
          not: [
            { key: 'metadata.source', value: 'notudu', and: true },
            { key: 'level', value: 'info', and: true },
          ]
        }
      ];
      const output = await logger.search(query);

      assert.equal(output[0].hits.total, 4);
    });

    it('Test multi nested functionality - should return 3', async () => {
      const query = [
        { key: 'message', value: 'test', exact: true },
        {
          or: [
            { key: 'level', value: 'info' }, // Won't match with anything
            {
              and: [
                { key: 'level', value: 'error' },
                { key: 'message', value: 'test3', not: true },
              ]
            }
          ]
        }
      ];
      const output = await logger.search(query);

      assert.equal(output[0].hits.total, 3);
    });
  });

  describe('Delete an Elasticsearch index test', () => {
    it('Should delete the test index', async () => {
      const output = await elastic.deleteIndex(indexName);
      assert.equal(output.acknowledged, true);
      return output;
    });
  });
});

/* POTENTIAL OR TEST
it('Search', async () => {
  const queries = [
    { key: 'metadata.source', value: 'notudu', exact: true },
    { key: 'message', value: 'test', exact: true }
  ];
  const output = await logger.search(queries);
  console.log(output[0]);
  assert.equal(output[0].hits.total, 3);
});
*/
