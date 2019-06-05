const express=require('express');
let router = express.Router();
const _=require('lodash');
const bodyParser=require('body-parser');
const {ObjectID}=require('mongodb');
var rp = require('request-promise');
const couponCode = require('coupon-code');


const {mongoose}=require('./../db/mongoose.js');
const {Order}=require('./../models/order.js');
const {User}=require('./../models/user.js');
const {Coupon}=require('./../models/coupon.js');
const {authenticate}=require('./../middleware/authenticate.js');
const {Status}=require('./../constants/stringConstants.js');
const {Url}=require('./../constants/stringConstants.js');
const {transporter}=require('./../notification/nodemailer.js');

router.post('/', function (req, res) {
    Coupon.findOne({
      user_email:req.body.user_email
    }).then((coupon)=>{
    	if(coupon){
        	console.log("already has a code");
      	}
    	else{
  			generateUniqueCode().then(function(code) {
  				new Coupon({
    			 	code:code,
   				 	user_email:req.body.user_email,
            expiry_date:req.body.expiry_date,
            discount:req.body.discount
 		 		}).save()
  				.then((coupon)=>{
  					console.log('coupon saved.');
            res.send({coupon});
  				},(e)=>{
  					res.status(400).send(e);
  				});
  				
     		});
   		}
	});
});

router.get('/searchCode',(req,res)=>{
  var code=_.toString(req.query.code);
  var user_email=_.toString(req.query.user_email);
  Coupon.findOne({
    code:code,
    user_email:user_email
  }).then((coupon)=>{
    if(coupon){
      res.send({coupon});
    }else{
      res.status(404).send({});
    }
  },(e)=>{
    res.status(400).send(e);
  });

});

router.patch('/:id',(req,res)=>{
  var id=req.params.id;
  var body=_.pick(req.body,['used']);
  var used=body.used;
  console.log(used);
  if(!ObjectID.isValid(id)){
    res.status(400).send({});
    return console.log('ID is invalid');
  };
  Coupon.findOneAndUpdate({_id:id},{$set:body},{new:true}).then((coupon)=>{
    if(!coupon){
      return res.status(400).send();
    }
    res.send({coupon});
  }).catch((e)=>{
    res.status(400).send();
  });
});


var count = 0;
function check(code) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      count++;
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
        return code;
      } else {
        return generateUniqueCode();
      }
    });
};

module.exports = router;