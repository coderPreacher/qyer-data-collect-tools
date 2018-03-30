/**
 *  MongoDB data Migration to Mysql 
 *  mongodb-------->Kafka--------> Mysql
 */

const Repository = require('./mysql/mysqlRepository');
const config = require('./config');
const placeType = require('./mysql/models/placetype');
const mongoose = require('mongoose');
const uuid = require ("uuid");
const Producer = require('./kafka/hightLevelProducer');
const chauSchema = require('./mongo/model/chau');
const countrySchema = require('./mongo/model/country');
const async = require('async');
const Chau = mongoose.model('Chau', chauSchema);
const Country = mongoose.model('Country', countrySchema);

const repository = new Repository();

const producer = new Producer();

producer.on('kafka_ready', ()=>{
  console.log('kafka_ready')
  

  async.waterfall([connectMongoDB,queryChauCountries,insertChauCountries,queryCitiesAttractions,insertCitiesAttractions], (err, result) => {
    if (err) {
      console.error(err);
      throw err; 
    }
    console.log(`waterfall execute  result : ${result }`)
  }) 
})

// connnect to mongo db
const connectMongoDB = (callback) => {
  mongoose.connect(config.mongo,(err) => {
    if (err) {
      console.log(`can not conect to ${ config.mongo}`)     
      callback(new Error(`can not conect to ${ config.mongo}`))
    }else{ 
      console.log(` connect to ${ config.mongo} successful!`)
      callback(null)
    }
  });
}
// query chau && countries
const queryChauCountries = (callback) => {
  let chauCountries = [];
  let countries = [];
  Chau.find({}, function(err, docs) {
    if (!err){ 
      if (docs && docs.length > 0) {
        for (const chau of docs) { 
          chauCountries.push({ //洲
              zh_name: chau.zh_name,
              id: chau.id,
              type: placeType.CHAU
          })
          countries = countries.concat(chau.contries)
          for (const country of chau.contries) { 
            chauCountries.push({ //国家
              zh_name: country.zh_name,
              qyer_href: country.qyer_href,
              qyer_map_href: country.qyer_map_href,
              qyer_attraction_href: country.qyer_attraction_href,
              en_name: country.en_name,
              parent_id: country.chauid,
              id: country.id,
              type: placeType.COUNTRY
            }) 
          }  
        }
        callback(null,chauCountries,countries);
      } 
    } else {callback(err);}
  }); 
}

const insertChauCountries = (chauCountries,countries,callback) => {
  if (chauCountries && chauCountries.length > 0) {
     
    for (const item of chauCountries) {
      producer.emit('send',item) 
    }
  }

  console.log( 'insertChauCountries successful! ')

  callback(null,countries);
}


const queryCitiesAttractions = (countries,callback) => {
  let CitiesAttractions = [];
  let cities_list = [];
  Country.find({}, function(err, docs) {
    if (!err){ 
      if (docs && docs.length > 0) { 
        for (let country of docs) {
          let country_id = countries.find(q=> q.zh_name == country.zh_name).id;          
          if (!country_id) {
            continue;
          }
          for (let city of country.cities) { //城市
            let obj = {
              zh_name: city.cn,
              qyer_href: city.url,
              qyer_map_href: city.mapUrl,
              latitude: city.position.x,
              longitude: city.position.y, 
              en_name: city.en,
              parent_id: country_id,
              id: uuid.v4(),
              type: placeType.CITY
            }
            cities_list.push(obj)      
            CitiesAttractions.push(obj)
          } 
          for (let attraction of country.attractions) { //景点
            //过滤掉 美食及其他
            if (attraction.rank.catename != '景点观光') {
              continue;
            } 
            let city_id = cities_list.find( q => q.zh_name == attraction.rank.place)
            if (!city_id) {
              continue;
            }    
            CitiesAttractions.push( {
              zh_name: attraction.cn,
              latitude: attraction.position.x,
              longitude: attraction.position.y,
              qyer_rank: attraction.count,
              qyer_href: attraction.url, 
              qyer_attraction_href: attraction.url,
              en_name: attraction.en,
              parent_id: city_id.id,
              cover: attraction.photo,
              intro: attraction.intro,
              id: uuid.v4(),
              type: placeType.ATTRACTION
            })
          }
        }
      }
      console.log( 'queryCitiesAttractions successful! ')
      callback(null,CitiesAttractions)
      
    } else {callback(err);}
  }); 
} 


const insertCitiesAttractions = (CitiesAttractions,callback) => {
  
  if (CitiesAttractions && CitiesAttractions.length > 0) {
 
    for (const item of CitiesAttractions) {
      producer.emit('send',item) 
    }
  }
  console.log('insertCitiesAttractions successful! ')
  callback(null,true);
}




