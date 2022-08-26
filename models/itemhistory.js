/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('itemhistory', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    createdat: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.fn('current_timestamp')
    },
    updatedat: {
      type: DataTypes.DATE,
      allowNull: true
    },
    itemid: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    iteminstanceid: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    from_: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    to_: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    price: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    priceunit: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    typestr: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    type: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    datahash: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    tokenid: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    txtype: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    isonchain: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    nettype: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    uuid: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    txhash: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    roundnumber: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    active: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 1
    },
    username: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    itemroundnumber: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    roundnumberglobal: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'itemhistory'
  });
};
