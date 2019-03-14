const elasticsearch = require('elasticsearch');

const client = new elasticsearch.Client({
  host: '127.0.0.1:9200',
  log: 'trace',
  apiVersion: '6.6'
});

  // Delete's all documents
const deleteAll = async () => {
  client.deleteByQuery({
    index: 'engineers',
    type: '_doc',
    body: {
      query: { match_all: {} }
    }
  });
};

// Get all documents from index
const searchAll = async () => {
  client.search({
    index: 'engineers',
    type: '_doc',
    body: {
      query: { match_all: {} }
    }
  });
};


// Specific search
const searchSpecific = async () => {
  const response = await client.search({
    index: 'engineers',
    type: '_doc',
    body: {
      query: {
        match: {
          metaData: 'admin'
        }
      }
    }
  });
  return response;
};

// console.log(searchSpecific());
console.log(searchAll());
// console.log(deleteAll());
