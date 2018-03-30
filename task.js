

/**
 * 抓取城市数据
 *{
  "zh_name":"曼谷",//中文名
  "en_name":"Bangkok",//英文名
  "intro":"曼谷",//简介
  "cover":"https://pic.qyer.com/album/user/2586/22/Q0xdRBgFYUw/index/cover",
  "latitude":"13.7540559751129", //纬度
  "longitude":"100.528855919838", //经度
}
*/


const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const querystring = require('querystring');
const unirest = require("unirest");
const request = require("request");
const log4js = require('log4js')
var pageSize = 20;
var maxTotalPage = 500;

const mongoProxy = require('./mongo/mongoRepository')

const mongo = new mongoProxy();

log4js.configure({
  appenders: {
    everything: { type: 'file', filename: 'all-the-logs.log' }
  },
  categories: {
    default: { appenders: [ 'everything' ], level: 'debug' }
  }
});

const logger = log4js.getLogger(); 



/**
 * 
 * @param {*抓取城市数据} countries 
 */
module.exports = ({countries}) => {
  if (countries && countries.length && countries.length > 0) {

    puppeteer.launch({headless: false}).then(async browser => {   

      await getCountryCityInfo(countries,browser);      

      console.log('countries',countries);

      await getCities(countries);    

      await getCityAttractionsInfo(countries,browser);

      await getAttractions(countries);
      
    });
  }
}
async function excute(url, browser, callback) {
  const page = await browser.newPage();
  page.on('response', callback);
  await page.goto(url);
  await sleep(5000);
  await page.close();
}

/**
 * 
 * @param {暂停毫秒数} ms 
 */
 function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 获取国家城市信息
 * @param {国家列表} countries 
 * @param {浏览器对象} browser 
 */
async function getCountryCityInfo(countries,browser) {
  console.log('getCountryCityInfo')
  if (countries && countries.length > 0 && browser) {
    for (let index = 0; index < countries.length; index++) {
      let country = countries[index];
      // let p = path.join(process.cwd(),'countries',`${country.zh_name}.json`);
      // console.log(p)
      // if (fs.existsSync(p)) {
      //   continue;
      // }
      var callback =  async function (res) {
        if (res.ok) {
          var req = res.request();              
          if (req._url.startsWith('http://place.qyer.com/map.php?action=countrycity')) {
            let postData = querystring.parse(req._postData);
            country.qyerid = postData.id; //城市ID
            let json = await res.json(); 
            country.totalCitiesCount = json.data.sum; //城市总数
          }
        }
      };                
      await excute(country.qyer_map_href, browser,callback);
      await sleep(1000);
    }  
  }
  return countries; 
}



/**
 * 获取国家的城市数据
 * @param {*国家列表} countries 
 */
async function getCities(countries){
  console.log('getCities')
  if (countries && countries.length > 0) {
    for (let index = 0; index < countries.length; index++) {
      let country = countries[index];
      // var p = path.join(process.cwd(), 'countries', `${country.zh_name}.json`);    
      if (true) { //!fs.existsSync(p)
        // const writeStream = fs.createWriteStream(p);
        // console.log('not exists!');
        if (country.totalCitiesCount && country.totalCitiesCount > 0) {
          let totalPage = parseInt(country.totalCitiesCount / pageSize);
          //如果不能整除则需要多加一页
          if (country.totalCitiesCount % pageSize  != 0) {
            totalPage = totalPage + 1;
          }
          if(totalPage == 0){
            totalPage = 1;
          }
          country.cities = [];
          console.log(totalPage,'totalPage')  
          for (let page = 1; page <= totalPage; page++) {       
            var options = { 
              method: 'POST',
              url: 'http://place.qyer.com/map.php',
              qs: { action: 'countrycity' },
              headers: { 
                'postman-token': '2d6a2d6a-3ec4-1101-1b61-7c7d4de1ffe1',
                'cache-control': 'no-cache',
                'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'                        
              },
              formData: { 
                id: country.qyerid,
                typename: 'city',
                page: page,
                order: '1',
                keyword: '' 
              }
            };
            logger.debug(JSON.stringify(options))
            request(options, function (error, response, body) {
              if (error) throw new Error(error);      
              try {                  
                let res = JSON.parse(body); 
                //res.data.lists
                logger.debug(body)
                if (res.data.lists) {
                  country.cities.push(...res.data.lists);       
                }
                             
                console.log(res.data.lists, 'res.data.lists')         
                if (page == totalPage) { 
                  // writeStream.write(JSON.stringify(country));
                  // writeStream.end(); 
                  // mongo.saveCountry(country)
                }
              } catch (error) {
                console.log(error)
              }       
            });
            await sleep(2000);
          }  
        }  
      } 
    }
  }
}
 
/**
 * 获取城市景点
 * @param {国家列表} countries 
 * @param {浏览器对象} browser 
 */
async function getCityAttractionsInfo(countries,browser){
  console.log('getCityAttractionsInfo')
  for (let index = 0; index < countries.length; index++) {
    var country = countries[index];
    // let p = path.join(process.cwd(),'attractions',`${country.zh_name}.json`);
    // if (fs.existsSync(p)) {
    //   continue;
    // }
    var callback =  async function (res) {
      if (res.ok) {
        var req = res.request();      
        // old map        
        if (req._url.startsWith('http://place.qyer.com/map.php?action=country_poi_list')) {
          let postData = querystring.parse(req._postData);
          console.log(req._postData);
          country.id = postData.id; //城市ID
          let json = await res.json(); 
          country.is_old = true
          country.totalAttractionsCount = json.data.sum; //城市总数
        }
        // new map
        if (req._url.startsWith('http://place.qyer.com/map.php?action=maplist')) {
          let postData = querystring.parse(req._postData);
          console.log(req._postData);
          country.id = postData.id; //城市ID
          let json = await res.json(); 
          country.is_old = false
          country.totalAttractionsCount = json.data.counts; //城市总数
        }

      }
    };                
    await excute(country.qyer_attraction_href, browser,callback);
    await sleep(5000);    
  }
}

/**
 * 获取景点数据
 * @param {国家列表} countries 
 */
async function getAttractions(countries){
  console.log('getAttractions',countries.length)
  if (countries && countries.length > 0) {
    for (let index = 0; index < countries.length; index++) {
      var country = countries[index];      
      // var p = path.join(process.cwd(), 'attractions', `${country.zh_name}.json`);    
      if (true) {
        // const writeStream = fs.createWriteStream(p);
        // console.log('not exists!');
        if (country.totalAttractionsCount && country.totalAttractionsCount > 0) {
          pageSize = country.is_old? pageSize: 15;
          let totalPage = parseInt(country.totalAttractionsCount / pageSize);
          //如果不能整除则需要多加一页
          if (country.totalAttractionsCount % pageSize  != 0) {
            totalPage = totalPage + 1;
          }
          if (totalPage > maxTotalPage) {
            totalPage = maxTotalPage;
          }
          if (totalPage <= 0 ) {
            totalPage = 1
          }
          country.attractions = [];
          console.log(totalPage,'totalPage')  
          console.log(country.zh_name,'curcountry')
          for (let page = 1; page <= totalPage; page++) {       
            console.log(page,"curPage")
            let action = country.is_old ? 'country_poi_list': 'maplist';
            var options = { 
              method: 'POST',
              url: 'http://place.qyer.com/map.php',
              qs: { action: action },
              headers: { 
                'postman-token': '2d6a2d6a-3ec4-1101-1b61-7c7d4de1ffe1',
                'cache-control': 'no-cache',
                'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'                        
              },
              formData: { 
                id: country.qyerid,
                typename:  country.is_old ? 'country' : 'city',
                page: page,
                order: '1',
                keyword: '',
                cateid:0
              }
            };
            if (!country.is_old) {
              options.formData.type = 'fun'
            } 
            logger.debug('getAttractions  options' + JSON.stringify(options))  
            logger.debug('country' + JSON.stringify(country))  
            request(options, function (error, response, body) {
              logger.debug('getAttractions  body' + body)  
              if (error) throw new Error(error);      
              try {                
                
                if (body) {
                  let resBody = JSON.parse(body); 
                  console.log(body, 'body')         
                  if (country.is_old) {
                    country.attractions.push(...resBody.data.lists);     
                  }else{
                    if (resBody.data.res && resBody.data.res.length && resBody.data.res.length > 0) {
                      country.attractions.push(...resBody.data.res);      
                    } 
                  } 
                  
                  if (page == totalPage) {  
                    delete country.is_old;
                    mongo.saveCountry(country); 
                  }
                }
                
              } catch (error) {
                console.log(error)
              }       
            });
            await sleep(3000);
          }  
        }  
      } 
    }
  }
} 
