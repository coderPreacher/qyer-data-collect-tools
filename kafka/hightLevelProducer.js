/**
 * 消息生产者
 */

const kafka = require("kafka-node");
const uuid = require ("uuid");
const config = require('../config');
const EventEmitter = require('events');

class Producer extends EventEmitter {

  get producer(){
    return this._producer;
  } 
  constructor(){
    super();
    this.initializer();
  }
  initializer(){
    const client = new kafka.Client(config.kafka_host);
    this._producer = new kafka.HighLevelProducer(client);    
    const that = this;
    this._producer.on("ready", function() {    
      console.log("Kafka Producer is connected and ready.");
      that.emit('kafka_ready');
    });
    
   
    
    // For this demo we just log producer errors to the console.
    this._producer.on("error", function(error) {
      this.emit('error',error)
    });

    this.on('create_topic',( topics,callback = () => {} ) => {

      if (!Array.isArray(topics)) {
        return callback(new Error(`topics must be a array.`));
      }

      this._producer.createTopics(topics, false, callback);

    });

    this.on('send',(payload, callback = () => {}) => {
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
      this._producer.send(record, callback);

    })
  }  
} 
module.exports =  Producer;