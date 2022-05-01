/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('banners', {
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
    imageurlpc: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    imageurlmobile: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    writer: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    uuid: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    active: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 1
    },
    isinuse: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 0
    },
    filenamepc: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    filenamemobile: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'banners'
  });
};
