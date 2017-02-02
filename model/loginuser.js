const addUserSchema = require("schema/mysql/loginuser");
const mTypeTable = addUserSchema.tableName;
const mTypeFieldmap = addUserSchema.fieldMap;
const config = require("config");
const mySqlConnection = config.mySqlConnection;
const mysql = require("mysql");
const Q = require("q");
const mConstants = config.constants;

const checkForLoginDetails = function (filters, informationRequired, mustFetchAll) {
    'use strict';
    let deferred = Q.defer();
    if (!filters) {
        filters = {};
    }
    if (!informationRequired) {
        informationRequired = {};
    }
    let reqFields = [];
    for (let idx in informationRequired) {
        if (informationRequired.hasOwnProperty(idx)) {
            if (mTypeFieldmap.hasOwnProperty(informationRequired[idx])) {
                    reqFields.push(informationRequired[idx]);


            } else {
                delete informationRequired[idx];
            }
        }
    }
    console.log(reqFields[0]+"="+filters.email);
    console.log(reqFields[1]+"="+filters.password);
    let mSql = "SELECT `email` FROM `" + mTypeTable + "` WHERE "+reqFields[0]+"='"+ filters.email+
    "' AND "+reqFields[1]+" ='"+filters.password+"'";

    let bindParams = [];
    let queryParts = [];


    if (filters[mTypeFieldmap.email]) {
        bindParams.push(filters[mTypeFieldmap.email]);
    }
    if (filters[mTypeFieldmap.password]) {
        bindParams.push(filters[mTypeFieldmap.password]);
    }
    if (bindParams.length > 0) { 
      mSql = mysql.format(mSql, bindParams);
    }

    mySqlConnection.query(mSql, function (error, results, fields) {
    //  console.log(mSql);
        if (error) {
            if (process.env.MUST_DEBUG == 'true') {
                console.log('\nWhile fetching \n', mSql, '\n in table', +mTypeTable + ' ERR\n', error);
            }
            return deferred.reject(error.code);
        }
    
        /*if (results[0]!=null){}
            return deferred.resolve({Status:results[0].email});
        }*/
        return deferred.resolve(false);

    });
    return deferred.promise;

};

const checkForSignupDetails = function (filters, informationRequired, mustFetchAll) {
    'use strict';
    let deferred = Q.defer();
    if (!filters) {
        filters = {};
    }
    if (!informationRequired) {
        informationRequired = {};
    }
    let reqFields = [];
    for (let idx in informationRequired) {
        if (informationRequired.hasOwnProperty(idx)) {
            if (mTypeFieldmap.hasOwnProperty(informationRequired[idx])) {
                    reqFields.push(informationRequired[idx]);


            } else {
                delete informationRequired[idx];
            }
        }
    }
    console.log(reqFields[0]+"="+filters.email);
    console.log(reqFields[1]+"="+filters.password);
    let mSql = "INSERT INTO `" + mTypeTable + "`(`"+reqFields[0]+ "` , `" +reqFields[1]+"`) VALUES('"+
                    filters.email + " ',' "+filters.password + "')";

    let bindParams = [];
    let queryParts = [];


    if (filters[mTypeFieldmap.email]) {
        bindParams.push(filters[mTypeFieldmap.email]);
    }
    if (filters[mTypeFieldmap.password]) {
        bindParams.push(filters[mTypeFieldmap.password]);
    }
    if (bindParams.length > 0) { 
      mSql = mysql.format(mSql, bindParams);
    }

    mySqlConnection.query(mSql, function (error, results, fields) {
    //  console.log(mSql);
        if (error) {
            return deferred.resolve("User Already Created");
        }
        if (results[0]!=null){
            return deferred.resolve("User Created");
        }
        return deferred.resolve("Account Created");

    });
    return deferred.promise;

};

module.exports = {
    checkForLoginDetails: checkForLoginDetails,
    checkForSignupDetails:checkForSignupDetails
};