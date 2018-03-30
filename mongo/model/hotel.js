/**
 * 酒店
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var hotelSchema = new Schema({
  zh_name:  String, //中文名称
  en_name:  String, //英文名称
  latitude: String,
  longitude: String,
  price_currency: String, //结算货币
  qyer_star: Number, // 穷游评分
  reference_price: Number, //参考价格
  price: Number, //价格
  intro: String, // 酒店描述
  booking_url: String, //缤客link
  price_discount: Number, // 折扣
  in_time: String, //入住时间
  out_time: String, // 退房时间 
  booking_information: String, //预定须知
});

module.exports = hotelSchema;