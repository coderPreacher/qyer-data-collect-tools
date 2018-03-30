/**
 * 消费者
 */

const kafka = require("kafka-node")
const EventEmitter = require('events');
const config = require("../config") 
class Consumer extends EventEmitter {


  get client(){
    return this._client;
  }

  get consumer(){
    return this._consumer;
  } 
  constructor(){
    super();
    this._initializer();
  }

  dispose(){
    if (this._consumer && this._consumer.close) {
      this._consumer.close();
    }
  }

  _initializer(){
    this._client = new kafka.Client(config.kafka_host);
    const topics = [
      {
        topic: config.kafka_topic
      }
    ];
    const options = {
      autoCommit: true,
      fetchMaxWaitMs: 1000,
      fetchMaxBytes: 1024 * 1024,
      encoding: "buffer"
    };

    this._consumer = new kafka.HighLevelConsumer(this._client, topics, options);

    const that = this;
    this._consumer.on("message", function(message) {

      var buf = new Buffer(message.value, "binary"); 

      console.log('onmessage',  buf.toString()) 

      that.emit('onmessage', JSON.parse(buf.toString()) )
      
    });

    this._consumer.on("error", function(err) {
      console.error("error", err);
      that.emit('onerror',err);
    });
  }




}

module.exports = Consumer;


