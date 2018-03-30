/**
 * mysql 仓库
 */

const Sequelize = require('sequelize');
const config = require('../config');

const EventEmitter = require('events');

class mysqlRepository extends EventEmitter {
  
  // Single instance
  get sequelize(){
    return this._sequelize;
  }

  set sequelize(value){
    this._sequelize = value;
  }
  initializer(){
    console.log('mysqlRepository initializer')
    this.Sequelize = Sequelize;
    this._sequelize = new Sequelize(config.mysql.database, config.mysql.username, config.mysql.password, {
      host: config.mysql.host,
      dialect: 'mysql', //驱动
      operatorsAliases: false,
      //数据库连接池
      pool: {
        max: 10,
        min: 1,
        acquire: 30000,
        idle: 10000
      }, 
    }); 
    const that = this;
    this._sequelize.authenticate().then(() => {
      that.emit('connected')
      console.log('Connection has been established successfully.');  
    }).catch(err => {
      console.error('Unable to connect to the database:', err);
    });

    this._sequelize.sync().then(()=>{
      console.log(' sync database successful!');
    }); 
    //Models/tables
    this.places = require('./models/place.js')(this._sequelize, Sequelize);  

    //Relations 
  } 
  constructor(){
    super();
    this.initializer();
  } 

}

module.exports = mysqlRepository;



