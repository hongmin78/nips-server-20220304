
const db=require( '../models' )
const LOGGER = console.log
const { updateorcreaterow , updaterow } = require( '../utils/db' )
const { create_uuid_via_namespace } = require( '../utils/common')
const MAX_ROUND_TO_REACH_DEF = 17
const BALLOT_PERIODIC_ROUNDNUMBER = 50 
const moment=require('moment')
const main =async _=>{
	let m0 = moment()
	let resp = await db.sequelize.query ( `select * from logsales where amount >613` )
	LOGGER( resp[0] ) 	
	let list = resp [ 0 ] 
	list.forEach (async elem => {
		let { username , nettype , itemid , amount } = elem 
		await updateorcreaterow ( 'maxroundreached' , { 
				itemid 
			, nettype
		 } , {
			username
			, uuid : create_uuid_via_namespace(`${username}_${itemid}_${nettype}`)
			, itemroundnumber : MAX_ROUND_TO_REACH_DEF
			, roundnumberglobal : BALLOT_PERIODIC_ROUNDNUMBER 
		} )
		await updaterow ( 'ballots',{ username , nettype } , {  ismaxreached: 1         ,ismaxroundreached : 1 } )
		await updaterow ( 'users' , { username , nettype } , {  ismaxreached: 1         ,ismaxroundreached : 1 } )
		await updaterow ( 'items' , { itemid   , nettype } , {  ismaxreached: 1         ,ismaxroundreached : 1 } )		
	})
	let m1 = moment()
	LOGGER( '@diff' , m1-m0 )
}
main()

/**
    id: 476,
    createdat: 2022-08-26T13:22:54.000Z,
    updatedat: null,
    username: '0x73c624f4b270b86c02ae66f27c520b19042b40b7',
    itemid: 'QmZx9ySJ2Sc33U3AdmSd5EkhayNAnwXgvX6Z7adXxwib3y',
    amount: '613.039365036789',
    currency: 'USDT',
    currencyaddress: '0x34da0872bb4b215345f6e47ed6514d8c4cd5f8e0',
    statusstr: null,
    status: null,
    roundnumber: 50,
    txhash: '0x73274fdaa3d99cb6e62eefd6d84ffc1a340b5ea7bc39bdff33663ce9414d6f1c',
    active: 1,
    seller: '0x5cd5d0b5ec58c3848d73be6ac334cf5f9bd4dbc0',
    nettype: 'BSC_MAINNET',
    itemroundnumber: null,
    roundnumberglobal: null
  }
*/
/**{      // max reached
283       await createrow( "maxroundreached", {
284         username, // : ''
285         itemid, // : ''
286         nettype, // : ''
287         uuid: create_uuid_via_namespace(`${username}_${itemid}_${nettype}`),
288         amountpaid: "",
289         txhash, // : ''
290         itemroundnumber : 1 + +itemroundnumber , // : roundnumber, // doublecounting
291         globalroundnumber : roundnumberglobal, // : ''
292         roundnumberglobal
293       });
294       await updaterow ('ballots' , { username, nettype } , {ismaxreached: 1         ,ismaxroundreached : 1})
296       await updaterow("users", { username, nettype }, { ismaxreached: 1         ,ismaxroundreached : 1});
298       await updaterow("items", { itemid, nettype }, { ismaxreached: 1         ,ismaxroundreached : 1});
300     }
*/
