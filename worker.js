

/**
 * spider worker 
 */


const City = require('./task');

process.on('message', (msg) => {
  console.log('onmessage',JSON.stringify(msg))
  City(msg);
})

 