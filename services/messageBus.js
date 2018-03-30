/**
 * 消息总线
 */

 const messageType = require('./messageType');


/**
 * 
 * @param {Object} message  kafka message seq model
 */
 module.exports = function (message) {
   switch (message.type) {
    case messageType.HOTEL:
       
      break;
    case messageType.ATTRACTION:
       
      break;
    case messageType.CHAU:
       
      break;
    case messageType.CITY:
       
      break;
    case messageType.COUNTRY:
       
      break;
   
     default:

      break;
   }
 }



