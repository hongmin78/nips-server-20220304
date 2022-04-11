/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('items', {
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
    active: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    countfavors: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0
    },
    group_: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    metadata: {
      type: DataTypes.STRING(1500),
      allowNull: true
    },
    username: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    salestatus: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 0
    },
    salesstatusstr: {
      type: DataTypes.STRING(40),
      allowNull: true,
      defaultValue: "on_reserve",
      comment: '0:on_reserve,1:assigned,-1:user_owned'
    },
    roundnumber: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'items'
  });
};
