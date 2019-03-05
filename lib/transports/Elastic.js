const elasticsearch = require('elasticsearch');

const Elastic = function (config) {
  const client = new elasticsearch.Client({
    host: config.host,
    log: 'trace',
    apiVersion: '6.6'
  });

  this.log = async (value) => {
    await client.create({
      index: config.index,
      type: config.type,
      id: 2,
      body: {
        name: 'Matthew',
        stuff: 3,
        tags: ['test1', 'test2'],
        male: true,
        data: value
      }
    });
  };
};

module.exports = Elastic;
