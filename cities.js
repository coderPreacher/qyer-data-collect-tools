/**
 * 抓取城市数据
 {
  "zh_name":"曼谷",//中文名
  "en_name":"Bangkok",//英文名
  "intro":"曼谷",//简介
  "cover":"https://pic.qyer.com/album/user/2586/22/Q0xdRBgFYUw/index/cover",
  "latitude":"13.7540559751129", //纬度
  "longitude":"100.528855919838", //经度
}
//executablePath: '/Users/hui/Downloads/chrome-mac/Chromium.app/Contents/MacOS/Chromium'
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const querystring = require('querystring');
const unirest = require("unirest");
const request = require("request");
const pageSize = 20;

/**
 * 
 * @param {*抓取城市数据} countries 
 */
module.exports = (countries) => {
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
  if (countries && countries.length > 0 && browser) {
    for (let index = 0; index < countries.length; index++) {
      let country = countries[index];
      let p = path.join(process.cwd(),'countries',`${country.zh_name}.json`);
      console.log(p)
      if (fs.existsSync(p)) {
        continue;
      }
      var callback =  async function (res) {
        if (res.ok) {
          var req = res.request();              
          if (req._url.startsWith('http://place.qyer.com/map.php?action=countrycity')) {
            let postData = querystring.parse(req._postData);
            country.id = postData.id; //城市ID
            let json = await res.json(); 
            country.totalCitiesCount = json.data.sum; //城市总数
          }
        }
      };                
      await excute(country.mapAddress, browser,callback);
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
  if (countries && countries.length > 0) {
    for (let index = 0; index < countries.length; index++) {
      let country = countries[index];
      var p = path.join(process.cwd(), 'countries', `${country.zh_name}.json`);    
      if (!fs.existsSync(p)) {
        const writeStream = fs.createWriteStream(p);
        console.log('not exists!');
        if (country.totalCitiesCount && country.totalCitiesCount > 0) {
          let totalPage = parseInt(country.totalCitiesCount / pageSize);
          //如果不能整除则需要多加一页
          if (country.totalCitiesCount % pageSize  != 0) {
            totalPage = totalPage + 1;
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
                id: country.id,
                typename: 'country',
                page: page,
                order: '1',
                keyword: '' 
              }
            };
            request(options, function (error, response, body) {
              if (error) throw new Error(error);      
              try {                  
                let res = JSON.parse(body); 
                country.cities.push(res);                  
                console.log(body, 'body')         
                if (page == totalPage) { 
                  writeStream.write(JSON.stringify(country));
                  writeStream.end(); 
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
 * 获取城市酒店
 * @param {国家列表} countries 
 */
async function getCityHotels(countries){

}
/**
 * 获取城市景点
 * @param {国家列表} countries 
 * @param {浏览器对象} browser 
 */
async function getCityAttractionsInfo(countries,browser){
  for (let index = 0; index < countries.length; index++) {
    const country = countries[index];
    let p = path.join(process.cwd(),'attractions',`${country.zh_name}.json`);
    if (fs.existsSync(p)) {
      continue;
    }
    var callback =  async function (res) {
      if (res.ok) {
        var req = res.request();              
        if (req._url.startsWith('http://place.qyer.com/map.php?action=country_poi_list')) {
          let postData = querystring.parse(req._postData);
          console.log(req._postData);
          country.id = postData.id; //城市ID
          let json = await res.json(); 
          country.totalAttractionsCount = json.data.sum; //城市总数
        }
      }
    };                
    await excute(country.attractionAddress, browser,callback);
    await sleep(5000);    
  }
}

/**
 * 获取景点数据
 * @param {国家列表} countries 
 */
async function getAttractions(countries){
  if (countries && countries.length > 0) {
    for (let index = 0; index < countries.length; index++) {
      let country = countries[index];      
      var p = path.join(process.cwd(), 'attractions', `${country.zh_name}.json`);    
      if (!fs.existsSync(p)) {
        const writeStream = fs.createWriteStream(p);
        console.log('not exists!');
        if (country.totalAttractionsCount && country.totalAttractionsCount > 0) {
          let totalPage = parseInt(country.totalAttractionsCount / pageSize);
          //如果不能整除则需要多加一页
          if (country.totalAttractionsCount % pageSize  != 0) {
            totalPage = totalPage + 1;
          }
          country.attractions = [];
          console.log(totalPage,'totalPage')  
          console.log(country.zh_name,'curcountry')
          for (let page = 1; page <= totalPage; page++) {       
            console.log(page,"curPage")
            var options = { 
              method: 'POST',
              url: 'http://place.qyer.com/map.php',
              qs: { action: 'country_poi_list' },
              headers: { 
                'postman-token': '2d6a2d6a-3ec4-1101-1b61-7c7d4de1ffe1',
                'cache-control': 'no-cache',
                'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'                        
              },
              formData: { 
                id: country.id,
                typename: 'country',
                page: page,
                order: '1',
                keyword: '',
                cateid:0
              }
            };
            request(options, function (error, response, body) {
              if (error) throw new Error(error);      
              try {                  
                let res = JSON.parse(body); 
                country.attractions.push(res);                  
                console.log(body, 'body')         
                if (page == totalPage) { 
                  writeStream.write(JSON.stringify(country));
                  writeStream.end(); 
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