const Repository = require('../mysql/mysqlRepository')
const placestype = require('../mysql/models/placetype')
const async = require('async')
const numCPUs = require('os').cpus().length; 
const { fork } = require('child_process');

const _ = require('lodash');
const Crawler = require("crawler");
const Producer = require('../kafka/hightLevelProducer');




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

const repository = new Repository();

/**
 * 
 * Post.findAll({
  where: {
    authorId: 2
  }
}); 
 */

 let result = [];

repository.on('connected', () => {
  console.log('connected')
  const producer = new Producer(); 
  producer.on('kafka_ready', () => {

    console.log('kafka_ready')

    async.waterfall([queryPlaces],(err, result) => {
      if (err) {
        console.error(err);    
      }else{ 
        if (result && result.length > 0) {
          for (const task of result) {

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
                  if (res && res.$) {
                    var $ = res.$; 
                    newObj.intro = _.trim($('.poi-detail').text().replace(/(\r\n|\n|\r|\t|\t\n|\n\t)/gm,""));
                    // newObj.tips = _.trim($('.poi-tips').text().replace(/(\r\n|\n|\r|\t|\t\n|\n\t)/gm,""));
                    // newObj.tip_content = _.trim($('.poi-tipContent').text().replace(/(\r\n|\n|\r|\t|\t\n|\n\t)/gm,""));
                    producer.emit('send',newObj);
                  }
                  
                }
                done();
              }
            }]);
          }          
        }
      }
    });
  })
});
 


 const queryPlaces = (callback) => {
  repository.places.findAll({
    where: {
      type: placestype.ATTRACTION
    }
  }).then((places) => {
    callback(null,places);    
  }).catch((err) => {
    console.error(err)
    callback(err);
  })
 };


 