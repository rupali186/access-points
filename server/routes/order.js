const express=require('express');
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
const {DeliveryMode}=require('./../constants/stringConstants.js');
const {Url}=require('./../constants/stringConstants.js');


router.get('/',(req,res)=>{
	Order.find().then((orders)=>{
		res.send({orders});
	},(e)=>{
		res.status(400).send(e);
	});
});

router.get('/me',authenticate,(req,res)=>{
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
router.get('/:id',(req,res)=>{
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


router.post('/',authenticate,(req,res)=>{
	console.log(req.body);
	var order=new Order({
		size:req.body.size,
		price:req.body.price,
		category_id:req.body.category_id,
		product_id:req.body.product_id,
		del_date:req.body.del_date,
		weight:req.body.weight,
		user_id:req.user._id,
		del_mode:req.body.del_mode,
		payment_status:req.body.payment_status,
		address:req.body.address,
		access_pt_address:req.body.access_pt_address
	});
	order.save().then((order)=>{
		res.send(order);
		updateUser(req.user,Status.NEW,order);
		
	},(e)=>{
		res.status(400).send(e);
	});
});

router.patch('/:id',authenticate,(req,res)=>{
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
			updateUser(req.user,status,order);
		}
	}).catch((e)=>{
		res.status(400).send();
	});
});

router.delete('/:id',authenticate,(req,res)=>{
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

var updateUser=(user,status,order)=>{
	console.log("update user function called");
	var hexString=user._id.toHexString();
	var last_order_date=user.last_order_date;
	var num_orders=user.num_orders;
	var del_failures_no=user.del_failures_no;
	var del_mode=order.del_mode;
	var locker_used=user.locker_used;

	if(locker_used==false&&status.localeCompare(Status.NEW)==0&&del_mode.localeCompare(DeliveryMode.ACCESS_PTS)==0){
		locker_used=true;
	}

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
			locker_used:locker_used
    	},
    	json: true 
	};
 
	rp(options)
    	.then(function (body) {
    	console.log("user update done");
    	console.log(body);
    })
    .catch(function (err) {
        console.log("user update failed");
        console.log(err);
    });

};

module.exports = router;