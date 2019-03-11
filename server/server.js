require('./config/config');

const express=require('express');
const _=require('lodash');
const bodyParser=require('body-parser');
const {ObjectID}=require('mongodb');

const {mongoose}=require('./db/mongoose.js');
const {Order}=require('./models/order.js');
const {User}=require('./models/user.js');
const {authenticate}=require('./middleware/authenticate.js');

const port=process.env.PORT;

var app=express();

app.use(bodyParser.json());

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

app.get('/orders/:id',(req,res)=>{
	var id=req.params.id;
	if(!ObjectID.isValid(id)){
		res.status(400).send({});
		return console.log('ID is invalid');
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

app.listen(port,()=>{
	console.log(`Started on port ${port}`);
});
module.exports={
	app
}