
const {hash53 , gettimestr , LOGGER , hashviasha256 }=require('./common')
const moment=require('moment')
const LEN_ITEM_HASH=16
const getitemdatahash_sha256=str=>{
	return hashviasha256(str)
}
const getitemdatahash_hash53=str=>{ // hash53(str).toString(16).padStart( LEN_ITEM_HASH ,0)	
	const strhashed=hash53(str).toString(16) ;	LOGGER('rPGNclG9Qk' , strhashed)
	return strhashed.padStart( LEN_ITEM_HASH ,0)
}
const getitemdatahash = getitemdatahash_sha256
const generateitemid_includes_timestamp=str=>`${getitemdatahash(str)}_${gettimestr()}` // => 0011f9f91ac18c8d_20210615231541 // len:31

const generateitemid_does_not_include_timestamp=str=>getitemdatahash(str)

const generateitemid = generateitemid_does_not_include_timestamp
module.exports={
	getitemdatahash	, generateitemid
}


