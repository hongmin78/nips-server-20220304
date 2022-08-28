
const axios  = require('axios')

const LOGGER=console.log
const STRINGER=JSON.stringify
// const nettype='ETH_TESTNET'
const nettype='BSC_MAINNET'

// const PORTNUM = 32929
const { PORTNUM } = require( '../configs/configs' ) // 32929

var stdin = process.stdin;

const keypress = async () => {
  process.stdin.setRawMode(true)
  return new Promise(resolve => process.stdin.once('data', () => {
    process.stdin.setRawMode(false)
    resolve()
  }))
}
function delay(n){
    return new Promise(function(resolve){
        setTimeout(resolve,n*1000);
    });
}

stdin.setRawMode( true ); // resume stdin in the parent process (node app won't quit all by itself // unless an error or process.exit() happens) stdin.resume(); // i don't want binary, do you?
stdin.setEncoding( 'utf8' ); // on any data into stdin
stdin.on( 'data', function( key ){   // ctrl-c ( end of text )
  if ( key === '\u0003' ) {
    process.exit();
  }  // write the key to stdout all normal like
  process.stdout.write( key );
});
let MAX_ROUND_TO_REACH_DEF=2
const main = async _=>{
	let Nrounds = 30 
	let resp = await axios.post ( `http://localhost:${PORTNUM}/ballot/init/rounds?nettype=${nettype}&MAX_ROUND_TO_REACH_DEF=${MAX_ROUND_TO_REACH_DEF}` ) 
	LOGGER( `@init: ${ STRINGER( resp.data,null,0) }` )
		LOGGER( `>>>>>>>>>>>>>> init`  )
		await keypress()
	for ( let idx = 0; idx< Nrounds ; idx ++ ){
		LOGGER( '@idx' , idx )
		let respadvance0 = await axios.post ( `http://localhost:${PORTNUM}/ballot/advance/roundstate?nettype=${nettype}` ) ; LOGGER( '@respadvance0' ,  respadvance0.data )

		await delay(1.5)
		let resp_rcv = await axios.get ( `http://localhost:${PORTNUM}/queries/rows/receivables/active/1/0/10/id/DESC?nettype=${nettype}` )
//		if ( resp_rcv && resp_rcv.data && resp_rcv.data.list && resp_rcv.data.list.length ) {}
		LOGGER( '@resp_rcv.data' , resp_rcv.data ) 
		if (  resp_rcv?.data?.list?.length ) {}
	  else { 		}
		let { list } = resp_rcv?.data //		list.forEach ( async elem => { LOGGER( '@reecivable' , elem )
		for ( let idxrcv = 0; idxrcv < list.length ; idxrcv ++ ) {
			elem = list[ idxrcv ]
			let { uuid } = elem
			let resppay = await axios.post ( `http://localhost:${PORTNUM}/ballot/manual/payitem/${uuid}?nettype=${nettype}` )
			await delay( 1 )
			LOGGER ( '@pay' , resppay.data )
//		} )
		}
		await delay( 1.5 )
		let respadvance1 = await axios.post ( `http://localhost:${PORTNUM}/ballot/advance/roundstate?nettype=${nettype}` ); LOGGER( '@respadvance1' , respadvance1.data )
		let respdelinq =await		axios.get ( `http://localhost:${PORTNUM}/queries/rows/delinquencies/active/1/0/10/id/DESC` )
		LOGGER( `@delinq` , respdelinq.data.list ) 
		LOGGER( `>>>>>>>>>>>>>> EOR` , idx )
		await keypress()
	}
}
main()

