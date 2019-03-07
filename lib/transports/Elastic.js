const elasticsearch = require('elasticsearch');

const Elastic = function (config) {
  const client = new elasticsearch.Client({
    host: config.host,
    log: 'trace',
    apiVersion: '6.6'
  });

  this.log = async (value) => {
    // const id = this.getId();
    const id = 'testId';
    await client.create({
      index: config.index,
      type: config.type,
      id,
      body: value
    });
  };

  this.getId = async () => {
    try {
      let { count } = await client.count({
        index: config.index
      });
      console.log(count);
      count += 1;
      return count.toString();
    } catch (error) {
      console.log('Get ID error: ', error);
      throw error;
    }
  };
};

module.exports = Elastic;
