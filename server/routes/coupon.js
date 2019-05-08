const express=require('express');
let router = express.Router();
const _=require('lodash');
const bodyParser=require('body-parser');
const {ObjectID}=require('mongodb');
var rp = require('request-promise');

const {mongoose}=require('./../db/mongoose.js');
const {Order}=require('./../models/order.js');
const {User}=require('./../models/user.js');
const {coupons}=require('./../models/coupon.js');
const {authenticate}=require('./../middleware/authenticate.js');
const {Status}=require('./../constants/stringConstants.js');
const {Url}=require('./../constants/stringConstants.js');
const {transporter}=require('./../notification/nodemailer.js');



router.post('/', function (req, res) {
    coupons.findOne({
      user_email:req.body.email
    }).then((coupon)=>{
    	if(coupon){
        	console.log("already has a code");
      	}
    	else{
  			generateUniqueCode().then(function(code) {
  				new coupons({
    			 	code:code,
   				 	user_email:req.body.email,
   				 	type:req.body.type
 		 		}).save()
  				.then((coupon)=>{
  					// res.send(coupon);
  					console.log('coupon saved.');
  					var mailOptions={
    			 		from:process.env.EMAIL,
   				 		to:req.body.email,
   				 		subject:'sending email',
   				 		html: '<p>Your code is</p>'+code
   					};
   					transporter.sendMail(mailOptions,function(err,info){
       					if(err){
        					console.log(err);
        					res.status(400).send(coupon);
       					}else{
        					console.log('email sent'+info.response);
							res.status(200).send(coupon);
						}
   					});
   
  				},(e)=>{
  					res.status(400).send(e);
  				});
  				
     		});
   		}
	});
});
var count = 0;
// this is code that checks uniqueness and returns a promise
function check(code) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      count++;
      // first resolve with false, on second try resolve with true
      if (count === 1) {
        console.log(code + ' is not unique');
        resolve(false);
      } else {
        console.log(code + ' is unique');
        resolve(true);
      }
    }, 1000);
  });
}

var generateUniqueCode = ()=>{
  var code = couponCode.generate({parts:3,partLen:5});
  return check(code)
    .then(function(result) {
      if (result) {
        return code;//if it is unique then return the code
      } else {
        return generateUniqueCode();//else generate a new code 
      }
    });
};

module.exports = router;