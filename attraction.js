/**
 * 获取景点数据
 {
  "link":"http://place.qyer.com/poi/V2EJa1FjBzRTYQ/",
  "intro":"玉佛寺建于1782年，历史相当悠久，属于泰国曼谷王朝开朝时建筑。
拉玛一世是首位将泰国首都迁至曼谷的国王，他将玉佛寺视为国家守护的宗教圣地，并在此地为王族举行重要的仪式。寺中并没有僧侣居住。
",
  "address":"Na Phralan, Phra Nakorn Old City",
  "traffic"：“公车汽车，508/512；
船，Tha Chang
位于大王宫东北角，可从华南蓬车站搭53、48号公共汽车前往。“,
  "open_time":"8:30-15:30",
  "ticket":"350泰铢；和大皇宫联票一共500泰铢。",
  "phone":"+66-02-2241833",
  "net_address":"https://www.panogira.com/wat_phra_kaew/",
  "tips":"要穿长裤长袖才可以进入。入口处可以免费租用服装。"
}
 */

const _ = require('lodash');
const fs = require('fs');
const path = require('path'); 
const Crawler = require("crawler");

const countries = ["泰国"]

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

let dir = path.join(process.cwd(), 'attractions');  
console.log(dir)
if (fs.existsSync(dir)) {
  const files = fs.readdirSync(dir);
  console.log(files)
  if (files && files.length > 0) {
    for (const file of files) {
      let country_name = path.basename(file, '.json');
      console.log(countries.indexOf(country_name))
      // if (countries.indexOf(country_name) === -1) {
      //   continue;
      // }
      let fullPath = path.join(process.cwd(), 'attractions', `${file}`);  
      console.log(fullPath)
      let writeFullPath = path.join(process.cwd(), 'newattractions', `${file}`);  
      if (fs.existsSync(fullPath)) {
        let data = require(fullPath);
        
        const writeStream = fs.createWriteStream(writeFullPath);
        writeStream.write('[')
        if (data && data.attractions && data.attractions.length > 0) {
          for (const obj of data.attractions) { 

              for (const item of obj.data.lists) {

                let newObj = Object.create(null);
                
                newObj.link = item.url;

                if (item.rank.catename === '景点观光') {
                  console.log(item)
                  c.queue([{
                    uri: `http:${item.url}`,
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
                        newObj.tips = _.trim($('.poi-tips').text().replace(/(\r\n|\n|\r|\t|\t\n|\n\t)/gm,""));
                        newObj.tip_content = _.trim($('.poi-tipContent').text().replace(/(\r\n|\n|\r|\t|\t\n|\n\t)/gm,""));
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
  }






