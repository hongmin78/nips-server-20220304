const { REFERERCODELEN}=require('../configs/configs')
const { findone, createrow
	, deleterow
	, updaterow 
 }=require('../utils/db')
const { respok , resperr}=require( '../utils/rest')
const { generateSlug } =require( 'random-word-slugs')
const {LOGGER,generaterandomstr 
	, generaterandomstr_charset 
	, gettimestr
	, ISFINITE
	, generaterandomhex
 }=require('../utils/common')
const { Op}=require('sequelize')
const { messages}=require('../configs/messages')
const { isethaddressvalid } =require('../utils/validates')
const {TOKENLEN}=require('../configs/configs')
const { getuseragent
	,getipaddress
} =require('../utils/session')
const db=require('../models')
const ejs = require("ejs");
const moment=require('moment')

const main=async _=>{
	let nettype = 'BSC_TESTNET'
	await deleterow ('receivables' , {} )
	await deleterow ('circulations' , { id: { [Op.gte] : '30' } } )
	await deleterow ('itemhistory' , { id : { [Op.gte] : '40' }} )
	await updaterow ('items' , { } , { salestatus : 0 , salesstatusstr : 'on_reserve' }  )

	LOGGER(gettimestr())
}
LOGGER(gettimestr())
main()
