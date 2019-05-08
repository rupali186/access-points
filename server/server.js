require('./config/config');

const couponCode = require('coupon-code');
const express=require('express');
const _=require('lodash');
const bodyParser=require('body-parser');
const {ObjectID}=require('mongodb');
var rp = require('request-promise');

const {mongoose}=require('./db/mongoose.js');
const {Order}=require('./models/order.js');
const {User}=require('./models/user.js');
const {coupons}=require('./models/coupon.js');
const {authenticate}=require('./middleware/authenticate.js');
const {Status}=require('./constants/stringConstants.js');
const {Url}=require('./constants/stringConstants.js');
const {transporter}=require('./notification/nodemailer.js');
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