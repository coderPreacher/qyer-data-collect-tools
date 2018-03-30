/**
 * 景点
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var attractionSchema = new Schema({
  zh_name:  String, //中文名称
  en_name:  String, //英文名称
  latitude: String,
  longitude: String,
  qyer_star: Number, // 穷游评分  
  intro: String, // 景点描述
  address:  String, //景点详细地址
  country_id:String, //国家Id
  city_id:   String, // 城市Id
});

module.exports = attractionSchema;