const mongoose=require('mongoose');

var CouponSchema=new mongoose.Schema({
	code:{
		type:String,
		required:true
	},
 	user_email:{
 		type:String,
 		required:true
 	},
 	creation_date:{
		type:Date,
		default:Date.now
 	},
	expiry_date:{
		type:Date,
		required:true,
		min:Date.now
	},
	used:{
		type:Boolean,
		default:false
	},
	discount:{
		type:Number,
		required:true
	}

});

var Coupon=mongoose.model('Coupon',CouponSchema);

module.exports={
	Coupon
};