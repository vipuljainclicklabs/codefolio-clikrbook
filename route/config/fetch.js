"use strict";
const commonFunctions   = require( "Utils/CommonFunctions" );
const appCriticalConfig = require( 'handler/config/global' );
const config            = require( "config" );
const Joi               = require( 'joi' );

var  nodemailer=require('nodemailer');

var transporter = nodemailer.createTransport({
	service: 'Gmail',
    auth: {
        user: 'vipuljain.clickerbook@gmail.com',
        pass: 'vipuljainclickerbook'
  }
});

var mongo=require("model/clickrbook_signup.js");
var tokenModel=require("model/clickrbook_token.js");

const access_token   = {
	method :  ['POST','GET'] ,
	path :    '/access_token' ,
	handler : function ( request , reply ){

		if(request.method=='get'){
	    	reply.view("clickrbook.html");
	    }
	    else{
	    	var token = request.payload.token;

			tokenModel.getEmail(token,function(email){
				if(email==""){
					reply("ERROR 404");
				}
				else{
					mongo.checkAccess2(email,function(data){
			          	if(data==''||data==[]||data==null){
			          		reply.view('clickrbook.html');
			          	}

			          	else if(data[0].role[0]=='admin'){
			          		mongo.allAccess(function(data){
			          			for(var i in data){
			          				var j=parseInt(i)+1;
			          				data[i].password=j;
			          			}
			          			reply.view('loggedinadmin.html',{data:data,token:token});
			          		});
			          	}

			         	else{
			          		reply.view('loggedin.html',{data:data[0],token:token});
			          	}
		          	});
				}
			});
	    }

	},
	config :  {
		auth :        false ,
		description : 'Auto Login' ,
		tags :        [
			'api' ,
			'config'
		] ,
		plugins :     {
			'hapi-swagger' : {
				responseMessages : commonFunctions.swaggerDefaultResponseMessages
			}
		}
	}
};

const loginuser   = {
	method :  ['POST','GET'] ,
	path :    '/loginuser' ,
	handler : function ( request , reply ){
	    if(request.method=='get'){
	    	reply.view("clickrbook.html");
	    }
	    else{
	    	mongo.checkAccess(request.payload,function(data){

	      	if(data==''||data==[]||data==null){
	      		reply.view('clickrbook.html');
	      	}

	      	else if(data[0].role[0]=='admin'){
	      		mongo.allAccess(function(data){
	      			for(var i in data){
	      				var j=parseInt(i)+1;
	      				data[i].password=j;
	      			}
	      			tokenModel.addToken(request.payload.email,function(token){
	      				if(token==null||token=="")
	      					reply.view('clickrbook.html');
	      				else
	      					reply.view('loggedinadmin.html',{data:data,token:token});
	      			});
	      		});
	      	}

	      	else{
	      		tokenModel.addToken(request.payload.email,function(token){
		      		if(token==null||token=="")
							reply.view('clickrbook.html');
						else
		      			reply.view('loggedin.html',{data:data[0],token:token});
		      	});
	      	}
	  	});
	    }
	} ,
	config :  {
		auth :        false ,
		description : 'Login form' ,
		tags :        [
			'api' ,
			'config'
		] ,
		validate :    {
			query :      {
				email :   Joi.string(),
				password :   Joi.string()
			} ,
			failAction : commonFunctions.failActionFunction
		} ,
		plugins :     {
			'hapi-swagger' : {
				responseMessages : commonFunctions.swaggerDefaultResponseMessages
			}
		}
	}
};


const signupuser   = {
	method :  ['POST','GET'] ,
	path :    '/loggedin' ,
	handler : function ( request , reply ){

		if(request.method=='get'){
			reply.view("clickrbook.html");
		}
		else{
			mongo.notExist(request.payload.emailAddress,function(callback){
				if(!callback){
					mongo.addToMongo(request.payload,function(callback2){
						if(callback2){
							var data={
				     			fname:request.payload.firstName,
				     			lname:request.payload.lastName,
				     			email:request.payload.emailAddress,
				     			password:request.payload.password1,
				     			gender:request.payload.gender,
				     			number:request.payload.number,
				     		};

				     		tokenModel.addToken(data.email,function(token){
				     			reply.view('loggedin.html',{data:data,token:token});
						    });
						}else{
							console.log("Error Adding User");
							reply.view('clickrbook.html');
						}
					});
				}
				else{
					console.log("Error Adding User");
				reply.view('clickrbook.html');
				}
			});
		}
    } ,
	config :  {
		auth :        false ,
		description : 'Signup form' ,
		tags :        [
			'api' ,
			'config'
		] ,
		validate :    {
			query :      {
				emailAddress :   Joi.string(),
				password1	 :   Joi.string(),
				gender	 	 :   Joi.string(),
				number	 	 :   Joi.string(),
				lastName	 :   Joi.string(),
				firstName	 :   Joi.string(),
			} ,
			failAction : commonFunctions.failActionFunction
		} ,
		plugins :     {
			'hapi-swagger' : {
				responseMessages : commonFunctions.swaggerDefaultResponseMessages
			}
		}
	}
};

const asigned_roles   = {
	method :  ['POST','GET'] ,
	path :    '/asigned_roles' ,
	handler : function ( request , reply ){
		if(request.method=='get'){
			reply.view("clickrbook.html");
		}
		else{
			if(request.payload.userId==null||request.payload.userId==""||
			       			request.payload.role==null||request.payload.role==null){
				reply.view("clickrbook.html");
			}
			else{
				mongo.addRoles(request.payload,function(){
					mongo.allAccess(function(data){
		          		for(var i in data){
		          			var j=parseInt(i)+1;
		          			data[i].password=j;
		          		}
		          		reply.view('loggedinadmin.html',{data:data});
		          	});
				});
			}
		}
	} ,
	config :  {
		auth :        false ,
		description : 'Assign Role' ,
		tags :        [
			'api' ,
			'config'
		] ,
		validate :    {
			query :      {
				email :   Joi.string(),
				password :   Joi.string()
			} ,
			failAction : commonFunctions.failActionFunction
		} ,
		plugins :     {
			'hapi-swagger' : {
				responseMessages : commonFunctions.swaggerDefaultResponseMessages
			}
		}
	}
};

function sendMail(name , email){
	var mailOptions = {
	    from: 'vipuljain.clickerbook@gmail.com', // sender address
	    to: email, // list of receivers
	    subject: 'Hello ✔', // Subject line
	    text: 'Hello '+name +' thank for contacting us! If you have any query, reply me on this mail.', // plaintext body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, info){
	    if(error){
	        return console.log(error);
	    }
	    console.log('Message sent: ' + info.response);
	});
}

const contactus   = {
	method :  ['POST','GET'] ,
	path :    '/contactus.html' ,
	handler : function ( request , reply ){
		if(request.method=='get'){
			reply.view("clickrbook.html");
		}
		else{
			var name=request.payload.fname + " " + request.payload.lname;
			sendMail(name , request.payload.email );
			reply.view('contactus.html',request.payload);
		}
	} ,
	config :  {
		auth :        false ,
		description : 'Assign Role' ,
		tags :        [
			'api' ,
			'config'
		] ,
		plugins :     {
			'hapi-swagger' : {
				responseMessages : commonFunctions.swaggerDefaultResponseMessages
			}
		}
	}
};

module.exports          = [
	access_token,
	loginuser,
	signupuser,
	asigned_roles,
	contactus
];
