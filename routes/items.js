var express = require('express');
var router = express.Router();
const { findone, createrow }=require('../utils/db')
const { respok , resperr}=require( '../utils/rest')
const { ISFINITE} =require('../utils/common')
const { messages}=require('../configs/messages')
const db=require('../models')
const { queryitemdata , queryitemdata_user }=require('../utils/db-custom')

router.get('/item/:itemid', async (req,res)=>{
	console.log('hello')
	let {itemid}=req.params
	db['items'].findOne({
		where:{
			itemid
		},
		include:[{
			model: db['itemhistory']
		},
		{
			model: db['circulations'],
			as:'current_info',
			include:[{
				model: db['users']
			}]
		}
		]
	}).then((resp)=>{
		console.log('hello')
		respok(res, null, null, {respdata: resp})
	})
// 	findone('items', {itemid}).then(async resp=>{
// 	//	let respdetail = await queryitemdata(itemid) // .then(resp=>
// 		respok ( res, null,null,{ respdata: {... resp
// //		, ... respdetail
// 		 } } ) 
// 	})	
})
/* GET home page. */
/** router.get('/item/:itemid', (req,res)=>{
	let {itemid}=req.params
	findone('items', {itemid}).then(resp=>{
		respok ( res, null,null,{ respdata: resp } ) 
	})	
}) */
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
