const { jweb3 } = require("../configs/configweb3");
const awaitTransactionMined = require("await-transaction-mined");
const cliredisa = require("async-redis").createClient();
const {
  LOGGER,
  STRINGER,
  KEYS,
  gettimestr,
  create_uuid_via_namespace,
} = require("../utils/common");
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
  KIP17_KINGKONG_CNTRADDRESS,
  //  MAX_RO UND_TO_REACH,
} = require("../configs/receivables");
const {
  get_MAX_ROUND_TO_REACH, // pick_kong_items_ on_item_max_round_reached
} = require("./match-helpers");
const ROUNDOFFSETTOAVAIL_DEF = -3;
const handle_kingkong_initial_payment_case = async (jargs) => {
  let {
    txhash,
    uuid,
    nettype,
    username,
    itemid,
    roundnumber,
    price,
    contractaddress,
  } = jargs; //
  await updaterow("itemhistory", { uuid }, { status: 1 });
  let respitembal = await findone("itembalances", { itemid, nettype });
  if (respitembal) {
    LOGGER(`@weirdo in kingkong giving`);
  } // this should not happen
  else {
    await createrow("itembalances", {
      username, //
      itemid, //
      status: 1,
      buyprice: price,
      paymeans: PAYMENT_MEANS_DEF,
      paymeansaddress: PAYMENT_ADDRESS_DEF,
      amount: 1,
      nettype, //
      group_: "kingkong",
      contractaddress,
      isonchain: 0,
      //			, locked
      //			, avail
    });
    await updaterow(
      "items",
      {
        itemid,
        nettype,
      },
      {
        salestatus: -1,
        salesstatusstr: "USER_OWNED",
      }
    );
  }
};
const handle_kingkong_staking = async (jargs) => {
  let { txhash, uuid, nettype, username, itemid, typestr, contractaddress } =
    jargs; //
  switch (typestr) {
    case "EMPLOY_KINGKONG":
      try {
        let tokenid = await query_with_arg({
          KIP17_KINGKONG_CNTRADDRESS,
          abikind: "KIP17",
          methodname: "_itemhash_tokenid",
          aargs: [itemid],
          nettype,
        });
        console.log("_______tokenid", tokenid);
        await updaterow("itembalances", { itemid, nettype }, { isstaked: 1 });
        await updaterow("items", { itemid, nettype }, { isstaked: 1, tokenid });
        // await createrow() // a row should be created in logstakes table
      } catch (err) {
        console.log(err);
      }
      break;
    case "UNEMPLOY_KINGKONG":
      await updaterow("itembalances", { itemid, nettype }, { isstaked: 0 });
      await updaterow("items", { itemid, nettype }, { isstaked: 0 });
    // await createrow() // a row should be created in logstakes table
  }
};
const enqueue_tx_toclose_02 = async (jargs) => {
  let { txhash, uuid, nettype, username, itemid, contractaddress, typestr } =
    jargs;
  let web3 = jweb3[nettype];
  awaitTransactionMined
    .awaitTx(web3, txhash, TX_POLL_OPTIONS)
    .then(async (minedtxreceipt) => {
      LOGGER("@minedtxreceipt", minedtxreceipt); // , STRINGER(minedtxreceipt,null,0) )
      let { status } = minedtxreceipt;
      let status_code_toupdate;
      if (status) {
        status_code_toupdate = 1;
      } else {
        status_code_toupdate = 0;
      }
      //      cliredisa.hget( "TX-TABLES" , txhash).then(async (resp) => {
      //        if (resp) {
      //        LOGGER("LdRvT1x8gH", resp);
      ///        } else {
      //       LOGGER("YFSoB0x0Nm@empty-table", txhash);
      //          return;
      //      }
      //        let str_txauxdata = resp;
      //        let jparams = PARSER(str_txauxdata);
      //        let { type, tables, address, amount, itemid, strauxdata, roundnumber } = jparams; // itemid
      switch (typestr) {
        case "KINGKONG_INITIAL_PAYMENT":
          let { txhash, uuid, nettype, username, itemid, roundnumber, price } =
            jargs;
          handle_kingkong_initial_payment_case({
            txhash,
            uuid,
            nettype,
            username, // : address,
            itemid, //           strauxdata,
            roundnumber,
            price,
          });
          break;
        case "EMPLOY_KINGKONG":
          handle_kingkong_staking({
            txhash,
            nettype,
            username,
            itemid,
            typestr,
            contractaddress,
          });
          break;
        case "UNEMPLOY_KINGKONG":
          handle_kingkong_staking({
            txhash,
            nettype,
            username,
            itemid,
            typestr,
            contractaddress,
          });
          break;
      }
      //      });
    })
    .catch((err) => {
      LOGGER("zjxPWfqwD3", err, txhash, uuid);
    });
};

module.exports = {
  enqueue_tx_toclose_02,
};
