/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('approvals', {
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
    amount: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    erc20: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    target: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'approvals'
  });
};
