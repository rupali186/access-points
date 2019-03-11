const mongoose=require('mongoose');

var LockerSchema=new mongoose.Schema({
	_order:{
		type: mongoose.Schema.Types.ObjectId
	},
	size:{
		length:{
			type:Number,
			required:true
		},
		width: {
			type:Number,
			required:true
		},
		height:{
			type:Number,
			required:true
		}
	},
	weight:{
		type:Number,
		required:true
	},
	allocated:{
		type:Boolean,
		default:false
	},
	pin:{
		type:String,
		minlength:4
	}
	
});

var Locker=mongoose.model('Locker',LockerSchema);

module.exports={
	Locker
};