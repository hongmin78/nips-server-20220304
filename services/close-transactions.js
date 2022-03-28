
const {jweb3}=require('../configs/configweb3')
const awaitTransactionMined =require( "await-transaction-mined")
const cliredisa = require('async-redis').createClient()
const { LOGGER , STRINGER , KEYS
  , gettimestr
}=require('../utils/common')
const {updaterow
  , findone
  , findall
  , deleterow
  , createrow
  , createorupdaterow
	, moverow
	, updateorcreaterow
}=require('../utils/db')
const { query_with_arg }=require('../utils/contract-calls')
const { ADDRESSES}=require('../configs/addresses')
/** const {updaterow : updaterow_mon , createrow : createrow_mon
  , findone : findone_mon
}=require('../utils/dbmon') */
const { NETTYPE } =require('../configs/net')
const { getweirep
	, getethrep} =require('../utils/eth')
const PARSER =JSON.parse    
const TXREQSTATUS_POLL_INTERVAL = 3000
const TXREQSTATUS_BLOCKCOUNT = 1 // 2 // 4 // 6
let TX_POLL_OPTIONS={
  interval : TXREQSTATUS_POLL_INTERVAL
  , blocksToWait : TXREQSTATUS_BLOCKCOUNT
} 
const {MIN_STAKE_AMOUNT}=require('../configs/stakes')

const enqueue_tx_toclose=async(txhash , uuid , nettype )=>{
	switch (nettype){
		case 'ETH_TESTNET':
		case 'ETH-TESTNET':
			enqueue_tx_eth (txhash , uuid , nettype )
		break
		case 'BSC_MAINNET' :
		case 'BSC-MAINNET':
			enqueue_tx_eth (txhash , uuid , nettype )
//			enqueue_tx_bsc (txhash , uuid , nettype )
		break
	}
}
const enqueue_tx_bsc=async (txhash , uuid, nettype )=>{
	setTimeout(_=>{
		cliredisa.hget('TX-TABLES', txhash).then(async resp=>{
			if (resp){LOGGER( resp )}
				let str_txauxdata = resp
        let jparams = PARSER( str_txauxdata )
        let {type , tables, address , amount , strauxdata }=jparams // itemid
			let status_code_toupdate =1; let status =true
        KEYS( tables ).forEach(async tablename=>{
          await updaterow( tablename , { txhash } , {status : status_code_toupdate })
        })
				if ( type=='STAKE' ){
					updaterow('users', {username : address} , {stakeamount : amount ,
						isstaked : status ? 1 : 0
					})
				}
		})
	}, 10*1000 )
}
const handle_pay_case = async( jdata )=>{
	let {uuid , username , itemid , strauxdata , txhash }=jdata
	await moverow( 'receivables', { itemid } , 'logsales', { txhash }) // uuid
	await updaterow( 'itemhistory' , {uuid} , {status : 1 } )
	let amount,currency,currencyaddress
	if (strauxdata ){
		let jdata=PARSER( strauxdata )
		amount = jdata.amount
		currency = jdata.currency
		currencyaddress = jdata.currencyaddress
	}
	await updateorcreaterow ( 'itembalances' ,{
		itemid
	} , { username
	, status : 1
	, buyprice : amount
	, paymeans : currency
	, paymeansaddress : currencyaddress 
//	, amount
	 } )
}
/** logactions
	username     | varchar(80)      | YES  |     | NULL                |                               |
| actiontype   | tinyint(4)       | YES  |     | NULL                |                               |
| actionname   | varchar(20)      | YES  |     | NULL                |                               |
| seller       | varchar(80)      | YES  |     | NULL                |                               |
| buyer        | varchar(80)      | YES  |     | NULL                |                               |
| amount       | varchar(20)      | YES  |     | NULL                |                               |
| note         | varchar(200)     | YES  |     | NULL                |                               |
| itemid       | varchar(80)      | YES  |     | NULL                |                               |
| priceunit    | varchar(20)      | YES  |     | NULL                |                               |
| typestr      | varchar(20)      | YES  |     | NULL                |                               |
| supertypestr | varchar(20)      | YES  |     | NULL                |                               |
| txhash       | varchar(100)     | YES  |     | NULL                |                               |
| price        | varchar(20)      | YES  |     | NULL                |                               |
| from_        | varchar(80)      | YES  |     | NULL                |                               |
| to_          | varchar(80)      | YES  |     | NULL                |                               |
| uuid         | varchar(100)     | YES  |     | NULL                |                               |
| nettype      | varchar(20)      | YES  |     | NULL                |                               |
| status       | tinyint(4)       | YES 
*/
const	handle_clear_delinquent_case = async ( jdata)=>{
	let { uuid , username , itemid , strauxdata , txhash } = jdata //	await moverow ('delinquencies', { itemid } , 'logdelinquents', {} )	
	findall('delinquencies' , {username} ).then(async list=>{
		list.forEach ( async (elem)=>{
			await moverow ('delinquencies', { id : elem.id } , 'logdelinquents', { txhash } )	
		})
	})
}
const enqueue_tx_eth=async (txhash , uuid, nettype)=>{
	let web3= jweb3[ nettype ]
  awaitTransactionMined
    .awaitTx(web3
      , txhash
      , TX_POLL_OPTIONS)
    .then( async minedtxreceipt =>{ LOGGER('nWkFZcvxux' , minedtxreceipt ) // , STRINGER(minedtxreceipt,null,0) )
      let {status} =minedtxreceipt
      let status_code_toupdate
      if(status){ status_code_toupdate = 1  }
      else {      status_code_toupdate = 0  }
      cliredisa.hget('TX-TABLES' , txhash ).then(async resp=>{ 
        if(resp) {LOGGER( 'LdRvT1x8gH',resp ) }
        else { LOGGER('YFSoB0x0Nm@empty-table' , txhash  );return }
let str_txauxdata = resp
        let jparams = PARSER( str_txauxdata )
        let {type , tables, address , amount, itemid , strauxdata }=jparams // itemid 

        KEYS( tables ).forEach(async tablename=>{
          await updaterow( tablename , { txhash } , {status : status_code_toupdate })
        })
				if ( type=='PAY' ){
					handle_pay_case( { uuid , username : address , itemid , strauxdata , txhash })
				}
        else if(type=='STAKE'){
/**          que ry_with_arg({
            contractaddress : ADDRESSES.contract_stake
            , abikind : 'STAKE'
            , methodname : '_balances' // _maphashtotokenid'
            , aargs : [ address ]
          }).then(resp=>{ LOGGER('oEPexsBvPd' , resp) */
//            if(resp){} else {return}
//						let stakeamount = getethrep(resp)
						if ( true || +amount>= MIN_STAKE_AMOUNT ){
							updaterow('users', { address }, {stakeamount : amount // stakeamount
								, isstaked : status? 1:0
							} )
							updateorcreaterow( 'ballots' , {username:address , } ,  )
						}
						else {
						}
//          })
        }
				else if (type=='APPROVE' ){
					query_with_arg({
						contractaddress : ADDRESSES.contract_usdt
						, abikind : 'ERC20'
						, methodname: 'allowance'
						, aargs : [ address , ADDRESSES.contract_stake ]
						, nettype
					}).then(resp=>{LOGGER(resp)
						if ( resp){}
						else {return}
						let approvedamount= getethrep(resp)
						createorupdaterow('approvals' , {username : address } , {amount :approvedamount
							, erc20 : ADDRESSES.contract_usdt
							, target : ADDRESSES.contract_stake
						} )	
					})
				}
				else if ( type=='CLEAR_DELINQUENT' ){
					handle_clear_delinquent_case( { uuid , username:address , itemid , strauxdata , txhash })	
				}
      })
    }).catch(err=>{
      LOGGER('zjxPWfqwD3' , err , txhash , uuid )
  })
}
module.exports={
  enqueue_tx_toclose
}

