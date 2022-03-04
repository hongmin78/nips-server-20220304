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
  switch ( objtype){
		case 'null' : break	
    case 'String' : strauxdata=auxdata ; break
    case 'Array' : strauxdata=STRINGER(auxdata) ; break
    case 'Object': strauxdata=STRINGER(auxdata) ; break
    default : break
  }
	await createrow('transactions' , {
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
	
	if ( typestr=='STAKE' ){
	  cliredisa.hset('TX-TABLES' , txhash , STRINGER({
  	  type:'STAKE'
	    , tables:{   logactions:1
  	    , transactions:1
    	  } , address:username // itemid
	  })).then(resp=>{
		  enqueue_tx_toclose( txhash , uuid )
		})
	}
	else if ( typestr=='APPROVE' ){
		cliredisa.hset('TX-TABLES' , txhash , STRINGER ({
			type : 'APPROVE'
			, tables : {logactions : 1
				, transactions : 1
			} , address:username 
		}) ).then(resp=>{
			enqueue_tx_toclose( txhash , uuid ) 
		})
	}
})
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
