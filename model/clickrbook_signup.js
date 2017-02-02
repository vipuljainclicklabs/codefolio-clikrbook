var mongo=require("schema/mongo/clikrbook_signup.js");
var mongoose=mongo.mongoose;
var schema=mongo.schema;
var Clickerbook=mongoose.model('clickerbook',schema);


function addToMongo(data,callback){
	Clickerbook({
		fname:data.firstName,
		lname:data.lastName,
		gender:data.gender,
		email:data.emailAddress,
		number:data.number,
		password:data.password1
	}).save(function(err){
		if (err)
			callback(false);
		else{
			callback(true);
		}
	});	
}

function checkAccess(data,callback){
	Clickerbook.find({$and: [
    	{ email:data.email},
    	{ password:data.password}
	]},function(err,data){
		if(err) throw err;
		callback(data);
	});	
}

function checkAccess2(email,callback){
	Clickerbook.find({email:email},function(err,data){
		if(err) throw err;
		callback(data);
	});	
}

function allAccess(callback){
	Clickerbook.find({},function(err,data){
		if(err) throw err;
		callback(data);
	});	
}

function addRoles(data,callback){
	var idz=data.userId;
	var array=idz.split(",");
	var role=data.role;

	allAccess(function(allData){
		for(var i in array){
			var code=parseInt(array[parseInt(i)])-1;
			if(code>1&&code<allData.length){
				updateRole(allData[code].id , role,function(call){
					if(i==array.length-1){
						callback();
					}
				});	
			}
			else if(i==array.length-1){
				callback();
			}
		}
  	});
};

function updateRole(myid,role,callback){
	Clickerbook.update(
		{_id:myid}, 
		{$push: {role: role} },
		function(err,data){
			if(err) console.log("err=",err);
			else console.log("errd=",data);
			callback();
		}
	);
}

function notExist( email , callback ){
	allAccess(function(allData){
		for(var i in allData){
			if(allData[i].email==email){
				callback(true);
			}
			else if(i==allData.length-1){
				callback(false);
			}
		}
  	});
}

module.exports={
	addToMongo:addToMongo,
	checkAccess:checkAccess,
	checkAccess2:checkAccess2,
	allAccess:allAccess,
	addRoles:addRoles,
	notExist:notExist
};
