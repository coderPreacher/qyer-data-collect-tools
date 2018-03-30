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
const fs = require('fs');
const path = require('path');

module.exports = (cities) => {
  if (cities && cities.length > 0) {
    console.log(`find total hotel count: ${cities.length}`)    
    puppeteer.launch({headless: false,ignoreHTTPSErrors:true}).then(async browser => { 
      for (const city of cities) {   
        let cityHotel = Object.create(null)
        let fileName =  _.replace( _.replace(city.cityName, '\t', ''),'\n','').replace(/(\r\n|\n|\r|\t|\t\n|\n\t)/gm,"");  
        cityHotel.cityName = fileName;
        var p = path.join(process.cwd(), 'hotels', `${fileName}.json`);  
        if (!fs.exists(p)) {
          const writeStream = fs.createWriteStream(p);
          const page = await browser.newPage(); 
          city.hotels = [];   
          cityHotel.hotels = [];        
          await page.goto(city.href);
          await page.waitFor(5000);  
          try {
            page.click('#lp-featured-hotels-more > a') //跳转到更多酒店列表
            await page.waitFor(8000);  
            let len = await getHotelDatas(page,1,cityHotel);
            // const pageSizeObj = await page.$('#search_results_table > div.results-paging > ul > li:nth-child(10) > a', el => el.href);
            // console.log(pageSizeObj,'pageSizeObj');
            await sleep(5000);
            var curLen = 0;
            let index = 1;
            do {
              index = index + 1;
              try { 

                let next = await page.$('.paging-next');
                if (next) {
                  page.click('.paging-next') //跳转下一页
                  await page.waitFor(5000);  
                  curLen = await getHotelDatas(page,index,cityHotel);
                  await sleep(2000);   
                }else{
                  break;
                } 
              } catch (error) {
                break;
              } 
            }while(curLen == len)            
            await page.waitFor(1000); 
            writeStream.write(JSON.stringify(cityHotel));
            writeStream.end();
          } catch (error) {
            console.log(error)
            continue;
          }  
          await sleep(5000);
        }        
      }
    });  
  }
}

/**
 * 
 * @param {暂停毫秒数} ms 
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
/**
 * 获取酒店名称
 * @param {页对象} page 
 */
async function  getHotelNames(page){
  let hotel__names = await page.evaluate(() => {
    const spans = document.querySelectorAll('.sr-hotel__name');
    return [].map.call(spans, a => a.innerText);
  }); 
  return hotel__names;
}


/**
 * 获取酒店详情链接
 * @param {页对象} page 
 */
async function getHotelLinks(page) {
  const hotel__links = await page.evaluate(() => {
    const links = document.querySelectorAll('.hotel_name_link');
    return [].map.call(links, a => a.href);
  }); 
  return hotel__links;
}
async function getImgs(page) {
  const hotel_imgs = await page.evaluate(() => {
    const imgs = document.querySelectorAll('.hotel_image');
    return [].map.call(imgs, img => img.src);
  });  
  return hotel_imgs;
}

async function getRank(page) {
  const hotel_ranks = await page.evaluate(() => {
    const descs = document.querySelectorAll('.review-score-badge');
    return [].map.call(descs, a => a.innerText);
  });  
  return hotel_ranks;
}
/**
 * 获取酒店描述
 * @param {*} page 
 */
async function getHotelDesc(page) {
  const hotel_descs = await page.evaluate(() => {
    const descs = document.querySelectorAll('.hotel_desc');
    return [].map.call(descs, a => a.innerText);
  });  
  return hotel_descs;
}

/**
 * 获取酒店数据
 * @param {页对象} page 
 * @param { 页码 } pageIndex
 * @param { 城市对象 } city
 */
async function getHotelDatas(page,pageIndex,city) {
  const hotel__names = await getHotelNames(page);
  const hotel__links = await getHotelLinks(page);
  const hotel_descs = await getHotelDesc(page);
  const hotel_ranks = await getRank(page);
  const hotel_imgs = await getImgs(page); 

  for (let index = 0; index < hotel__names.length; index++) {
    const hotel__name = hotel__names[index];    
    const zh_name = hotel__name.substring(0, hotel__name.indexOf('（') - 1)
    const en_name = hotel__name.substring( hotel__name.indexOf('（') + 1, hotel__name.indexOf('）') -1 )
    city.hotels.push({
      name:  hotel__name,
      zh_name: zh_name,
      en_name: en_name,
      link: hotel__links[index],
      intro: hotel_descs[index],
      rank: hotel_ranks[index],
      cover: hotel_imgs[index]
    });
  } 
  console.log(JSON.stringify(city))
  return hotel__names.length;
}