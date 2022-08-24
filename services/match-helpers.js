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
  getrandomrow_filter,
  getrandomrow_filter_multiple_rows
} = require("../utils/db");
const {
  ITEM_SALE_START_PRICE,
  PAYMENT_MEANS_DEF,
  PAYMENT_ADDRESS_DEF,
  PRICE_INCREASE_FACTOR_DEF,
} = require("../configs/receivables");
const { create_uuid_via_namespace, uuidv4 
	, generaterandomhex
} = require("../utils/common");
const moment = require("moment");
const LOGGER = console.log;
const STR_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
const MAP_SALE_STATUS = {
  ON_RESERVE: 0,
  ASSIGNED: 1,
  USER_OWNED: -1,
};
const getroundnumber_global = async (nettype) => {
  let round_number_global;
  let respballotround = await findone("settings", {
    key_: "BALLOT_PERIODIC_ROUNDNUMBER",
    subkey_: nettype,
  });
  if (respballotround) {
    let { value_ } = respballotround;
    round_number_global = 1 + +value_;
  } else {
    round_number_global = 1;
  }
  return round_number_global;
};
const get_MAX_ROUND_TO_REACH = async (nettype) => {
  const MAX_ROUND_TO_REACH_DEF = 17;
  let resp = await findone("settings", {
    nettype,
    key_: "MAX_ROUND_TO_REACH_DEF",
  });
  if (resp && resp.value_) {
    return resp.value_;
  } else {
    return MAX_ROUND_TO_REACH_DEF;
  }
};
const pick_kong_items_on_item_max_round_reached = async (
  // MAX_RO UND_REACH_RELATED_PARAMS 	,
  nettype
) => {
  let respcounttoassign = await findone("settings", {
    key_: "COUNT_KONGS_TO_ASSIGN_ON_MAX_ROUND",
    nettype,
  });
  if (respcounttoassign && respcounttoassign.value_) {
    counttoassign = respcounttoassign.value_;
  } else {
  }
  return getrandomrow_filter_multiple_rows(
    "items",
    { salestatus: 0, group_: 'kong' , nettype },
    counttoassign // MAX_RO UND_REACH_RELATED_PARAMS. COUNT_KONGS_TO_ASSIGN
  );
};
const handle_perish_item_case = async (itemid, nettype, username) => {
  await updaterow(
    "items",
    { itemid, nettype },
    { salestatus: -3, salesstatusstr: "PERISHED" }
  );
let txhash = 'dev___' + generaterandomhex(64);
    await moverow ( 'circulations' 
  , { itemid , nettype }
  , 'logcirculations'
  , { txhash } /* dont use for maually */
)
  await incrementrow({
    table: "users",
    jfilter: { username, nettype },
    fieldname: "countmaxroundreached",
    incvalue: +1,
  });
  return true;
}; //
const get_price_of_kingkong_upon_birth=async nettype=>{ const PRICE_OF_KINGKONG_UPON_BIRTH_DEF = '372'
	let { value_ } = await findone ( 'settings' , { key_ : 'PRICE_OF_KINGKONG_UPON_BIRTH' ,  nettype } )
	if ( value_) {}
	else { return PRICE_OF_KINGKONG_UPON_BIRTH_DEF }	
	return value_
}
const handle_give_an_item_ownership_case_this_ver_charges_for_payment = async ( username , nettype ) =>{
	let duetime = moment().add(12,'hours' )
  let duetimeunix = duetime.unix(); //
	let group_ = 'kingkong' 
	let respitem = await getrandomrow_filter ( 'items' , {
		nettype
		, group_ // : 'ki ngkong'
		, salestatus : 0
	} )
	if ( respitem ) {}
	else{ LOGGER(`@give kingkong, return on empty reserve`) ;  return null }
	let { itemid } = respitem
	await updaterow ( 'items' , { itemid , nettype } , { salestatus : 1 } )
	let uuid = create_uuid_via_namespace ( `${itemid}_${nettype}_${username}` )
	let roundnumber_global = await getroundnumber_global ( nettype )
	let roundnumberglobal = roundnumber_global
	await createrow ( 'itemhistory' , {
		itemid
		, username
		, uuid
		, typestr : 'RECEIVE'
		, nettype
		, roundnumber : roundnumber_global
//		, itemroundnumber : 
		, roundnumberglobal
	} )
//	let price = await get_price_of_kong_upon_birth ( nettype )
	let price = await get_price_of_kingkong_upon_birth ( nettype )
	await createrow ( 'logactions' , {
		username
		, typestr : 'RECEIVE'
		, uuid
		, price
		, itemid
		, roundnumber : roundnumber_global
	})
	let SALES_ACCOUNT_NONE_TICKET = await get_sales_account ( 'SALES_ACCOUNT_NONE_TICKET' , nettype )
	await createrow ( 'receivables', {
		itemid
		, username
		, roundnumber : roundnumber_global
//		, itemroundnumber
		, roundnumberglobal
		, amount : price
		, currency :PAYMENT_MEANS_DEF 			
		, currencyaddress : PAYMENT_ADDRESS_DEF
		, uuid
		, duetimeunix : duetimeunix ? duetimeunix : null
		, duetime : duetime? duetime.format( STR_TIME_FORMAT ) : null
		, seller : SALES_ACCOUNT_NONE_TICKET
		, nettype
		, group_	
	})
	// pick item
	// receivables 
	// itemhistory
	// logactions
	// XX itembalances
}
const handle_give_an_item_ownership_case_this_ver_gives_for_free = async (username, nettype) => {
  let respitem = await getrandomrow_filter("items", {
    nettype,
    group_: "kingkong",
    salestatus: 0,
  });
  if (respitem) {
  } else {
    createrow("alerts", {
      typestr: "KINGKONG_RESERVE_RAN_OUT",
      message: "KINGKONG_RESERVE_RAN_OUT",
      functionname: "handle_give_an_item_ownership_case",
    });
    return null;
  }
  let { itemid } = respitem;
  await updaterow(
    "items",
    {
      itemid, //
      nettype,
    },
    { salestatus: 1 }
  );
  let uuid = create_uuid_via_namespace(`${itemid}_${nettype}_${username}`);
  let roundnumber_global = await getroundnumber_global(nettype); // round_number_global
  await createrow("itemhistory", {
    itemid,
    username,
    uuid,
    typestr: "RECEIVE",
    nettype,
    roundnumber: roundnumber_global,
  });
  await createrow("logactions", {
    username,
    typestr: "RECEIVE",
    uuid,
    price: 0,
    itemid,
    roundnumber: roundnumber_global,
  });
  await createrow("itembalances", {
    itemid,
    nettype,
    username,
    status: 1,
    buyprice: 0, // amount
    status: 1,
    //	, paymeans: currency
    // , paymeansaddress: currencyaddress, //	, amount
  });
};
const handle_give_an_item_ownership_case = handle_give_an_item_ownership_case_this_ver_charges_for_payment

const get_sales_account = async (role, nettype) => {
  let resp = await findone("addresses", { role, nettype });
  if (resp && resp) {
    let { address } = resp;
    return address;
  } else {
    return null;
  }
};
const get_price_of_kong_upon_birth=async nettype=>{ const PRICE_OF_KONG_UPON_BIRTH_DEF = '157.35'
	let { value_ } =await findone ( 'settings' , { key_ : 'PRICE_OF_KONG_UPON_BIRTH' , nettype } )
	if ( value_ ) {}
	else { return PRICE_OF_KONG_UPON_BIRTH_DEF }
	return value_
}
const get_roundnumber_of_kong_on_birth=async nettype=>{ const ROUNDNUMBER_OF_KONG_ON_BIRTH_DEF = 3 
	let { value_} = await findone ( 'settings' , { key_ : 'ROUNDNUMBER_OF_KONG_ON_BIRTH' , nettype } )
	if ( value_ ) {}
	else { return ROUNDNUMBER_OF_KONG_ON_BIRTH_DEF } 
	return value_
}
const handle_assign_item_case_birth_kong = async ( item , username , nettype ) =>{
	let duetime = moment().add(12,'hours' )
  let duetimeunix = duetime.unix(); // 
	LOGGER(`@handle kong birth`)
	let { itemid , isdelinquent : itemisdelinquent , group_ } = item
	await updaterow ( 
		'items' ,
		{ itemid , nettype } ,
		{ salestatus : MAP_SALE_STATUS ['ASSIGNED'] , salesstatusstr : 'assigned' } 
	)
	let uuid = uuidv4()
	let price = await get_price_of_kong_upon_birth ( nettype )
	let roundnumber = await get_roundnumber_of_kong_on_birth ( nettype )
	let itemroundnumber = roundnumber
	let roundnumberglobal = await getroundnumber_global( nettype )
	await createrow ( 'circulations' , {
		itemid
		, username
		, roundnumber
		, itemroundnumber 
		, roundnumberglobal
		, price
		, priceunit : PAYMENT_MEANS_DEF
		, nettype 
	} )
	let SALES_ACCOUNT_NONE_TICKET = await get_sales_account ( 'SALES_ACCOUNT_NONE_TICKET' , nettype )
	await updaterow ( 'items' , { itemid , nettype } , { isdelinquent : 0 } )
	let roundnumber_global = await getroundnumber_global ( nettype )
	let seller = SALES_ACCOUNT_NONE_TICKET 
	await createrow ( 'receivables' , { 
		itemid
		, username
		, roundnumber : roundnumber_global
		, itemroundnumber // : ''
		, roundnumberglobal // : ''
		, amount : price
		, currency : PAYMENT_MEANS_DEF
		, currencyaddress : PAYMENT_ADDRESS_DEF
		, uuid
		, duetimeunix : duetimeunix ? duetimeunix : null 
		, duetime : duetime? duetime.format( STR_TIME_FORMAT ) : null
		, seller
		, nettype
		, group_ 
	})
	await createrow ( 'itemhistory' , {
		itemid 
		, username
		, roundnumber
		, itemroundnumber // : ''
		, roundnumberglobal // : ''
		, price
		, priceunit : PAYMENT_MEANS_DEF
		, status : -1
		, uuid
		, typestr : 'TENTATIVE_ASSIGN'
		, nettype 
	})
	// set item state 
	// round number
	// cr eate row => circulations
	// seller 
	// receivables
	// itemhistory
}
const handle_assign_item_case = async (item, username, nettype) => {
  let duetime = moment().add(12, "hours"); // .unix() // in it with placeholder
  let duetimeunix = duetime.unix(); // in it with placeholder
  LOGGER("@handle_assign_item_case", duetime, duetimeunix, item); // , respduetime  //      let item = itemstogive[i];
  let { itemid, isdelinquent: itemisdelinquent, group_ } = item;  //      let { username } = listreceivers0[i];
    await updaterow(
      "items",
      { itemid, nettype },
      { salestatus: MAP_SALE_STATUS["ASSIGNED"], salesstatusstr: "assigned" }
    ); //		await updaterow ( 'items' , { itemid , nettype } , { isdelinquent : 0 } )
    let uuid = uuidv4(); //			let duetime=moment().endOf('day').subtract(1,'hour')
    let price01; // = decideprice ( itemid , nettype ) // ITEM_SALE_START_PRICE
    let respcirculation = await findone("circulations", { itemid, nettype });    //		LOGGER( '@respcirculation ' , itemid , respcirculation )
    let price;
    let roundnumber;
    let roundnumber_global = await getroundnumber_global(nettype); // round_number_global
		let itemroundnumber
		let roundnumberglobal = roundnumber_global
    if (respcirculation) { //
      let { price: price00, roundnumber , roundnumberglobal } = respcirculation;
			itemroundnumber = respcirculation.itemroundnumber
      let resppriceincrease = await findone("settings", {
        key_: "BALLOT_PRICE_INCREASE_FACTOR",
        nettype,
      });
      if (resppriceincrease) {
        if (itemisdelinquent) {
          price01 = +price00;
        } else {
          price01 = +price00 * +resppriceincrease.value_;
        }
      } else {
        price01 = +price00 * +PRICE_INCREASE_FACTOR_DEF;
      }
      LOGGER( "@respcirculation ", itemid, respcirculation, price00, price01);
      roundnumber = 1 + +roundnumber;
      await updaterow(
        "circulations",
        {          itemid, // : ''            //					, username // : ''
          nettype,
        },
        { roundnumber // : 1 + +roundnumber // : ''
					, itemroundnumber : +itemroundnumber + 1 // ''
					, roundnumberglobal , // : ''
          price: price01, // ITEM_SALE_START_PRICE
          priceunit: PAYMENT_MEANS_DEF,
          username, // : ''
        }
      );
    } else {      // freshly assigned
      roundnumber = 1;
			itemroundnumber = 1 
      await createrow( "circulations", {
        itemid, // : ''
        username, // : ''
        roundnumber, // : 1 // + +roundnumber // : ''
				itemroundnumber , //: 1 ,
				roundnumberglobal , // : getroundnumber_global() ,
        price: ITEM_SALE_START_PRICE,
        priceunit: PAYMENT_MEANS_DEF,
        nettype,
        //					, priceunitcurrency : ''
      });
      price01 = ITEM_SALE_START_PRICE;
    }
    let SALES_ACCOUNT_NONE_TICKET = await get_sales_account("SALES_ACCOUNT_NONE_TICKET", nettype);
    await updaterow("items", { itemid, nettype }, { isdelinquent: 0 });
//    let roundnumber_global = await getroundnumber_global(nettype); // round_number_global
    let seller; // =  ? '' : ''
//    if (+roundnumber > 1) {
    if (+ itemroundnumber > 1) {
      let respitembalance = await findone("itembalances", { itemid, nettype });
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
      roundnumber: roundnumber_global,
			itemroundnumber ,
			roundnumberglobal ,
      amount: price01, // ITEM_SALE_START_PRICE
      currency: PAYMENT_MEANS_DEF,
      currencyaddress: PAYMENT_ADDRESS_DEF,
      uuid,
      duetimeunix: duetimeunix ? duetimeunix : null, // : duetime.unix()
      duetime: duetime ? duetime.format(STR_TIME_FORMAT) : null,
      seller, // : roundnumber>0?  : SALES_ACCOUNT_NONE_TI CKET
      nettype,
      group_,
    });
    await createrow("itemhistory", {
      itemid,
      username,
      roundnumber,
			itemroundnumber ,
			roundnumberglobal ,
      price: ITEM_SALE_START_PRICE,
      priceunit: PAYMENT_MEANS_DEF,
      status: -1,
      uuid,
      typestr: "TENTATIVE_ASSIGN",
      nettype,
    });
};

module.exports = {
  getroundnumber_global,
  pick_kong_items_on_item_max_round_reached,
  handle_perish_item_case,
	handle_assign_item_case_birth_kong , 
  handle_assign_item_case,
  handle_give_an_item_ownership_case,
  get_MAX_ROUND_TO_REACH,
};
