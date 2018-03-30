/**
 * 国家
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var countrySchema = new Schema({
  zh_name:  String,
  chauid:   String,
  en_name:  String,  
  qyer_map_href: String,
  qyer_href:     String,
  cities:   Array,
  attractions: Array,
  qyer_attraction_href: String,
  totalAttractionsCount: Number,
  totalCitiesCount : Number,
  qyerid: Number
});


module.exports = countrySchema;