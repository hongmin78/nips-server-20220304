const moment = require("moment");
var express = require("express");
var router = express.Router();
const {
  findone,
  findall,
  createrow,
  updaterow,
  deleterow,
  countrows_scalar,
  createorupdaterow,
  fieldexists,
  tableexists,
  updateorcreaterow,
} = require("../utils/db");
const { updaterow: updaterow_mon } = require("../utils/dbmon");
const KEYS = Object.keys;
const {
  LOGGER,
  generaterandomstr,
  generaterandomstr_charset,
  gettimestr,
  convaj,
  ISFINITE,
  separatebycommas,
  generaterandomhex,
} = require("../utils/common");
const { respok, respreqinvalid, resperr, resperrwithstatus } = require("../utils/rest");
const { messages } = require("../configs/messages");
const { getuseragent, getipaddress } = require("../utils/session"); // const {sendemail, sendemail_customcontents_withtimecheck}=require('../services/mailer')
const { validateemail } = require("../utils/validates");
const db = require("../models"); // const dbmon=require('../modelsmongo')
const { getusernamefromsession } = require("../utils/session"); // const { createrow:createrow_mon , updaterow : updaterow_mon }=require('../utils/dbmon')
const { queryitemdata, queryitemdata_user } = require("../utils/db-custom");
const { queryuserdata } = require("../utils/db-custom-user");
const TOKENLEN = 48;
let { Op } = db.Sequelize;
let { nettype } = require("../configs/net"); // = "ETH-TESTNET";
let rmqq = "tasks";
let rmqopen = require("amqplib").connect("amqp://localhost");
const STRINGER = JSON.stringify;
const { mqpub } = require("../services/mqpub");
const { handle_pay_case, handle_clear_delinquent_case } = require("../services/close-transactions");

router.post("/manual/paydelinquency/:uuid", (req, res) => {
  let { nettype } = req.query;
  if (nettype) {
  } else {
    resperr(res, messages.MSG_ARGMISSING);
    return;
  }
  let { uuid } = req.params;
  findone("delinquencies", { uuid, nettype }).then((resp) => {
    if (resp) {
    } else {
      resperr(res, messages.MSG_DATANOTFOUND);
      return;
    }
    let txhash = generaterandomhex(64);
    txhash = "dev___" + txhash;
    handle_clear_delinquent_case({
      uuid,
      username: resp.username,
      itemid: resp.itemid,
      txhash,
      nettype,
    });
    respok(res);
    // { uuid , username , itemid , strauxdata , txhash }
  });
});
router.post("/manual/payitem/:uuid", async (req, res) => {
  let { nettype } = req.query;
  if (nettype) {
  } else {
    resperr(res, messages.MSG_ARGMISSING);
    return;
  }
  let { uuid } = req.params;
  findone("receivables", { uuid, nettype }).then(async (resp) => {
    if (resp) {
    } else {
      resperr(res, messages.MSG_DATANOTFOUND);
      return;
    }
    let { username, itemid, nettype, roundnumber } = resp; // , strauxdata , txhash ,
    let strauxdata = STRINGER({
      amount: resp.amount,
      currency: resp.currency,
      currencyaddress: resp.currencyaddress,
    });
    let txhash = generaterandomhex(64);
    txhash = "dev___" + txhash;
    await handle_pay_case({
      uuid, //
      username, //
      itemid, //
      txhash,
      nettype,
      strauxdata,
      roundnumber, // : resp
    });
    respok(res);
  });
});
router.get("/roundstate", (req, res) => {
  let { nettype } = req.query;
  if (nettype) {
  } else {
    resperr(res, messages.MSG_ARGMISSING);
    return;
  }
  findone("settings", { key_: "BALLOT_PERIODIC_ROUND_STATE", nettype }).then((resp) => {
    respok(res, null, null, { respdata: resp });
  });
});
// const {
//   //		func_00_01_draw_users
//   //, func_00_02_draw_items	,
//   func_00_03_advance_round,
//   func00_allocate_items_to_users,
//   func01_inspect_payments,
//   func_00_04_handle_max_round_reached,
// } = require("../ballot/routine-daily-ETH_TE STNET");
const {
  //		func_00_01_draw_users
  //, func_00_02_draw_items	,
  func_00_03_advance_round,
  func00_allocate_items_to_users,
  func01_inspect_payments,
  func_00_04_handle_max_round_reached,
} = require("../ballot/routine-daily-common"); // ETH_TESTNET
/** items.salestatus
logrounds
settings
receivables
itemhistory
circulations
delinquencies
*/
router.post("/init/rounds", async (req, res) => {
  let { nettype } = req.query;
  if (nettype) {
  } else {
    resperr(res, messages.MSG_ARGMISSING);
    return;
  }
  await updaterow("items", { nettype }, { salestatus: 0, roundoffsettoavail: 0, isdelinquent: 0, roundnumber: 0 });
  await updaterow("settings", { key_: "BALLOT_PERIODIC_ROUNDNUMBER", nettype }, { value_: 0 });
  //	await deleterow ( 'logrounds' , { nettype } )
  await deleterow("receivables", { nettype });
  await deleterow("itemhistory", { nettype });
  await deleterow("circulations", { nettype });
  await deleterow("delinquencies", { nettype });
  await updaterow("settings", { key_: "BALLOT_PERIODIC_ROUND_STATE", nettype }, { value_: 0 });
  await updaterow("ballots", { nettype }, { counthelditems: 0, lastroundmadepaymentfor: -4, isdelinquent: 0 }); // update ballots set active=1 where nettype ='ETH_TESTNET';
  await deleterow("itembalances", { nettype });
  await updaterow("users", { nettype }, { lastroundmadepaymentfor: -4, isdelinquent: 0, countmaxroundreached: 0 });
  respok(res);
});
router.post("/advance/roundstate", async (req, res) => {
  let { nettype } = req.query;
  if (nettype) {
  } else {
    resperr(res, messages.MSG_ARGMISSING);
    return;
  }
  LOGGER("@nettype", `_${nettype}_`);
  findone("settings", { key_: "BALLOT_PERIODIC_ROUND_STATE", nettype }).then(async (resp) => {
    if (resp) {
    } else {
      resperr(res, messages.MSG_INTERNALERR);
      return;
    }
    let { value_: roundstate } = resp;
    roundstate = +roundstate;

    LOGGER("BALLOT_PERIODIC_ROUND_STATE", roundstate);
    switch (roundstate) {
      case 0:
        await func_00_03_advance_round(nettype);
        await func00_allocate_items_to_users(nettype);
        await func_00_04_handle_max_round_reached(nettype);
        break;
      case 1:
        await func01_inspect_payments(nettype);
        break;
      default:
        resperr(res, messages.MSG_INTERNALERR);
        return;
        break;
    }
    await updaterow("settings", { id: resp.id }, { value_: roundstate ^ 1 });
    respok(res);
  });
});
router.put("/update-or-create-rows/:tablename/:statusstr", async (req, res) => {
  let { tablename, keyname, valuename, statusstr } = req.params;
  let { nettype } = req.query;
  if (nettype) {
  } else {
    resperr(res, messages.MSG_ARGMISSING);
    return;
  }
  console.log("statusstr", req.body);
  let jpostdata = { ...req.body };
  let resp = await tableexists(tablename);
  if (statusstr == "START") {
    KEYS(jpostdata).forEach(async (elem) => {
      let valuetoupdateto = jpostdata[elem]; //		let jdata={}
      await updateorcreaterow(tablename, { key_: elem, subkey_: nettype }, { value_: valuetoupdateto });
    });
    mqpub(jpostdata);
  }

  if (statusstr == "PAUSE") {
    KEYS(jpostdata).forEach(async (elem) => {
      let valuetoupdateto = jpostdata[elem]; //		let jdata={}
      await updateorcreaterow(tablename, { key_: elem, subkey_: nettype }, { value_: valuetoupdateto });
    });
    mqpub(jpostdata);
  }
  if (statusstr == "PERIODIC_START") {
    KEYS(jpostdata).forEach(async (elem) => {
      let valuetoupdateto = jpostdata[elem]; //		let jdata={}
      await updateorcreaterow(tablename, { key_: elem, subkey_: nettype }, { value_: valuetoupdateto });
    });
    mqpub(jpostdata);
  }
  if (statusstr == "PERIODIC_PAUSE") {
    KEYS(jpostdata).forEach(async (elem) => {
      let valuetoupdateto = jpostdata[elem]; //		let jdata={}
      await updateorcreaterow(tablename, { key_: elem, subkey_: nettype }, { value_: valuetoupdateto });
    });
    mqpub(jpostdata);
  }
  if (statusstr == "BALLOT_PERIODIC_DRAW_ACTIVE") {
    KEYS(jpostdata).forEach(async (elem) => {
      let valuetoupdateto = jpostdata[elem]; //		let jdata={}
      await updateorcreaterow(tablename, { key_: elem, subkey_: nettype }, { value_: valuetoupdateto });
    });
    mqpub(jpostdata);
  }
  if (statusstr == "BALLOT_PERIODIC_PAYMENTDUE_ACTIVE") {
    KEYS(jpostdata).forEach(async (elem) => {
      let valuetoupdateto = jpostdata[elem]; //		let jdata={}
      await updateorcreaterow(tablename, { key_: elem, subkey_: nettype }, { value_: valuetoupdateto });
    });
    mqpub(jpostdata);
  }
  if (statusstr == "MAX_ROUND_TO_REACH_DEF") {
    KEYS(jpostdata).forEach(async (elem) => {
      let valuetoupdateto = jpostdata[elem]; //		let jdata={}
      await updateorcreaterow(tablename, { key_: elem, subkey_: nettype }, { value_: valuetoupdateto });
    });
    mqpub(jpostdata);
  }
  if (statusstr == "COUNT_KONGS_TO_ASSIGN_ON_MAX_ROUND") {
    KEYS(jpostdata).forEach(async (elem) => {
      let valuetoupdateto = jpostdata[elem]; //		let jdata={}
      await updateorcreaterow(tablename, { key_: elem, subkey_: nettype }, { value_: valuetoupdateto });
    });
    mqpub(jpostdata);
  }
  respok(res);
});

router.post("/mq", (req, res) => {
  let {} = req.body;
  let mstr = STRINGER(req.body);
  rmqopen
    .then(function (conn) {
      return conn.createChannel();
    })
    .then(function (ch) {
      return ch.assertQueue(rmqq).then(function (ok) {
        respok(res);
        return ch.sendToQueue(rmqq, Buffer.from(mstr));
      });
    })
    .catch((err) => {
      console.warn(err);
      resperr(res, "INTERNAL-ERR");
    });
});

module.exports = router;
