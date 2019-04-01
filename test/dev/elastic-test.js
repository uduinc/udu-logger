const elasticsearch = require('elasticsearch');
const bodybuilder = require('bodybuilder');
const util = require('util');

const client = new elasticsearch.Client({
  host: '127.0.0.1:9200',
  // log: 'trace',
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

// Searches message field for anything containing text
const searchMessage = async (text) => {
  const response = await client.search({
    index: 'engineers',
    type: '_doc',
    body: {
      query: {
        wildcard: {
          message: `*${text}*`
        }
      }
    }
  });
  return response;
};

const searchMeta = async (text) => {
  try {
    const body = bodybuilder()
      .query('wildcard', 'metadata.source', `*${text}*`)
      .query('wildcard', 'message', '*test*')
      .build();
    // body = body.build();
    console.log('Body', body);
    const response = await client.search({
      index: 'engineers',
      type: '_doc',
      body
    });
    return response;
  } catch (error) {
    throw error;
  }
};

const addQuery = (body, query) => {
  if (query.exact) {
    body.addQuery('match', query.key, query.value);
  } else {
    body.addQuery('wildcard', query.key, `*${query.value}*`);
  }
};

const search = async (queries) => {
  // Send array as arguments, loop through
  let body = bodybuilder();
  queries.forEach((query) => {
    addQuery(body, query);
  });

  body = body.build();
  // console.log('BODY: ', JSON.stringify(body));
  console.log('BODY: ', body);
  const response = await client.search({
    index: 'test_index',
    type: '_doc',
    body
  });
  return response;
};

const test = async () => {
  const log = await searchMeta('notudu');
  if (log) {
    log.hits.hits.forEach((x) => {
      console.log(x);
    });
    console.log('Total: ', log.hits.total);
  }
};

const searchTest = async () => {
  const log = await search([
    { key: 'message', value: 'test', exact: true },
  ]);
  if (log) {
    log.hits.hits.forEach((x) => {
      console.log(x._source);
    });
    console.log('Total: ', log.hits.total);
  }
};
// console.log(searchSpecific());
// console.log(searchAll());
// console.log(deleteAll());

// searchMessage('test');

// test();
searchTest();
// searchAll();
// deleteAll();
