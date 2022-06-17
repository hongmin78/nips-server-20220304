var express = require("express");
var router = express.Router();
let {
  create_uuid_via_namespace,
  generaterandomstr,
  ISFINITE,
  uuidv4,
} = require("../utils/common");
let {
  findone,
  findall,
  createrow,
  updateorcreaterow,
  updaterow,
  moverow,
} = require("../utils/db");
let { respok, resperr } = require("../utils/rest");
const { messages } = require("../configs/messages");
const LOGGER = console.log;
const { getobjtype } = require("../utils/common");
const STRINGER = JSON.stringify;
const moment = require("moment");
const db = require("../models");
let { Op } = db.Sequelize;
/* GET users listing. */
const MAP_SALETYPRSTR = {};
const validate_expiry = (expiry) => {
  let timenow = moment();
  let timenowunix = timenow.unix();
  if (+expiry > timenowunix) {
    return true;
  } else {
    return false;
  }
};
router.delete("/:fieldname/:fieldval", async (req, res) => {
  LOGGER("", req.body);
  let { fieldname, fieldval } = req.params;
  let { username } = req.body;
  if (username) {
  } else {
    resperr(res, messages.MSG_ARGMISSING, null, { reason: "username" });
    return;
  }
  let jdata = {};
  jdata[fieldname] = fieldval;
  let uuid = uuidv4();
  findone("orders", { ...jdata }).then(async (resp) => {
    if (resp) {
    } else {
      resperr(res, messages.MSG_DATANOTFOUND);
      return;
    }
    await moverow("orders", { id: resp.id }, "logorders", { isfulfilled: 0 });
    respok(res, null, null, { uuid });
    await createrow("logactions", {
      username,
      itemid: resp.itemid,
      typestr: "CANCEL_SALE",
      uuid, // : generaterandomstr(40)
    });
    await updateorcreaterow(
      "items",
      { itemid: resp.itemid },
      { salestatus: 0 }
    );
  });
});
//		moverow(fromtable, jfilter, totable , auxdata)
router.put("/:fieldname/:fieldval", async (req, res) => {
  LOGGER("", req.body);
  let { fieldname, fieldval } = req.params;
  let jdata = {};
  jdata[fieldname] = fieldval;
  let { username } = req.body;
  if (username) {
  } else {
    resperr(res, messages.MSG_ARGMISSING, null, { reason: "username" });
    return;
  }
  let uuid = uuidv4();
  findone("orders", { ...jdata }).then(async (resp) => {
    if (resp) {
    } else {
      resperr(res, messages.MSG_DATANOTFOUND);
      return;
    }
    let { expiry } = req.body;
    if (expiry) {
      if (validate_expiry(expiry)) {
      } else {
        resperr(res, messages.MSG_ARGINVALID);
        return;
      }
    }
    await updaterow("orders", { id: resp.id }, { ...req.body });
    respok(res, null, null, { uuid });
    createrow("logactions", {
      username,
      itemid: resp.itemid,
      typestr: "EDIT_SALE",
      uuid, // : generaterandomstr(40)
    });
  });
});
router.post("/", async (req, res) => {
  LOGGER("", req.body);
  let {
    username,
    contractaddress,
    tokenid,
    itemid,
    price,
    expiry,
    paymeansaddress,
    paymeansname,
    saletype,
    saletypestr,
    salestatus,
    salestatusstr,
    jsignature,
    nettype,
    typestr,
    expirystr,
  } = req.body;
  console.log(req.body);
  if (username && price && paymeansaddress) {
  } else {
    resperr(res, messages.MSG_ARGMISSING);
    return;
  }

  if (itemid) {
  } else if (contractaddress && tokenid) {
  } else {
    resperr(res, messages.MSG_ARGINVALID, null, {
      reason: "item not specified",
    });
    return;
  }
  // let {signature , msg }=jsignature
  // if (jsignature && jsignature?.signature) {
  // } else {
  // }
  let uuid;
  if (contractaddress && tokenid) {
    let respitem = await findone("items", { itemid });
    if (respitem) {
      itemid = respitem.itemid;
    } else {
      resperr(res, messages.MSG_DATANOTFOUND);
      return;
    }
  } else {
  }
  // if (expiry && ISFINITE(+expiry)) {
  // } else {
  //   resperr(res, messages.MSG_ARGMISSING);
  //   return;
  // }

  // if (validate_expiry(expiry)) {
  // } else {
  //   resperr(res, messages.MSG_ARGINVALID);
  //   return;
  // }
  uuid = create_uuid_via_namespace(
    `${username.toLowerCase()}_${itemid}_${contractaddress.toLowerCase()}_${moment().unix()}`
  ); // `${contractaddress}_${tokenid}`

  let resporder = await findone("orders", { uuid });
  if (resporder) {
  } // resperr( res, messages.MSG_DATADUPLICATE); return }
  else {
  }
  // await updateorcreaterow("orders", { uuid }, { ...req.body , signature , msg:msg?msg:null });
  // await updateorcreaterow(
  //   "orders",
  //   { uuid },
  //   { ...req.body, msg: msg ? msg : null }
  // );
  await updateorcreaterow("orders", { uuid }, { ...req.body });
  respok(res, null, null, { uuid });
  updateorcreaterow(
    "items",
    { itemid },
    {
      salestatus: 1,
      salestatus: salestatus,
      saletype: saletype,
      saletypestr: saletypestr,
      salestatusstr: salestatusstr,
      expirystr: expirystr,
    }
  );
  createrow("itemhistory", { itemid, ...req.body });
  createrow("logactions", { ...req.body });
});
module.exports = router;
/**  delete( "/:fieldname/:fieldval" 
 put("/:fieldname/:fieldval"
post("/", */
/**  url      | varchar(1000)       | YES  |     | NULL                |                               |
| description | varchar(1000)       | YES  |     | NULL                |                               |
| titlename   | varchar(200)        | YES  |     | NULL                |                               |
| itemid      | varchar(300)        | YES  |     | NULL                |                               |
| metadataurl | varchar(500)        | YES  |     | NULL                |                               |
| isminted    | tinyint(4)          | YES  |     | 0                   |                               |
| txhash      | varchar(80)         | YES  |     | NULL                |                               |
| active      | tinyint(4)          | YES  |     | NULL                |                               |
| countfavors | bigint(20) unsigned | YES  |     | 0                   |                               |
| group_      | varchar(40)         | YES  |     | NULL                |                               |
| metadata    | varchar(1500)       | YES  |     | NULL                |                               |
| username    | varchar(80)         | YES  |     | NULL                |                               |
| salestatus  | tinyint(4)          | YES  |     | 0                   |                               |
| tokenid     | bigint(20) unsigned | YES  |     | NULL                |                               |
| isonsale    | tinyint(4)          | YES  |     | 0                   |                               |
| saletype    | tinyint(4)          | YES  |     | NULL                |                               |
| author      | varchar(80)         | YES  |     | NULL
*/
/** username   | varchar(80)      | YES  |     | NULL                |                               |
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
| status       | tinyint(4)      
*/
/**router.get( '/auctions/pastexpiry/:username' , (req,res)=>{ // /:reftimeunix
	let { nettype } =req.query
	if ( nettype ) {}
	else { resperr( res,messages.MSG_ARGMISSING ) ; return }
	let { username}=req.params
	let timenowunix=moment().unix()
	findall ( 'orders' , { saletype : 2 
		, nettype
		, username 
		, expiry : { [Op.lt] :  timenowunix } } ).then(list =>{
		respok ( res ,null,null , {list } )
	})
})
 */
