const { REFERERCODELEN}=require('../configs/configs')
const { findone, createrow }=require('../utils/db')
const { respok , resperr}=require( '../utils/rest')
const { generateSlug } =require( 'random-word-slugs')
const {LOGGER,generaterandomstr 
	, generaterandomstr_charset 
	, gettimestr
	, ISFINITE
	, generaterandomhex
 }=require('../utils/common')
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
	for ( let i=0;i<40;i++){
		let username = generaterandomhex( 40 ,  )
		await createrow ( 'users' , {
			username
			, nettype
		})
		await createrow( 'ballots' , {
			username
			, isstaked : 1
			, nettype
		})
	}
	LOGGER(gettimestr())
}
LOGGER(gettimestr())
main()
