
const KEYS=Object.keys
const {findone , findall , countrows_scalar
	, updaterow
	, incrementroworcreate 
 }=require('../utils/db')
const cliredisa=require('async-redis').createClient()
const { ISFINITE } =require('../utils/common' )

const get_klay_usdt_ticker=async _=>{
  let denomincurrency = 'USDT' 
  let resp= await cliredisa.hget( `TICKERS-${denomincurrency }`, 'KLAY' )
	return resp	
}

module.exports={get_klay_usdt_ticker
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

