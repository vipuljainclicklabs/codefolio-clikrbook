var mongo=require("schema/mongo/clikrbook_signup.js");
var mongoose=mongo.mongoose;

var schema= new mongoose.Schema({
	email:String,
	token:String
});

module.exports={
	mongoose:mongoose,
	schema:schema
};