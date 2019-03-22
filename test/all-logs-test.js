const udu = require('../index');

const logger = udu.createUduLogger({
  level: 'log',
  timeFormat: 'MM/DD/YYYY kk:mm:ss',
  logLimit: 50,
  logLimitLevel: 'warning',
  metadata: {
    user: 'Matthew'
  },
  transports: [
    new udu.Transports.Console({}),
    /* new udu.Transports.Elastic({
      host: '127.0.0.1:9200',
      index: 'engineers',
      type: '_doc',
    }) */
  ]
});

/*
console.log('Starting logging');
console.log('This machine\'s hostname:', require('os').hostname());

console.log('Error test:', new Error('testing'));
console.log(Array);
console.log(require('fs'));
console.log(JSON.stringify(require('fs'), null, 4));

console.log('This is a simple object', { a: 1, b: 2 });
console.log('null =', null, 'and undefined =', undefined, '\n\tand true =', true, 'and NaN =', NaN);
console.log('port:', 80);
*/
logger.log('Starting logging');
logger.log('This machine\'s hostname:', require('os').hostname());

logger.log('Error test:', new Error('testing'));
logger.log(Array);
logger.log(require('fs'));
logger.log(JSON.stringify(require('fs'), null, 4));

logger.info('This is a simple object', { a: 1, b: 2 });
logger.warn('null =', null, 'and undefined =', undefined, '\n\tand true =', true, 'and NaN =', NaN);
logger.error('port:', 80);
logger.log('abcdefghijklmnopqrstuvwxyz');

// const str = 'AAA'.repeat(30000);

// BAD: this does NOT log exactly what we're looking for
// console.log( str );

// GOOD: this logs exactly what we're looking for if we call the above;
// i.e. all messages should be capped at 20k (or w/e) characters
// The exact error message here is not important, just that there's
// some indication that this happened
// console.warn(`Log too large (${str.length} chars). Truncated to 20000:\n`, str.slice(0, 20000));
