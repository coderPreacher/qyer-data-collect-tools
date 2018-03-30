const Crawler = require("crawler");
const Chau = require('./chau_collect');
const City = require('./cities');
const Hotel = require('./hotel');
const hotelCollect = require('./hotelCollect');
const config = require('./config') 

const mongoProxy = require('./mongo/mongoRepository')




let excuted = false;
var c = new Crawler({
  jQuery: true,
  maxConnections: 10,
  // This will be called for each crawled page
  callback: function (error, res, done) {
    if (error) {
      console.log(error);
    } else {
      var $ = res.$;
      var { countries , chaus} = Chau($);

      console.log(chaus)

      if (chaus && chaus.length > 0) {
        let mongo = new mongoProxy();
        for (const chau of chaus) {
          mongo.saveChau(chau);
        }
        
      }


    }
    done();
  }
});

// Queue just one URL, with default callback
c.queue('http://place.qyer.com/'); 

c.on('drain', function () { 
  // console.log('drain executed!',countries);
  // console.log('countries len!',countries.length);

  // if (countries.length > 0) {
    
  // }

  
 
});


