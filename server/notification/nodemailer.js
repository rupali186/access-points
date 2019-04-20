var nodemailer=require('nodemailer');

const {EmailConfig}=require('./../config/emailConfig.js');



var transporter=nodemailer.createTransport({
service:'gmail',
auth:{
  user:EmailConfig.EMAIL,
  pass:EmailConfig.PASSWORD
}
});

module.exports={
	transporter
}