/**
 * 获取洲、国家、城市数据
 {
  "zh_name":"曼谷",//中文名
  "en_name":"Bangkok",//英文名
  "intro":"曼谷",//简介
  "cover":"https://pic.qyer.com/album/user/2586/22/Q0xdRBgFYUw/index/cover",
  "latitude":"13.7540559751129", //纬度
  "longitude":"100.528855919838", //经度
}
 */
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const config = require('./config');

module.exports = ($) => {
  let writeStream = fs.createWriteStream(path.join(process.cwd(),`contries.json`));
  let writeStream2 = fs.createWriteStream(path.join(process.cwd(),`chaus.json`));
  let chaus = [];
  let contries = [];
  let chauList = [];
  $('#js-tab-4').children('li').children('span').contents().each((i, element) => { 
    let chau = _.replace(_.replace(element.data,'\n',''),'\t','');    
    console.log(chau);
    chaus.push(chau.replace(/(\r\n|\n|\r|\t|\t\n|\n\t)/gm,""));
    chauList.push({ chau_name: chau.replace(/(\r\n|\n|\r|\t|\t\n|\n\t)/gm,""), contries:[] });
  }); 
  $('#js-container-4').children('ul').each((index,element)=>{
    console.log(element.type);
    console.log(element.name);
    $(element).children('li').children('span').children('a').contents().each((i, element) => { 
      let country = Object.create(null); 
      country.href = $(element.parent).attr('href');
      country.mapAddress = `${country.href}map`; //地图链接
      country.attractionAddress = `${country.href}map/poi/`; //旅行的链接
      $(element.parent).children('span').contents().each((j, data) => {      
        country.zh_name =  _.replace( _.replace(data.data, '\t', ''),'\n','').replace(/(\r\n|\n|\r|\t|\t\n|\n\t)/gm,""); 
      }); 
      $(element.parent).children('em').contents().each((j, data2) => {      
        country.en_name =   _.replace( _.replace(data2.data, '\t', ''),'\n','').replace(/(\r\n|\n|\r|\t|\t\n|\n\t)/gm,"");  
      });       
      let find = chauList[index].contries.find(q => q.en_name === country.en_name);
      if (!find) {
        chauList[index].contries.push(country);        
      }      
    });
  });
  $('#js-container-4').children('ul').children('li').children('span').children('a').contents().each((i, element) => { 
    let country = Object.create(null); 
    country.href = $(element.parent).attr('href');
    country.mapAddress = `${country.href}map`; //地图链接
    country.attractionAddress = `${country.href}map/poi/`; //旅行的链接
    $(element.parent).children('span').contents().each((j, data) => {      
      country.zh_name =  _.replace( _.replace(data.data, '\t', ''),'\n','').replace(/(\r\n|\n|\r|\t|\t\n|\n\t)/gm,""); 
    }); 
    $(element.parent).children('em').contents().each((j, data2) => {      
      country.en_name =   _.replace( _.replace(data2.data, '\t', ''),'\n','').replace(/(\r\n|\n|\r|\t|\t\n|\n\t)/gm,"");  
    }); 
    let exists = config.need_collect_countries.find(q => q === country.zh_name);
    let find = contries.find(q => q.en_name === country.en_name);
    if (exists && !find) {
      contries.push(country);
    }
  });
  let obj = Object.create(null);
  obj.chaus = chaus;
  obj.contries = contries; 
  if (chauList && chauList.length > 0) {
    writeStream2.write(JSON.stringify(chauList));
    writeStream2.end();
  }
  writeStream.write(JSON.stringify(obj));
  writeStream.end();
  return contries;
} 