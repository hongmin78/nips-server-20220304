
// import {web3} from '../configs/configweb3'
// import {abierc20} from '../contracts/abi/erc20'
// import { LOGGER} from './common'
const { jweb3} = require( '../configs/configweb3')
const {abi : abistake }=require('../contracts/abi/stake')
const {abi : abierc20} =require( '../contracts/abi/erc20')
// const  {abicallrouter } =require( '../contracts/abi/call-router')
// const { LOGGER}=require( './common')
const  LOGGER=console.log

let jcontracts = {}
const MAP_STR_ABI={
	ERC20 : abierc20
	, STAKE : abistake
// , CALL_ROUTER : abicallrouter 
}
const getabistr_forfunction= jargs=>{let { contractaddress , abikind ,  methodname , aargs, nettype }=jargs;
	let contract; contractaddress=contractaddress.toLowerCase()
	let web3 =jweb3[ nettype ] 
  if(jcontracts[contractaddress ]){ contract=jcontracts[contractaddress] }
  else {        contract=new web3.eth.Contract( MAP_STR_ABI[abikind] , contractaddress);    jcontracts[contractaddress ]=contract }
	return contract.methods[ methodname ](... aargs ).encodeABI()
}
const query_noarg = jargs=>{
	let {contractaddress , abikind , methodname , nettype }=jargs
	let contract; contractaddress=contractaddress.toLowerCase()
	let web3 =jweb3[ nettype ] 
	if(jcontracts[contractaddress ]){ contract=jcontracts[contractaddress] }
	else {        contract=new web3.eth.Contract( MAP_STR_ABI[abikind] , contractaddress);    jcontracts[contractaddress ]=contract }
	return new Promise((resolve,reject)=>{
		contract.methods[ methodname ]( ).call((err,resp)=>{LOGGER('' , err,resp)
			if(err){resolve(null);return}
			resolve(resp)
		}).catch(err=>{resolve(null)})
	})
}
const query_with_arg = jargs=> {  // {contractaddress , methodname , aargs }=jargs
	let {contractaddress , abikind , methodname , aargs , nettype  }=jargs
	let contract; contractaddress=contractaddress.toLowerCase()
	let web3 =jweb3[ nettype ] 
	if(jcontracts[contractaddress ]){ contract=jcontracts[contractaddress] }
	else {        contract=new web3.eth.Contract( MAP_STR_ABI[abikind] , contractaddress);    jcontracts[contractaddress ]=contract }
	return new Promise((resolve,reject)=>{
		contract.methods[ methodname ](	... aargs		).call((err,resp)=>{LOGGER('' , err,resp)
			if(err){resolve(null);return}
			resolve(resp)
		}).catch(err=>{resolve(null)})
	})
}
const query_eth_balance=useraddress=>{
	return new Promise((resolve,reject)=>{
		let web3 =jweb3[ nettype ] 
		web3.eth.getBalance( useraddress ).then(resp=>{
			resolve(resp)
		}).catch(err=>{resolve(null)})
	})
}
module.exports= {
	getabistr_forfunction
	, query_noarg
	, query_with_arg
	, query_eth_balance
}

