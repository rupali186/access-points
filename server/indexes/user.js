module.exports = function(UserSchema) {
	UserSchema.index({num_orders: 1});
	UserSchema.index({num_orders:-1,locker_used:1});
	UserSchema.index({del_failures_no:-1,locker_used:1});
}

