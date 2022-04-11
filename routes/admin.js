var express = require('express');
var router = express.Router();
const { REFERERCODELEN}=require('../configs/configs')
const { findone, createrow }=require('../utils/db')
const { respok , resperr}=require( '../utils/rest')
const { generateSlug } =require( 'random-word-slugs')
const {LOGGER,generaterandomstr 
	, generaterandomstr_charset 
	, gettimestr
	, ISFINITE
	, }=require('../utils/common')
const { messages}=require('../configs/messages')
const { isethaddressvalid } =require('../utils/validates')
const {TOKENLEN}=require('../configs/configs')
const { getuseragent
	,getipaddress
} =require('../utils/session')
const db=require('../models')
const ejs = require("ejs");


router.post('/login', async(req,res)=>{
	const {username , pw }=req.body
	LOGGER('pM34zwlLCQ',req.body) //	respok(res);return
	if(username && pw){} else {resperr(res,messages.MSG_ARGMISSING);return}
	let respfind = await findone('admin' , { username : username, pw: pw} )
	if ( respfind){
    respok ( res, null,null, null)
  }
	else { resperr(res,messages.MSG_DATANOTFOUND ) ;return }


})

module.exports = router;
