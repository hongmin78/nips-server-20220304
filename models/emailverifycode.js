/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('emailverifycode', {
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
    emailaddress: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    lastupdate: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    code: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    lastupdateunix: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    cryptoaddress: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    isverified: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    expiry: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    emailauth: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'emailverifycode'
  });
};
