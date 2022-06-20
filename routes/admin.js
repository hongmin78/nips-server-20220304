var express = require('express');
var router = express.Router();
const { REFERERCODELEN}=require('../configs/configs')
const {
  findone,
  findall,
  createrow,
  updaterow,
  countrows_scalar,
  createorupdaterow,
  fieldexists,
  tableexists,
  updateorcreaterow,
	updaterows
} = require("../utils/db");
const { respok , resperr}=require( '../utils/rest')
const { generateSlug } =require( 'random-word-slugs')
const {LOGGER,generaterandomstr 
	, generaterandomstr_charset 
	, gettimestr
	, ISFINITE
	, uuidv4
	, }=require('../utils/common')
const { messages}=require('../configs/messages')
const { isethaddressvalid } =require('../utils/validates')
const {TOKENLEN}=require('../configs/configs')
const { getuseragent
	,getipaddress
} =require('../utils/session')
const db=require('../models')
const ejs = require("ejs");
const fs=require('fs')
const PATH_STORE_DEF = "/var/www/html";
const { storefiletoawss3 } = require("../utils/repo-s3");
const shell = require("shelljs");
/*
const storefile_from_base64data=( datainbase64 ,fullpathname, fullpathfilename )=>{ // ,hexid , mode_perm_temp
  // const fullpathname=`${__dirname}/repo/${hexid}`
  // ! fs.existsSync  ( fullpathname ) && fs.mkdirSync( fullpathname )
//  switch( mode_perm_temp ){
  //  case 'perm' : fullpathname = `${PATH_STORE_DEF}/repo/${hexid}` ; break
    //case 'temp' : fullpathname = `${PATH_STORE_DEF}/tmp/${hexid}` ; break
//  }
  ! fs.existsSync ( fullpathname ) && shell.mkdir( '-p' , fullpathname )
  return new Promise((resolve,reject)=>{
    datainbase64 = datainbase64.replace(/^data:image\/png;base64,/, "")
    datainbase64 = datainbase64.replace(/^data:image\/jpg;base64,/, "")
    datainbase64 = datainbase64.replace(/^data:image\/jpeg;base64,/, "")
    datainbase64 = datainbase64.replace(/^data:image\/gif;base64,/, "")
    datainbase64 = datainbase64.replace(/^data:video\/mp4;base64./,"")
//    let fullpathfilename=`${fullpathname}/${filename}`
    fs.writeFile( fullpathfilename , datainbase64, 'base64', function(err) {      // filename
      if(err){console.log('ADlwE6Rctw',err);resolve(null);return}
      resolve( fullpathfilename ) ;
    })
  })
}
*/
const storefile_from_base64data = (datainbase64, filename, hexid) => {
  // const fullpathname=`${__dirname}/repo/${hexid}`	// ! fs.existsSync	( fullpathname ) && fs.mkdirSync( fullpathname )
  let fullpathname = `${PATH_STORE_DEF}/banners/pc`;
  !fs.existsSync(fullpathname) && shell.mkdir("-p", fullpathname);
  return new Promise((resolve, reject) => {
    datainbase64 = datainbase64.replace(/^data:image\/png;base64,/, "");
    datainbase64 = datainbase64.replace(/^data:image\/jpg;base64,/, "");
    datainbase64 = datainbase64.replace(/^data:image\/jpeg;base64,/, "");
    datainbase64 = datainbase64.replace(/^data:image\/gif;base64,/, "");
    datainbase64 = datainbase64.replace(/^data:video\/mp4;base64./, "");
    let fullpathfilename = `${fullpathname}/${filename}`;
    fs.writeFile(fullpathfilename, datainbase64, "base64", function (err) {
      // filename
      if (err) {
        console.log("ADlwE6Rctw", err);
        resolve(null);
        return;
      }
      resolve(fullpathfilename);
    });
  });
};

router.put('/banner/:uuid', async (req,res)=>{ LOGGER('' , req.body )
	let {uuid}=req.params
	let { isinuse , }=req.body 
	findone('banners', {uuid} ).then(async resp=>{
		if ( resp){}
		else { resperr(res, messages.MSG_DATANOTFOUND ) ; return }
		if( Number.isFinite( + isinuse ) ){}
		else {resperr( res,messages.MSG_ARGINVALID); return }
		await updaterow( 'banners' , { uuid } , {... req.body } )
		respok ( res )  
	})
}) 
router.post ( '/banner' ,async(req,res)=>{
   LOGGER('' , req.body )
	let {nettype, imagepc, writer, isinuse ,filenamepc }=req.body
	if (imagepc && filenamepc  ){}
	else {resperr(res,messages.MSG_ARGMISSING) ; return }
let uuid = uuidv4();	
let FILE_SAVE_LOCATION_ROOT ='/var/www/html/banners'
	let resp00 =	await storefile_from_base64data ( imagepc , filenamepc,uuid);
  let imageurlpc = await storefiletoawss3(resp00, uuid);
	if ( resp00) {}
	else { resperr( res, 'ERR-FILE-WRITE-ERR', null, { reason:'pc-file' } ) ; return }	
 /*	if(+isinuse){
		await updaterows ('banners' , {active: 1} , {isinuse:0} )
	} else{} */
	await createrow ( 'banners', {
		 writer : writer ? writer:null
		, isinuse : isinuse ? isinuse : null	
		, imageurlpc : resp00
    ,filenamepc
		, uuid
    , nettype  
	} ).then((resp)=>{
 respok(res,"success")
}) 
/*
	respok ( res, null,null,{
		respdata : { imageurlpc, uuid } 
	} )
*/
//	listdir = fs.readdirSync( FILE )
})
/** imageurlpc   | varchar(500) 
| imageurlmobile | varchar(500) 
| writer         | varchar(40)  
| uuid           | varchar(50)  
| active         | tinyint(4)   
| isinuse        | tinyint(4)   
| filenamepc     | varchar(500) 
| filenamemobile |  */

router.post('/login', async(req,res)=>{
  const {username , pw }=req.body
  LOGGER('pM34zwlLCQ',req.body) //  respok(res);return
  if(username && pw){
    let respfind = await findone('admins', { username : username, pw: pw} )
    if ( respfind){
    respok ( res, null,null, null)
  }
  else { resperr(res,messages.MSG_DATANOTFOUND ) ;return }
  } else {resperr(res,messages.MSG_ARGMISSING);return}
})

module.exports = router;
