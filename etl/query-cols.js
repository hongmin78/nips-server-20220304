
let db = require('../models')
const LOGGER=console.log

const main=async _=>{
	let resptables =await	db.sequelize.query(`show tables`) // .then(resp0=>{resp=resp0;console.log(resp[0].length )} )

	let list = resptables[0].map(elem=>elem['Tables_in_nipsbirth'] ).sort ( (a,b)=>a.localeCompare ( b))
//	let list = resptables[0].map(elem=>elem['Tables_in_nipsethtestnet02'] ).sort ( (a,b)=>a.localeCompare ( b))
//	let list = resptables[0].map(elem=>elem['Tables_in_nipsethtestnet02'] ).sort ( (a,b)=>a > b? +1:-1)
//	resptables[0].forEach ( async ( elem  , idx ) =>{
//		let { Tables_in_nipsethtestnet02 : tablename} = elem
//		let { Tables_in_nipsethtestnet02 : tablename} = elem
	list.forEach ( async ( elem  , idx ) =>{
		false && LOGGER( elem )
		let tablename = elem
 		let respcolcount = await db.sequelize.query(`desc ${tablename} `) // .then(resp0=>{resp=resp0;console.log(resp[0].length )} )
		LOGGER( idx , tablename , respcolcount[0].length ) 
	})
}
main()

// db.sequelize.query(`desc users`).then(resp0=>{resp=resp0;console.log(resp[0].length )} )



