var express = require("express");
var router = express.Router();
/* GET home page. */
const LOGGER = console.log;
const {
  createrow,
  createifnoneexistent,
  findone,
  updateorcreaterow,
} = require("../utils/db");
const { getobjtype } = require("../utils/common");
const { enqueue_tx_toclose } = require("../services/close-transactions");
const { enqueue_tx_toclose_02 } = require("../services/close-transactions-02");
const STRINGER = JSON.stringify;
const { create_uuid_via_namespace } = require("../utils/common");
const { respok, resperr } = require("../utils/rest");
const cliredisa = require("async-redis").createClient();
const ISFINITE = Number.isFinite;
const { NETTYPE } = require("../configs/net");

router.post("/:txhash", async (req, res) => {
  let { txhash } = req.params;
  let uuid = create_uuid_via_namespace(txhash);
  LOGGER(txhash, req.body);
  let {
    username,
    auxdata,
    typestr,
    nettype,
    itemid,
    amount,
    contractaddress,
    tokenid,
    roundnumber,
    rewardtokenaddress,
  } = req.body;
  /**	if (nettype){}
	else if ( nettype=auxdata.nettype ) {}
	else {} */
  let objtype = getobjtype(auxdata);
  let strauxdata;
  let istxtotrack = true;
  switch (objtype) {
    case "null":
      break;
    case "String":
      strauxdata = auxdata;
      break;
    case "Array":
      strauxdata = STRINGER(auxdata);
      break;
    case "Object":
      strauxdata = STRINGER(auxdata);
      break;
    default:
      break;
  }
  if (nettype) {
  } else if (req.query.nettype) {
    nettype = req.query.nettype;
  } else if (auxdata.nettype) {
    nettype = auxdata.nettype;
  } else {
    nettype = NETTYPE;
  }
  await createifnoneexistent(
    "transactions",
    { txhash },
    {
      username,
      //		, txhash
      auxdata: strauxdata,
      typestr,
      amount: auxdata?.amount, // typestr=='STAKE' ?: null
      currency: auxdata?.currency, // typestr=='STAKE'? : null
      currencyaddress: auxdata?.currencyaddress, // typestr=='STAKE' ?: null
      nettype, // :
    }
  );
  await createifnoneexistent(
    "logactions",
    { txhash },
    {
      username,
      //		, txhash
      typestr,
      itemid: itemid ? itemid : null,
      price: auxdata?.amount,
      priceunit: auxdata?.currency,
      uuid,
      nettype,
      amount: auxdata?.amount,
    }
  );
  if (itemid) {
    let resproundnumber = await findone("settings", {
      key_: "BALLOT_ROUND_NUMBER",
    });
    let roundnumber = 0;
    if (resproundnumber && ISFINITE(+resproundnumber?.value_)) {
      roundnumber = +resproundnumber?.value_;
    }
    await createifnoneexistent(
      "itemhistory",
      { txhash },
      {
        itemid,
        typestr,
        nettype,
        uuid,
        roundnumber,
      }
    );
  }
  //	 } )
  respok(res, null, null, { payload: { uuid } });
  switch (typestr) {
    case "CLAIM_KINGKONG_WAGE":
      istxtotrack = false;
      enqueue_tx_toclose_02({
        txhash,
        nettype,
        username,
        itemid,
        contractaddress,
        rewardtokenaddress,
        amount,
      });
      break;
    case "UNEMPLOY_KINGKONG":
      istxtotrack = false;
      enqueue_tx_toclose_02({
        txhash,
        nettype,
        username,
        itemid,
        contractaddress,
        typestr,
      });
      break;
    case "EMPLOY_KINGKONG":
      istxtotrack = false;
      enqueue_tx_toclose_02(
        //					, uuid
        { txhash, nettype, username, itemid, contractaddress, typestr }
      );
      break;
    case "KINGKONG_INITIAL_PAYMENT":
      istxtotrack = false;
      enqueue_tx_toclose_02({
        txhash,
        uuid,
        nettype,
        username,
        itemid,
        roundnumber,
        price,
        contractaddress,
        typestr,
      });
      break;
    case "STAKE":
      enqueue_tx_toclose(
        txhash,
        req.body.auxdata.uuid,
        nettype,
        "ticket",
        contractaddress
      );
      break;
    case "APPROVE":
    case "PAY":
    case "CLEAR_DELINQUENT":
      cliredisa
        .hset(
          "TX-TABLES",
          txhash,
          STRINGER({
            type: typestr,
            tables: {
              logactions: 1,
              transactions: 1,
            },
            address: username, // itemid
            amount: auxdata?.amount,
            itemid,
            strauxdata,
          })
        )
        .then((resp) => {
          enqueue_tx_toclose(txhash, uuid, nettype);
        });
      break;
    case "BUY_NFT_ITEM":
      cliredisa
        .hset(
          "TX-TABLES",
          txhash,
          STRINGER({
            type: typestr,
            //    , tables:{
            //     logactions:1
            // , transactions:1
            //  }
            address: username, // itemid
            //       , amount : auxdata?.amount
            itemid,
            contractaddress,
            tokenid,
            uuid,
            strauxdata,
            orderuuid: req.body.auxdata.uuid,
          })
        )
        .then((resp) => {
          enqueue_tx_toclose(
            txhash,
            req.body.auxdata.uuid,
            nettype,
            "kingkong",
            contractaddress,
            tokenid
          );
        });
      /*****/
      break;
    case "BUY_NFT_ITEM_TICKET":
      cliredisa
        .hset(
          "TX-TABLES",
          txhash,
          STRINGER({
            type: typestr,
            //    , tables:{
            //     logactions:1
            // , transactions:1
            //  }
            address: username, // itemid
            //       , amount : auxdata?.amount
            itemid,
            tokenid,
            contractaddress,
            uuid,
            strauxdata,
            orderuuid: req.body.auxdata.uuid,
          })
        )
        .then((resp) => {
          enqueue_tx_toclose(
            txhash,
            req.body.auxdata.uuid,
            nettype,
            "ticket",
            contractaddress
          );
          console.log("success");
        });
      /*****/
      break;
  }
  istxtotrack &&
    createifnoneexistent(
      "transactionstotrack",
      { txhash },
      {
        username,
        //	  , type
        typestr,
        active: 1,
        status: -1,
        auxdata: strauxdata,
        amount: auxdata?.amount,
        currency: auxdata?.currency ? auxdata?.currency : null,
        currencyaddress: auxdata?.currencyaddress
          ? auxdata?.currencyaddress
          : null,
        nettype,
        address: username,
        itemid: itemid ? itemid : null,
        uuid: uuid ? uuid : null,
      }
    );
});
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

module.exports = router;

/** itemhistory
itemid         | varchar(100)     | YES  |     | NULL                |                               |
| iteminstanceid | int(10) unsigned | YES  |     | NULL                |                               |
| from_          | varchar(80)      | YES  |     | NULL                |                               |
| to_            | varchar(80)      | YES  |     | NULL                |                               |
| price          | varchar(20)      | YES  |     | NULL                |                               |
| priceunit      | varchar(20)      | YES  |     | NULL                |                               |
| typestr        | varchar(20)      | YES  |     | NULL                |                               |
| type           | tinyint(4)       | YES  |     | NULL                |                               |
| datahash       | varchar(100)     | YES  |     | NULL                |                               |
| tokenid        | varchar(20)      | YES  |     | NULL                |                               |
| txtype         | tinyint(4)       | YES  |     | NULL                |                               |
| isonchain      | tinyint(4)       | YES  |     | NULL                |                               |
| nettype        | varchar(20)      | YES  |     | NULL                |                               |
| uuid           | varchar(50)      | YES  |     | NULL                |                               |
| status         | tinyint(4)       | YES  |     | NULL                |                               |
| txhash         | varchar(80)      | YES  |     | NULL                |                               |
| roundnumber    | int(1 */
