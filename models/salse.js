/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('salse', {
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
      type: DataTypes.STRING(200),
      allowNull: true
    },
    titlename: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    itemid: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    url: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    statusstr: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    nettype: {
      type: DataTypes.STRING(200),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'salse'
  });
};
