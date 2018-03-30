
/**
 * 不存在的国家:美国
null
不存在的国家:马尔代夫
null
不存在的国家:帕劳
null
不存在的国家:新西兰
null
不存在的国家:新加坡
 */
const config = require('./config')

const mongoose = require('mongoose')

const countrySchema = require('./mongo/model/country')

mongoose.connect(config.mongo,(err)=>{
  if (err) {
    console.log(`can not conect to ${ config.mongo}`)
  }else{

    console.log(` connect to ${ config.mongo} successful!`)

  }
});


var Country = mongoose.model('Country', countrySchema);


let notCollectCountries = [];

for (const country of config.need_collect_countries) {
  console.log(country)
  Country.findOne({ 'zh_name': country }, 'zh_name', function (err, res) {
    console.log(res)
    if (!res || err) {
      notCollectCountries.push(country)
      console.log(`不存在的国家:${country}` )
    }
    else{
      console.log(res)
    }
  }); 
}




