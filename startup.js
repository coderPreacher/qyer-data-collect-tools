


/**
 * 入口文件
 */
const Crawler = require("crawler");

const { fork } = require('child_process');
var numCPUs = require('os').cpus().length; 



const Chau = require('./chau_collect');  
const config = require('./config') 
const mongoProxy = require('./mongo/mongoRepository')

const mongo = new mongoProxy();

let countries = [];

let excuted = false;
var c = new Crawler({
  jQuery: true,
  maxConnections: 10,
  // This will be called for each crawled page
  callback: function (error, res, done) {
    if (error) {
      console.log(error);
    } else {
      var $ = res.$;
      countries = Chau($,mongo); 
    }
    done();
  }
});

// Queue just one URL, with default callback
c.queue('http://place.qyer.com/'); 

  

c.on('drain', function () {   
  // console.log('drain executed!',countries);
  console.log('countries len!',countries.length);

  // 
  let need_collect_country = [ '新加坡'];

  let tmp_arr = [];
  for (const country of countries) {
    if (need_collect_country.indexOf(country.zh_name) != -1) {
      tmp_arr.push(country)
    }
  }
  
  countries = tmp_arr;

  console.log(countries,'countries')

  if (config.process_num &&  config.process_num > 0) {
    numCPUs = config.process_num;
  } 

  let workers = [];

  workers.length = numCPUs;

  console.log(`需要抓取的国家数量:${ countries.length  }`)

  console.log(`CPU length: ${ numCPUs }`)

  if (countries.length > 0 && config.process_num > 0) {


    if (countries.length == 1) {
      numCPUs = 1
    }

    //平均每个进程需要处理的数量
    let avg_worker_num =  countries.length / numCPUs

    console.log(`平均每个进程需要处理的数量: ${avg_worker_num} `)

    for (let index = 0; index < numCPUs; index++) {

      let tasks = [];

      if (index == numCPUs - 1 && countries.length % config.process_num !== 0) {

        tasks = countries.slice( (index * avg_worker_num ), (index * avg_worker_num ) + avg_worker_num + countries.length % config.process_num )

      }else{

        if (index == 0  ) {

          tasks = countries.slice(0, avg_worker_num ) ;

        }
        else{
          tasks =  countries.slice( (index * avg_worker_num ), (index * avg_worker_num ) + avg_worker_num )    
        } 
      } 

      console.log(`${index} ${tasks.length}  ${JSON.stringify(tasks)} `)
      const worker = fork('worker.js');

      worker.send({ countries:tasks})

      
      worker.on('exit', (code)=> {
        console.log(`worker ${worker.pid} died with code: ${code}`);
      });

      worker.on('uncaughtException', (err) => {
        console.log(`${worker.pid}  uncaughtException with err: ${err}`);
        
      });

      workers[index] = { worker, tasks }; 
    }  

  }
 
});


