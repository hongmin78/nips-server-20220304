
const validate_txhash=str=>{  return /^0x([A-Fa-f0-9]{64})$/.test( str )}

const validateemail =email=> {  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};
//const WAValidator = require('multicoin-address-validator')
//const cryptotype = 'ETH'
//const isethaddressvalid =str=> WAValidator.validate( str , cryptotype.toLowerCase() )
const isethaddress=str=>{
	let re = /[0-9A-Fa-f]{6}/g;
	if (str){}
	else { return false }
	return (str.length==40 || str.length==42 ) && re.test(str)
}
const isethaddressvalid =str=>true 

module.exports={
	validate_txhash
	, validateemail
	, isethaddress
	, isethaddressvalid 
}
