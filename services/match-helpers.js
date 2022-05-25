const {
  updaterow,
  findone,
  findall,
  deleterow,
  createrow,
  createorupdaterow,
  moverow,
  updateorcreaterow,
  incrementroworcreate,
  incrementrow,
	createifnoneexistent,
	getrandomrow_filter_multiple_rows
	, getrandomrow_filter
} = require("../utils/db");
const {
  ITEM_SALE_START_PRICE,
  PAYMENT_MEANS_DEF,
  PAYMENT_ADDRESS_DEF,
  PRICE_INCREASE_FACTOR_DEF,
} = require("../configs/receivables");
const { create_uuid_via_namespace } = require( '../utils/common' )
const getroundnumber_global = async (nettype) => {
  let round_number_global;
  let respballotround = await findone("settings", { key_: "BALLOT_PERIODIC_ROUNDNUMBER", subkey_: nettype });
  if (respballotround) {
    let { value_ } = respballotround;
    round_number_global = 1 + +value_;
  } else {
    round_number_global = 1;
  }
  return round_number_global;
}

/** const get_MAX_ROUND_TO_REACH_=async nettype=>{
	const MAX_ROUND_TO_REACH_DEF = 17
	
	let resp = await	findone ('settings', { nettype , key_: 'MAX_ROUND_TO_REACH_DEF' } ) 
	if ( resp ) {}
	else { return  
} */
const pick_kong_items_on_item_max_round_reached =async ( MAX_ROUND_REACH_RELATED_PARAMS 
	, nettype
)	=>{
	 return getrandomrow_filter_multiple_rows ( 'items' 
	 , { salestatus : 0
			, nettype
		} 
	 , MAX_ROUND_REACH_RELATED_PARAMS.COUNT_KONGS_TO_ASSIGN
	) 
}
const handle_perish_item_case =async ( itemid , nettype )=>{
	await updaterow ( 'items'
		, { itemid , nettype }
		, { salestatus : -3
				, salesstatusstr : 'PERISHED'	
		}
	)
	await moverow ( 'circulations' 
		, { id : respcirc.id }
		, 'logcirculations'
		, { txhash }
	)
	await incrementrow({
		table : 'users'
		, jfilter : { username , nettype }
		, fieldname : 'countmaxroundreached'
		, incvalue : +1
	} )
	return true 
} //
const handle_give_an_item_ownership_case = async ( username , nettype )=>{	
	let respitem  = await getrandomrow_filter ( 'items', { nettype 
		, group_: 'kingkong' 
		, salestatus : 0 
	} )
	if (respitem ){ }
	else {
		createrow ( 'alerts' , {
			typestr : 'KINGKONG_RESERVE_RAN_OUT'
			, message : 'KINGKONG_RESERVE_RAN_OUT'
			, functionname : 'handle_give_an_item_ownership_case'
		})
		return null }
	let { itemid } = respitem
	await updaterow ( 'items' , {
		itemid // 
		, nettype
		} ,
		{ salestatus : 1
		, 
		} )
	let uuid = create_uuid_via_namespace ( `${itemid}_${nettype}_${username}` )
	let roundnumber_global = await getroundnumber_global(nettype); // round_number_global
	await createrow ( 'itemhistory' , {
		itemid
		, username
		, uuid 
		, typestr : 'RECEIVE'
		, nettype
		, roundnumber : roundnumber_global
	} )
	await createrow ( 'logactions' , {
		username
		, typestr : 'RECEIVE'
		, uuid
		, price : 0
		, itemid
		, roundnumber : roundnumber_global
	} )
	await createrow ( 'itembalances' , {
		itemid
		, nettype
		, username
		, status : 1
		, buyprice: 0 // amount
		, status : 1
	//	, paymeans: currency
		// , paymeansaddress: currencyaddress, //	, amount
	} )
}
const handle_assign_item_case=async ( item , username , nettype )=>{
	let duetime = moment().add(12, "hours"); // .unix() // in it with placeholder
	let duetimeunix = duetime.unix(); // in it with placeholder
	LOGGER( "@handle_assign_item_case", duetime, duetimeunix); // , respduetime
//      let item = itemstogive[i];
		let { itemid, isdelinquent: itemisdelinquent } = item;
//      let { username } = listreceivers0[i];
		await updaterow(
			"items",
			{          itemid,
				nettype,
			},
			{          salestatus: MAP_SALE_STATUS [ "ASSIGNED" ],
				salesstatusstr: "assigned",
			}
		)      //		await updaterow ( 'items' , { itemid , nettype } , { isdelinquent : 0 } )
		let uuid = uuidv4(); //			let duetime=moment().endOf('day').subtract(1,'hour')
		let price01; // = decideprice ( itemid , nettype ) // ITEM_SALE_START_PRICE
		let respcirculation = await findone("circulations", { itemid, nettype });
		//		LOGGER( '@respcirculation ' , itemid , respcirculation )
		let price;
		let roundnumber;
		if (respcirculation) {        //
			let { price: price00, roundnumber } = respcirculation;
			let resppriceincrease = await findone("settings", { key_: "BALLOT_PRICE_INCREASE_FACTOR", nettype });
			if (resppriceincrease) {
				if (itemisdelinquent) {
					price01 = +price00;
				} else {
					price01 = +price00 * +resppriceincrease.value_;
				}
			} else {
				price01 = +price00 * +PRICE_INCREASE_FACTOR_DEF;
			}
			LOGGER("@respcirculation ", itemid, respcirculation, price00, price01);
			roundnumber = 1 + +roundnumber;
			await updaterow(
				"circulations",
				{            itemid, // : ''            //					, username // : ''
					nettype,
				},
				{            roundnumber, // : 1 + +roundnumber // : ''
					price: price01, // ITEM_SALE_START_PRICE
					priceunit: PAYMENT_MEANS_DEF,
					username, // : ''
				}
			);
		} else {        // freshly assigned
			roundnumber = 1;
			await createrow("circulations", {
				itemid, // : ''
				username, // : ''
				roundnumber, // : 1 // + +roundnumber // : ''
				price: ITEM_SALE_START_PRICE,
				priceunit: PAYMENT_MEANS_DEF,
				nettype,
				//					, priceunitcurrency : ''
			});
			price01 = ITEM_SALE_START_PRICE;
		}
		let SALES_ACCOUNT_NONE_TICKET = await get_sales_account("SALES_ACCOUNT_NONE_TICKET", nettype);
		await updaterow("items", { itemid, nettype }, { isdelinquent: 0 });
		let seller; // =  ? '' : ''
		if (+roundnumber > 1) {
			let respitembalance = await findone ( "itembalances" , { itemid, nettype });
			if (respitembalance && respitembalance.username) {
				seller = respitembalance.username;
			} else {
				seller = SALES_ACCOUNT_NONE_TICKET;
			}
		} else {
			seller = SALES_ACCOUNT_NONE_TICKET;
		}
		await createrow("receivables", {
			itemid,
			username,
			roundnumber: round_number_global,
			amount: price01, // ITEM_SALE_START_PRICE
			currency: PAYMENT_MEANS_DEF,
			currencyaddress: PAYMENT_ADDRESS_DEF,
			uuid,
			duetimeunix: duetimeunix ? duetimeunix : null, // : duetime.unix()
			duetime: duetime ? duetime.format(STR_TIME_FORMAT) : null,
			seller, // : roundnumber>0?  : SALES_ACCOUNT_NONE_TI CKET
			nettype,
		});
		await createrow("itemhistory", {
			itemid,
			username,
			roundnumber,
			price: ITEM_SALE_START_PRICE,
			priceunit: PAYMENT_MEANS_DEF,
			status: -1,
			uuid,
			typestr: "TENTATIVE_ASSIGN",
			nettype,
		});
}

module.exports={
	getroundnumber_global
	, pick_kong_items_on_item_max_round_reached
	, handle_perish_item_case
	, handle_assign_item_case
	, handle_give_an_item_ownership_case
}
