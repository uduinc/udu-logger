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
    it('Should log test to Elasticsearch', async () => {
      const test = await logger.log('test');
      assert.equal(test[0].result, 'created');
      return test;
    });
    it('Should log test2 to Elasticsearch', async () => {
      const test = await logger2.meta({ source: 'notudu' }).log('test2');
      assert.equal(test[0].result, 'created');
      return test;
    });
    it('Should log test3 to Elasticsearch', async () => {
      const test = await logger2.log('test3');
      assert.equal(test[0].result, 'created');
      return test;
    });
    it('Should log test4 to Elasticsearch', async () => {
      const test = await logger.log('test4');
      assert.equal(test[0].result, 'created');
      return test;
    });
    it('Should log test5 to Elasticsearch', async () => {
      const test = await logger.log({
        metadata: {
          user: 'Matthew'
        }
      }, 'test');
      assert.equal(test[0].result, 'created');
      return test;
    });
  });

  describe('Searching Elasticsearch documents test', () => {
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
    it('Search for any log containing "test" - expect 5', async () => {
      const query = [{ key: 'message', value: 'test' }]; // Exact: false should be default
      const query2 = [{ key: 'message', value: 'test', exact: false }];

      const output = await logger.search(query);
      const output2 = await logger.search(query2);
      // console.log(output[0]);
      assert.equal(output[0].hits.total, 5);
      assert.equal(output2[0].hits.total, 5);
    });
    it('Search for logs containing "message: test" "excluding metadata.user: Matthew" - expect 4', async () => {
      const query = [
        { key: 'message', value: 'test', exact: false },
        {
          key: 'metadata.user',
          value: 'Matthew',
          exact: true,
          not: true
        }
      ];
      const output = await logger.search(query);
      // console.log(output[0]);
      assert.equal(output[0].hits.total, 4);
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
      console.log(output[0]);
      assert.equal(output[0].hits.total, 1);
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
