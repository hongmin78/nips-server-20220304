var express = require('express');
var router = express.Router();
const { findone, createrow
	, countrows_scalar
 }=require('../utils/db')
const { respok , resperr}=require( '../utils/rest')
const { ISFINITE} =require('../utils/common')
const { messages}=require('../configs/messages')
const db=require('../models')
const { queryitemdata , queryitemdata_user }=require('../utils/db-custom')
let { Op }=db.Sequelize

router.get('/', (req,res)=>{
	let {nettype}=req.query
	let aproms=[]
	aproms[aproms.length]  = countrows_scalar( 'items' , {salestatus : 0 , ... req.query })
	aproms[aproms.length]  = countrows_scalar( 'items' , {salestatus : 1 , ... req.query})
	aproms[aproms.length]  = countrows_scalar( 'items', { salestatus : { [Op.lte] : -1 } , ... req.query })
	Promise.all ( aproms).then(resp=>{
		respok ( res, null, null, { respdata : {
			onreserve : resp[ 0 ] 
			, assigned: resp[ 1 ]
			, perished: resp[ 2 ]
		} } )
//		respok ( res, null, null, {list:resp } )
	})
})
module.exports = router;
