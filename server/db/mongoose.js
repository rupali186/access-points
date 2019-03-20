const mongoose=require('mongoose');

mongoose.Promise=global.Promise;
mongoose.connect(process.env.MONGODB_URI,{
	useNewUrlParser: true,
	autoIndex:false
});

module.exports={
	mongoose
};