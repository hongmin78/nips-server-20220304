/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('maxroundreached', {
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
      type: DataTypes.STRING(80),
      allowNull: true
    },
    nettype: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    uuid: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    itemroundnumber: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    amountpaid: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    txhash: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    globalroundnumber: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    active: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 1
    },
    roundnumberglobal: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    roundnumberglobal4birth: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'maxroundreached'
  });
};
