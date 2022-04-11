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
	, STRINGER
	, }=require('../utils/common')
const { messages}=require('../configs/messages')
const { isethaddressvalid } =require('../utils/validates')
const {TOKENLEN}=require('../configs/configs')
const { getuseragent
	,getipaddress
} =require('../utils/session')
const db=require('../models')
const ejs = require("ejs");
let rmqq = 'tasks'
let rmqopen = require('amqplib').connect('amqp://localhost');

router.post('/mq',(req,res)=>{
	let {}=req.body
	let mstr= STRINGER( req.body )
	rmqopen.then(function(conn) {
	  return conn.createChannel();
	}).then(function(ch) {
  	return ch.assertQueue(rmqq).then(function(ok) {
			respok ( res ) 
    	return ch.sendToQueue(rmqq, Buffer.from( mstr ));
	  });
	}).catch(err=> { console.warn(err) 
		resperr(res, 'INTERNAL-ERR' ) 
	});

})
module.exports = router;
