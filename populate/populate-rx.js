
const {generaterandomhex
  , getrandomint
	, uuidv4
} = require('../utils/common')
const N = 50
const LOGGER=console.log
const { createrow , findone
	, getrandomrow
	, getrandomrow_filter
 }=require('../utils/db')
const moment=require('moment')
const CURRENCY_DEF='USDT'
const CURRENCY_DEF_ADDRESS='0x34da0872bb4b215345f6e47ed6514d8c4cd5f8e0'
const roundnumber = 1
let duetime=moment().startOf('day').add(21,'hours')
let duetimeunix = duetime.unix()
const TIMEFORMATSTR='YYYY-MM-DDTHH:mm:ss' 
const main=async ()=>{
  for ( let i =0;i<N;i++){
    let address ='0x'+ generaterandomhex(40)
		let respitem =await getrandomrow_filter( 'items' , { 
			group_ : 'kong'
		} )
		let { itemid } =respitem 
		LOGGER( '', respitem ) 
    await createrow ('receivables', {
		 username : address
		, itemid
		, amount : 1
		, currency :  CURRENCY_DEF
		, currencyaddress : CURRENCY_DEF_ADDRESS
		, statusstr : 'ACTIVE' 
		, status : 1
		, roundnumber
		, uuid : uuidv4() 
		, duetimeunix
		, duetime : duetime.format(TIMEFORMATSTR)
		, active : 1 
    })
  }
}
main()

/** receivables
 username        | varchar(80)         | YES  |     | NULL                |                               |
| itemid          | varchar(60)         | YES  |     | NULL                |                               |
| amount          | varchar(20)         | YES  |     | NULL                |                               |
| currency        | varchar(20)         | YES  |     | NULL                |                               |
| currencyaddress | varchar(30)         | YES  |     | NULL                |                               |
| statusstr       | varchar(20)         | YES  |     | NULL                |                               |
| status          | tinyint(4)          | YES  |     | NULL                |                               |
| roundnumber     | int(11)             | YES  |     | NULL                |                               |
| uuid            | varchar(50)         | YES  |     | NULL                |                               |
| duetimeunix     | bigint(20) unsigned | YES  |     | NULL                |                               |
| duetime         | varchar(30)         | YES  |     | NULL                |                               |
| active          | tinyint(4)          | YES  |     | 1
*/
