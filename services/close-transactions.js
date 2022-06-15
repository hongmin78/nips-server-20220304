const { jweb3 } = require("../configs/configweb3");
const awaitTransactionMined = require("await-transaction-mined");
const cliredisa = require("async-redis").createClient();
const { LOGGER, STRINGER, KEYS, gettimestr, create_uuid_via_namespace } = require("../utils/common");
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
} = require("../utils/db");
const { query_with_arg } = require("../utils/contract-calls");
const { ADDRESSES } = require("../configs/addresses");
/** const {updaterow : updaterow_mon , createrow : createrow_mon
  , findone : findone_mon
}=require('../utils/dbmon') */
const { NETTYPE } = require("../configs/net");
const { getweirep, getethrep } = require("../utils/eth");
const PARSER = JSON.parse;
const TXREQSTATUS_POLL_INTERVAL = 3000;
const TXREQSTATUS_BLOCKCOUNT = 1; // 2 // 4 // 6
let TX_POLL_OPTIONS = {
  interval: TXREQSTATUS_POLL_INTERVAL,
  blocksToWait: TXREQSTATUS_BLOCKCOUNT,
};
const moment = require("moment");
const { MIN_STAKE_AMOUNT } = require("../configs/stakes");
const {
  ITEM_SALE_START_PRICE,
  PAYMENT_ADDRESS_DEF,
  PAYMENT_MEANS_DEF,
  //  MAX_RO UND_TO_REACH,
} = require("../configs/receivables");
const {
  get_MAX_ROUND_TO_REACH, // pick_kong_items_ on_item_max_round_reached
} = require("./match-helpers");
/** let MAX_R OUND_REACH_RELATED_PARAMS = { 
	MAX_ROU ND_TO_REACH_DEF : 17 
//	, COUNT_KONGS_TO_ASSIGN : 2
} */
const ROUNDOFFSETTOAVAIL_DEF = -3;
const close_sale = async (jdata) => {
  let { itemid, contractaddress, tokenid, orderuuid, username, nettype, txhash } = jdata;
  let resporder = await findone("orders", { uuid: orderuuid });
  let seller;
  if (resporder && resporder.seller) {
    seller = resporder.seller;
  } else {
  }
  await moverow("orders", { uuid: orderuuid }, "logorders", { isfulfilled: 1 });
  await createifnoneexistent(
    "itemhistory",
    { txhash },
    {
      itemid,
      //		, datahash
      tokenid,
      //		, url
      seller,
      buyer: username,
      price: resporder?.price,
      txhash,
      //		, txhash
      txtype: 1,
      uuid: orderuuid,
      isonchain: 1,
      //		, chaintype : nett
      typestr: "BUY",
      //		, type
      bidder: username,
      strikeprice: resporder?.price,
      from_: seller,
      to_: username,
      nettype,
      status: 1,
      //		, normprice
    }
  );
  await updateorcreaterow(
    "itembalances",
    {
      itemid,
      nettype,
    },
    {
      username,
    }
  );
  await updaterow(
    "items",
    {
      itemid,
      nettype,
    },
    {
      contractaddress,
    }
  );
};
const enqueue_tx_toclose = async (txhash, uuid, nettype) => {
  switch (nettype) {
    case "ETH_TESTNET":
    case "ETH-TESTNET": //			enqu eue_tx_eth (txhash , uuid , nettype ) //		break
    case "BSC_MAINNET":
    case "BSC-MAINNET":
      enqueue_tx_eth(txhash, uuid, nettype); //			enqu eue_tx_bsc (txhash , uuid , nettype )
      break;
  }
};
const get_pay_related_users = async (uuid, nettype) => {
  let seller, buyer, refereraddress, referercode;
  let respreceivable = await findone("receivables", { uuid, nettype });
  if (respreceivable) {
  } else {
    return { seller, buyer, refereraddress, referercode };
  }
  buyer = respreceivable.username;
  seller = respreceivable.seller;
  let respseller = await findone("users", { username: seller, nettype });
  if (respseller) {
    referercode = respseller.referer;
    let respreferer = await findone("users", { myreferercode: referercode });
    refereraddress = respreferer.username; //
  }
  return { seller, buyer, refereraddress, referercode };
};
const handle_pay_case = async (jdata) => {
  let { uuid, username, itemid, strauxdata, txhash, nettype, roundnumber } = jdata;
  let globalroundnumber = roundnumber;
  let { buyer, seller, referercode, refereraddress } = get_pay_related_users(uuid, nettype);
  //	await moverow( 'receivables', { itemid, nettype } , 'logsales', { txhash }) // uuid
  await updaterow("itemhistory", { uuid }, { status: 1 });
  let amount, currency, currencyaddress, feerate;
  let jauxdata;

  if (strauxdata) {
    jauxdata = PARSER(strauxdata);
    amount = jauxdata.amount;
    currency = jauxdata.currency;
    currencyaddress = jauxdata.currencyaddress;
    feerate = jauxdata.feerate;
  }
  let respitembalance = await findone("itembalances", {
    itemid,
    nettype,
  });

  if (respitembalance) {
    await incrementrow({
      table: "ballots",
      jfilter: { username: respitembalance.username, nettype },
      fieldname: "counthelditems",
      incvalue: -1,
    });
   /*  await moverow("itembalances", { id: respitembalance.id }, "logitembalances", {}); */
  } else {
  }

  await updateorcreaterow(
    "itembalances",
    {
      itemid,
      nettype,
    },
    {
      username,
      status: 1,
      buyprice: amount,
      paymeans: currency,
      paymeansaddress: currencyaddress, //	, amount
      //		, nettype
    }
  );

  await incrementroworcreate({
    table: "ballots",
    jfilter: { username, nettype },
    fieldname: "counthelditems",
    incvalue: +1,
  });
  // await incrementroworcreate({
  //   table: "ballots",
  //   jfilter: { username, nettype },
  //   fieldname: "lastroundmadepaymentfor",
  //   incvalue: +1,
  // });
  LOGGER("lastroundmadepaymentfor", roundnumber);
  await updaterow("ballots", { username, nettype }, { lastroundmadepaymentfor: -3 });
  let respcirc = await findone("circulations", { itemid, nettype });

  if (respcirc) {
    let { price, roundnumber, countchangehands } = respcirc;
    let MAX_ROUND_TO_REACH = await get_MAX_ROUND_TO_REACH(nettype);
    LOGGER("MAX_ROUND_TO_REACH", roundnumber, MAX_ROUND_TO_REACH);
    if (+roundnumber < MAX_ROUND_TO_REACH) {
      // max not reached yet
      await updaterow(
        "items",
        { itemid, nettype },
        {
          salestatus: 1,
          salesstatusstr: "ASSIGNED",
          roundoffsettoavail: ROUNDOFFSETTOAVAIL_DEF,
        }
      ).then((resp) => {
        incrementrow({
          table: "items", // orcreate
          jfilter: { itemid, nettype },
          fieldname: "roundnumber",
          incvalue: +1,
        });
      });
      await updaterow(
        "circulations",
        { id: respcirc.id },
        {
          //				price : price 				,
          roundnumber: 1 + +roundnumber,
          countchangehands: 1 + +countchangehands,
        }
      );

      await updaterow(
        "users",
        { username, nettype },
        {
          lastroundmadepaymentfor: roundnumber,
          lasttimemadepaymentat: moment().unix(),
        }
      );
    } //
    else {
      // max reached
      await createrow("maxroundreached", {
        username, // : ''
        itemid, // : ''
        nettype, // : ''
        uuid: create_uuid_via_namespace(`${username}_${itemid}_${nettype}`),
        itemroundnumber: roundnumber,
        amountpaid: "",
        txhash, // : ''
        globalroundnumber, // : ''
      });

      await updaterow("users", { username, nettype }, { ismaxreached: 1 });
      await updaterow("items", { itemid, nettype }, { ismaxreached: 1 });
    }
    await updaterow(
      "circulations",
      { id: respcirc.id },
      {
        //				price : price 				,
        roundnumber: 1 + +roundnumber,
        countchangehands: 1 + +countchangehands,
      }
    );
    await updaterow(
      "users",
      { username, nettype },
      {
        lastroundmadepaymentfor: roundnumber,
        lasttimemadepaymentat: moment().unix(),
      }
    );
  } else {
    // no circ defined, should not have happened, give a fallback
    await createrow("circulations", {
      itemid, // : ''
      username, // : ''
      roundnumber: 1, // : 1 // + +roundnumber // : ''
      price: ITEM_SALE_START_PRICE,
      priceunit: PAYMENT_MEANS_DEF,
      priceunitcurrency: PAYMENT_ADDRESS_DEF,
      nettype,
    });
  }
  if (jauxdata.referfeeamount) {
    // let { buyer,seller,referer} = get_pay_related_users ( uuid , nettype )
    let { referfeeamount } = jauxdata;
    await updateorcreaterow(
      "logfeepayments",
      {
        txhash,
        nettype,
      },
      {
        // username			,
        amount: referfeeamount,
        amountfloat: referfeeamount,
        paymeansname: currency,
        paymeansaddress: currencyaddress,
        feerate: feerate,
        nettype,
        buyer, // : username
        seller, // :''
        referer: refereraddress, // :''
        referercode,
        refereraddress,
      }
    );
  }
  await moverow("receivables", { itemid, nettype }, "logsales", { txhash }); // uuid
};
/* logfeepayments
	username        | varchar(80)      | YES  |     | NULL                |                               |
| txhash          | varchar(80)      | YES  |     | NULL                |                               |
| amount          | varchar(40)      | YES  |     | NULL                |                               |
| amountfloat     | double           | YES  |     | NULL                |                               |
| paymeansname    | varchar(40)      | YES  |     | NULL                |                               |
| paymeansaddress | varchar(80)      | YES  |     | NULL                |                               |
| buyer           | varchar(80)      | YES  |     | NULL                |                               |
| seller          */
/** cir culations
  itemid            | varchar(80)         | YES  |     | NULL                |                               |
| username          | varchar(80)         | YES  |     | NULL                |                               |
| roundnumber       | int(11)             | YES  |     | NULL                |                               |
| price             | varchar(40)         | YES  |     | NULL                |                               |
| priceunit         | varchar(80)         | YES  |     | NULL                |                               |
| priceunitcurrency | varchar(80)         | YES  |     | NULL                |                               |
| countchangehands
*/
/** 
 `salestatus		` tinyint(4) DEFAULT 0,
 `salesstatusstr`
logactions
	username     | varchar(80)      | YES  |     | NULL                |                               |
| actiontype   | tinyint(4)       | YES  |     | NULL                |                               |
| actionname   | varchar(20)      | YES  |     | NULL                |                               |
| seller       | varchar(80)      | YES  |     | NULL                |                               |
| buyer        | varchar(80)      | YES  |     | NULL                |                               |
| amount       | varchar(20)      | YES  |     | NULL                |                               |
| note         | varchar(200)     | YES  |     | NULL                |                               |
| itemid       | varchar(80)      | YES  |     | NULL                |                               |
| priceunit    | varchar(20)      | YES  |     | NULL                |                               |
| typestr      | varchar(20)      | YES  |     | NULL                |                               |
| supertypestr | varchar(20)      | YES  |     | NULL                |                               |
| txhash       | varchar(100)     | YES  |     | NULL                |                               |
| price        | varchar(20)      | YES  |     | NULL                |                               |
| from_        | varchar(80)      | YES  |     | NULL                |                               |
| to_          | varchar(80)      | YES  |     | NULL                |                               |
| uuid         | varchar(100)     | YES  |     | NULL                |                               |
| nettype      | varchar(20)      | YES  |     | NULL                |                               |
| status       | tinyint(4)       | YES 
*/
const handle_clear_delinquent_case = async (jdata) => {
  let { uuid, username, itemid, strauxdata, txhash, nettype } = jdata; //	await moverow ('delinquencies', { itemid } , 'logdelinquents', {} )
  findall("delinquencies", { username }).then(async (list) => {
    list.forEach(async (elem) => {
      await moverow("delinquencies", { id: elem.id }, "logdelinquents", {
        txhash,
      });
      await updaterow("ballots", { username }, { active: 1, isdelinquent: 0 });
      await updaterow("users", { username }, { active: 1, isdelinquen: 0 });
      //			await updaterow ( 'items' , { itemid,  nettype } , {isdelinquent : 0 } ) // not yet
      /*			await incrementrow ( {
					table : 'logrounds'
				, jfilter : {  }
				, fieldname : 'countdelinquenciesresolved'
				, incvalue : +1
			}) */
    });
  });
};
const enqueue_tx_eth = async (txhash, uuid, nettype) => {
  let web3 = jweb3[nettype];
  awaitTransactionMined
    .awaitTx(web3, txhash, TX_POLL_OPTIONS)
    .then(async (minedtxreceipt) => {
      LOGGER("nWkFZcvxux", minedtxreceipt); // , STRINGER(minedtxreceipt,null,0) )
      let { status } = minedtxreceipt;
      let status_code_toupdate;
      if (status) {
        status_code_toupdate = 1;
      } else {
        status_code_toupdate = 0;
      }
      cliredisa.hget("TX-TABLES", txhash).then(async (resp) => {
        if (resp) {
          LOGGER("LdRvT1x8gH", resp);
        } else {
          LOGGER("YFSoB0x0Nm@empty-table", txhash);
          return;
        }
        let str_txauxdata = resp;
        let jparams = PARSER(str_txauxdata);
        let { type, tables, address, amount, itemid, strauxdata, roundnumber } = jparams; // itemid

        KEYS(tables).forEach(async (tablename) => {
          amount; //         await updaterow( tablename , { txhash } , {status : status_code_toupdate })
        });
        if (type == "PAY") {
          handle_pay_case({
            uuid,
            username: address,
            itemid,
            strauxdata,
            txhash,
            nettype,
            roundnumber,
          });
        } else if (type == "STAKE") {
          if (true || +amount >= MIN_STAKE_AMOUNT) {
            await updaterow(
              "users",
              { username: address },
              {
                stakeamount: amount, // stakeamount
                isstaked: status ? 1 : 0,
              }
            );
            await updateorcreaterow(
              "ballots",
              { username: address, nettype: nettype ? nettype : "BSC_MAINNET" }, // "ETH_TES TNET"
              { isstaked: 1 }
            );
            let { currency, currencyaddress } = PARSER(strauxdata); // ,nettype
            await createifnoneexistent(
              "logstakes",
              { txhash },
              {
                username: address,
                // , txhash
                type: 1,
                typestr: "STAKE",
                active: 1,
                status: 1,
                amount: amount, // ITEM_SALE_START_PRICE
                currency,
                currencyaddress,
                nettype,
                address,
              }
            );
          } else {
          }
          //        })
        } else if (type == "APPROVE") {
          query_with_arg({
            contractaddress: ADDRESSES.contract_usdt,
            abikind: "ERC20",
            methodname: "allowance",
            aargs: [address, ADDRESSES.contract_stake],
            nettype,
          }).then((resp) => {
            LOGGER(resp);
            if (resp) {
            } else {
              return;
            }
            let approvedamount = getethrep(resp);
            createorupdaterow(
              "approvals",
              { username: address },
              {
                amount: approvedamount,
                erc20: ADDRESSES.contract_usdt,
                target: ADDRESSES.contract_stake,
              }
            );
          });
        } else if (type == "CLEAR_DELINQUENT") {
          handle_clear_delinquent_case({
            uuid,
            username: address,
            itemid,
            strauxdata,
            txhash,
            nettype,
          });
        } else if (type == "BUY_NFT_ITEM") {
          close_sale({
            itemid,
            contractaddress,
            tokenid,
            orderuuid,
            username: address,
            nettype,
            txhash,
          });
        }
        updaterow("transactionstotrack", { txhash }, { active: 0 });
        //				deleterow( 'transactionstotrack' , {					txhash				} )
      });
    })
    .catch((err) => {
      LOGGER("zjxPWfqwD3", err, txhash, uuid);
    });
};
const init = async (_) => {
  let tablename = "transactionstotrack";
  let list = await findall(tablename, {
    active: 1,
  }); // .then(list=>{
  if (list && list.length) {
    list.forEach((elem) => {
      let { txhash, uuid, nettype } = elem;
      if (nettype) {
      } else {
        return;
      }
      enqueue_tx_toclose(txhash, uuid, nettype);
    });
  } else {
    return;
  }
  //	})
};
init();
module.exports = {
  enqueue_tx_toclose,
  handle_pay_case, // ( { uuid , username : address , itemid , strauxdata , txhash , nettype })
  handle_clear_delinquent_case,
};
/** const enqueue_tx_bsc=async (txhash , uuid, nettype )=>{
	setTimeout(_=>{
		cliredisa.hget('TX-TABLES', txhash).then(async resp=>{
			if (resp){LOGGER( resp )}
				let str_txauxdata = resp
        let jparams = PARSER( str_txauxdata )
        let {type , tables, address , amount , strauxdata }=jparams // itemid
			let status_code_toupdate =1; let status =true
        KEYS( tables ).forEach(async tablename=>{
          await updaterow( tablename , { txhash } , {status : status_code_toupdate })
        })
				if ( type=='STAKE' ){
					updaterow('users', {username : address} , {stakeamount : amount ,
						isstaked : status ? 1 : 0
					})
				}
		})
	}, 10*1000 )
}
*/
/**          que ry_with_arg({
            contractaddress : ADDRESSES.contract_stake
            , abikind : 'STAKE'
            , methodname : '_balances' // _maphashtotokenid'
            , aargs : [ address ]
          }).then(resp=>{ LOGGER('oEPexsBvPd' , resp) */
//            if(resp){} else {return}
//						let stakeamount = getethrep(resp)
/**  username     | varchar(80)         | YES  |     | NULL                |                               |
| txhash          | varchar(80)         | YES  |     | NULL                |                               |
| type            | tinyint(3) unsigned | YES  |     | NULL                |                               |
| typestr         | varchar(40)         | YES  |     | NULL                |                               |
| active          | tinyint(4)          | YES  |     | 1                   |                               |
| status          | tinyint(4)          | YES  |     | -1                  |                               |
| amount          | varchar(20)         | YES  |     | NULL                |                               |
| currency        | varchar(40)         | YES  |     | NULL                |                               |
| currencyaddress | varchar(80)         | YES  |     | NULL                |                               |
| nettype         | varchar(20)         | YES  |     | NULL                |                               |
| address         | varchar(80)  
username         | varchar(80)      | YES  |     | NULL                |                               |
| isstaked         | tinyint(4)       | YES  |     | NULL                |                               |
| counthelditems   | int(10) unsigned | YES  |     | 0                   |                               |
| lastassigneddate
*/
