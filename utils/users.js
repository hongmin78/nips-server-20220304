
const { findone, createrow
	, updaterow
 }=require('../utils/db')
const sha256 = require('js-sha256').sha256
const conv_consec_id_rand_id=num=>{
//  return parseInt( hashviasha256(''+num ).substr(0,8),16)
  return parseInt( sha256(''+ num ).substr(0,8),16).toString().substr(0,8)
}

const createnicks = async _=>{
  const KEYNAME_LOCAL = 'random_id_next'
  let resp  = await findone('settings' , {key_: KEYNAME_LOCAL } )
  let nextid
  if ( resp ){ 
    nextid = +resp.value_ // 1 + +resp.value_
    updaterow ('settings' , {key_: KEYNAME_LOCAL} , {value_ : 1 + nextid })
  }
  else { 
    nextid = NEXT_ID_DEF
    createrow ( 'settings' , { key_: KEYNAME_LOCAL , value_ : nextid  } )
  }
  let rand_id = conv_consec_id_rand_id ( nextid)

  for ( let idx=15; idx>0; idx --){
    let resp = await findone( 'users', {nickname : `NIP#${rand_id}` } )
    if ( resp) { ++ nextid ;
      rand_id = conv_consec_id_rand_id ( nextid)
      continue
    } else {
      break
    }
  }
  await updaterow ('settings' , {key_: KEYNAME_LOCAL} , {value_ : 1 + nextid })
  return { nickname : `NIP#${rand_id}` , storename : `NIP#${rand_id}` } // Store 
//  return { nickname : `NIP#${nextid}` , storename : `NIP#${nextid}Store` } 
}
module.exports={
	createnicks
}
