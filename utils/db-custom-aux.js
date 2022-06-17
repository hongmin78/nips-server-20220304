
const KEYS=Object.keys
const {findone , findall , countrows_scalar 
	, findall_select_columns
}=require('../utils/db')
const db=require('../models')
const cliredisa=require('async-redis').createClient()
const queryitemdata=async (itemid ) =>{
  let aproms=[]
  return new Promise(async(resolve,reject)=>{
    if(itemid){} else {resolve(null)}
    findone( 'items', {itemid}).then(async respitem=>{
      if(respitem) {} else {resolve(null);return}
      aproms[aproms.length]=findone( 'items' , { itemid } ) // 0 - author
      aproms[aproms.length]=findone( 'transactions' , { itemid } ) // 0 - author
//			aproms[aproms.length]=findall_select_columns('logsales' , { itemid, status : 1 }, ['price','createdat'] )	
			aproms[aproms.length]=findall_select_columns('logorders' , { itemid, status : 1 }, ['price','createdat'] )	
			aproms[aproms.length]=findall( 'logorders' , { itemid } ) // 7-
			aproms[aproms.length]=findall( 'logactions' , { itemid } ) // 7-
//			aproms[aproms.length]=findone( 'itembalances' , { username } ) // 3 - itembalance
//      findone('sales', { itemid }).then(async respsale=>{
  //      if(respsale){       aproms[aproms.length]=findone('users', { username : respsale.seller } ) } // 6
    //    else {aproms[aproms.length]=null }
        Promise.all(aproms).then(async aresps=>{
          resolve( {
						 item : aresps [ 0 ]
						, transactions : aresps[ 1 ]
						, logprices : aresps[2]
						, logorders : aresps [ 3 ]
						, logactions : aresps [ 4 ]
//						, itembalance : aresps[3]
//            , logbids : aresps[3] && aresps[3][0]? aresps[3][0] : null 
          })
        })
//      })
    })
  })
}

////////
const queryitemdata_user=async (itemid , username ) =>{
  let aproms=[]
  return new Promise(async(resolve,reject)=>{
    if(itemid){} else {resolve(null)}
    findone('items', {itemid}).then(async respitem=>{
      if(respitem) {} else {resolve(null);return}
//      findone('sales', { itemid }).then(async respsale=>{
  //      if(respsale){       aproms[aproms.length]=findone('users', { username : respsale.seller } ) } // 6
    //    else {aproms[aproms.length]=null }
        Promise.all(aproms).then(async aresps=>{
          resolve( {
//            , logbids : aresps[3] && aresps[3][0]? aresps[3][0] : null 
          })
        })
//      })
    })
  })
}
/** logfavorites;
| id | createdat           | updatedat           | username                                   | itemid | status | objectid                                       |
|  2 | 2022-01-17 09:43:36 | 2022-01-17 09:47:08 | 0x8983ea0aadc94cf8dff68d12b011c17a9a3d523d | NULL   |      0 | QmS7RFqoUZei5tQZN6XYyyjcvrtk3eHfibQoxJG4bnh3v3 |
*/
module.exports={
	queryitemdata 
	,	 queryitemdata_user 
}

