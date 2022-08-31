/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "contractaddresses",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.fn("current_timestamp"),
      },
      updatedat: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      deployer: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      blockchain: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "contractaddresses",
    }
  );
};
