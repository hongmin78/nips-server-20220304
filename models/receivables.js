/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('receivables', {
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
    uuid: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    duetimeunix: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    duetime: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    active: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 1
    },
    seller: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    nettype: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    group_: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    roundnumberglobal: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    itemroundnumber: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    birth: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      comment: '0,null: regular rounds,1:right from birth'
    },
    roundnumberglobal4birth: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'receivables'
  });
};
