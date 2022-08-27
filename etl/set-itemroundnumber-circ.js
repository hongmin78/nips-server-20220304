
let db = require('../models')
let { findall , updaterow } = require( '../utils/db') 

const LOGGER=console.log

const MAP_PRICE_ROUNDNUM ={
'100' :	1,
'112'	: 2,
'125' :	3,
'140' :	4,
'141' :	4,
'157' : 5,
'176' :	6,
'197' : 7,
'221' :	8,
'248' :	9,
'277' : 	10,
'311' :	11,
'348' :	12,
'390' :	13,
'436' :	14,
'489' :	15,
'547' :	16,
'613' : 17,
'687' :	18,
'769' :	19,
'861' : 20,
'965' :	21,
'1080' :	22
}

const main=async _=>{
	let listcirc = await findall ( 'circulations' , { } ) 	
	listcirc.forEach ( async elem => {
		let price = (+ elem.price).toFixed( 0 ) 
		if ( elem.itemroundnumber ){ return }
		else {}
		let itemroundnumber = MAP_PRICE_ROUNDNUM[ price ]
		if ( itemroundnumber  ) {}
		else { LOGGER( `@missing jdata` , elem ) ; return }
		await updaterow ( 'circulations' , { id : elem.id } , { itemroundnumber } )
	} )
}
main()

// db.sequelize.query(`desc users`).then(resp0=>{resp=resp0;console.log(resp[0].length )} )



