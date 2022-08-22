/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "itembalances",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      createdat: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.fn("current_timestamp"),
      },
      updatedat: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      username: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },
      itemid: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },
      status: {
        type: DataTypes.INTEGER(4),
        allowNull: true,
      },
      buyprice: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      paymeans: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      paymeansaddress: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },
      amount: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: true,
        defaultValue: 1,
      },
      nettype: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      group_: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      contractaddress: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },
      isonchain: {
        type: DataTypes.INTEGER(4),
        allowNull: true,
      },
      locked: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: true,
      },
      avail: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: true,
      },
      isstaked: {
        type: DataTypes.INTEGER(4),
        allowNull: true,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      tableName: "itembalances",
    }
  );
};
