
const axios  = require('axios')

const LOGGER=console.log
const STRINGER=JSON.stringify
const nettype='ETH_TESTNET'
const { PORTNUM } = require( '../configs/configs' )

const keypress = async () => {
  process.stdin.setRawMode(true)
  return new Promise(resolve => process.stdin.once('data', () => {
    process.stdin.setRawMode(false)
    resolve()
  }))
}

const main = async _=>{
	let Nrounds = 50 
	let resp = await axios.post ( `http://localhost:${PORTNUM}/ballot/init/rounds?nettype=${nettype}` ) 
	LOGGER( `@init: ${ STRINGER( resp.data,null,0) }` )
	for ( let idx = 0; idx< Nrounds ; idx ++ ){
		LOGGER( '@idx' , idx )
		let respadvance0 = await axios.post ( `http://localhost:${PORTNUM}/ballot/advance/roundstate?nettype=${nettype}` ) ; LOGGER( '@respadvance0' ,  respadvance0.data )
		let resp_rcv = await axios.get ( `http://localhost:${PORTNUM}/queries/rows/receivables/active/1/0/10/id/DESC?nettype=${nettype}` )
//		if ( resp_rcv && resp_rcv.data && resp_rcv.data.list && resp_rcv.data.list.length ) {}
		if (  resp_rcv?.data?.list?.length ) {}
	  else { 		}
		LOGGER( '@resp_rcv.data' , resp_rcv.data ) 
		let { list } = resp_rcv?.data //		list.forEach ( async elem => { LOGGER( '@reecivable' , elem )
		for ( let idxrcv = 0; idxrcv < list.length ; idxrcv ++ ) {
			elem = list[ idxrcv ]
			let { uuid } = elem
			let resppay = await axios.post ( `http://localhost:${PORTNUM}/ballot/manual/payitem/${uuid}?nettype=${nettype}` )
			LOGGER ( '@pay' , resppay.data )
//		} )
		}
		let respadvance1 = await axios.post ( `http://localhost:${PORTNUM}/ballot/advance/roundstate?nettype=${nettype}` ); LOGGER( '@respadvance1' , respadvance1.data )
		await keypress()
	}
}
main()

