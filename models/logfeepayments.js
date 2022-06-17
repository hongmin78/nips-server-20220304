/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('logfeepayments', {
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
    amount: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    amountfloat: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    paymeansname: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    paymeansaddress: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    buyer: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    seller: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    feerate: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    nettype: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    referer: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    referercode: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    refereraddress: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    uuid: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'logfeepayments'
  });
};
