/**
 * 获取景点详细数据信息
 */

const _ = require('lodash');
const Crawler = require("crawler");
const Producer = require('../kafka/hightLevelProducer');


const producer = new Producer();

var c = new Crawler({
  jQuery: true,
  maxConnections: 10,
  // This will be called for each crawled page
  callback: function (error, res, done) {
    if (error) {
      console.log(error);
    } else {
      var $ = res.$;
      console.log('c')
    }
    done();
  }
});

let fetchTasks = [];


producer.on('kafka_ready', () => {

  console.log('kafka_ready')


  console.log(fetchTasks)

  if (fetchTasks && fetchTasks.length > 0) {
    for (const task of tasks) {

      let newObj = {
        id: task.id
      } 
      c.queue([{
        uri: `http:${task.qyer_href}`,
        jQuery: true,
        rateLimit: 1000,
        retries:5,
        // The global callback won't be called
        callback: function (error, res, done) {
          if (error) {
            console.log(error);
          } else {
            var $ = res.$; 
            newObj.intro = _.trim($('.poi-detail').text().replace(/(\r\n|\n|\r|\t|\t\n|\n\t)/gm,""));
            // newObj.tips = _.trim($('.poi-tips').text().replace(/(\r\n|\n|\r|\t|\t\n|\n\t)/gm,""));
            // newObj.tip_content = _.trim($('.poi-tipContent').text().replace(/(\r\n|\n|\r|\t|\t\n|\n\t)/gm,""));
            producer.emit('send',newObj);
          }
          done();
        }
      }]);
    }
  }
  
  

})





process.on('message', (tasks) => {
  fetchTasks = tasks;
})