# udu-logger
A simple logging package

## About
`udu-logger` is a simple logging solution for `Elasticsearch` users. It allows users to handle create new indexes, delete indexes, perform complex search queries, and of course... log data.

## Setup
```
npm install udu-logger
```

## Quick Start

```js
const udu = require('udu-logger');
const logger = udu.createUduLogger({
  level: 'log',
  metadata: {
    source: 'udu'
  },
  transports: [
    new udu.Transports.Console({}),
  ]
logger.log('data');
});
```
## Logging
You learned how to create a logger above. Logging data is easy. You can chain as must data together as you'd like.
```js
logger.log('data', 'more data', {a: 1, b: 2});
```
Objects will be turned into strings. Multiple strings will be joined together by a space. Logs can also be supplied with additional metadata, must be supplied in the first argument.
```js
logger.error({ metadata: { source: 'optional' } }, 'port:', 80);
```
If optional metadata will overwrite the default metadata if the keys are the same.

## Log Structure
Every logged output is an object and maintains the following structure.
```js
{
  time: '2019-04-04T01:25:59.248Z', // All logs in ISO format
  level: 'error',
  metadata: { source: 'udu' } // Will be an empty object if no metadata supplied
  message: 'Here is some data that you logged'
}
```

## Levels
`udu-logger` keeps levels simple. It comes with 4 basic levels.

```js
const levels = {
  error: 0,
  warning: 1,
  info: 2,
  log: 3
};
```
Log levels are set by the method called:

```js
logger.log('log level data');
logger.info('info level data');
logger.warn('warning level data');
logger.error('error level data');
```
If a logger is assigned a level of `error`. It will not log data with a level above error's constant value (see above constant values).

## Transports
`udu-logger` comes prepackaged with 3 transports, Console, File, and Elasticsearch. More may be added in the future.

Transports can be instantiated with the logger.
```js
const udu = require('udu-logger');
const logger = udu.createUduLogger({
  level: 'log',
  metadata: {
    user: 'Admin'
  },
  transports: [
    new udu.Transports.Console({}),
    new udu.Transports.File({
      level: 'error',
      metadata: {
        source: 'Transport Specific Metadata'
      },
      filePath: 'test/logs/errors.log'
    }),
    new udu.Transports.Elastic({
      level: 'info',
      host: '127:0.0.1:9200',
      type: '_doc',
      index: 'customers'
    })
  ]
});
```
Of course, transports can also be instantiated separately. They can then be added to the logger like so.
```js
const elastic = new udu.Transports.Elastic({
    host: '127.0.0.1:9200',
    type: '_doc',
    index: indexName
  });
const logger = udu.createUduLogger({
  transports: [
    elastic
  ]
});
// Or
logger.addTransport(elastic);
```

## Elastic Searching
What makes `udu-logger` different from other logging solutions, is its ability to search for saved Elasticsearch logs. Querying for logs is easy.

```js
const query = [{ key: 'message', value: 'test', exact: true }];
const output = await logger.search(query);
```
Since only the Elastic transport can query for logs, the above method will return an Array. This gives the added benefit of multiple Elastic being able to search for the same set of data. You also have the option to search directly with the transport to return output directly.

```js
const elastic = new udu.Transports.Elastic({
    host: '127.0.0.1:9200',
    type: '_doc',
    index: indexName
  });
elastic.search(query);
```

Now that you know how to search, you need to learn a few rules for structuring queries. Every query is an Array of objects. Every object must include a key and a value. If your key is a nested object, you must supply the full key chain.

```js
const query = [{ key: 'metadata.source', value: 'test', exact: true }];
```
The source key is contained with the metadata object, so you must supply the full key for the query to work correctly.

Queries can be given these optional parameters.
| Name          | Default                     |  Description                                      |
| ------------- | --------------------------- | --------------------------------------------------|
| `exact`       | `false`                     | If true, query values must match the log exactly. |
| 'and'         | `false`                     | If true, query value always match the log.        |
| `not`         | `false`                     | If true, queries will not return matched values   |