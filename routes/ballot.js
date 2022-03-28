const moment = require('moment');
var express = require('express');
var router = express.Router();
const {findone,findall,createrow , updaterow
, countrows_scalar
, createorupdaterow
  , fieldexists
	, tableexists
}=require('../utils/db')
const { updaterow : updaterow_mon}=require('../utils/dbmon')
const KEYS=Object.keys
const {LOGGER,generaterandomstr , generaterandomstr_charset , gettimestr
  , convaj
	, ISFINITE
	, separatebycommas
 }=require('../utils/common')
const {respok,respreqinvalid,resperr , resperrwithstatus } =require('../utils/rest')
const {messages}=require('../configs/messages')
const {getuseragent , getipaddress}=require('../utils/session') // const {sendemail, sendemail_customcontents_withtimecheck}=require('../services/mailer')
const {validateemail}=require('../utils/validates')
const db=require('../models') // const dbmon=require('../modelsmongo')
const {getusernamefromsession}=require('../utils/session') // const { createrow:createrow_mon , updaterow : updaterow_mon }=require('../utils/dbmon')
const { queryitemdata , queryitemdata_user }=require('../utils/db-custom')
const { queryuserdata }=require('../utils/db-custom-user' ) 
const TOKENLEN = 48
let { Op }=db.Sequelize
let nettype = 'ETH-TESTNET'

router.put ('/round/status/:statusvalue',(req,res)=>{
	let { stattusvalue}=req.params
	if ( == 'START' )

	if ( == 'PAUSE' ) 

})

module.exports = router;

