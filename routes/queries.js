const moment = require('moment');
var express = require('express');
var router = express.Router();
const {findone,findall,createrow , updaterow
, countrows_scalar
, createorupdaterow
  , fieldexists
	, tableexists
	, updateorcreaterow
}=require('../utils/db')
const { updaterow : updaterow_mon}=require('../utils/dbmon')
const KEYS=Object.keys
const {LOGGER,generaterandomstr , generaterandomstr_charset , gettimestr
	, ISFINITE
	, separatebycommas
	, convaj
 }=require('../utils/common')
const {respok,respreqinvalid,resperr , resperrwithstatus } =require('../utils/rest')
const {messages}=require('../configs/messages')
const {getuseragent , getipaddress}=require('../utils/session') // const {sendemail, sendemail_customcontents_withtimecheck}=require('../services/mailer')
const {validateemail}=require('../utils/validates')
const db=require('../models') // const dbmon=require('../modelsmongo')
const {getusernamefromsession}=require('../utils/session') // const { createrow:createrow_mon , updaterow : updaterow_mon }=require('../utils/dbmon')
const { queryitemdata , queryitemdata_user }=require('../utils/db-custom')
const { queryuserdata }=require('../utils/db-custom-user' ) 
const TOKENLEN=48
let { Op }=db.Sequelize
let nettype='ETH-TESTNET'
const { mqpub } = require('../services/mqpub')
const MAP_ORDER_BY_VALUES={
  ASC:1
  , asc:1
  , DESC:1
  , desc:1
}
const MAP_TABLENAME_QUERY_ALLOWED={
	settings : 1
	, categories: 1
	, itembalances : 1
	,circulations : 1
}
const expand_fieldval_matches=( fieldname , arrfieldvalues ) =>{
	let arr_field_matches =	arrfieldvalues.map ( elem => { let jdata={} ; jdata[fieldname] = { [Op.like] : elem }; return jdata } )
	return { [ Op.or] : arr_field_matches }
}
const MAP_TABLE_INVOKE_ITEMQUERY={
	items : 1
	, itembalances : 1
}
const SERIAL_NUMBER_DEF = 1
router.post('/update-or-create-rows/:tablename',async(req,res)=>{ LOGGER('' , req.body )
	let {tablename , keyname, valuename }=req.params
	let jpostdata={... req.body} 
	let resp = await tableexists(tablename)
	if(resp){}
	else {resperr(res,messages.MSG_DATANOTFOUND);return}
	KEYS ( jpostdata ).forEach(async elem=>{
		let valuetoupdateto = jpostdata [elem] //		let jdata={}
		await updateorcreaterow(tablename ,{ key_:elem } ,{ value_: valuetoupdateto } )
	})
	respok ( res)
	mqpub ( jpostdata )
})
router.put('/update-or-create-rows/:tablename',async(req,res)=>{ LOGGER('' , req.body )
	let {tablename , keyname, valuename }=req.params
	let jpostdata={... req.body}
	let resp = await tableexists(tablename)
	if(resp){}
	else { resperr(res,messages.MSG_DATANOTFOUND);return}
	KEYS ( jpostdata ).forEach(async elem=>{
		let valuetoupdateto = jpostdata [elem] //		let jdata={}
		await updateorcreaterow(tablename ,{ key_:elem } ,{ value_: valuetoupdateto } )
	})
	respok ( res)
	mqpub ( jpostdata )
})

router.get( '/singlerow/:tablename/:fieldname/:fieldval' , async(req,res)=>{
	let {tablename , fieldname , fieldval }=req.params
	if ( tablename && fieldname && fieldval){}
	else {resperr(res,messaegs.MSG_ARGMISSING);return }
	fieldexists( tablename ,fieldname ).then(async resp=>{
		if (resp){}
		else {resperr(res, messages.MSG_DATANOTFOUND); return }
	
		let jfilter={}
		jfilter[ fieldname]=fieldval	
		if (req.query && KEYS(req.query).length){

			let akeys=KEYS(req.query)
			for ( let i=0; i<akeys.length; i++){ let elem=akeys[ i ] // 			forEach (elem=>{
				let respfieldex = await fieldexists ( tablename , elem )
				if ( respfieldex){}
				else {resperr(res, messages.MSG_ARGINVALID , null, {payload:{reason:elem } } ); return }
			}
			jfilter={... jfilter , ... req.query }
		}
		else {}
		let respfindone = await findone( tablename, { ... jfilter } )
		respok ( res, null,null, { respdata : respfindone } )
	})
})

router.get( '/singlerow/:tablename/:fieldname/:fieldval', async (req,res)=>{
	let {tablename , fieldname , fieldval }=req.params
	if ( tablename && fieldname && fieldval){}
	else {resperr(res,messaegs.MSG_ARGMISSING);return }
	fieldexists( tablename ,fieldname ).then(async resp=>{
		if (resp){}
		else { resperr(res, messages.MSG_DATANOTFOUND ) ;return }
		let jfilter={}
		jfilter[ fieldname]=fieldval	
		let respfindone = await findone( tablename, { ... jfilter } )
		respok ( res, null,null, { respdata : respfindone } )
	})	
})
router.get( '/max/:tablename/:fieldname' ,async (req,res)=>{
	let { tablename , fieldname}=req.params
	tableexists(tablename).then(async resp=>{
		if ( resp){}
		else {resperr(res, messages.MSG_DATANOTFOUND,null,{payload: {reason:'tablename'}}); return }

		let respfieldexists = await fieldexists ( tablename , fieldname )
		if ( respfieldexists ){}
		else {resperr( res, messages.MSG_DATANOTFOUND, null,{payload: { reason:'fieldname'}}); return }

		let count = await countrows_scalar ( tablename, {} ) 
		if ( count){}
		else { respok ( res, null, null, { payload: { max :SERIAL_NUMBER_DEF } } ) ;return }

		let respmax = await db[ tablename ].max( fieldname , {where : { }})
		respok ( res, null,null, { payload : { max : respmax } } )
	})
})
router.get('/count/:tablename',async (req,res)=>{
	let {tablename} =req.params
	tableexists( tablename).then(async resp=>{
		if ( resp ){}
		else {resperr(res, messages.MSG_DATANOTFOUND ); return }
		let count = await countrows_scalar( tablename ,{}) 
		respok ( res, null,null, { payload : {count } } )
	})
})
router.get('/rows/jsonobject/:tablename/:keyname/:valuename',(req,res)=>{
	let {tablename ,keyname , valuename }=req.params
	if ( tablename=='users'){resperr(res,'ERR-RESTRICTED');return }
	tableexists(tablename).then(resp=>{
		if(resp){}
		else {resperr(res,messages.MSG_DATANOTFOUND); return }
		findall(tablename, {}).then(list=>{
			let jdata = convaj( list , keyname , valuename ) // =(arr,keyname,valuename)=>{
			respok ( res,null,null, { respdata : jdata } )
		})
	})
})
router.get('/rows/fieldvalues/:tablename/:offset/:limit/:orderkey/:orderval' , async (req,res)=>{ // :fieldname/:fieldval/
	let { tablename , offset , limit , orderkey , orderval}=req.params
	let {fieldname , fieldvalues , itemdetail } = req.query
	const username=getusernamefromsession( req ) 
	fieldexists(tablename, fieldname ).then(async resp=>{
		if(resp){}
		else {resperr( res, messages.MSG_DATANOTFOUND); return }
		offset = +offset
		limit = +limit
		if ( ISFINITE(offset) && offset>=0 && ISFINITE(limit) && limit >=1 ){}
		else {resperr( res, messages.MSG_ARGINVALID , null , {payload: {reason : 'offset-or-limit-invalid'}} ); return }
		if ( MAP_ORDER_BY_VALUES[orderval]){}
		else {resperr( res , messages.MSG_ARGINVALID , null , {payload: {reason : 'orderby-value-invalid'}})  ; return }
		let respfield_orderkey = await fieldexists ( tablename , orderkey )
		if ( respfield_orderkey){}
		else {resperr( res, messages.MSG_ARGINVALID, null , {payload : {reason : 'orderkey-invalid'}}); return }

		let jfilter={}
		let {fieldname , fieldvalues} = req.query
		if ( fieldname && fieldvalues ){
			if ( fieldvalues.length ){
				if(fieldvalues.match( /\,/ ) && fieldvalues.match ( /(?<big>[a-zA-Z0-9]+)/ ) ) {
					let arrfieldvalues=  separatebycommas ( fieldvalues ) ; LOGGER('pPPlj4EEMG' , arrfieldvalues )
					jfilter = expand_fieldval_matches	( fieldname , arrfieldvalues )
				}
				else { jfilter[ fieldname ] = fieldvalues } 
			} else {}
		}
		else {}  //		jfilter[ fieldname ]	=fieldval
		db[tablename].findAll ({raw:true
			, where : {... jfilter} 
			, offset
			, limit
			,	order : [[ orderkey , orderval ]]
		}).then( list_00 =>{
//		if (tablename=='items'){
		if ( MAP_TABLE_INVOKE_ITEMQUERY [tablename] || itemdetail ){
			let aproms=[]
			if (username){
				list_00.forEach ( elem=>{
					aproms[aproms.length] = queryitemdata_user ( elem.itemid , username )
				})
			} else {
				list_00.forEach ( elem=>{
					aproms[aproms.length] = queryitemdata( elem.itemid )
				})
			}
			Promise.all ( aproms).then(list=>{
//				list= list.map ( (elem,idx ) => {return {... elem, ... list_00[idx] }} ) 
//				list= list.map ( (elem,idx ) => {return {... list_00[idx] , payload : list_00[idx] , ... elem , }} ) 
				list= list.map ( (elem,idx ) => {return {... list_00[idx] , ... elem , }} ) 
				respok ( res ,null, null , {list } )
			})
		} else {
			respok ( res ,null,null , { list : list_00 } )
		}
		})
	})
})
const convliker=str=>'%' + str + '%'
const expand_search=(tablename , liker ) =>{
	switch(tablename){
		case 'items' :
			return { [Op.or] : [
          {itemid:      {[Op.like] : liker }}
//        , {userame:  {[Op.like] : liker }}
        , {description: {[Op.like] : liker }}
			] }
		break 
		case 'users' :
			return {[Op.or] : [
          { username:      {[Op.like] : liker }}
        , { email :  {[Op.like] : liker }}
        , { myreferercode : {[Op.like] : liker }}
			] 			}	
		break
		case 'transactions' : 
			return { [Op.or] : [
          { txhash :      {[Op.like] : liker }}
        , { username :  {[Op.like] : liker }}
        , { itemid : {[Op.like] : liker }}
			]
			}
		break
	}
}
router.get('/rows/:tablename/:fieldname/:fieldval/:offset/:limit/:orderkey/:orderval' , async (req,res)=>{
	let { tablename , fieldname , fieldval , offset , limit , orderkey , orderval}=req.params
	let { itemdetail, userdetail , filterkey , filterval}=req.query
	let { searchkey } =req.query
	let { date0 , date1 } =req.query
	console.log(date0)
	console.log(date1)
	const username=getusernamefromsession( req ) 
	fieldexists(tablename, fieldname ).then(async resp=>{
		if(resp){}
		else {resperr( res, messages.MSG_DATANOTFOUND); return }
		offset = +offset
		limit = +limit
		if ( ISFINITE(offset) && offset>=0 && ISFINITE(limit) && limit >=1 ){}
		else {resperr( res, messages.MSG_ARGINVALID , null , {payload: {reason : 'offset-or-limit-invalid'}} ); return }
		offset=parseInt(offset)
		limit=parseInt(limit)

		if ( MAP_ORDER_BY_VALUES[orderval]){}
		else {resperr( res , messages.MSG_ARGINVALID , null , {payload: {reason : 'orderby-value-invalid'}})  ; return }
		let respfield_orderkey = await fieldexists ( tablename , orderkey )
		if ( respfield_orderkey){}
		else {resperr( res, messages.MSG_ARGINVALID, null , {payload : {reason : 'orderkey-invalid'}}); return }
		let jfilter={}
		jfilter[ fieldname ]	=fieldval
		if ( filterkey && filterval ){
			let respfieldexists = await fieldexists (tablename , filterkey )
			if ( respfieldexists ){ }
			else {resperr( res, messages.MSG_DATANOTFOUND); return }
			jfilter[ filterkey ]=filterval
		}
		else {}
		if ( searchkey ) {
			let liker=convliker ( searchkey )
			let jfilter_02=expand_search ( tablename , liker ) 
			jfilter={... jfilter , ... jfilter_02 } 
		}
		else {}
		if ( date0 ){
			jfilter = { ... jfilter ,
				createdat: {
		      [Op.gte] : moment(date0).format('YYYY-MM-DD HH:mm:ss')
    	  }
			}
		}
		if ( date1 ) {
			jfilter = { ... jfilter ,
				createdat: {
		      [Op.lte] : moment(date1).format('YYYY-MM-DD HH:mm:ss')
    	  }
			}
		}
		if (date0 && date1){
			jfilter = { ... jfilter ,
				createdat: {
					[Op.gte] : moment(date0).format('YYYY-MM-DD HH:mm:ss'),
		      		[Op.lte] : moment(date1).format('YYYY-MM-DD HH:mm:ss')
    	  		}
			}
		}
		console.log(jfilter)
		db[tablename].findAll ({raw:true
			, where : {... jfilter} 
			, offset
			, limit
			,	order : [[ orderkey , orderval ]]
		}).then( async list_00 =>{
			let count = await countrows_scalar( tablename , jfilter )
			respok ( res ,null,null , { list : list_00, payload :{count} } )
//		if (tablename=='items'){
			return
		if ( MAP_TABLE_INVOKE_ITEMQUERY [tablename] || itemdetail ){
			let aproms=[]
			if ( username) {
				list_00.forEach ( elem=>{
					aproms[aproms.length] = queryitemdata_user ( elem.itemid , username )
				})
			} else {
				list_00.forEach ( elem=>{
					aproms[aproms.length] = queryitemdata ( elem.itemid )
				})
			}
			Promise.all ( aproms).then(list=>{
//				list= list.map ( (elem,idx ) => {return {... elem, ... list_00[idx] }} ) 
//				list= list.map ( (elem,idx ) => {return {... elem , payload : elem, ... list_00[idx] }} ) 
				list= list.map ( (elem,idx ) => {return { ... list_00[idx] , ... elem ,}} ) 
				respok ( res ,null, null , {list } )
			})
		} 
		else if ( userdetail ){
			let aproms=[]
			list_00.forEach ( elem=>{
				aproms[aproms.length] = queryuserdata ( elem.username )
			})
			Promise.all ( aproms).then(list =>{
				list =list.map( (elem,idx)=> { return { ... elem, ... list_00[idx] }} )
				respok ( res, null ,null, { list } )
			})
		}
		else {
			respok ( res ,null,null , { list : list_00 } )
		}
		})		
	})
})
router.get('/:tablename' , (req,res)=>{
  let { tablename } =req.params
	if ( MAP_TABLENAME_QUERY_ALLOWED[tablename]){}
	else {resperr(res,messages.MSG_NOT_ALLOWED); return } 
  findall ( tablename , {}).then(resp=>{
    respok ( res, null ,null , { list : resp } )
  })
})
router.get('/:tablename/:fieldname/:fieldval' , (req,res)=>{
  let {tablename , fieldname , fieldval }=req.params
  if (tablename=='users'){resperr(res , messages.MSG_NOT_PRIVILEGED ) ; return }
  fieldexists ( tablename , fieldname).then(resp=>{
    if (resp){}
    else { resperr( res, messages.MSG_DATANOTFOUND); return }
    let  jfilter = {}
    jfilter [ fieldname ]  = fieldval
    findall ( tablename , {... jfilter } ).then(resp=>{
      if ( resp) {}
      else {resperr( res, messages.MSG_DATANOTFOUND ) ; return }
			if (resp[0] && resp[0].itemid ){	
				let aproms=[]
				resp.forEach (elem=>{
					aproms[aproms.length ] = findone('items', { itemid : elem.itemid } )
				})
				Promise.all ( aproms).then(respproms=>{
					let list = resp.map(( elem , idx ) =>{ return {... elem, itemdata: respproms[idx] } } )
					respok ( res, null,null, { list } )	
				})
			} else {
      	respok ( res, null ,null , {payload : {rowdata : resp } } )
			}
			
    })
  })
})


module.exports = router;
const get_search_table_fields=(tablename,liker)=>{
  if ( tablename){}
  else { return null }
  switch( tablename){
    case 'logsales' :
return { [Op.or] : [
    {itemid : {[Op.like] : liker}}
  , {txhash : {[Op.like] : liker} }
  , {paymeansname: {[Op.like] : liker} }
  , {paymeans: {[Op.like] : liker} }
  , {buyer: {[Op.like] : liker} }
  , {seller: {[Op.like] : liker} }
  ] }
//  , {nettype : {[Op.like] : liker} }}
    break
    default :
    return  { [ Op.or ] : [
          {name :   {[Op.like] : liker }}
        , {address: {[Op.like] : liker }}
      ]
    }
  }
}

