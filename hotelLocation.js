const fs = require('fs');
const path = require('path'); 
const puppeteer = require('puppeteer');
const _ = require('lodash');

const needCities = ["曼谷","清迈","芽庄","普吉岛","岘港"];

let dir = path.join(process.cwd(), 'hotels');  
if (fs.existsSync(dir)) {
  const cityFiles = fs.readdirSync(dir);
  if (cityFiles && cityFiles.length > 0) {
    puppeteer.launch({headless: false,ignoreHTTPSErrors:true}).then(async browser => {
    for (const city of cityFiles) {
      let fullPath =  path.join(process.cwd(), 'hotels', `${city}`);  
      let newPath =  path.join(process.cwd(), 'hotelDatas', `${city}.json`);  
      if (fs.existsSync(newPath)) {
        continue;
      }
      
      const newCity = Object.create(null);
      const writeStream = fs.createWriteStream(newPath);
      writeStream.write("[")
      const cityPkg = require(fullPath);
      console.log(cityPkg.cityName)
      newCity.cityName = cityPkg.cityName;
      if (needCities.indexOf(cityPkg.cityName)  == -1) {
        continue;
      }
      newCity.hotels = [];
      if (cityPkg && cityPkg.hotels && cityPkg.hotels && cityPkg.hotels.length > 0) {
        for (const hotel of cityPkg.hotels) {    
            const newHotel = Object.create(null);     
            newHotel.name = hotel.name;
            newHotel.zh_name = hotel.en_name;
            newHotel.en_name = hotel.zh_name;
            newHotel.link = hotel.link;
            newHotel.intro = hotel.intro;
            newHotel.rank = hotel.rank;
            newHotel.cover = hotel.cover;
            const page = await browser.newPage();  
            await page.goto(hotel.link); 
            newHotel.address = await page.$eval('.hp_address_subtitle', e => e.innerText);
            console.log(newHotel.address,'newHotel.address')
            try {
              page.click('.show_map') //跳转到更多酒店列表
              await page.waitFor(1500);
              page.on('response', async (res) => {
                if (res.ok) {
                  var req = res.request();              
                  if (req._url.startsWith('https://www.booking.com/markers_on_map?')) {                    
                    let json = await res.json(); 
                    // console.log(json,'json');
                    let location = json.b_hotels[0]; //城市总数
                    if (location) {
                      newHotel.latitude = location.b_latitude;
                      newHotel.longitude = location.b_longitude;
                      writeStream.write(",")
                      newCity.hotels.push(newHotel);
                      writeStream.write(JSON.stringify(newHotel));                
                    }
                  }
                }
              });  
              await page.waitFor(1500);
              console.log(newHotel,'hotel');
              await page.close();
            } catch (error) {
              console.log(error)
              continue;
            }
          }
        } 
        writeStream.write("]")
        writeStream.end();
      }     
    });
  }
}


/**
 * 
 * @param {暂停毫秒数} ms 
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
