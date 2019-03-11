const mongoose=require('mongoose');

var CouponSchema=new mongoose.Schema({
	_user:{
		type: mongoose.Schema.Types.ObjectId
	},
	creation_date:{
		type:Date,
		default:Date.now
	},
	expiry_date:{
		type:Date,
		required:true
	},
	used:{
		type:Boolean,
		default:false
	}
});
var Coupon=mongoose.model('Coupon',CouponSchema);

module.exports={
	Coupon
};