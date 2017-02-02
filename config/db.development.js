'use strict';

const mysqlConfig = {
	host :               'localhost' ,
	database :           'clicklabs' ,
	password :           '' ,
	user :               'root' ,
	debug :              false ,
	port :               3306 ,
	multipleStatements : true
};
module.exports    = {
	mysqlConfig : mysqlConfig
};