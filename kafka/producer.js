/**
 * 消息生产者
 */

const kafka = require("kafka-node");
const uuid = require ("uuid");

const EventEmitter = require('events');


const config = require('../config');

const client = new kafka.Client(config.kafka_host);

const producer = new kafka.HighLevelProducer(client);

producer.on("ready", function() {

  console.log("Kafka Producer is connected and ready.");
});

// producer.createTopics([config.kafka_topic], false, function (err, data) {
//   console.log(data);
// });

// For this demo we just log producer errors to the console.
producer.on("error", function(error) {
  console.error(error);
});




const KafkaService =  {

  sendRecord: (payload, callback = () => {}) => {
    if (!payload) {
      return callback(new Error(`A data must be provided.`));
    } 

    const buffer = new Buffer.from(JSON.stringify(payload));

    // Create a new payload
    const record = [
    {
      topic: config.kafka_topic,
      messages: buffer,
      attributes: 1 /* Use GZip compression for the payload */
    }];

    console.log(`producer send a messgae payload:${ JSON.stringify(payload) }`);
    

    //Send record to Kafka and log result/error
    producer.send(record, callback);
  }
};

Object.assign(KafkaService,EventEmitter.prototype)



module.exports =  KafkaService;