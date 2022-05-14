
const KEYS=Object.keys
const {findone , findall , countrows_scalar }=require('../utils/db')
const db=require('../models')
const { findone : findone_mon }=require('./dbmon')
const cliredisa=require('async-redis').createClient()
const {getMaxMinAvg}=require('./stats') 

const {ISFINITE}=require('../utils/common')
const queryitemdata=async (itemid , nettype ) =>{
  let aproms=[]
  return new Promise(async(resolve,reject)=>{
    if(itemid){} else {resolve(null)}
    findone('items', {itemid,  nettype }).then(async respitem=>{
      if(respitem) {} else {resolve(null);return}
//      aproms[aproms.length]=findone( 'users', { username: respitem.author } ) // 0 - author
      aproms[aproms.length]=findone( 'itembalances', { itemid , nettype } ) // 0 - author
      aproms[aproms.length]=findone( 'circulations', { itemid , nettype } ) // 0 - author
			aproms[aproms.length]=findall( 'itemhistory' , { itemid , nettype } ) // 2 - logsales
//			aproms[aproms.length]=countrows_scalar ( 'itembalances' , { itemid , active : 1 } ) // 1 - count holders 
	//		aproms[aproms.length]=findall( 'logsales' , { itemid } ) // 2 - logsales
//			aproms[aproms.length]=findone( 'filestorages' , { itemid } ) // 3 - filestorages
//		aproms[aproms.length]=findall( 'orders' , { itemid , supertype : 1 , active : 1 } ) // 4 - orders , sell
//			aproms[aproms.length]=findall( 'orders' , { itemid , supertype : 2 , active : 1} ) // 5 - orders , buyside
	//		aproms[aproms.length]=findall( 'sales' , { itemid  } ) // 6 - sales
//			aproms[aproms.length]=findone_mon('users', { username : respitem.author } ) // 7 
	//		aproms[aproms.length]=findall( 'logorders', { itemid , } ) // 8 
		//	aproms[aproms.length]=findall( 'bids', { itemid , active : 1 } ) // 9 
//			aproms[aproms.length]=findall( 'log orders' , { itemid } ) // -
//			aproms[aproms.length]=findone( 'itemba lances' , { username } ) //  - itembalance
//      findone('sales', { itemid }).then(async respsale=>{
  //      if(respsale){       aproms[aproms.length]=findone('users', { username : respsale.seller } ) } // 6
    //    else {aproms[aproms.length]=null }
        Promise.all(aproms).then(async aresps=>{
					if ( aresps[0] ){
						delete aresps[0].pw
						delete aresps[0].pwhash
						delete aresps[0].emailverified
						delete aresps[0].emailverifiedtimeunix
						delete aresps[0].icanmint
						delete aresps[0].agreereceivepromo
					}
/**					let aorders_sell_raw = aresps[ 4 ]
					aorders_sell = aorders_sell_raw.filter(elem=>elem.asset_amount_ask).map(elem=>elem.asset_amount_ask )
					let askpricestats =[ null,null,null,null ]
					if ( aorders_sell && aorders_sell.length ) {
						askpricestats =	getMaxMinAvg( aorders_sell )
						aorders_sell_raw = aorders_sell_raw.filter( elem => elem.asset_amount_ask)
					} else {}
					let minpriceidx = askpricestats [ 3 ] */
          resolve( {
							itembalances : aresps[0]
// 						, countholders  :aresps[1] 
	//					, logsales : aresps[2]
						, circulations : aresps[1] 
						, itemhistory : aresps[2]
						, item : respitem
		//				, filestorages : aresps[3] 
			//			, orders_sellside : aresps[ 4 ]
				//		, orders_buyside : aresps[ 5 ]  
//						, sales : aresps[ 6 ]
//						, author_mongo : aresps[ 7 ]
//						, logorders : aresps[ 8 ]
	//					, bids : aresps[ 9 ]
		//				, askpricestats	: {max:  askpricestats[0] , min: askpricestats[1], average:askpricestats[2] }
			//			, minpriceorder : ISFINITE( minpriceidx ) ? aorders_sell_raw [ minpriceidx ] : null // [orders_sellside
/**						, salestatusstr : resolve_salestatus ( {
							bids : aresps[ 9 ]
							, logorders : aresps[ 7 ]
						})  */
//						, minpriceorder : ISFINITE( minpriceidx ) ? orders_sellside[ minpriceidx ] : null  
//						, log orders : aresps [ 7 ]
//						, itembalance : aresps[3]
//            , bids : aresps[3] && aresps[3][0]? aresps[3][0] : null 
          })
        })
//      })
    })
  })
}
const resolve_salestatus=()=>{

}

////////
const queryitemdata_user=async (itemid , username , nettype ) =>{
	return queryitemdata ( itemid , nettype )
  let aproms=[]
	
  return new Promise(async(resolve,reject)=>{
    if(itemid){} else {resolve(null)}
    findone('items', {itemid}).then(async respitem=>{
      if(respitem) {} else {resolve(null);return}
      aproms[aproms.length]=findone( 'users', { username: respitem.author } ) // 0 - author
			aproms[aproms.length]=countrows_scalar ( 'itembalances' , { itemid , active : 1 } ) // 1 - count holders 
			aproms[aproms.length]=findall( 'logsales' , { itemid } ) // 2 - logsales
			aproms[aproms.length]=findone( 'itembalances' , { itemid , username , active : 1 } ) // 3 - itembalance
			aproms[aproms.length]=findone( 'filestorages' , { itemid } ) // 4 - filestorages
			aproms[aproms.length]=findall( 'orders' , { itemid , supertype : 1 , active : 1} ) // 5 - orders , sell
			aproms[aproms.length]=findall( 'orders' , { itemid , supertype : 2 , active : 1 } ) // 6 - orders , buyside
			aproms[aproms.length]=findone( 'logfavorites' , { itemid , username } ) // 7
			aproms[aproms.length]=findone( 'sales' , { itemid } ) // 8
			aproms[aproms.length]=findone( 'logbookmarks' , { itemid , username } ) // 9
			aproms[aproms.length]=findall( 'logorders', { itemid , } ) // 10 
			aproms[aproms.length]=findall( 'bids', { itemid , active : 1 } ) // 11 
//			aproms[aproms.length]=findall( 'log orders' , { itemid } ) // 9-
//      findone('sales', { itemid }).then(async respsale=>{
  //      if(respsale){       aproms[aproms.length]=findone('users', { username : respsale.seller } ) } // 6
    //    else {aproms[aproms.length]=null }
        Promise.all(aproms).then(async aresps=>{

					let aorders_sell_raw = aresps[ 5 ]
					aorders_sell = aorders_sell_raw.filter(elem=>elem.asset_amount_ask).map(elem=>elem.asset_amount_ask )
					let askpricestats =[null,null,null,null ]
					if ( aorders_sell && aorders_sell.length ){
						askpricestats =	getMaxMinAvg( aorders_sell )
						aorders_sell_raw = aorders_sell_raw.filter( elem => elem.asset_amount_ask)
					} else {}
					let minpriceidx = askpricestats[ 3 ]  
          resolve( {
							author : aresps[0]
 						, countholders  :aresps[1] 
						, logsales : aresps[2]
						, itembalance : aresps[3]
						, item : respitem
						, filestorages : aresps[4]
						, orders_sellside : aresps[ 5 ]
						, orders_buyside : aresps[ 6 ]
						, ilikethisitem : aresps[7]?.status
						, sales : aresps[8]
						, askpricestats	: {max: askpricestats[0] , min: askpricestats[1], average:askpricestats[2] }		 	
						, minpriceorder : ISFINITE( minpriceidx ) ? aorders_sell_raw[ minpriceidx ] : null 
						, ibookmarkthis : aresps[9]?.status 
						, logorders : aresps[ 10 ]
						, bids : aresps[ 11 ]
//						, log orders : aresps [ 9 ]
//            , bids : aresps[3] && aresps[3][0]? aresps[3][0] : null 
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

