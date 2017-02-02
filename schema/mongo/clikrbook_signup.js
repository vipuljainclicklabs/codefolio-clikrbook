var mongoose=require('mongoose');

mongoose.connect('mongodb://Test:test@ds111549.mlab.com:11549/clickerbook');

var schema= new mongoose.Schema({
	fname:String,
	lname:String,
	gender:String,
	email:String,
	number:String,
	password:String,
	role:[String]
});

module.exports={
	mongoose:mongoose,
	schema:schema
};