var express = require('express');
var router = express.Router();
const { REFERERCODELEN}=require('../configs/configs')
const { findone, createrow
	, updaterow
 }=require('../utils/db')
const { respok , resperr}=require( '../utils/rest')
const { generateSlug } =require( 'random-word-slugs')
const {LOGGER,generaterandomstr 
	, generaterandomstr_charset 
	, gettimestr
	, create_uuid_via_namespace
 }=require('../utils/common')
const { messages}=require('../configs/messages')
const { isethaddressvalid } =require('../utils/validates')
const {TOKENLEN}=require('../configs/configs')
const { getuseragent
	,getipaddress
} =require('../utils/session')
const db=require('../models')
const ejs = require("ejs");
const nodemailer=require('nodemailer')
const moment=require('moment')
// let transporter=nodemailer.createTransport({  service: 'gmail'  
//	, auth: {   user: configemail.user    , pass: configemail.pass }  , tls: { rejectUnauthorized: false } //true
// })
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {      user: 'testnodemailer77@gmail.com'
		, pass : 'chainlabs123'
  },
})
router.get('/randomuuid', (req,res)=>{
	let uuid=create_uuid_via_namespace ( generaterandomstr(10) )
	respok ( res, null,null, { uuid})
})

router.post("/email/request", (req, res) => {
  const { email		, walletAddress 	} = req.body; LOGGER( '', req.body )
	if ( email && walletAddress ) {}
	else { resperr(res, messages.MSG_ARGMISSING ) ;return }
  const authNum = Math.floor(Math.random() * (9999 - 1) + 1);
//	LOGGER( process.env )

	let TABLENAME='emailverifycode'
  let emailForm;
  ejs.renderFile(
    __dirname + "/../template/authMail.ejs",
    { email, walletAddress, authNum },
    (err, data) => {
      if (err) console.log(err);
      emailForm = data;
    }
  );
  transporter.sendMail(
    {      from: "nip",
      to: email,
      subject: "nip 인증메일",
      html: emailForm,
      attachments: [
        {
          filename: "logo.png",
          path: __dirname + "/../template/img/logo.png",
          cid: "logo",
        },
      ],
    },
    (error, info) => {
      if (error) { 				LOGGER(error) // res.status(400).send("이메일 전송 실패");
				resperr( res, messages.MSG_EMAIL_SEND_ERR );return 
			}
      else {
   			findone( TABLENAME, {emailaddress : email } ).then(resp=> { //     M_emailAuth.find({ email }, (err, item) => {
          if ( resp ) {
            LOGGER( resp) // console.log(item[0]);
            updaterow ( TABLENAME , //) M_emailAuth.updateOne(
              { emailaddress : email },
              { code : authNum  } // { $set: { authNum } },
            ).then(resp => { // (err, res) => {
							LOGGER(resp)
            } )
          } else {
						createrow ( TABLENAME , {
							emailaddress : email
							, code : authNum 
							, expiry : moment().unix() + 24 * 60 * 60 * 1000
						} )
        	}
					setTimeout (_=>{
						deleterow ( TABLENAME , {emailaddress : email } )
					}, 24 * 60 * 60 * 1000)
					respok ( res)	//        res.status(200).send("이메일 전송 성공");
      	})
    	}
		}
  );
});
let {createnicks}=require('../utils/users')
router.post('/signup' , async(req,res)=>{
  const { walletAddress : walletaddress 
		, email 
		, password
		, referral : referer
		, nickname 
	} = req.body; LOGGER(req.body )
	if ( walletaddress && email && password && referer ){}
	else {resperr(res, messages.MSG_ARGMISSING);return }

	let respreferer= await findone('users' , { myreferercode : referer} )
	if ( respreferer){}
	else {resperr( res, messages.MSG_INVALID_REFERER); return }
//	let respemail = await findone('users', { email })
	//if ( respemail ){resperr( res, messages.MSG_DATADUPLICATE ,null, {reason : 'email'} ) ; return }
//	else { }
	let respaddress = await findone ( 'users', {username : walletaddress } )
	if ( respaddress ) {resperr( res, messages.MSG_DATADUPLICATE ,null, {reason : 'walletaddress'}) ; return }
	else {} 
  findone ( 'users' , {address : walletaddress } ).then(async resp=> { // M_userInfo.find({ walletAddress }, (err, item) => {
		if ( resp ) { 			resperr(res, messages.MSG_DATADUPLICATE ,null, {reason : 'walletaddress'}); return
		} else {} //    if (item[0]) res.status(400).send("이미 가입된 지갑입니다");
// REQUIRE EMAIL VERIFY BEFORE SIGN UP
//		let respemail = await findone ( 'emailverifycode' , {emailaddress : email } )
	//	if (respemail){}
		//else { resperr( res, messages.MSG_EMAIL_NOTSET ) ; return } // M_emailAuth.find({ email, auth: true }, (err, item) => {
		let uuid=create_uuid_via_namespace ( walletaddress.toLowerCase() ) 
		let myreferercode = generaterandomstr_charset( REFERERCODELEN , 'notconfusing' ) 
		if ( nickname){		} 
else {
	let respcreatenick =await createnicks()
	nickname=respcreatenick.nickname	
}	
		await createrow( 'users', {
			username : walletaddress
			, walletaddress
			, email
			, pw : password
			, referer
			, emailauth : 0
			, uuid
			, myreferercode 
			, nickname
		})
		respok ( res, null,null, {respdata : uuid } ) 
  })
})
router.post("/email/auth", async(req, res) => {
  const { email : emailaddress
		, authNum : code
		, walletaddress  
	} = req.body //  M_emailAuth.updateOne(
	findone ( 'emailverifycode' , { emailaddress , code }).then(async resp=>{
		if (resp){}
		else {resperr(res, messages.MSG_VERIFYFAIL ) ; return }
		updaterow ( 'emailverifycode' 
  	  , { emailaddress , code }
    	, { emailauth: true } 
		)
		respok ( res ) 
		let respfinduser = await findone('users', { address : walletaddress , email : emailaddress } )
		if ( respfinduser) {
			updaterow ( 'users', {id:respfinduser.id } , { emailauth : 1 } )
		}
		else {
		} 
	} )
});

module.exports = router;
