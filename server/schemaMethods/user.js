const jwt=require('jsonwebtoken');
const _=require('lodash');

module.exports = function(UserSchema) {
	UserSchema.methods.toJSON=function(){
		var user=this;
		var userObject=user.toObject();
		return _.pick(userObject,['_id','u_name','email','phone_no','address','dob','gender','num_orders','del_failures_no','acc_creation_date',
			'last_order_date','last_coupon_date','locker_used','tokens']);
	}

	UserSchema.methods.generateAuthToken=function(){
		var user=this;
		var access='auth';
		var token=jwt.sign({_id:user._id.toHexString(),access},process.env.JWT_SECRET).toString();
		user.tokens.length=0;
		user.tokens=user.tokens.concat([{access,token}]);
		return user.save().then(()=>{
			return token;
		});
	};

	UserSchema.methods.removeToken = function (token) {
  		var user = this;
  		return user.update({
    		$pull: {
      			tokens: {token}
    		}
  		});
	};

}
