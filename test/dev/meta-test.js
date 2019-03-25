const udu = require('../../index');

const logger = udu.createUduLogger({
  level: 'log',
  timeFormat: 'MM/DD/YYYY kk:mm:ss',
  metadata: {
    source: 'udu',
  },
  transports: [
    new udu.Transports.Console({}),
    new udu.Transports.Elastic({
      host: '127.0.0.1:9200',
      index: 'engineers',
      type: '_doc',
    })
  ]
});

logger.log('test');

const logger2 = logger.meta({ alpha: 'a ' });

logger2.meta({ source: 'notudu' }).log('test2');

logger2.log('test3');

logger.log('test4');
