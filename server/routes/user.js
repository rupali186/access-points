var express = require('express');
let router = express.Router();

const _=require('lodash');
const bodyParser=require('body-parser');
const {ObjectID}=require('mongodb');
var rp = require('request-promise');

const {mongoose}=require('./../db/mongoose.js');
const {Order}=require('./../models/order.js');
const {User}=require('./../models/user.js');
const {authenticate}=require('./../middleware/authenticate.js');
const {Status}=require('./../constants/stringConstants.js');
const {Url}=require('./../constants/stringConstants.js');


router.get('/',(req,res)=>{
	User.find().then((users)=>{
		res.send({users});
	},(e)=>{
		res.status(400).send(e);
	});
});

router.get('/me',authenticate,(req,res)=>{
	res.send(req.user);
});

router.get('/new',(req,res)=>{
	var n=_.toNumber(req.query.limit);
	User.find({num_orders:0}).sort({acc_creation_date:-1}).limit(n).then((users)=>{
		res.send({users});
	},(e)=>{
		res.status(400).send(e);
	});
});

router.get('/newtolocker',(req,res)=>{
	var n=_.toNumber(req.query.limit);
	User.find({num_orders:{ $gte: 1},locker_used:false}).sort({last_order_date:-1}).limit(n).then((users)=>{
		res.send({users});
	},(e)=>{
		res.status(400).send(e);
	});
});

router.get('/target',(req,res)=>{
	var threshold=_.toNumber(req.query.threshold);
	var limit=_.toNumber(req.query.limit);
	User.find({del_failures_no:{ $gte: threshold},locker_used:false}).sort({last_order_date:-1}).limit(limit).then((users)=>{
		res.send({users});
	},(e)=>{
		res.status(400).send(e);
	});
});

router.get('/:id',(req,res)=>{
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

router.post('/',(req,res)=>{
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

router.post('/login',(req,res)=>{
	var body=_.pick(req.body,['email','password']);
	User.findByCredentials(body.email,body.password).then((user)=>{
		return user.generateAuthToken().then((token)=>{
			res.header('x-auth',token).send(user);
		})
	}).catch((e)=>{
		res.status(400).send();
	});
});

router.patch('/:id',authenticate,(req,res)=>{
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

router.delete('/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

router.delete('/me',authenticate,(req,res)=>{
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

module.exports = router;