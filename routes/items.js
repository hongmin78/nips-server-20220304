var express = require('express');
var router = express.Router();
const { findone, createrow }=require('../utils/db')
const { respok , resperr}=require( '../utils/rest')
const { ISFINITE} =require('../utils/common')
const { messages}=require('../configs/messages')
const db=require('../models')

/* GET home page. */
router.get('/item/:itemid', (req,res)=>{
	let {itemid}=req.params
	findone('items', {itemid}).then(resp=>{
		respok ( res, null,null,{ respdata: resp } ) 
	})	
})
router.get('/:offset/:limit/:orderkey/:orderval', function(req, res, next) {
	let { offset , limit }=req.params
	let { orderkey , orderval }=req.params
	offset = +offset
	limit = +limit
	if (ISFINITE( offset)){}
	else {resperr(res,messages.MSG_ARGINVALID ) ;return }
	if (ISFINITE( limit )){}
	else {resperr(res,messages.MSG_ARGINVALID ) ;return }
	db['items'].findAll ({raw:true
		,	where :{}
		, offset
		, limit
	}).then( list =>{
		respok ( res,null,null, { list })	
	})
})

module.exports = router;
