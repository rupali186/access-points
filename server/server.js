require('./config/config');

const couponCode = require('coupon-code');//generate unique coupon codes
const Promise = require('bluebird');
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
const {EmailConfig}=require('./config/emailConfig.js');
const {transporter}=require('./notification/nodemailer.js');

const port=process.env.PORT;

var app=express();



app.use(bodyParser.json());

app.get('/users/me',authenticate,(req,res)=>{
	res.send(req.user);
});

app.get('/users',(req,res)=>{
	User.find().then((users)=>{
		res.send({users});
	},(e)=>{
		res.status(400).send(e);
	});
});

app.get('/users/new',(req,res)=>{
	var n=_.toNumber(req.query.limit);
	User.find({num_orders:0}).sort({acc_creation_date:-1}).limit(n).then((users)=>{
		res.send({users});
	},(e)=>{
		res.status(400).send(e);
	});
});

app.get('/users/newtolocker',(req,res)=>{
	var n=_.toNumber(req.query.limit);
	User.find({num_orders:{ $gte: 1},locker_used:false}).sort({last_order_date:-1}).limit(n).then((users)=>{
		res.send({users});
	},(e)=>{
		res.status(400).send(e);
	});
});

app.get('/users/target',(req,res)=>{
	var threshold=_.toNumber(req.query.threshold);
	var limit=_.toNumber(req.query.limit);
	User.find({del_failures_no:{ $gte: threshold},locker_used:false}).sort({last_order_date:-1}).limit(limit).then((users)=>{
		res.send({users});
	},(e)=>{
		res.status(400).send(e);
	});
});

app.get('/users/:id',(req,res)=>{
	var id=req.params.id;
	if(!ObjectID.isValid(id)){
		res.status(400).send({});
		return console.log('ID is invalid');
	}
	User.findOne({
		_id:id
	}).then((user)=>{
		if(user){
			res.send({user});
		}else{
			res.status(404).send({});
		}
	},(e)=>{
		res.status(400).send(e);
	});
	//res.send(req.params);
});

app.post('/users',(req,res)=>{
	console.log(req.body);
	var body=_.pick(req.body,['u_name','email','password','phone_no','address','dob','gender']);
	var user=new User(body);
	user.save().then((user)=>{
		return user.generateAuthToken();
	}).then((token)=>{
		res.header('x-auth',token).send(user);
	}).catch((e)=>{
		res.status(400).send(e);
	});
});

app.post('/users/login',(req,res)=>{
	var body=_.pick(req.body,['email','password']);
	User.findByCredentials(body.email,body.password).then((user)=>{
		return user.generateAuthToken().then((token)=>{
			res.header('x-auth',token).send(user);
		})
	}).catch((e)=>{
		res.status(400).send();
	});
});

app.patch('/users/:id',authenticate,(req,res)=>{
	var id=req.params.id;
	var userId=req.user._id;
	var body=_.pick(req.body,
		['u_name','password','phone_no','address','dob','gender','last_order_date','del_failures_no','num_orders','locker_used']);
	if(!ObjectID.isValid(id)){
		res.status(400).send({});
		return console.log('ID is invalid');
	};

	User.findOneAndUpdate({_id:id},{$set:body},{new:true}).then((user)=>{
		if(!user){
			return res.status(400).send();
		}
		res.send({user});
	}).catch((e)=>{
		res.status(400).send();
	});
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

app.delete('/users/me',authenticate,(req,res)=>{
	var id=req.user._id;
	if(!ObjectID.isValid(id)){
		res.status(400).send({});
		return console.log('ID is invalid');
	};
	User.findOneAndRemove({
		_id:id
	}).then((user)=>{
		if(!user){
			res.status(404).send({});
		}else{
			res.status(200).send({user});
		}
		console.log(user);
	},(e)=>{
		res.status(400).send(e);
	});
});

app.get('/orders',(req,res)=>{
	Order.find().then((orders)=>{
		res.send({orders});
	},(e)=>{
		res.status(400).send(e);
	});
});

app.get('/orders/me',authenticate,(req,res)=>{
		 // res.send(req.user);

	var userId=req.user._id;
	if(!ObjectID.isValid(userId)){
		res.status(400).send({});
		return console.log('/orders/me ID is invalid'+userId);
	}
	Order.find({user_id:req.user._id}).sort({o_date:-1}).then((orders)=>{
		res.send({orders});
	},(e)=>{
		res.status(400).send(e);
	});
});
app.get('/orders/:id',(req,res)=>{
	var id=req.params.id;
	if(!ObjectID.isValid(id)){
		res.status(400).send({});
		return console.log('/orders/:id ID is invalid');
	}
	Order.findOne({
		_id:id,
	}).then((order)=>{
		if(order){
			res.send({order});
		}else{
			res.status(404).send({});
		}
	},(e)=>{
		res.status(400).send(e);
	});
	//res.send(req.params);
});





app.post('/orders',authenticate,(req,res)=>{
	console.log(req.body);
	var order=new Order({
		size:req.body.size,
		price:req.body.price,
		category_id:req.body.category_id,
		product_id:req.body.product_id,
		del_date:req.body.del_date,
		weight:req.body.weight,
		user_id:req.user._id
	});
	order.save().then((order)=>{
		res.send(order);
		updateUser(req.user,Status.NEW);
		
	},(e)=>{
		res.status(400).send(e);
	});
});

app.patch('/orders/:id',authenticate,(req,res)=>{
	var id=req.params.id;
	var userId=req.user._id;
	var body=_.pick(req.body,['status']);
	var status=body.status;
	if(!ObjectID.isValid(id)){
		res.status(400).send({});
		return console.log('ID is invalid');
	};
	if(!_.isString(status)||(status.localeCompare(Status.DELIVERED)!=0&&status.localeCompare(Status.NEW)!=0
		&&status.localeCompare(Status.CANCELLED)!=0&&status.localeCompare(Status.FAILED)!=0)||status.localeCompare(Status.NEW)==0){
			res.status(400).send({});
			return console.log('status is invalid, make sure it is in lowercase and status cannot be new');
	}

	Order.findOneAndUpdate({_id:id,user_id:userId},{$set:body},{new:true}).then((order)=>{
		if(!order){
			return res.status(400).send();
		}
		res.send({order});
		if(status.localeCompare(Status.FAILED)==0){
			updateUser(req.user,status);
		}
	}).catch((e)=>{
		res.status(400).send();
	});
});

app.delete('/orders/:id',authenticate,(req,res)=>{
	var id=req.params.id;
	if(!ObjectID.isValid(id)){
		res.status(400).send({});
		return console.log('ID is invalid');
	};
	Order.findOneAndRemove({
		_id:id,
		user_id:req.user._id
	}).then((order)=>{
		if(!order){
			res.status(404).send({});
		}else{
			res.status(200).send({order});
		}
		console.log(order);
	},(e)=>{
		res.status(400).send(e);
	});
});

app.post('/coupons', function (req, res) {
    coupons.findOne({
      user_email:req.body.email
    }).then((coupon)=>{
    	if(coupon){
        	console.log("already has a code");
      	}
    	else{
  			generateUniqueCode().then(function(code) {
  				new coupons({
    			 	code:code,
   				 	user_email:req.body.email,
   				 	type:req.body.type
 		 		}).save()
  				.then((coupon)=>{
  					// res.send(coupon);
  					console.log('coupon saved.');
  					var mailOptions={
    			 		from:EmailConfig.EMAIL,
   				 		to:req.body.email,
   				 		subject:'sending email',
   				 		html: '<p>Your code is</p>'+code
   					};
   					transporter.sendMail(mailOptions,function(err,info){
       					if(err){
        					console.log(err);
        					res.status(400).send(coupon);
       					}else{
        					console.log('email sent'+info.response);
							res.status(200).send(coupon);
						}
   					});
   
  				},(e)=>{
  					res.status(400).send(e);
  				});
  				
     		});
   		}
	});
});
var count = 0;
// this is code that checks uniqueness and returns a promise
function check(code) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      count++;
      // first resolve with false, on second try resolve with true
      if (count === 1) {
        console.log(code + ' is not unique');
        resolve(false);
      } else {
        console.log(code + ' is unique');
        resolve(true);
      }
    }, 1000);
  });
}

var generateUniqueCode = Promise.method(function() {
  var code = couponCode.generate({parts:3,partLen:5});
  return check(code)
    .then(function(result) {
      if (result) {
        return code;//if it is unique then return the code
      } else {
        return generateUniqueCode();//else generate a new code 
      }
    });
});

var updateUser=(user,status)=>{
	console.log("function called");
	var hexString=user._id.toHexString();
	var last_order_date=user.last_order_date;
	var num_orders=user.num_orders;
	var del_failures_no=user.del_failures_no;

	if(status.localeCompare(Status.NEW)==0){
		num_orders=num_orders+1;
		last_order_date=new Date();
	}else if(status.localeCompare(Status.FAILED)==0){
		del_failures_no=del_failures_no+1;
	}

	var options = {
    	method: 'PATCH',
    	uri: `http://${Url.BASE_URL}/users/${hexString}`,
    	headers: {
        	'x-auth': user.tokens[0].token
    	},
    	body: {
        	u_name:user.u_name,
			password:user.password,
			phone_no:user.phone_no,
			address:user.address,
			dob:user.dob,
			gender:user.gender,
			last_order_date:last_order_date,
			del_failures_no:del_failures_no,
			num_orders:num_orders,
			locker_used:user.locker_used
    	},
    	json: true 
	};
 
	rp(options)
    	.then(function (body) {
    	console.log("update done");
    	console.log(body);
    })
    .catch(function (err) {
        console.log("update failed");
        console.log(err);
    });

};
app.listen(port,()=>{
	console.log(`Started on port ${port}`);
});
module.exports={
	app
}