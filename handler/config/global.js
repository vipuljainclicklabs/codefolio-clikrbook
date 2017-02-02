"use strict";
const Boom              = require( "boom" );
const membershipModel   = require( "model/membership" );
const messages          = require( "model/messages" );
const loginuser 		= require('model/loginuser');
//const mConstants        = require( "config" ).constants;

const config=require('config');
const mySqlConnection=config.mySqlConnection;

const checkIfHaveAccount=function(request,dataFromRequest , finCalBck )
	{
		"use strict";
		let filters = {};
		filters.email = request.query.email;
		filters.password = dataFromRequest.password;
		
		let loginPromise = loginuser.checkForLoginDetails( filters , [
			'email',
			'password'
		]);
		loginPromise.then( function ( output ) {
            if ( output !== false ){
              	return finCalBck("Invalid Email or Password");
          	}
          	//request.session.email = filters.email;
			//console.log("session="+request.session.email);
      		return finCalBck( null , "User Logged In :)" );
  } )
  .fail( function ( err )
  {
      return finCalBck( Boom.create( 400 , err ) );
  } );
};

const haveNewAccount=function(dataFromRequest , finCalBck )
	{
		"use strict";
		let filters = {};
		filters.email = dataFromRequest.email;
		filters.password = dataFromRequest.password;
		
		let loginPromise = loginuser.checkForSignupDetails( filters , [
			'email',
			'password'
		]);
		loginPromise.then( function ( output ) {
      		return finCalBck( null , output );
  } )
  .fail( function ( err )
  {
      return finCalBck( Boom.create( 400 , err ) );
  } );
};

const membershipFetcher = function ( dataFromRequest , finCalBck )
	{
		"use strict";
		let filters = {};
		if ( dataFromRequest.membershipTypeId )
			{
				filters.id = dataFromRequest.membershipTypeId;
			}
		if ( dataFromRequest.membershipTypeName )
			{
				filters.name = dataFromRequest.membershipTypeName;
			}
		if ( dataFromRequest.hasOwnProperty( 'enabled' ) )
			{
				filters.enabled = dataFromRequest.enabled;
			}
		let membershipFetchPromise = membershipModel.getMembershipInfo( filters , [
			'id' ,
			'name' ,
			'ammountValue' ,
			'ammountMeasuredInUnit'
		] );
		membershipFetchPromise.then( function ( memberships )
		                      {
			                      if ( memberships === false )
				                      {
					                      return finCalBck( Boom.create( messages.errors.eng.notFound.NO_MEMBERSHIP_MATCH_THE_QUERY.statusCode ,
						                       messages.errors.eng.notFound.NO_MEMBERSHIP_MATCH_THE_QUERY.customMessage ) );
				                      }
			                      return finCalBck( null , {
				                      membershipTypes : memberships
			                      } );
		                      } )
		                      .fail( function ( err )
		                      {
			                      return finCalBck( Boom.create( 400 , err ) );
		                      } );
	};
const languageUpdate    = function ( dataFromRequest , finCalBck )
	{
		let messagesCheck = messages.checkMessagesExistOrNot( dataFromRequest.messageID , dataFromRequest.languageID );
		const messagesModel = require( "model/messages" );
		messagesCheck.then( function ( resp )
		             {
			             if ( resp )
				             {
					             let updateMess = messages.updateMessages( dataFromRequest.messageID , dataFromRequest.languageID , {
						             customMessage : dataFromRequest.customMessage
					             });
					             updateMess.then(function (resp){
						             if(resp == true)
							             {
								             messagesModel.getMessages( {} , false , true )
								                          .then( function ( r )
								                          {
									                          setValueMessage( r , finCalBck );
								                          } );
							             }
						             else{
							             return finCalBck(resp);
						             }
					             })
				             }
			             else
				             {
					             let insertMess = messages.insertMessage( dataFromRequest.messageID , dataFromRequest.languageID , {
						             customMessage : dataFromRequest.customMessage
					             });
					             insertMess.then(function (resp){
						             if(resp==true)
							             {
								             messagesModel.getMessages( {} , false , true )
								                          .then( function ( r )
								                          {
									                          setValueMessage( r , finCalBck );
								                          } );
							             }
						             else{
							             return finCalBck(resp);
						             }
					             })
				             }
		             } )
		             .fail( function ( err )
		             {
			             return finCalBck( Boom.create( 400 , err ) );
		             } );
	}
module.exports          = {
	languageUpdate:languageUpdate,
	membershipFetcher : membershipFetcher,
	checkIfHaveAccount:checkIfHaveAccount,
	haveNewAccount:haveNewAccount
};
