var mongo=require("schema/mongo/clickrbook_token.js");
var mongoose=mongo.mongoose;
var schema=mongo.schema;
var Clickerbook=mongoose.model('clickerbook-token',schema);

function addToken(email,callback){
	var date = new Date();
   	var token=require('jsonwebtoken').sign({  email: email, date: date }, "key");
   	
   	Clickerbook({
		email:email,
		token:token
	}).save(function(err){
		if (err){
			callback("");
		}
			
		else{
			callback(token);
		}
	});	
}

function getEmail(token,callback){
	Clickerbook.find({token:token},function(err,data){
		if(err) throw err;
		if(data==null||data=="")
			callback("");
		else
			callback(data[0].email);
	});	
}



function deleteOldToken(email,token){
	var date = new Date();
   	var token=require('jsonwebtoken').sign({  email: email, date: date }, "key");
   	console.log("token=",token);
   	Clickerbook({
		email:email,
		token:token
	}).save(function(err){
		if (err)
			console.log('error saving token');
		else{
			console.log('token Saved');
		}
	});	
}

module.exports={
	addToken:addToken,
	getEmail:getEmail
};
