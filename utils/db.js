const db = require("../models");
const { LOGGER } = require("./common");
const findone = async (table, jfilter) => {
  return await db[table].findOne({ raw: true, where: jfilter });
};
const findall = async (table, jfilter) => {
  return await db[table].findAll({ raw: true, where: jfilter });
};
const countrows_scalar_distinct = (table, jfilter) => {
  return new Promise((resolve, reject) => {
    db[table].count({ where: { ...jfilter }, distinct: true, col: "itemid" }).then((resp) => {
      if (resp) {
        resolve(resp);
      } else {
        resolve(0);
      }
    });
  });
};

const getrandomrow_filter = async (tablename, jfilter) => {
  let aresp = await db[tablename].findAll({
    raw: true,
    order: db.Sequelize.literal("rand()"),
    limit: 1,
    where: { ...jfilter },
  });
  return aresp && aresp[0] ? aresp[0] : null;
};
/////////
const getrandomrow = async (tablename) => {
  let aresp = await db[tablename].findAll({ raw: true, order: db.Sequelize.literal("rand()"), limit: 1 });
  return aresp && aresp[0] ? aresp[0] : null;
};
const tableexists = async (tablename) => {
  let resp = await db.sequelize.query(`SHOW TABLES LIKE '${tablename}'`);
  return resp[0][0];
};
const update_min_or_max = async (tablename, jfilter, fieldname, val1, oper_min_or_max) => {
  if (Number.isFinite(+val1)) {
  } else {
    return null;
  }
  let resp = await findone(tablename, jfilter);
  if (resp) {
  } else {
    return null;
  }
  let jdata = {};
  jdata[fieldname] = val1;
  if (resp[fieldname]) {
    switch (oper_min_or_max) {
      case 0:
        if (+val1 < resp[fieldname]) {
          return updaterow(tablename, { id: resp.id }, jdata);
        } else {
          return null;
        }
        break;
      case 1:
        if (+val1 > resp[fieldname]) {
          return updaterow(tablename, { id: resp.id }, jdata);
        } else {
          return null;
        }
        break;
    }
  } else {
    return updaterow(tablename, { id: resp.id }, jdata);
  }
};
const logical_op = async (tablename, jfilter, fieldname, fieldval, logicaloper) => {
  let resprow = await db[tablename].findOne({ where: jfilter });
  if (resprow) {
    let jupdate = {};
    jupdate[fieldname] = resprow.dataValues[fieldname];
    if (logicaloper == "or") {
      jupdate[fieldname] = jupdate[fieldname] | fieldval;
    } else {
      jupdate[fieldname] = jupdate[fieldname] & fieldval;
    }
    resprow.update(jupdate);
  } else {
    return null;
  }
};
const togglefield = async (tablename, jfilter, fieldname) => {
  let resp = await findone(tablename, { ...jfilter });
  if (resp) {
  } else {
    return null;
  }
  let valuetoupdate = +resp[fieldname] ? 0 : 1;
  let jupdates = {};
  jupdates[fieldname] = valuetoupdate;
  await updaterow(tablename, { id: resp.id }, { ...jupdates });
  return valuetoupdate;
};
const findall_select_columns = async (table, jfilter, acols) => {
  if (acols.constructor === Array) {
    return await db[table].findAll({ raw: true, where: jfilter, attributes: acols });
  } else {
    return await db[table].findAll({ raw: true, where: jfilter });
  }
};
const updatetable = async (table, jfilter, jupdates) => {
  return await db[table].update(jupdates, { where: jfilter });
};
const updaterow = updatetable;

/** const tableexists=async tablename=>{
	let resp=await db.sequelize.query(`SHOW TABLES LIKE '${tablename}'`)
	return resp[0][0]
} */
const fieldexists = async (tablename, fieldname) => {
  let resp = await db.sequelize.query(`SHOW COLUMNS FROM ${tablename} LIKE '${fieldname}'`);
  return resp[0][0];
};
const createrow = async (table, jdata) => {
  console.log(`${table}`, jdata);
  return await db[table].create(jdata);
};
const cprow = async (fromtable,jfilter , totable )=>{
	let resp = await findone ( fromtable , jfilter)
	if ( resp ) {}
	else { return null }
	delete resp[ 'id' ]
	delete resp[ 'createdat' ]
	return await createrow ( totable, resp ) 
}
const countrows_scalar = (table, jfilter) => {
  return new Promise((resolve, reject) => {
    db[table].count({ where: { ...jfilter } }).then((resp) => {
      if (resp) {
        resolve(resp);
      } else {
        resolve(0);
      }
    });
  });
}; //
/** const countrows= (table,jfilter)=>{
  return new Promise ((resolve,reject)=>{
    db[table].count({where:{... jfilter} } ).then(resp=>{
      if(resp)  {resolve({status:1 ,respdata:resp }  )}
      else      {resolve({status:0 })    }
    })
  })
} */
const countrows = (table, jfilter) => {
  return new Promise((resolve, reject) => {
    db[table].count({ where: { ...jfilter } }).then((resp) => {
      if (resp) {
        resolve({ status: 1, respdata: resp });
      } else {
        resolve({ status: 0 });
      }
    });
  });
}; //
const createorupdaterow = (table, jfilter, jupdates) => {
  return new Promise((resolve, reject) => {
    db[table].findOne({ where: jfilter }).then((resp) => {
      if (resp) {
        resp.update(jupdates).then((respupdate) => {
          resolve(respupdate);
          return false;
        });
      } else {
        db[table].create({ ...jfilter, ...jupdates }).then((respcreate) => {
          resolve(respcreate);
          return false;
        });
      }
    });
  });
};
const updateorcreaterow = createorupdaterow;
const incrementroworcreate = async (jargs) => {
  let { table, jfilter, fieldname, incvalue } = jargs;
  let resprow;
  try {
    resprow = await db[table].findOne({ where: jfilter });
  } catch (err) {
    // .then(resprow=>{
    LOGGER("yHshy8Ist5", err);
    return null;
  }
  let jdata = {};
  jdata[fieldname] = +incvalue;
  if (resprow) {
    jdata[fieldname] += +resprow.dataValues[fieldname];
    return await resprow.update({ ...jdata });
  } else {
    return await db[table].create({ ...jfilter, ...jdata });
  } //  })
};
const incrementrow = incrementroworcreate;

const createifnoneexistent = async (table, jfilter, jupdates) => {
  let resp = await findone(table, jfilter);
  if (resp) {
    return null;
  }
  return await createrow(table, { ...jfilter, ...jupdates });
};
const deleterow = async (tablename, jfilter) => {
  return await db[tablename].destroy({ where: jfilter });
};
const moverow = async (fromtable, jfilter, totable, auxdata) => {
  findone(fromtable, jfilter).then(async (resp) => {
    if (resp) {
      let { id } = resp;
      delete resp["createdat"];
      delete resp["updatedat"];
      delete resp["id"];
      let respcreate = await createrow(totable, { ...resp, ...auxdata });
      await db.sequelize.query(`delete from ${fromtable} where id=${id}`);
      //			deleterow (fromtable ,{id: resp.id} )
      return respcreate;
    } else {
    }
  });
};

const getrandomrow_filter_multiple_rows = async (tablename, jfilter, N) => {
  LOGGER("getrandomrow_filter_multiple_rows", tablename, jfilter, N);
  let aresp = await db[tablename].findAll({
    raw: true,
    order: db.Sequelize.literal("rand()"),
    limit: +N,
    where: { ...jfilter },
  });
  return aresp;
};
module.exports = {
  findone,
  findall,
  findall_select_columns,
  togglefield,
  updatetable,
  updaterow,
  getrandomrow_filter,
  getrandomrow,
  getrandomrow_filter_multiple_rows,
  tableexists,
  fieldexists,
  createrow,
  createorupdaterow,
  updateorcreaterow,
  incrementroworcreate,
  countrows,
  countrows_scalar,
  createifnoneexistent,
  incrementrow,
  deleterow,
  moverow,
  logical_op,
  update_min_or_max,
  countrows_scalar_distinct,
	cprow 
};

const test = (_) => {
  incrementroworcreate();
};
