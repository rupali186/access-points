const jwt=require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = function(UserSchema) {
	UserSchema.statics.findByToken=function(token){
		var User=this;
		var decoded;
		try{
			decoded=jwt.verify(token,process.env.JWT_SECRET);
		}catch(e){
			return Promise.reject();
		}
		return User.findOne({
			_id:decoded._id,
			'tokens.token':token,
			'tokens.access':'auth'
		});
	};

	UserSchema.statics.findByCredentials=function(email,password){
		var User=this;
		return User.findOne({email}).then((user)=>{
			if(!user){
				return Promise.reject();
			}
			return new Promise((resolve,reject)=>{
				bcrypt.compare(password,user.password,(err,res)=>{
					if(res){
						resolve(user);
					}else{
						reject();
					}
				});
			});
		
		});

	};
}

