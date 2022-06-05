var express = require("express");
var router = express.Router();
const { findone, createrow, findall } = require("../utils/db");
const { respok, resperr } = require("../utils/rest");
const { ISFINITE } = require("../utils/common");
const { messages } = require("../configs/messages");
const db = require("../models");
const { queryitemdata, queryitemdata_user } = require("../utils/db-custom");
const STRINGER = JSON.stringify;
router.get("/item/:itemid", async (req, res) => {
  //	console.log('hello')
  let { nettype } = req.query;
  let { itemid } = req.params;
  if (nettype) {
  } else {
    resperr(res, messages.MSG_ARGMISSING);
    return;
  }
  let aproms = [];
  aproms[aproms.length] = findone("itembalances", { itemid, nettype });
  aproms[aproms.length] = findone("circulations", { itemid, nettype });
  aproms[aproms.length] = findall("itemhistory", { itemid, nettype });
  db["items"]
    .findOne({
      raw: true,
      where: {
        itemid,
        nettype,
      },
      /**		include:[{
			model: db['itemhistory']
		}, */
      /*		{
			model: db['circulations'],
			as:'current_info',
			include:[{
				model: db['users']
			}]
		} 
		]*/
    })
    .then(async (resp) => {
      console.log("hello");
      let aresps = await Promise.all(aproms);
      let itembalances = aresps[0];
      let circulations = aresps[1];
      let itemhistory = aresps[2];
      let order_detail = await findone("orders", {
        itemid: resp.itemid,
      });
      respok(res, null, null, {
        respdata: {
          ...resp,
          order_detail,
          itembalances, // : STRINGER(itembalances)
          circulations, // : STRINGER(circulations )
          itemhistory,
        },
      });
    });
  // 	findone('items', {itemid}).then(async resp=>{
  // 	//	let respdetail = await queryitemdata(itemid) // .then(resp=>
  // 		respok ( res, null,null,{ respdata: {... resp
  // //		, ... respdetail
  // 		 } } )
  // 	})
});
/* GET home page. */
/** router.get('/item/:itemid', (req,res)=>{
	let {itemid}=req.params
	findone('items', {itemid}).then(resp=>{
		respok ( res, null,null,{ respdata: resp } ) 
	})	
}) */
router.get("/:offset/:limit/:orderkey/:orderval", function (req, res, next) {
  let { offset, limit } = req.params;
  let { orderkey, orderval } = req.params;
  offset = +offset;
  limit = +limit;
  if (ISFINITE(offset)) {
  } else {
    resperr(res, messages.MSG_ARGINVALID);
    return;
  }
  if (ISFINITE(limit)) {
  } else {
    resperr(res, messages.MSG_ARGINVALID);
    return;
  }
  db["items"].findAll({ raw: true, where: {}, offset, limit }).then((list) => {
    respok(res, null, null, { list });
  });
});

module.exports = router;
