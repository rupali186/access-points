const mongoose=require('mongoose');
const validator=require('validator');

var UserSchema=new mongoose.Schema({
	email:{
		type:String,
		required:true,
		trim:true,
		minlength:1,
		unique:true,
		lowercase:true,
		validate:{
			validator: validator.isEmail,
			message:'{VALUE} is not a valid email'
		}
	},
	password:{
		type:String,
		required:true,
		minlength:6
	},
	tokens:[{
		access:{
			type:String,
			required:true
		},
		token:{
			type:String,
			required:true
		}
	}],
	u_name:{
		type: String,
		required:true,
		minlength:1
	},
	acc_creation_date:{
		type:Date,
		default:Date.now
	},
	phone_no:[{
		type: String,
		required:true,
		minlength:10
	}],
	dob:{
		type: Date,
		required:true,
	},
	gender:{
		type:String,
		enum: ['male', 'female', 'other'],
		lowercase:true,
		required:true
	},
	last_order_date:{
		type: Date,
		default: null
	},
	del_failures_no:{
		type:Number,
		default:0,
		min:0
	},
	num_orders:{
		type: Number,
		default:0,
		min:0
	},
	address:[{
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
	}],
	locker_used:{
		type: Boolean,
		default:false
	}
});

require("./../indexes/user.js")(UserSchema);

require("./../schemaMethods/user.js")(UserSchema);

require("./../schemaStatics/user.js")(UserSchema);

require("./../middleware/pre.js")(UserSchema);


const indexes = UserSchema.indexes();
console.log('index:', indexes);

var User=mongoose.model('User',UserSchema);

// User.on('index', function(error) {
//     console.log(error);
// });

module.exports={
	UserSchema,
	User
};