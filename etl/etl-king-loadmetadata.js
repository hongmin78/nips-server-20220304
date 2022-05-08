
// const pathname_images='/var/www/html/assets/images'
const pathname_images='/var/www/html/assets-kingkong/images'
const fs=require('fs')
const db=require('../models')
const pathname_metadata='/var/www/html/assets-kingkong/json'
let nettype='ETH_TESTNET'
let listdir = fs.readdirSync( pathname_images ) 

const LOGGER=console.log
// let URL_IMAGES_DEF=		`http://nips1.net/assets-kingkong/images`
// let URL_METADATA_DEF =	`http://nips1.net/assets-kingkong/json`
let URL_IMAGES_DEF=`https://nftinfinity.world/assets-kingkong/images`
let URL_METADATA_DEF=`https://nftinfinity.world/assets-kingkong/json`

LOGGER(listdir)
let {get_ipfsformatcid_file}=require('../utils/ipfscid')
const { createrow , findone }=require('../utils/db')
const moment=require('moment')

const readmetadata=filename=>{
	let buf = fs.readFileSync ( filename) 
	if ( buf){}
	else {return ''}
	return JSON.stringify(JSON.parse(buf.toString()))
}

const main=async _=>{
	let time0=moment()
	let	time1
//	let resp = await db.sequelize.query( 'delete from items')
	// LOGGER( ''  , resp )
	listdir = listdir.sort( (a,b)=> + a.split(/\./)[0] - +b.split(/\./)[0] ) 
	let group_ = 'kingkong'
	for ( let i =0 ; i<listdir.length ; i ++ ){
//	listdir.forEach ( elem => {
		let elem = listdir [ i ]
		let baseidx = elem.split(/\./)[0]
//		LOGGER( elem )
		let itemid =await get_ipfsformatcid_file ( `${pathname_images}/${elem}`  ) 
		let titlename=`#${(''+ baseidx ).padStart( 6 , '0')}`
		let url = `${URL_IMAGES_DEF}/${elem}`
		let metadataurl = `${URL_METADATA_DEF}/${ baseidx }.json`
		let metadata = readmetadata ( pathname_metadata + `/${baseidx}.json` )
		await createrow ( 'items' , {
			itemid
			, titlename
			, url
			, metadataurl 
			, metadata
			, group_
			, nettype
		})
//		if ( i > 3){break }
//		time1=moment()
//		LOGGER('delta' , time1-time0 )
	}	
		time1=moment()
	LOGGER('delta' , time1-time0 )
}
main()

// get_ipfsformatcid_file ( ) 

