const mongoose=require('mongoose');

var couponSchema=new mongoose.Schema({
 code:String,
 type:Number,
 user_email:String

});

var coupons=mongoose.model('coupons',couponSchema);

module.exports={
	coupons
};