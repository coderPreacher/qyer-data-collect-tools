

const mongoose = require('mongoose')

const chauSchema = require('./model/chau')
const countrySchema = require('./model/country')

const config = require('../config')


class mongoRepository {

  constructor(){
    this.initConnection();
  }

  initConnection(){
    mongoose.connect(config.mongo,(err)=>{
      if (err) {
        console.log(`can not conect to ${ config.mongo}`)
      }else{

        console.log(` connect to ${ config.mongo} successful!`)

      }
    });
  }

  saveCountry(countryDto){

    var Country = mongoose.model('Country', countrySchema);

    let country = new Country(countryDto);

    country.save((err)=>{
      if (err) {
        console.error(err)
      }
    });
  }

  
  saveChau(chauDto){

    var Chau = mongoose.model('Chau', chauSchema);

    let chau = new Chau(chauDto);

    chau.save(()=>{

    }); 
  }

  getChaus(){ 
    return new Promise(function(resolve,reject){
      var Chau = mongoose.model('Chau', chauSchema);
      Chau.find({},(res,err) => {
        if (err) {
          reject(err)
        }else{
          resolve(res)
        } 
      });
    });
  }
}
module.exports = mongoRepository;



