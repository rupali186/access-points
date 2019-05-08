require('./config/config');

const express=require('express');
const bodyParser=require('body-parser');

const userRoutes = require('./routes/user');
const orderRoutes = require('./routes/order');
const couponRoutes = require('./routes/coupon');

const port=process.env.PORT;

var app=express();

app.use(bodyParser.json());

app.use('/users', userRoutes);
app.use('/orders',orderRoutes);
app.use('/coupons',couponRoutes);

app.listen(port,()=>{
	console.log(`Started on port ${port}`);
});
module.exports={
	app
}