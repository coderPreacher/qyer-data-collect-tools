const _ = require('lodash');
const fs = require('fs');
const path = require('path'); 
const Crawler = require("crawler");


const cities = ["清迈.json","曼谷.json","Kalaw.json","岘港.json","仙本那.json"]

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

var dir = path.join(process.cwd(), 'hotelDatas');  
console.log(dir)
if (fs.existsSync(dir)) {
  const files = fs.readdirSync(dir);
  console.log(files)
  if (files && files.length > 0) {
    for (const file of files) {
      let country_name = path.basename(file, '.json');
      console.log(country_name)
      console.log(cities.indexOf(country_name))
      if (cities.indexOf(country_name) === -1) {
        continue;
      }
      let fullPath = path.join(process.cwd(), 'hotelDatas', `${file}`);  
      console.log(fullPath)
      let writeFullPath = path.join(process.cwd(), 'newhotelDatas', `${file}`);  
      if (fs.existsSync(fullPath)) {
          let data = require(fullPath);        
          const writeStream = fs.createWriteStream(writeFullPath);
          writeStream.write('[')
          if (data &&  data.length > 0) {   
            for (const item of data) {
              let newObj = Object.create(null);            
              newObj.link = item.link;
              newObj.latitude = item.latitude;
              newObj.longitude = item.longitude;
              newObj.name= item.name;
              newObj.zh_name= item.zh_name;
              newObj.en_name= item.en_name;
              newObj.rank = item.rank;
              newObj.cover = item.cover;
              newObj.address= item.address;
              newObj.address= item.address;
              if (item) { 
                c.queue([{
                  uri: `${item.link}`,
                  jQuery: true,
                  rateLimit: 1000,
                  retries:5,
                  // The global callback won't be called
                  callback: function (error, res, done) {
                    if (error) {
                      console.log(error);
                    } else {
                      var $ = res.$;
                      newObj.intro = _.trim($('.hp_desc_main_content').text().replace(/(\r\n|\n|\r|\t|\t\n|\n\t)/gm,"")); 
                      newObj.albums = [];
                      $('#photos_distinct').children('a').contents().each((i, element) => { 
                        console.log($(element.parent).attr('href'))
                        newObj.albums.push($(element.parent).attr('href'))
                      });
                      writeStream.write(JSON.stringify(newObj));
                      writeStream.write(',');
                    }
                    done();
                  }
                }]);
              } 
            } 
          }
        }
      }
    }    
  }