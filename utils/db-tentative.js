
const db=require('../models') // const dbmon=require('../modelsmongo')
let { Op}=db.Sequelize
let nettype='ETH-TESTNET'
const MAP_ORDER_BY_VALUES={
  ASC:1
  , asc:1
  , DESC:1
  , desc:1
}
/** const MAP_TABLENAME_QUERY_ALLOWED={
	settings : 1
	, categories: 1
	, itembalances : 1
} */
const expand_fieldval_matches=( fieldname , arrfieldvalues ) =>{
	let arr_field_matches =	arrfieldvalues.map ( elem => { let jdata={} ; jdata[fieldname] = { [Op.like] : elem }; return jdata } )
	return { [ Op.or] : arr_field_matches }
}
module.exports= {
	expand_fieldval_matches
}
