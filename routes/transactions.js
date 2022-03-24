var express = require('express');
var router = express.Router();
/* GET home page. */
const LOGGER=console.log
const {createrow}=require('../utils/db')
const { getobjtype} = require('../utils/common')
const {   enqueue_tx_toclose
}=require ( '../services/close-transactions')
const STRINGER=JSON.stringify
const { create_uuid_via_namespace } =require('../utils/common')
const { respok , resperr}=require( '../utils/rest')
const cliredisa=require('async-redis').createClient()

router.post('/:txhash', async(req,res)=>{
	let { txhash }=req.params
	let uuid = create_uuid_via_namespace ( txhash )
	LOGGER( txhash , req.body)
	let { 
		username 
		, auxdata
		, typestr
		, nettype
	}=req.body
  let objtype= getobjtype( auxdata)
	let strauxdata
  switch ( objtype ){
		case 'null' : break	
    case 'String' : strauxdata=auxdata ; break
    case 'Array' : strauxdata=STRINGER(auxdata) ; break
    case 'Object': strauxdata=STRINGER(auxdata) ; break
    default : break
  }
	await createrow( 'transactions' , {
		username
		, txhash
		, auxdata : strauxdata
		, typestr
		, amount :  auxdata?.amount // typestr=='STAKE' ?: null
		, currency : auxdata?.currency // typestr=='STAKE'? : null
		, currencyaddress :  auxdata?.currencyaddress // typestr=='STAKE' ?: null
		, nettype
	} )
	await createrow ( 'logactions' , {
		username
		, txhash
		, typestr
	})
	respok(res, null,null, {payload : {uuid} } )	
	switch( typestr ) {
		case 'STAKE' :
		case 'APPROVE' : 
		case 'PAY' :
		  cliredisa.hset('TX-TABLES' , txhash , STRINGER({
  		  type: typestr
	  	  , tables:{   logactions:1
  	  	  , transactions:1
    	  	} , address:username // itemid
				, amount : auxdata?.amount	
		  })).then(resp=>{
			  enqueue_tx_toclose( txhash , uuid , nettype )
			})
		break
	}
})
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
