/**
 * 获取酒店数据
 {
  "zh_name":"曼谷城市大酒店", //酒店中文名
  "en_name":"The Grand Palace", //酒店英文名
  "intro":"Hotel Royal Bangkok@Chinatown酒店位于曼谷（Bangkok），提供室外盐水游泳池、酒吧、餐厅以及覆盖各处的免费WiFi。", //酒店简介
  "latitude":"13.7540559751129", //酒店纬度
  "longitude":"100.528855919838", //酒店经度
  "city_id":"55145452", //城市ID
  "country_id":"55145452", //国家ID
  "address":"103 Road King Prajadhipok Phra Singh, Muang District, Chiang Mai", //酒店详细地址
  "rank":"9.2", //酒店评分
  "cover":"https://pic.qyer.com/album/user/2586/22/Q0xdRBgFYUw/index/cover" //酒店封面图
}
 */

const config = require('./config');
const puppeteer = require('puppeteer');
const _ = require('lodash');

module.exports = ($) => {
  let countries = [];
  $('#countryTmpl').children('div').each((index,element)=> {
    $(element).children('.block_header').children('h2').children('a').each((index2,element2)=> {    
      let countryName = $(element2).text();
      let exists = config.need_collect_countries.find(q => q === countryName);
      if (exists) {
        let href = $(element2).attr('href')
        countries.push({
          name: countryName,
          href: `https://www.booking.com${ href}`
        })
      }    
    })
  });
  // console.log(countries,'countries')
  return countries;
  // if (countries && countries.length > 0) {

  //   puppeteer.launch({headless: false}).then(async browser => {   
  //    for (const country of countries) {      
  //     const page = await browser.newPage();      
      
  //     await page.goto(country.href);
  //     let result = await page.$eval('ul.unified-postcards-container', el => el);
  //     console.log(result);

  //     await sleep(5000);
  //    }      
  //   });
  // }
 }


/**
 * 
 * @param {暂停毫秒数} ms 
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}