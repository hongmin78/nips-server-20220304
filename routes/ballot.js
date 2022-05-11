const moment = require("moment");
var express = require("express");
var router = express.Router();
const {
  findone,
  findall,
  createrow,
  updaterow,
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
let nettype = "ETH-TESTNET";
let rmqq = "tasks";
let rmqopen = require("amqplib").connect("amqp://localhost");
const STRINGER = JSON.stringify;
const { mqpub } = require("../services/mqpub");

router.put("/update-or-create-rows/:tablename/:statusstr", async (req, res) => {
  let { tablename, keyname, valuename, statusstr } = req.params;
  let { nettype } = req.query;
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
