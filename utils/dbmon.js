
const dbmon=require('../modelsmongo')
const createrow=async(table,jdata)=>{return await dbmon[table].create(jdata)}
const findone=async (table,jfilter)=>{return await dbmon[table].findOne({... jfilter})}

const togglefield=async (tablename , jfilter , fieldname)=>{
  let resp = await findone(tablename , jfilter )
  if(resp){} else {return null}
  let valuetoupdate = + resp[fieldname] ? 0 : 1
  let jupdates={}
  jupdates={}
  jupdates[ fieldname ] = valuetoupdate
  await updaterow( tablename , { _id: resp._id } , {... jupdates } )
  return valuetoupdate
}
const findall=async (table,jfilter)=>{return await dbmon[table].find({... jfilter})}
const updaterow=(table,jfilter,jupdates)=>{return new Promise((resolve,reject)=>{
  dbmon[table].findOneAndUpdate(jfilter , jupdates , (err,doc)=>{
    if(err){resolve(null);LOGGER(err);return false}
    else {  resolve(doc);return false}
    } )
  })
}

const createifnoneexistent=async(table,jfilter,jupdates)=>{
  dbmon[table].findOne({ ... jfilter} , (err,doc)=>{
    if(doc ){} //     dbmon.items.update()
    else {
      dbmon.items.create( {... jfilter , ... jupdates } , (err,doc)=>{
        if(err){return null}
        else {return doc}
      } )
    }
  })
}

module.exports={
  createrow
, findone
, togglefield
, findall
, updaterow
, createifnoneexistent
}

