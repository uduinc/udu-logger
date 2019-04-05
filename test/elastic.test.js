const assert = require('assert');
const moment = require('moment');
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

  const timeFormat1 = 'MM/DD/YYYY kk:mm:ss.SSS';
  const times1 = [];
  const timeFormat2 = 'MM/DD/YYYY';
  const times2 = [];
  describe('Logging to Elasticsearch test', () => {
    beforeEach((done) => {
      times1.push(new Date());
      times2.push(moment().format(timeFormat2));
      setTimeout(() => {
        done();
      }, 100);
    });
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

  describe('Elastic searching tests - basic', () => {
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
      /*
      output[0].hits.hits.forEach((x) => {
        console.log(x._source);
      });
      */
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

  describe('Elastic searching tests - nested', () => {
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
            { key: 'level', value: 'error', and: true },
            { key: 'message', value: 'test3', not: true, },
          ]
        }
      ];
      const output = await logger.search(query);

      assert.equal(output[0].hits.total, 3);
    });
  });

  describe('Elastic searching tests - date range', () => {
    it('Search within a given time range and nest queries - should return 3', async () => {
      const startTime = times1[0];
      const endTime = Date.now();

      const query = [
        { time: { start: startTime, end: endTime } },
        {
          and: [
            { key: 'level', value: 'error', },
            { key: 'level', value: 'warning', },
          ]
        }
      ];
      const output = await logger.search(query);

      assert.equal(output[0].hits.total, 3);
    });
    it('Search up to 1 day prior if no start time given - should return 6', async () => {
      const endTime = Date.now();

      const query = [
        { time: { end: endTime } },
      ];
      const output = await logger.search(query);

      assert.equal(output[0].hits.total, 6);
    });
    it('Search to current time if no end time given - should return 6', async () => {
      const startTime = times1[0];

      const query = [
        { time: { start: startTime } },
      ];
      const output = await logger.search(query);

      assert.equal(output[0].hits.total, 6);
    });
    it('Should search over last 24 hours if no times given - should return 6', async () => {
      const query = [
        { time: { } },
      ];
      const output = await logger.search(query);

      assert.equal(output[0].hits.total, 6);
    });
    it('Should handle differing date formats - should return 6', async () => {
      const startTime = times2[0]; // MM/DD/YYYY format
      const endTime = Date.now(); // Returns epoch time in ms
      const query = [
        { time: { start: startTime, end: endTime } },
      ];
      const output = await logger.search(query);

      assert.equal(output[0].hits.total, 6);
    });
    it('Exclude a certain time range - should return 4', async () => {
      const startTime = times1[2];
      const endTime = times1[4];

      const query = [
        { time: { start: startTime, end: endTime, not: true } },
      ];
      const output = await logger.search(query);

      assert.equal(output[0].hits.total, 4);
    });
    it('Multiple time ranges - should return 3', async () => {
      const query = [
        { time: { end: times1[1] } },
        { time: { start: times1[4], end: Date.now() } },
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
