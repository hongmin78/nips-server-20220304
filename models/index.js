
'use strict'
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename) // const env = 'production' // 'developmentDesktop20191004' //  //   // process.env.NODE_ENV ||  
const env = process.env.NODE_ENV || 'development' //test 'developmentpc' //  // 'development'// 'production' // 
const config = require( '../configs/dbconfig.json')[env];// ./apiServe // __dirname + 
// let config
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], { ... config ,   logging: false}    )
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, {... config
    , dialect: 'mariadb'
//    , port : '37375'
    , dialectOptions: {     timezone: 'Etc/GMT-9'   },    define: {     timestamps: false   },  logging: false  }
//  , define: {timestamps: false}
  )
}
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db['items'].hasMany(db['itemhistory'], {foreignKey:'itemid', sourceKey:'itemid'})
db['itemhistory'].belongsTo(db['items'], {foreignKey:'itemid', targetKey:'itemid'})

db['items'].hasOne(db['circulations'], {as:'current_info', foreignKey:'itemid', sourceKey:'itemid'})
db['circulations'].belongsTo(db['items'], {foreignKey:'itemid', targetKey:'itemid'})

db['circulations'].hasOne(db['users'], {foreignKey:'username', sourceKey:'username'})
db['users'].belongsTo(db['circulations'], {foreignKey:'username', targetKey:'username'})



db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

