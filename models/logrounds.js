/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('logrounds', {
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
    roundnumber: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    countballotsactive: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    countitemsassigned: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true,
      defaultValue: 0
    },
    countusersassigned: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true,
      defaultValue: 0
    },
    countdelinquencies: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true,
      defaultValue: 0
    },
    countdelinquenciesresolved: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true,
      defaultValue: 0
    },
    starttime: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    drawtime: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    paymentduetime: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    endtime: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    starttimeunix: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    drawtimeunix: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    paymentduetimeunix: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    endtimeunix: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    totalitemsonreserve: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    totalitemsassigned: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    totalitemsinpossession: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'logrounds'
  });
};
