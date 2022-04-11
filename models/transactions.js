/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('transactions', {
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
    username: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    txhash: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    type: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true
    },
    typestr: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    active: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 1
    },
    status: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: -1
    },
    auxdata: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    amount: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    currencyaddress: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    nettype: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    itemid: {
      type: DataTypes.STRING(80),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'transactions'
  });
};
