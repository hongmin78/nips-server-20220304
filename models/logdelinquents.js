/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('logdelinquents', {
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
    itemid: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    amount: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    currencyaddress: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    statusstr: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    roundnumber: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    txhash: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    active: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'logdelinquents'
  });
};
