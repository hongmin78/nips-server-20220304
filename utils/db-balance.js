
const KEYS=Object.keys
const {findone , findall , countrows_scalar
	, updaterow
	, incrementroworcreate 
 }=require('../utils/db')
const db=require('../models')
const cliredisa=require('async-redis').createClient()
const { ISFINITE } =require('../utils/common' )
const LOGGER=console.log
const adjust_balances_on_transfer=async(from,to,itemid,amount)=>{ LOGGER('JMP0fbrVEb' , from,to,itemid,amount)
	if ( from && to && itemid && amount){}
	else {return null }
	amount = + amount 
	let respbal= await findone('itembalances', { username: from , itemid} )
	if ( respbal) { 
		let { locked , avail} = respbal // .locked
		locked = + locked ; avail = + avail
		if ( locked  >= amount ){
			updaterow ( 'itembalances', { id : respbal.id } , { locked : locked - amount , avail : + respbal.avail - amount } ) // username : from
//			await incrementroworcreate ( { table : 'itembalances', jfilter: {username : to} ,fieldname: 'avail', incvalue :  amount } )
	//		await incrementroworcreate ( { table : 'itembalances', jfilter :{username : to} ,fieldname: 'amount',incvalue :  amount } ) //			updateorcreaterow( 'itembalances', { username :   to } , { avail :  	
/**			let respto = await findone('itembalances', {username: to} )
			if ( respto) {
				updaterow ( 'itembalances' , { username:to}, {avail : +amount + +respto.avail , amount: +amount+ +respto.amount} )
			} else {
				createrow ( 'itembalances' , {username: to , avail: amount, amount } )
			}
*/
			if ( locked == amount && + respbal.avail == 0 ){
				await updaterow ( 'itembalances' , { id : respbal.id} , {active : 0 } )
			}
			return + amount
		}
		else if ( locked < amount ) {			 // return null 			/// 
		}
	} else {		// return null 	
	}
			let respto = await findone('itembalances', {username: to} )
			if ( respto) {
				updaterow ( 'itembalances' , { username:to}, {avail : +amount + +respto.avail , amount: +amount+ +respto.amount} )
			} else {
				createrow ( 'itembalances' , {username: to , avail: amount, amount } )
			}
	return amount	
}

const move_avail_to_locked=async(username,itemid , amounttolockup )=>{
	amounttolockup = + amounttolockup 
	if (ISFINITE ( amounttolockup ) ){}
	else {LOGGER('BAg9a3WfzF arg invalid'); return null }
	let respbalance = await findone( 'itembalances' , {		username , itemid	})
	if ( respbalance ) {
		if(+respbalance.avail >= amounttolockup ){}
		else {LOGGER('3kd2YE3l9f@balance not enough'  ) ; return null }
		await updaterow ( 'itembalances' , { username, itemid} , {
			avail : respbalance.avail - amounttolockup 
			, locked : respbalance.locked + amounttolockup 
		} )
		return 1
	}
	else {return null }
}
const move_across_columns = async(username,itemid ,sourcefield ,destfield,  amount)=>{
	amount= + amount
	if (ISFINITE ( amount) ){}
	else {LOGGER('BAg9a3WfzF arg invalid'); return null }
	let respbalance = await findone( 'itembalances' , {		username , itemid	})
	if ( respbalance ) {
		if(+respbalance[ sourcefield ] >= amount ){}
		else {LOGGER('3kd2YE3l9f@balance not enough'  ) ; return null }
		let jupdates={}
		jupdates[ sourcefield ] = jupdates[ sourcefield ] - amount
		jupdates[ destfield ] = jupdates[ destfield ] + amount // all init'd to 0
		await updaterow ( 'itembalances' , { username, itemid} , {
			... jupdates
		} )
		return 1
	}
	else { return null } 
}
module.exports={
	adjust_balances_on_transfer
	, move_avail_to_locked
	,	move_across_columns 
}

/** itembalances;
| username  | varchar(80)         | YES  |     | NULL                |                               |
| itemid    | varchar(100)        | YES  |     | NULL                |                               |
| amount    | bigint(20)          | YES  |     | 0                   |                               |
| avail     | bigint(20)          | YES  |     | 0                   |                               |
| locked    | bigint(20)          | YES  |     | 0                   |                               |
| tokenid   | bigint(20) unsigned | YES  |     | NULL                |                               |
| hidden    | bigint(20) unsigned | YES  |     | NULL                |                               |
| visible   | bigint(20) unsigned | YES  |     | NULL                |                               |
| decimals  | tinyint(4)          |  */
/** logfavorites;
| id | createdat           | updatedat           | username                                   | itemid | status | objectid                                       |
|  2 | 2022-01-17 09:43:36 | 2022-01-17 09:47:08 | 0x8983ea0aadc94cf8dff68d12b011c17a9a3d523d | NULL   |      0 | QmS7RFqoUZei5tQZN6XYyyjcvrtk3eHfibQoxJG4bnh3v3 |
*/

