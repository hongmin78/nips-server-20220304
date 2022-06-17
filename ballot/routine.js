var express = require("express");
var router = express.Router();
const { REFERERCODELEN } = require("../configs/configs");
const { findone, createrow } = require("../utils/db");
const { respok, resperr } = require("../utils/rest");
const { generateSlug } = require("random-word-slugs");
const {
  LOGGER,
  generaterandomstr,
  generaterandomstr_charset,
  gettimestr,
  shufflearray,
  uuidv4,
} = require("../utils/common");
const { messages } = require("../configs/messages");
const { isethaddressvalid } = require("../utils/validates");
const { TOKENLEN } = require("../configs/configs");
const { getuseragent, getipaddress } = require("../utils/session");
const db = require("../models");
const cron = require("node-cron"),
  moment = require("moment");
const STR_TIME_FORMAT = "YYYY-MM-DDTHH:mm:ss";
let { Op } = db.Sequelize;
let roundnumber;
const init = (_) => {
  findone("settings", { key_: "BALLOT_ROUND_NUMBER" }).then((resp) => {
    roundnumber = +resp._value;
  });
};
init();
// new stakers
let listreceivers0;
let listreceivers1;
let listitemstoassign;
const draw_items = (N) => {
  return db["items"].findAll({ raw: true, where: { salestatus: 0 }, offset: 0, limit: N });
};
const { ITEM_SALE_START_PRICE, PAYMENT_MEANS_DEF, PAYMENT_ADDRESS_DEF } = require("../configs/receivables");

const func00 = async (_) => {
  let listreceivers0 = await findall("ballots", { counthelditems: 0 });
  if (listreceivers0 && listreceivers0.length) {
    let N = listreceivers0.length; // draw_items( )
    let itemstogive = await draw_items(N);
    // less-than exceptions later
    for (let i = 0; i < listreceivers0.length; i++) {
      let { itemid } = itemstogive[i];
      let { username } = listreceivers[i];
      await updaterow("items", { itemid }, { salesstatus: 1 });
      let uuid = uuiidv4();
      let duetime = moment().endOf("day").subtract(1, "hour");
      await createrow("receivables", {
        itemid,
        username,
        roundnumber,
        amount: ITEM_SALE_START_PRICE,
        currency: PAYMENT_MEANS_DEF,
        currencyaddress: PAYMENT_ADDRESS_DEF,
        uuid,
        duetimeunix: duetime.unix(),
        duetime: duetime.format(STR_TIME_FORMAT),
      });
      await createrow("itemhistory", {
        itemid,
        username,
        roundnumber,
        price: ITEM_SALE_START_PRICE,
        priceunit: PAYMENT_MEANS_DEF,
        status: -1,
        uuid,
      });
    }
  } else {
  }
  let listreceivers1 = await findall("ballots", { counthelditems: { [Op.gt]: 0 } });
  if (listreceivers1 & listreceivers1.lnegth) {
    for (let i = 0; i < listreceivers1.length; i++) {
      let respitembalance = await findone("itembalances", { username });
      if (respitembalance) {
      } else {
        LOGGER("ERR() inconsistent data");
        continue;
      }
      let { itemid } = respitembalance;
      let { username } = listreceivers[i];
      let { buyprice: price0 } = respitembalance;
      let price1 = +price0 * (1 + PRICE_HIKE_PERCENT / 100);
      price1 = price1.toFixed(0);
      let duetime = moment().endOf("day").subtract(1, "hour");
      await createrow("receivables", {
        itemid,
        username,
        roundnumber,
        amount: price1,
        currency: PAYMENT_MEANS_DEF,
        currencyaddress: PAYMENT_ADDRESS_DEF,
        duetimeunix: duetime.unix(),
        duetime: duetime.format(STR_TIME_FORMAT),
      });
      await createrow("itemhistory", {
        itemid,
        username,
        roundnumber,
        price: price1,
        priceunit: PAYMENT_MEANS_DEF,
        status: -1,
      });
    }
  }
  let listitemsheld = await findall("itembalances", {});
};
cron.schedule("0 0 0 * * *", async () => {
  LOGGER("", moment().format("HH:mm:ss, YYYY-MM-DD"), "@nips");
  setTimeout(async (_) => {
    //		let resplastcloseunix = await findone('settings', { key_ : 'BALLOT_LAST_CLOSE_UNIX'} )
    let resplaststartunix = await findone("settings", { key_: "BALLOT_LAST_CLOSE_UNIX" });
    let timediff = moment().unix() - +resplaststartunix;
    let respdurationunix = await findone("settings", { key_: "BALLOT_LAST_START_UNIX" });

    if (timediff > respdurationunix) {
      func00();
    } else {
    }
  }, 3600 * 9 * 1000); // in
});

module.exports = router;

/**ballots;
| username         | varchar(80)      | YES  |     | NULL                |                               |
| isstaked         | tinyint(4)       | YES  |     | NULL                |                               |
| counthelditems   | int(10) unsigned | YES  |     | 0                   |                               |
| lastassigneddate | varchar(20)
*/
