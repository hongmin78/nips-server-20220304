/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('logballots', {
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
    countreceivers: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    countitems: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    roundnumber: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    drawtime: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    paymentduetime: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    countdelinquencies: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    amountdelinquencies: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    countpayments: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    amountpayments: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    active: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'logballots'
  });
};
