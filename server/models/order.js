const mongoose=require('mongoose');
const validator=require('validator');

const {Status}=require('./../constants/stringConstants.js');
const {DeliveryMode}=require('./../constants/stringConstants.js');
const {PaymentStatus}=require('./../constants/stringConstants.js');

var OrderSchema=new mongoose.Schema({
	user_id:{
		required:true,
		type: mongoose.Schema.Types.ObjectId
	},
	size:{
		length:{
			type:Number,
			min:0,
			required:true
		},
		width: {
			type:Number,
			min:0,
			required:true
		},
		height:{
			type:Number,
			min:0,
			required:true
		}
	},
	price:{
		type:Number,
		min:0,
		required:true
	},
	o_date:{
		type:Date,
		default:Date.now
	},
	del_date:{
		type: Date,
		required:true,
		min:Date.now
	},
	category_id:{
		type:Number,
		required:true
	},
	product_id:{
		type:Number,
		required:true
	},
	weight:{
		type:Number,
		min:0,
		required:true
	},
	image:{
		url:{
			type:String,
			trim:true,
			validate:{
				validator: validator.isURL,
				message:'{VALUE} is not a valid url'
			}
		}
	},
	status:{
		type:String,
		enum: [Status.DELIVERED,Status.CANCELLED,Status.FAILED,Status.NEW],
		lowercase:true,
		default:Status.NEW
	},
	del_mode:{
		type:String,
		enum: [DeliveryMode.ACCESS_PTS,DeliveryMode.HOME_DEL,DeliveryMode.STORE_DEL],
		lowercase:true,
		required:true
	},
	payment_status:{
		type:String,
		enum:[PaymentStatus.PAID,PaymentStatus.UNPAID],
		lowercase:true,
		required:true
	},
	address:{
		h_no:{
			type:String,
			minlength:1,
			required:true
		},
		street:{
			type:String,
			minlength:1,
			uppercase:true,
			required:true
		},
		state:{
			type:String,
			minlength:1,
			uppercase:true,
			required:true
		},
		city:{
			type:String,
			minlength:1,
			uppercase:true,
			required:true
		},
		country:{
			type:String,
			minlength:1,
			uppercase:true,
			required:true
		},
		name:{
			type:String,
			minlength:1,
			uppercase:true,
			default:this.u_name
		},
		landmark:{
			type:String,
			minlength:1,
			uppercase:true,
			required:true
		},
		pincode:{
			type:Number,
			minlength:6,
			min:0,
			required:true,
		},
		contact_no:{
			type:String,
			required:true,
			minlength:10
		}
	},
	access_pt_address:{
		address:{
			type:String
		}
	}
	
});

var Order=mongoose.model('Order',OrderSchema);

module.exports={
	Order
};