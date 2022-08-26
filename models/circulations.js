/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('circulations', {
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
      type: DataTypes.STRING(80),
      allowNull: true
    },
    username: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    roundnumber: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    price: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    priceunit: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    priceunitcurrency: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    countchangehands: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0
    },
    nettype: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    isdelinquent: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true
    },
    globalroundnumber: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    roundnumberglobal: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    itemroundnumber: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'circulations'
  });
};
