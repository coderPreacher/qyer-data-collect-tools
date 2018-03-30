const unirest = require('unirest');

var Request = unirest.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452&key=AIzaSyBT8MXqYpqBWH91aKxKHX0I9ObZ2-CMa3Q');
 

Request.proxy('http://localhost:8087');
 

Request.end((res)=>{
  console.log(res);
});


