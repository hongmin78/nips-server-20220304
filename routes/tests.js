var express = require('express');
var router = express.Router();
const { findone, createrow }=require('../utils/db')
const { respok , resperr}=require( '../utils/rest')
const { ISFINITE} =require('../utils/common')
const { messages}=require('../configs/messages')
const db=require('../models')
const { queryitemdata , queryitemdata_user }=require('../utils/db-custom')
const LOGGER=console.log
router.post ('/test',(req,res)=>{
	LOGGER(req.query)
	respok (res)
})
module.exports = router;
