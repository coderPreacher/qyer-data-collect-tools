const Consumer = require('./kafka/consumer')
const Repository = require('./mysql/mysqlRepository')

const repository = new Repository();



const consumer = new Consumer();

consumer.on('onmessage', (msg) => {
  repository.places.create(msg).then(( excute) => {

  }).catch((err) => {
    console.error(err);
  })
}); 

consumer.on('onerror', (err) => {
  console.error(err)
});



process.on("SIGINT", function(code) {
  console.log(` on process SIGINT ${code} !`)
  consumer.dispose();
  process.exit(0)
});


















