/**
 * 城市
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var citySchema = new Schema({
  zh_name:  String,
  en_name:  String,
  latitude: String,
  longitude: String,
  qyer_href: String,
  qyer_map_href: String,
  qyer_attraction_href : String,
  attractions:   Array,
});


module.exports = citySchema;