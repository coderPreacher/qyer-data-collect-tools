/**
 * 洲
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var chauSchema = new Schema({
  zh_name:  String, 
  id:       String,
  contries:  Array,
});


module.exports = chauSchema;