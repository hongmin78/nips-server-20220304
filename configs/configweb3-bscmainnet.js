
const Web3=require('web3')
const infuraurlmain=   'https://bsc-dataseed4.defibit.io/' // 'https://mainnet.infura.io/v3/cd35bc8ac4c14bc5b464e267e88ee9d0'
// const infuraurlropsten= XXX 'https://data-seed-prebsc-2-s2.binance.org:8545/' // 'https://ropsten.infura.io/v3/cd35bc8ac4c14bc5b464e267e88ee9d0'
//  const infuraurlropsten= 'https://data-seed-prebsc-1-s3.binance.org:8545/'
//    const infuraurlropsten= 'https://data-seed-prebsc-2-s3.binance.org:8545/'
// const infuraurlropsten='https://ropsten.infura.io/v3/cd35bc8ac4c14bc5b464e267e88ee9d0'  ???
// const infuraurlropsten='https://ropsten.infura.io/v3/5799d55e1e66488786f26d987bfcfd05'

const NETCLASS='mainnet' // testnet' // require('fs').readFileSync('NETTYPE.cfg').toString().replace(/ /g,'');console.log(NETCLASS)
const jnetkind={mainnet:'mainnet',testnet:'ropsten'}
const jnettype={mainnet:'mainnet',testnet:'testnet'}
const jinfuraurl={mainnet:infuraurlmain,testnet:infuraurlmain}
const infuraurl=jinfuraurl[NETCLASS]  //
const netkind=jnetkind[NETCLASS],nettype=jnettype[NETCLASS] // 'testnet' //  'ropsten'
// const infuraurl=infuraurlmain // infuraurlropsten // 
let web3 = new Web3(new Web3.providers.HttpProvider(infuraurl))

module.exports={ web3 ,netkind,nettype } // ,createaccount,aapikeys,getapikey

