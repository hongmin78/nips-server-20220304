/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('orders', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
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
    matcher_contract: {
      type: DataTypes.STRING(80),
      allowNull: true,
      comment: 'address of contract which will execute matching process'
    },
    username: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    uuid: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    itemid: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true
    },
    type: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    typestr: {
      type: DataTypes.STRING(40),
      allowNull: true,
      comment: '0:MINT,1:COMMON,2:AUCTION'
    },
    isprivate: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 0
    },
    price: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    tokenid: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    buyer: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    seller: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 1
    },
    amount: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    saletype: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    active: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 1
    },
    paymeansaddress: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    paymeansname: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    saletypestr: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    nettype: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    expirystr: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    bidcount: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true,
      defaultValue: 0
    },
    auxdata: {
      type: 'LONGTEXT',
      allowNull: true
    },
    oldseller: {
      type: DataTypes.STRING(80),
      allowNull: true
    }
  );
};
