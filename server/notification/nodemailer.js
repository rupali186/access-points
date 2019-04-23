var nodemailer=require('nodemailer');

//const {EmailConfig}=require('./../config/emailConfig.js');



var transporter=nodemailer.createTransport({
service:'gmail',
auth:{
  user:process.env.EMAIL,
  pass:process.env.PASSWORD
}
});

module.exports={
	transporter
}