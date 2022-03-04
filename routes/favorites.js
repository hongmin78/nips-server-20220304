var express = require('express');
var router = express.Router();
const {gettimestr}=require('../utils/common')
const {respok,resperr , resperrwithstatus}=require('../utils/rest')
const {getusernamefromsession}=require('../utils/session')
const {messages}=require('../configs/messages')
const {createrow , updaterow , incrementroworcreate , incrementrow }=require('../utils/db')
const {findone,findall}=require('../utils/db')
/* GET home page. */
const MAP_FAVOR_OBJECT_TYPES={
	ITEM:0
	, USER:1
}
router.get('/:objectid/likers',(req,res)=>{
	const {objectid }=req.params
	findall('logfavorites',{ object:objectid , status:1,objecttype:MAP_FAVOR_OBJECT_TYPES['ITEM'] }).then(resp=>{
		respok(res,null,null,{list:resp})
	})
})

router.get('/me/:objectid',(req,res)=>{
	const username=getusernamefromsession(req)
	if(username) {} else {resperrwithstatus(res,403,messages.MSG_PLEASELOGIN);return}
	let {objectid}=req.params
	findone('logfavorites',{username:username , object:objectid}).then(resp=>{
//		if(resp){} else {resperrwithstatus(res,406,messages.MSG_DATANOTFOUND);return}
		if(resp){} else {resperr(res,messages.MSG_DATANOTFOUND,18471);return}
		respok(res,null,null,{respdata:resp.status });return
	})
})
// router.get('/:objectid/totalcount',(req,res)=>{
router.get('/totalcount/:objectid',(req,res)=>{
	let {objectid}=req.params
	findone('favorites',{object:objectid}).then(resp=>{
		if(resp){respok(res,null,null,{respdata:resp['countfavors']})} 
		else 		{respok(res,null,null,{respdata:0})}
	})
})
router.post('/toggle/:objectid',(req,res)=>{
	let username=getusernamefromsession(req)
	if(username){} 
	else if (username = req.body?.username){}
	else {resperr(res,messages.MSG_PLEASELOGIN , );return}
	let {objectid}=req.params ; let itemid = objectid
	findone('logfavorites',{username , objectid}).then(resp=>{
		if(resp){
			const status01=1^resp.status,incvalue=resp.status?-1:+1 // , status00=resp.status
			updaterow('logfavorites', {username:username , objectid},{status:status01})
			respok(res,null,null,{respdata:status01 })
//			incrementroworcreate({table:'favorites',jfilter:{objectid},fieldname:'countfavors',incvalue: incvalue })
			incrementrow({table:'items' , jfilter:{itemid:objectid  } , fieldname:'countfavors',incvalue: incvalue	})	
		} else {			
			createrow('logfavorites',{objectid , itemid , username:username,status:1})
			respok(res,null,null,{respdata:1})
	//		incrementroworcreate({table:'favorites',jfilter:{ objectid},fieldname:'countfavors',incvalue: +1 })
			incrementrow({table:'items' , jfilter:{itemid:objectid  } , fieldname:'countfavors',incvalue: +1})	
			;return
		}
	})
})
/** create table favorites (
  `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT primary key,
  `createdat` DATETIME NULL DEFAULT current_timestamp(),
	`updatedat` DATETIME NULL DEFAULT NULL ON UPDATE current_timestamp()
	, objectclass tinyint 
	, object varchar(200)
	, countfavors int default 0
);*/

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
module.exports = router;
