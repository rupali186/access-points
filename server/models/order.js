const mongoose=require('mongoose');
const validator=require('validator');

var OrderSchema=new mongoose.Schema({
	user_id:{
		required:true,
		type: mongoose.Schema.Types.ObjectId
	},
	size:{
		length:{
			type:Number,
			min:1,
			required:true
		},
		width: {
			type:Number,
			min:1,
			required:true
		},
		height:{
			type:Number,
			min:1,
			required:true
		}
	},
	price:{
		type:Number,
		min:1,
		required:true
	},
	o_date:{
		type:Date,
		default:Date.now
	},
	del_date:{
		type: Date,
		required:true
	},
	category:{
		id:{
			type:Number,
			required:true
		}
	},
	weight:{
		type:Number,
		min:1,
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
		delivered: {
			type: Boolean,
			default: false
		},
		cancelled: {
			type: Boolean,
			default:false
		},
		failed:{
			type: Boolean,
			default:false
		}
	}
	
});

var Order=mongoose.model('Order',OrderSchema);

module.exports={
	Order
};