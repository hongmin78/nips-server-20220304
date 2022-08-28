/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ballots', {
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
    isstaked: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    counthelditems: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true,
      defaultValue: 0
    },
    lastassigneddate: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    active: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 1
    },
    nettype: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    lastroundmadepaymentfor: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: -4
    },
    lasttimemadepaymentat: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    countdelinquencies: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    isdelinquent: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 0
    },
    buytimeunix: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    contractaddress: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    tokenid: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    sellabletimeunix: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    ismaxroundreached: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 0
    },
    ismaxreached: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'ballots'
  });
};
