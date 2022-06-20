var express = require("express");
var router = express.Router();
let { nettype } = require("../configs/net"); //  "ETH_TESTNET";
//	let nettype = "ETH_TESTNET";
const { REFERERCODELEN, B_ASSIGN_DELINQUENT_ITEMS } = require("../configs/configs");
const {
  findone,
  createrow,
  countrows_scalar,
  updaterow,
  moverow,
  updateorcreaterow,
  incrementrow,
  findall,
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
  getRandomElementsFromArray,
} = require("../utils/common");
const { messages } = require("../configs/messages");
const { isethaddressvalid } = require("../utils/validates");
const { TOKENLEN } = require("../configs/configs");
const { getuseragent, getipaddress } = require("../utils/session");
const db = require("../models");
const cron = require("node-cron");
const {
  pick_kong_items_on_item_max_round_reached,
  handle_perish_item_case,
  handle_assign_item_case,
  handle_give_an_item_ownership_case,
  getroundnumber_global,
} = require("../services/match-helpers");
const moment = require("moment-timezone");
const B_CALL_OFFSET_KST_TO_UTC = false;
moment.tz.setDefault("Etc/UTC");
const STR_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
let rmqq = "tasks";
let rmqopen = require("amqplib").connect("amqp://localhost");
const nodeschedule = require("node-schedule");
const {
  ITEM_SALE_START_PRICE,
  PAYMENT_MEANS_DEF,
  PAYMENT_ADDRESS_DEF,
  PRICE_INCREASE_FACTOR_DEF,
} = require("../configs/receivables");

let { Op } = db.Sequelize;
let scheduleddrawjob; // = nodeschedule.scheduleJob
let jschedules = {};

const func_00_03_advance_round = async (nettype) => {
  //	return
  let list = await findall("items", { nettype }); // .then(async list=>{
  list.forEach(async (elem) => {
    let { roundoffsettoavail } = elem;
    roundoffsettoavail = +roundoffsettoavail;
    if (roundoffsettoavail < 0) {
      await updaterow("items", { id: elem.id, nettype }, { roundoffsettoavail: 1+ roundoffsettoavail  });
    } else {
    }
  });

  let list01 = await findall("ballots", { nettype });
  list01.forEach(async (elem) => {
    let { lastroundmadepaymentfor } = elem;
    lastroundmadepaymentfor = +lastroundmadepaymentfor;
    if (lastroundmadepaymentfor < 0) {
      await updaterow("ballots", { id: elem.id, nettype }, { lastroundmadepaymentfor: 1 + lastroundmadepaymentfor });
    }
  });

  //	})
};

const get_sales_account = async (role, nettype) => {
  let resp = await findone("addresses", { role, nettype });
  if (resp && resp) {
    let { address } = resp;
    return address;
  } else {
    return null;
  }
};

const func_00_01_draw_users = async (jdata) => {
  let { roundnumber, nettype } = jdata;

  //	let listballots_00 = await findall( 'ballots' , {	counthelditems : 0		} ) //
  // let count_users = await countrows_scalar("ballots", { active: 1, nettype });
  let count_users = await countrows_scalar("ballots", { active: 1, nettype });
  let count_users_plus_delinquent =  await countrows_scalar("items", {  group_: "kong", nettype, ismaxroundreached: 0, isdelinquent: 1});
  let all_users_with_delinquent = count_users + count_users_plus_delinquent
  if (count_users > 0) {
  } else {
    return [];
  }
  let allocatefactor_bp = J_ALLOCATE_FACTORS.DEF; // _BP_DEF
  let respallocatefactor = await findone("settings", {
    key_: "BALLOT_DRAW_FRACTION_BP",
    nettype,
  });

  if (respallocatefactor) {
    let { value_: allocatefactor_settings } = respallocatefactor;
    allocatefactor_settings = +allocatefactor_settings;

    if (allocatefactor_settings >= J_ALLOCATE_FACTORS.MIN && allocatefactor_settings <= J_ALLOCATE_FACTORS.MAX) {
      allocatefactor_bp = allocatefactor_settings;
    }
  } else {
  }

 let count_users_receivers = count_users_plus_delinquent > 0 ?  Math.round((count_users * allocatefactor_bp) / 10000)  : Math.round((count_users * allocatefactor_bp) / 10000);
  let roundnumber_01 = roundnumber - 3;

  let listballots_00_from_entire = await db["ballots"].findAll({
    raw: true,
    where: {
      active: 1,
      isdelinquent: 0,
      nettype,
      lastroundmadepaymentfor: { [Op.gte]: 0 },
    },
    ismaxroundreached: 0,
  });
  if (listballots_00_from_entire && listballots_00_from_entire.length) {
  } else {
    return [];
  }
  shufflearray(listballots_00_from_entire);
  shufflearray(listballots_00_from_entire);
 
  listballots_00_from_entire = listballots_00_from_entire.slice(0,
 count_users_receivers)
  let listballots_01_from_entire = listballots_00_from_entire.sort((a, b) => {
    //	let listballots_01_from_entire = listballots_00_from_entire.sort ( (a,b)=>{
    //		a.counthelditems - b.counthelditems >0 ? +1 : -1
    return a.counthelditems - b.counthelditems > 0 ? -1 : +1;
  });
  return listballots_01_from_entire;
  /** await db['ballots'].findAll({ raw:true
		,	order: [ [ 'counthelditems', 'DESC' ] ]
		, offset : 0
		, limit : count_users_receivers
		, where : { active : 1 , nettype }
	}) //	let countballots = countrows_scalar( 'ballots' , { isstaked:1 } )
	return listballots_01_from_entire // .slice ( 0 , count_users_receivers ) */
};

let FORCE_RUN_REGARDLESS_OF_SETTINGS = true;
const func00_allocate_items_to_users = async (nettype) => {
  /************* */ //	let listr eceivers0 =await fin dall( 'ballots' , {			counthelditems : 0		} )
  LOGGER(`executing func00_allocate_items_to_users ${nettype} `);
  let respfindactive = await findone("settings", {
    key_: "BALLOT_PERIODIC_ACTIVE",
    subkey_: nettype,
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
  } //	let listreceivers0 = await func_00_01_draw_users( nettype )  //shufflearray(listreceivers0)   //	shufflearray(listreceivers0)

  let NReceivers;
  let itemstogive;
  let NItemstogive;
  let NMin;
  let round_number_global;
  let respballotround = await findone("settings", {
    key_: "BALLOT_PERIODIC_ROUNDNUMBER",
    subkey_: nettype,
  });
  if (respballotround) {
    let { value_ } = respballotround;
    round_number_global = 1 + parseInt(value_);
  } else {
    round_number_global = 1;
  }
  let listreceivers0 = await func_00_01_draw_users({
    nettype,
    roundnumber: round_number_global,
  });

  shufflearray(listreceivers0);
  shufflearray(listreceivers0); // possibly once is not enough

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
    NReceivers = listreceivers0.length; // draw_items()

    //    itemstogive = await func_00_02_draw_items(NReceivers);
    itemstogive = await func_00_02_draw_items(NReceivers, nettype); //  func_00_02_draw_items_this_ver_takes_N_arg(NReceivers);
    NItemstogive = itemstogive.length;

    // less-than exceptions later
    NMin = Math.min(NReceivers, NItemstogive);

    if (NMin > 0) {
    } else {
      LOGGER();
    }
    /**** due time */
    //		let respduetime= await fin done( 'settings', { key_ : `BALLOT_${str_current_next}_ROUND_PAYMENT_DUE` } )// 'BALLOT_CURRENT_ROUND_PAYMENT_DUE'
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
    for (let i = 0; i < listreceivers0.length; i++) {
      let item = itemstogive[i];
      let { itemid, isdelinquent: itemisdelinquent, group_ } = item;
      let { username } = listreceivers0[i];
      await updaterow(
        "items",
        { itemid, nettype },
        { salestatus: MAP_SALE_STATUS["ASSIGNED"], salesstatusstr: "assigned" }
      );
      //		await updaterow ( 'items' , { itemid , nettype } , { isdelinquent : 0 } )
      let uuid = uuidv4(); //			let duetime=moment().endOf('day').subtract(1,'hour')
      let price01; // = decideprice ( itemid , nettype ) // ITEM_SALE_START_PRICE
      let respcirculation = await findone("circulations", { itemid, nettype });

      let price;
      let roundnumber;
      if (respcirculation) {
        //
        let { price: price00, roundnumber } = respcirculation;
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

        roundnumber = 1 + +roundnumber;
        await updaterow(
          "circulations",
          {
            itemid, // : ''
            //					, username // : ''
            nettype,
          },
          {
            roundnumber, // : 1 + +roundnumber // : ''
            price: price01, // ITEM_SALE_START_PRICE
            priceunit: PAYMENT_MEANS_DEF,
            username, // : ''
          }
        );
      } else {
        // freshly assigned
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
      LOGGER("SALES_ACCOUNT_NONE_TICKET", SALES_ACCOUNT_NONE_TICKET);
      await updaterow("items", { itemid, nettype }, { isdelinquent: 0 });
      let seller; // =  ? '' : ''

      if (price01 > 100) {
        let respitembalance = await findone("itembalances", {
          itemid,
          nettype,
        });
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
        seller,
        nettype,
        group_,
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
        nettype,
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
    //		await updaterow ( 'items' , { itemid , nettype } , { isdelinquent : 0 } )
  } else {
  }
  await updaterow(
    "settings",
    { key_: "BALLOT_PERIODIC_ROUND_STATE", nettype },
    {
      value_: 1,
    }
  );
};
// let MAX_ROUND_REACH_RELATED_PARAMS = {
//   MAX_ROUND_TO_REACH_DEF: 2,
//   COUNT_KONGS_TO_ASSIGN: 2,
// };
const func_00_04_handle_max_round_reached = async (nettype) => {
  let list_maxroundreached = await findall("maxroundreached", { nettype });
 if (list_maxroundreached && list_maxroundreached.length) {
  } else {
    LOGGER("@max round reached, no items past max");
    return;
  }

  list_maxroundreached.forEach(async (elemmatch, idx) => {
    let { itemid, username, nettype } = elemmatch;

    await handle_perish_item_case(itemid, nettype, username);
    console.log("1")
    let listkongs = await pick_kong_items_on_item_max_round_reached(nettype);
    console.log("tpye",listkongs)
  /*  listkongsArray.forEach(async (elemkong) => {
  
      let item = await findone("items", { itemid: elemkong.itemid, nettype });
      await handle_assign_item_case(item, username, nettype);
    console.log("1.5item",item)
    }); */
   let item = await findone("items", { itemid: listkongs.itemid, nettype });
      await handle_assign_item_case(item, username, nettype);
    console.log("1.5item",item)
    await handle_give_an_item_ownership_case(username, nettype); 
  
 });
 

  list_maxroundreached.forEach(async (elemmatch, idx) => {
    let { itemid, username, nettype } = elemmatch;
    await updaterow("users", { username, nettype }, { ismaxreached: 0 });
    await updaterow("items", { itemid, nettype }, { ismaxreached: 0 });
    await moverow("maxroundreached", { id: elemmatch.id }, "logmaxroundreached", {});
  });
};

const func01_inspect_payments = async (nettype) => {
  const timenow = moment().add(1, "seconds").unix(); // startOf('hour').unix()
  let listreceivables = await db.receivables.findAll({
    raw: true,
    where: { active: 1, nettype },
    //		, where : { duetimeunix : { [Op.lte] : timenow } }
  }); // findall ('receivables' , {} )
  LOGGER("timenow@inspect", timenow, nettype, listreceivables);

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
    await moverow("receivables", { id: elem.id }, "delinquencies", {
      amount: (+elem.amount * delinq_discount_factor) / 10000,
    }); //
    let { roundnumber, itemid, username, amount, nettype } = elem;

    let uuid = uuidv4();
    await updaterow("items", { itemid, nettype }, { isdelinquent: 1 });
    await updaterow("ballots", { username, nettype }, { active: 0, isdelinquent: 1 });
    await updaterow("users", { username, nettype }, { active: 0, isdelinquent: 1 });

    await incrementrow({
      table: "logrounds",
      jfilter: { roundnumber, nettype },
      fieldname: "countdelinquencies", // value_'
      incvalue: +1,
    });
    await incrementrow({
      table: "users",
      jfilter: { username },
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
      uuid, // :
      typestr: "DELINQUENT", // TENTATIVE_ASSIGN'
      nettype,
    });

    let roundnumber_global = await getroundnumber_global(nettype); // round_number_global
    await createrow("logactions", {
      username,
      typestr: "DELINQUENT",
      uuid, // : uuidv4()
      price: amount,
      itemid,
      roundnumber: roundnumber_global,
    });
    findall("itembalances", { username, nettype }).then(async (list) => {
      list.forEach(async (elem) => {
        await moverow("itembalances", { id: elem.id }, "logitembalances", {});
      });
    });
  });
};
const parse_q_msg = async (str) => {
  if (str && str.length) {
  } else {
    LOGGER(`falsey call`);
    return;
  }
  let jdata = PARSER(str); //
  if (jdata && jdata?.nettype == nettype) {
  } else {
    LOGGER("@cli called mainnet");
    return;
  }
  if (jdata && jdata.BALLOT_PERIODIC_DRAW_TIMEOFDAY_INSECONDS) {
    let { BALLOT_PERIODIC_DRAW_TIMEOFDAY_INSECONDS: timeofday } = jdata;
    jschedules["BALLOT_PERIODIC_DRAW_TIMEOFDAY_INSECONDS"]?.stop(); //?.cancel ()
    timeofday = +timeofday;
    let hourofday = moment.unix(timeofday).hour();
    if (B_CALL_OFFSET_KST_TO_UTC) {
      hourofday = normalize_hour_from_kst_to_utc(hourofday);
    }
    let minute = moment.unix(timeofday).minute();
    LOGGER("timeofday@draw,mq", hourofday, minute);
    jschedules["BALLOT_PERIODIC_DRAW_TIMEOFDAY_INSECONDS"] = cron.schedule(
      `0 ${minute} ${hourofday} * * *`,
      async (_) => {
        await func_00_03_advance_round(nettype); // call it here
        await func00_allocate_items_to_users(nettype);
        await func_00_04_handle_max_round_reached(nettype);
      }
    );
  } else if (jdata && jdata.BALLOT_PERIODIC_PAYMENTDUE_TIMEOFDAY_INSECONDS) {
    let { BALLOT_PERIODIC_PAYMENTDUE_TIMEOFDAY_INSECONDS: timeofday } = jdata;
    jschedules["BALLOT_PERIODIC_PAYMENTDUE_TIMEOFDAY_INSECONDS"]?.stop();
    timeofday = +timeofday;
    let hourofday = moment.unix(timeofday).hour();
    if (B_CALL_OFFSET_KST_TO_UTC) {
      hourofday = normalize_hour_from_kst_to_utc(hourofday);
    }
    let minute = moment.unix(timeofday).minute();
    LOGGER("timeofday@inspect,mq", hourofday, minute);
    jschedules["BALLOT_PERIODIC_PAYMENTDUE_TIMEOFDAY_INSECONDS"] = cron.schedule(
      `0 ${minute} ${hourofday} * * *`,
      (_) => {
        func01_inspect_payments(nettype);
      }
    );
  }
};
/**  const getroundnumber_global = async (nettype) => {
  let round_number_global;
  let respballotround = await findone("settings", { key_: "BALLOT_PERIODIC_ROUNDNUMBER", subkey_: nettype });
  if (respballotround) {
    let { value_ } = respballotround;
    round_number_global = 1 + +value_;
  } else {
    round_number_global = 1;
  }
  return round_number_global;
}; */
/****** */
let roundnumber;
const normalize_hour_from_kst_to_utc = (hour) => {
  hour -= 9;
  if (hour >= 0) {
    return hour;
  } else {
    return hour + 24;
  }
};
const init = async (_) => {
  //	let nettype = 'BS C_MAINNET'
  //	fi ndone( 'settings' , { key_: 'BALLOT_DRAW_TIME_OF_DAY' } ).then(resp=>{
  findone("settings", {
    key_: "BALLOT_PERIODIC_DRAW_TIMEOFDAY_INSECONDS",
    nettype,
  }).then(async (resp) => {
    // subkey_ :
    if (resp) {
      let { value_: timeofday } = resp;
      timeofday = +timeofday;
      let hourofday0 = moment.unix(timeofday).hour(); // +timeofday / 3600   ;
      let hourofday = hourofday0;
      if (B_CALL_OFFSET_KST_TO_UTC) {
        hourofday = normalize_hour_from_kst_to_utc(hourofday0);
      }
      let minute = moment.unix(timeofday).minute();
      LOGGER("timeofday@draw", timeofday, hourofday0, hourofday, minute, resp); //			let timenow = moment()	//		let timenowunix = timenow.unix()		//	let timetodrawat= timenow.startOf('day').add(+value_ , 'hours') //			if ( timenowunix > timetodrawat ){} // already past //			else {			}
      jschedules["BALLOT_PERIODIC_DRAW_TIMEOFDAY_INSECONDS"] = cron.schedule(
        `0 ${minute} ${hourofday} * * *`,
        async (_) => {
          await func_00_03_advance_round(nettype); // call it here
          await func00_allocate_items_to_users(nettype);
          await func_00_04_handle_max_round_reached(nettype);
        }
      );
    } else {
    }
  });
  //	fin done ( 'settings' , { key_ : 'BALLOT_PAYMENT_DUE_TIME_OF_DAY' }).then(resp=>{
  findone("settings", {
    key_: "BALLOT_PERIODIC_PAYMENTDUE_TIMEOFDAY_INSECONDS",
    subkey_: nettype,
  }).then((resp) => {
    if (resp) {
      let { value_: timeofday } = resp; // timeofdaypaymentdue = +timeofdaypaymentdue / 3600; LOGGER(timeofdaypaymentdue , resp )
      timeofday = +timeofday;
      let hourofday = moment.unix(timeofday).hour(); // +timeofday / 3600   ;
      if (B_CALL_OFFSET_KST_TO_UTC) {
        hourofday = normalize_hour_from_kst_to_utc(hourofday);
      }
      let minute = moment.unix(timeofday).minute();
      LOGGER("timeofday@paydue", timeofday, hourofday, minute, resp); //			let timenow = moment()	//		let timenowunix = timenow.unix()		//	let timetodrawat= timenow.startOf('day').add(+value_ , 'hours') //			if ( timenowunix > timetodrawat ){} // already past //			else {			}
      jschedules["BALLOT_PERIODIC_PAYMENTDUE_TIMEOFDAY_INSECONDS"] = cron.schedule(
        `0 ${minute} ${hourofday} * * *`,
        (_) => {
          func01_inspect_payments(nettype);
        }
      );
    } else {
    }
  });
  /********* current */
  /********* next */
}; // init
true && init();
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
const J_ALLOCATE_FACTORS = {
  DEF: 1500,
  MAX: 5000,
  MIN: 0,
};

const func_00_02_draw_items_this_ver_gives_both_delinquents_and_from_itembalances = async (N, nettype) => {
  if (N > 0) {
  } else {
    return [];
  }
  let list_00 = await db["items"].findAll({
    raw: true,
    where: { group_: "kong", nettype, ismaxroundreached: 0, isdelinquent: 1 },
  });

  let countdelinquent = list_00.length - 1;
  let list = [];
  if (list_00.length > 0) {
    let list_01 = await db["items"].findAll({
      raw: true,
      where: {
        group_: "kong",
        nettype,
        roundoffsettoavail: { [Op.gte]: 0 },
        ismaxroundreached: 0,
        isdelinquent: 0,
      },
      limit: N,
    });
    list = [...list_00, ...list_01];
  } else {
    let list_03 = await db["items"].findAll({
      raw: true,
      where: {
        group_: "kong",
        nettype,
        roundoffsettoavail: { [Op.gte]: 0 },
        ismaxroundreached: 0,
        isdelinquent: 0,
      },
      limit: N,
    });
    list = [...list_03];
  }
  shufflearray(list);
  shufflearray(list);
  return list;
};
const func_00_02_draw_items_this_ver_takes_N_arg = async (N, nettype) => {
  // what if more users than items available , then we should hand out all we could , and the rest users left unassigned
  if (N > 0) {
  } else {
    round_number_global = 1;
  }
  let listreceivers0 = await func_00_01_draw_users({
    nettype,
    roundnumber: round_number_global,
  });

  if (list.length >= N) {
  } else {
    createrow("alerts", {
      typestr: "KINGKONG_RESERVE_RAN_OUT",
      message: "KINGKONG_RESERVE_RAN_OUT",
      functionname: "func_00_02_draw_items_this_ver_takes_N_arg",
    });
  }
  shufflearray(list);
  shufflearray(list);
  return list;
};
// const func_00_02_draw_items = func_00_02_draw_items_this_ver_gives_both_delinquents_and_from_itembalances
const func_00_02_draw_items = B_ASSIGN_DELINQUENT_ITEMS
  ? func_00_02_draw_items_this_ver_gives_both_delinquents_and_from_itembalances
  : func_00_02_draw_items_this_ver_takes_N_arg;

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

const randomly_pick_from_array_while_ensuring_each_included_atleast_once = (arr0, targetsize) => {
  return [...getRandomElementsFromArray(arr0, targetsize)];
};
const match_with_obj = async (listreceivers0, itemstogive) => {
  let aproms = [];
  listreceivers0.forEach((elem) => {
    let { username } = elem;
    aproms[aproms.length] = findone("circulations", { username, nettype });
  });
  const n_max_tries = 20;
  const max_score_achievable = listreceivers0.length;
  let max_score_achieved = -1000000;
  let aresolves = await Promise.all(aproms);
  let listreceivers_at_maxscore = [];
  const N_items = itemstogive.length;

  listreceivers0_exp =
    listreceivers0.length < N_items
      ? randomly_pick_from_array_while_ensuring_each_included_atleast_once(listreceivers0, N_items)
      : listreceivers0;
  listreceivers0 = listreceivers0_exp;
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

module.exports = {
  func_00_01_draw_users,
  func_00_02_draw_items,
  func_00_03_advance_round,
  func00_allocate_items_to_users,
  func01_inspect_payments,
  func_00_04_handle_max_round_reached,
};
// const cron = require('node-cron')
false &&
  cron.schedule("* */9 * * *", () => {
    LOGGER("");
    console.log(moment().format("HH:mm:ss, YYYY-MM-DD"), "@nips");
    //	let nettype='BSC _MAINNET'
    func00_allocate_items_to_users(nettype);
  });
false &&
  cron.schedule("* */21 * * *", (_) => {
    LOGGER("@moving unpaids to deliquents");
    //	let nettype='BSC _MAINNET'
    func01_inspect_payments(nettype);
  });
rmqopen
  .then(function (conn) {
    false && LOGGER("", conn);
    return conn.createChannel();
  })
  .then(function (ch) {
    return ch.assertQueue(rmqq).then(function (ok) {
      return ch.consume(rmqq, function (msg) {
        if (msg !== null) {
          let strmsg = msg.content.toString();
          parse_q_msg(strmsg);
          console.log("@msg rcvd", strmsg);
          ch.ack(msg);
        }
      });
    });
  })
  .catch(console.warn);

/** cron.schedule('0 0 0 * * *',async ()=>{  	LOGGER('' , moment().format('HH:mm:ss, YYYY-MM-DD') , '@nips' )
	setTimeout(async _=>{
//		let resplastcloseunix = await find one('settings', { key_ : 'BALLOT_LAST_CLOSE_UNIX'} )
		let resplaststartunix = await fin done('settings', { key_ : 'BALLOT_LAST_CLOSE_UNIX'} )
		let timediff = moment().unix() - +resplaststartunix
		let respdurationunix = await find one('settings', { key_: 'BALLOT_LAST_START_UNIX' } )

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
			let respitembalance = await fin done('itembalances' , {username} )
			if (respitembalance){}
			else {LOGGER('ERR() inconsistent data'); continue }
			let {itemid} = respitembalance
			let {username}=listreceivers[ i ]
			let { buyprice : price0 }=respitembalance
			let price1 = +price0 * ( 1 + PRICE_HIKE_PERCENT/100) ;
			price1 = price1.toFixed(0)
			let duetime=moment().endOf('day').subtract(1,'hour')
			await crea terow( 'receivables' , {itemid , username , roundnumber 
				, amount : price1 
				, currency :PAYMENT_MEANS_DEF
				, currencyaddress : PAYMENT_ADDRESS_DEF 
				, duetimeunix : duetime.unix()
				, duetime : duetime.format(STR_TIME_FORMAT)
			}) 
			await creat erow( 'item history' , {
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
/*   '0xdd993 8393815bce3695956cac73c3123aa1f6b1d',
      'QmdjurLkauqEBSTm77uhbFsVTqMoLUDW2AFm6Bb8STMzzU',
      100,
      'USDT',
      '0x34da0 872bb4b215345f6e47ed6514d8c4cd5f8e0',
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
