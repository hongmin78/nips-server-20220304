var express = require("express");
var router = express.Router();
let nettype = "BSC_MAINNET";
const { REFERERCODELEN } = require("../configs/configs");
const {
  findone,
  createrow,
  countrows_scalar,
  updaterow,
  moverow,
  updateorcreaterow,
  incrementrow,
} = require("../utils/db");
const { respok, resperr } = require("../utils/rest");
const { generateSlug } = require("random-word-slugs");
const {
  LOGGER,
  generaterandomstr,
  generaterandomstr_charset,
  gettimestr,
  shufflearray,
  uuidv4,
  PARSER,
  KEYS,
} = require("../utils/common");
const { messages } = require("../configs/messages");
const { isethaddressvalid } = require("../utils/validates");
const { TOKENLEN } = require("../configs/configs");
const { getuseragent, getipaddress } = require("../utils/session");
const db = require("../models");
const cron = require("node-cron");
const {
  SALES_ACCOUNT_TICKET,
  SALES_ACCOUNT_NONE_TICKET,
} = require("../configs/receivables");
const moment = require("moment-timezone");
moment.tz.setDefault("Etc/UTC");
const STR_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
let rmqq = "tasks";
let rmqopen = require("amqplib").connect("amqp://localhost");
const nodeschedule = require("node-schedule");
let scheduleddrawjob; // = nodeschedule.scheduleJob
let jschedules = {};
const func01_inspect_payments = async (nettype) => {
  // in here done payment cases are assumed to be not present
  //	const timenow=moment().startOf('hour').unix()
  const timenow = moment().add(1, "seconds").unix(); // startOf('hour').unix()
  let listreceivables = await db.receivables.findAll({
    raw: true,
    where: { active: 1, nettype },
    //		, where : { duetimeunix : { [Op.lte] : timenow } }
  }); // findall ('receivables' , {  } )
  LOGGER("timenow@inspect", timenow);
  if (listreceivables.length > 0) {
  } else {
    LOGGER(`outstanding balance :0 @`, gettimestr());
    return;
  }
  let respdelinquencydiscountfactor = await findone("settings", {
    key_: "BALLOT_DELINQUENCY_DISCOUNT_FACTOR_BP",
  });
  let { value_: delinq_discount_factor } = respdelinquencydiscountfactor;
  listreceivables.forEach(async (elem, idx) => {
    if (+elem.amount > 0) {
    } else {
      return;
    } // should not happen ,yet
    let seller;
    LOGGER("@move-to-delinquency", elem);
    await moverow("receivables", { id: elem.id }, "delinquencies", {
      amount: (+elem.amount * delinq_discount_factor) / 10000,
    }); //
    let { roundnumber, itemid, username, amount } = elem;
    await updaterow("ballots", { username }, { active: 0 });
    await incrementrow({
      table: "logrounds",
      jfilter: { roundnumber, nettype },
      fieldname: "countdelinquencies", // value_'
      incvalue: +1,
    });
    await incrementrow({
      table: "users",
      jfilter: { username, nettype },
      fieldname: "countdelinquencies",
      incvalue: +1,
    });
    await createrow("itemhistory", {
      itemid: itemid,
      username,
      roundnumber,
      price: amount, // ITEM_SALE_START_PRICE
      //			, priceunit : PAYMENT_MEANS_DEF
      amount,
      status: -1,
      uuid: uuidv4(),
      typestr: "DELINQUENT", // TENTATIVE_ASSIGN'
    });
  });
};
let { Op } = db.Sequelize;
let roundnumber;
const init = (_) => {
  //	let nettype = 'BS C_MAINNET'
  //	findone( 'settings' , { key_: 'BALLOT_DRAW_TIME_OF_DAY' } ).then(resp=>{
  LOGGER("time now", moment());
  findone("settings", {
    key_: "BALLOT_PERIODIC_DRAW_TIMEOFDAY_INSECONDS",
  }).then((resp) => {
    if (resp) {
      let { value_: timeofdaytodrawat } = resp;
      timeofdaytodrawat = +timeofdaytodrawat / 3600;
      LOGGER(timeofdaytodrawat, resp);
      //			let timenow = moment()
      //		let timenowunix = timenow.unix()
      //	let timetodrawat= timenow.startOf('day').add(+value_ , 'hours')
      //			if ( timenowunix > timetodrawat ){} // already past
      //			else {			}
      cron.schedule(`0 0 ${timeofdaytodrawat} * * *`, (_) => {
        func00_allocate_items_to_users(nettype);
      });
    } else {
    }
  });
  //	findone ( 'settings' , { key_ : 'BALLOT_PAYMENT_DUE_TIME_OF_DAY' }).then(resp=>{
  findone("settings", {
    key_: "BALLOT_PERIODIC_PAYMENTDUE_TIMEOFDAY_INSECONDS",
  }).then((resp) => {
    if (resp) {
      let { value_: timeofdaypaymentdue } = resp;
      timeofdaypaymentdue = +timeofdaypaymentdue / 3600;
      LOGGER(timeofdaypaymentdue, resp);
      cron.schedule(`0 0 ${timeofdaypaymentdue} * * *`, (_) => {
        func01_inspect_payments(nettype);
      });
    } else {
    }
  });
  /********* current */
  /********* next */
}; // init
init();
// new stakers
let listreceivers0;
let listreceivers1;
let listitemstoassign;
const draw_items = (N) => {
  return db["items"].findAll({
    raw: true,
    where: { salestatus: 0 },
    offset: 0,
    limit: N,
  });
};
const {
  ITEM_SALE_START_PRICE,
  PAYMENT_MEANS_DEF,
  PAYMENT_ADDRESS_DEF,
  PRICE_INCREASE_FACTOR_DEF,
} = require("../configs/receivables");
const J_ALLOCATE_FACTORS = {
  DEF: 1500,
  MAX: 5000,
  MIN: 0,
};
const func_00_01_draw_users = async (jdata) => {
  let { nettype, roundnumber } = jdata;
  //	let listballots_00 = await findall( 'ballots' , {	counthelditems : 0		} ) //
  let count_users = await countrows_scalar("users", { nettype });
  if (count_users > 0) {
  } else {
    return [];
  }
  let allocatefactor_bp = J_ALLOCATE_FACTORS.DEF; // _BP_DEF
  let respallocatefactor = await findone("settings", {
    key_: "BALLOT_DRAW_FRACTION_BP",
  });
  if (respallocatefactor) {
    let { value_: allocatefactor_settings } = respallocatefactor;
    allocatefactor_settings = +allocatefactor_settings;
    if (
      allocatefactor_settings >= J_ALLOCATE_FACTORS.MIN &&
      allocatefactor_settings <= J_ALLOCATE_FACTORS.MAX
    ) {
      allocatefactor_bp = allocatefactor_settings;
    }
  } else {
  }
  let count_users_receivers = Math.floor(
    (count_users * allocatefactor_bp) / 10000
  );
  LOGGER("@count_users_receivers ", count_users_receivers);
  let roundnumber_01 = roundnumber - 3;
  let listballots_00_from_entire = await db["ballots"].findAll({
    raw: true,
    offset: 0,
    limit: count_users_receivers,
    where: {
      active: 1,
      nettype,
      lastroundmadepaymentfor: { [Op.gte]: roundnumber_01 },
    },
  });
  if (listballots_00_from_entire && listballots_00_from_entire.length) {
  } else {
    return [];
  }
  let listballots_01_from_entire = listballots_00_from_entire.sort((a, b) => {
    //		a.counthelditems - b.counthelditems >0 ? +1 : -1
    return a.counthelditems - b.counthelditems > 0 ? -1 : +1;
  });
  return listballots_01_from_entire;
  /** await db['ballots'].findAll({ raw:true
		,	order: [ [ 'counthelditems', 'DESC' ] ]
		, offset : 0
		, limit : count_users_receivers
		, where : { active : 1 , nettype }
	}) //	let countballots = co untrows_scalar( 'ballots' , { isstaked:1 } )
	return listballots_01_from_entire // .slice ( 0 , count_users_receivers ) */
};
const func_00_02_draw_items = async (N) => {
  // what if more users than items available , then we should hand out all we could , and the rest users left unassigned
  if (N > 0) {
  } else {
    return [];
  }
  return await db["items"].findAll({
    raw: true,
    order: [["salestatus", "DESC"]],
    limit: N,
  });
};
const MAP_SALE_STATUS = {
  ON_RESERVE: 0,
  ASSIGNED: 1,
  USER_OWNED: -1,
};
/** itemid          | varchar(80)         | YES  |     | NULL                |                               |
| username          | varchar(80)         | YES  |     | NULL                |                               |
| roundnumber       | int(11)             | YES  |     | NULL                |                               |
| price             | varchar(40)         | YES  |     | NULL                |                               |
| priceunit         | varchar(80)         | YES  |     | NULL                |                               |
| priceunitcurrency | varchar(80)         | YES  |     | NULL                |                               |
| countchangehands  */
const MAP_BALLOT_STATUS = {
  START: true,
  1: true,
  0: false,
  PAUSE: false,
};
const match_with_obj = async (listreceivers0, itemstogive) => {
  let aproms = [];
  listreceivers0.forEach((elem) => {
    let { username } = elem;
    aproms[aproms.length] = findone("circulations", { username });
  });
  const n_max_tries = 10;
  const max_score_achievable = listreceivers0.length;
  let max_score_achieved = -1000000;
  let aresolves = await Promise.all(aproms);
  let listreceivers_at_maxscore = [];
  for (let idxtries = 0; idxtries < n_max_tries; idxtries++) {
    shufflearray(listreceivers0);
    let score = 0;
    for (let idxcirc = 0; idxcirc < max_score_achievable; idxcirc++) {
      if (aresolves[idxcirc]) {
        if (aresolves[idxcirc].itemid == itemstogive[idxcirc].itemid) {
        } else {
          ++score;
        }
      } else {
        // first time user is assigned a
        ++score;
      }
    }
    if (score == max_score_achievable) {
      listreceivers_at_maxscore = listreceivers0;
      break;
    } else {
      if (score > max_score_achieved) {
        max_score_achieved = score;
        listreceivers_at_maxscore = listreceivers0;
      }
    }
  }
  return listreceivers0;
};
let FORCE_RUN_REGARDLESS_OF_SETTINGS = false;
const func00_allocate_items_to_users = async (nettype) => {
  /************* */ //	let listr eceivers0 =await findall( 'ballots' , {			counthelditems : 0		} )
  let respfindactive = await findone("settings", {
    key_: "BALLOT_PERIODIC_ACTIVE",
  });
  if (FORCE_RUN_REGARDLESS_OF_SETTINGS) {
  } else if (respfindactive) {
    let { value_: ballotstatus } = respfindactive;
    if (MAP_BALLOT_STATUS[ballotstatus]) {
    } else {
      LOGGER(`ballot off at the moment`);
      return;
    }
  } else {
  }
  //	let listreceivers0 = await func_00_01_draw_users( nettype )
  //shufflearray(listreceivers0)
  //	shufflearray(listreceivers0) // possibly once is not enough
  //LOGGER( '@listreceivers0: ' , listreceivers0.length , listreceivers0 )
  let NReceivers;
  let itemstogive;
  let NItemstogive;
  let NMin;
  let round_number_global;
  let respballotround = await findone("settings", {
    key_: "BALLOT_PERIODIC_ROUNDNUMBER",
  });
  if (respballotround) {
    let { value_ } = respballotround;
    round_number_global = 1 + +value_;
  } else {
    round_number_global = 1;
  }

  let listreceivers0 = await func_00_01_draw_users({
    nettype,
    roundnumber: round_number_global,
  });
  shufflearray(listreceivers0);
  shufflearray(listreceivers0); // possibly once is not enough
  LOGGER("@listreceivers0: ", listreceivers0.length, listreceivers0);

  let timenow = moment();
  let timenowunix = timenow.unix();
  let timenowstr = timenow.format(STR_TIME_FORMAT);
  await updateorcreaterow(
    "logrounds",
    {
      drawtime: timenowstr,
      drawtimeunix: timenowunix,
      roundnumber: round_number_global,
      nettype,
    },
    { totalitemsassigned: 0 }
  );
  if (listreceivers0 && listreceivers0.length) {
    NReceivers = listreceivers0.length; // draw_items( )
    itemstogive = await func_00_02_draw_items(NReceivers);
    NItemstogive = itemstogive.length;
    // less-than exceptions later
    NMin = Math.min(NReceivers, NItemstogive);
    if (NMin > 0) {
    } else {
      LOGGER();
    }
    /**** due time */
    //		let respduetime= await findone( 'settings', { key_ : `BALLOT_${str_current_next}_ROUND_PAYMENT_DUE` } )// 'BALLOT_CURRENT_ROUND_PAYMENT_DUE'
    let duetime = moment().add(12, "hours"); // .unix() // in it with placeholder
    let duetimeunix = duetime.unix(); // in it with placeholder
    LOGGER("outer", duetime, duetimeunix); // , respduetime
    //		if ( respduetime ){
    //		duetime = moment.unix ( + respduetime.value_ )
    //	duetimeunix = duetime.unix( duetime )
    //			LOGGER( 'inner' , respduetime , duetime , duetimeunix )
    //	}
    //		else { ; }
    listreceivers0 = await match_with_obj(listreceivers0, itemstogive);
    for (let i = 0; i < NMin; i++) {
      let { itemid } = itemstogive[i];
      let { username } = listreceivers0[i];
      await updaterow(
        "items",
        { itemid },
        {
          salestatus: MAP_SALE_STATUS["ASSIGNED"],
          salesstatusstr: "assigned",
        }
      );
      let uuid = uuidv4(); //			let duetime=moment().endOf('day').subtract(1,'hour')
      let price01 = ITEM_SALE_START_PRICE;
      let respcirculation = await findone("circulations", { itemid });
      LOGGER("@respcirculation ", itemid, respcirculation);
      let price;
      let roundnumber;
      if (respcirculation) {
        //
        let { price: price00, roundnumber } = respcirculation;
        let resppriceincrease = await findone("settings", {
          key_: "BALLOT_PRICE_INCREASE_FACTOR",
        });
        if (resppriceincrease) {
          price01 = +price00 * +resppriceincrease.value_;
        } else {
          price01 = +price00 * +PRICE_INCREASE_FACTOR_DEF;
        }
        roundnumber = 1 + +roundnumber;
        updaterow("circulations", {
          itemid, // : ''
          username, // : ''
          roundnumber, // : 1 + +roundnumber // : ''
          price: price01, // ITEM_SALE_START_PRICE
          priceunit: PAYMENT_MEANS_DEF,
        });
      } else {
        //
        roundnumber = 1;
        await createrow("circulations", {
          itemid, // : ''
          username, // : ''
          roundnumber, // : 1 // + +roundnumber // : ''
          price: ITEM_SALE_START_PRICE,
          priceunit: PAYMENT_MEANS_DEF,
          //					, priceunitcurrency : ''
        });
        price01 = ITEM_SALE_START_PRICE;
      }
      let seller; // =  ? '' : ''
      if (+roundnumber > 1) {
        let respitembalance = await findone("itembalances", { itemid });
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
        roundnumber,
        amount: price01, // ITEM_SALE_START_PRICE
        currency: PAYMENT_MEANS_DEF,
        currencyaddress: PAYMENT_ADDRESS_DEF,
        uuid,
        duetimeunix: duetimeunix ? duetimeunix : null, // : duetime.unix()
        duetime: duetime ? duetime.format(STR_TIME_FORMAT) : null,
        seller, // : roundnumber>0?  : SALES_ACCOUNT_NONE_TICKET
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
      });
    }
    await incrementrow({
      table: "settings",
      jfilter: { key_: "BALLOT_PERIODIC_ROUNDNUMBER", subkey_: nettype },
      fieldname: "value_",
      incvalue: +1,
    });
    await updaterow(
      "logrounds",
      {
        roundnumber: round_number_global,
      },
      {
        countballotsactive: NReceivers,
        countitemsassigned: NMin, // itemstogive
        countusersassigned: NItemstogive,
        //			, countdelinquencies : ''
        //			, countdelinquenciesresolved : ''
        //			, starttime : ''
        //			, drawtime : ''
        //			, paymentduetime : ''
        //			, endtime : ''
        //			, starttimeunix : ''
        //		, drawtimeunix : ''
        paymentduetimeunix: timenow.add(12, "hours").startOf("hour").unix(), //''
        //			, endtimeunix : ''
        //			, totalitemsonreserve : ''
        totalitemsassigned: NMin, // ??''
        //		, totalitemsinpossession : ''
      }
    );
  } else {
  }
};
module.exports = {
  func_00_01_draw_users,
  func_00_02_draw_items,
  func00_allocate_items_to_users,
  func01_inspect_payments,
};
// const cron = require('node-cron')
false  &&
  cron.schedule("* */9 * * *", () => {
    LOGGER("");
    console.log(moment().format("HH:mm:ss, YYYY-MM-DD"), "@nips");
    //	let nettype='BSC _MAINNET'
    func00_allocate_items_to_users(nettype);
  });
false  &&
  cron.schedule("* */21 * * *", (_) => {
    LOGGER("@moving unpaids to deliquents");
    //	let nettype='BSC _MAINNET'
    func01_inspect_payments(nettype);
  });
/** cron.schedule('0 0 0 * * *',async ()=>{  	LOGGER('' , moment().format('HH:mm:ss, YYYY-MM-DD') , '@nips' )
	setTimeout(async _=>{
//		let resplastcloseunix = await findone('settings', { key_ : 'BALLOT_LAST_CLOSE_UNIX'} )
		let resplaststartunix = await findone('settings', { key_ : 'BALLOT_LAST_CLOSE_UNIX'} )
		let timediff = moment().unix() - +resplaststartunix
		let respdurationunix = await findone('settings', { key_: 'BALLOT_LAST_START_UNIX' } )

		if (timediff > respdurationunix){
			func00_all ocate_item_to_users ()				
		}
		else { }
	}, 3600 * 9 * 1000 ) // in
	setTimeout(_=>{
//		func01_ inspect_payments()
	} , 3600 * 21 * 1000 ) // towards pay due time
})

/**ballots;
| username         | varchar(80)      | YES  |     | NULL                |                               |
| isstaked         | tinyint(4)       | YES  |     | NULL                |                               |
| counthelditems   | int(10) unsigned | YES  |     | 0                   |                               |
| lastassigneddate | varchar(20)
*/
/**/
/*	let listreceivers1 = await findall('ballots', { counthelditems : { [	Op.gt	] : 0 } } )
	if ( listreceivers1 & listreceivers1.lnegth ){
		for ( let i =0;i< listreceivers1.length; i++){
			let respitembalance = await findone('itembalances' , {username} )
			if (respitembalance){}
			else {LOGGER('ERR() inconsistent data'); continue }
			let {itemid} = respitembalance
			let {username}=listreceivers[ i ]
			let { buyprice : price0 }=respitembalance
			let price1 = +price0 * ( 1 + PRICE_HIKE_PERCENT/100) ;
			price1 = price1.toFixed(0)
			let duetime=moment().endOf('day').subtract(1,'hour')
			await createrow( 'receivables' , {itemid , username , roundnumber 
				, amount : price1 
				, currency :PAYMENT_MEANS_DEF
				, currencyaddress : PAYMENT_ADDRESS_DEF 
				, duetimeunix : duetime.unix()
				, duetime : duetime.format(STR_TIME_FORMAT)
			}) 
			await createrow( 'itemhistory' , {
				itemid
				, username
				, roundnumber
				, price : price1
				, priceunit : PAYMENT_MEANS_DEF
				, status : -1
			})
		}
	}
*/
//	let listitemsheld = await findall ('itembalances' , { } )
/*  (`id`,`createdat`,`username`,`itemid`,`amount`,`currency`,`currencyaddress`,`roundnumber`,`uuid`,`duetimeunix`,`duetime`,`active`)
 */
/*   '0xdd9938393815bce3695956cac73c3123aa1f6b1d',
      'QmdjurLkauqEBSTm77uhbFsVTqMoLUDW2AFm6Bb8STMzzU',
      100,
      'USDT',
      '0x34da0872bb4b215345f6e47ed6514d8c4cd5f8e0',
      1,
      'ea90cfbc-41e1-40d4-9acc-3964ab4e01e9',
      'Invalid date',
      'Invalid date',
      1
*/
/** receivables
  username        | varchar(80)         | YES  |     | NULL                |                               |
| itemid          | varchar(60)         | YES  |     | NULL                |                               |
| amount          | varchar(20)         | YES  |     | NULL                |                               |
| currency        | varchar(20)         | YES  |     | NULL                |                               |
| currencyaddress | varchar(80)         | YES  |     | NULL                |                               |
| statusstr       | varchar(20)         | YES  |     | NULL                |                               |
| status          | tinyint(4)          | YES  |     | NULL                |                               |
| roundnumber     | int(11)             | YES  |     | NULL                |                               |
| uuid            | varchar(50)         | YES  |     | NULL                |                               |
| duetimeunix     | bigint(20) unsigned | YES  |     | NULL                |                               |
| duetime         | varchar(30)         | YES  |     | NULL                |                               |
| active   */
