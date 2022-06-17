/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tickets', {
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
    url: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    titlename: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    itemid: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    metadataurl: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    isminted: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 0
    },
    txhash: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    price: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    priceunit: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    priceunitaddress: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    active: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    serialnumber: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    group_: {
      type: DataTypes.STRING(40),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tickets'
  });
};
