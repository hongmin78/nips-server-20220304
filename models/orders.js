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
    asset_contract_bid: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    asset_id_bid: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    asset_amount_bid: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    asset_contract_ask: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    asset_id_ask: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    asset_amount_ask: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    makerortaker: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    uuid: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    sig_r: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    sig_s: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    sig_v: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    signature: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    datahash: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    itemid: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    type: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    typestr: {
      type: DataTypes.STRING(40),
      allowNull: true,
      comment: '0:MINT,1:COMMON,2:AUCTION'
    },
    rawdata_to_sign: {
      type: DataTypes.STRING(3000),
      allowNull: true
    },
    supertype: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      comment: 'sell:1, buy:2'
    },
    supertypestr: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '1: sell, 2:buy'
    },
    rawdatahash: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    signaturestr: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    isprivate: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 0
    },
    privateaddress: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    price: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    expiry: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    expirychar: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    tokenid: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    closingtxhash: {
      type: DataTypes.STRING(80),
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
    decimals: {
      type: DataTypes.INTEGER(10).UNSIGNED,
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
    contractaddress: {
      type: DataTypes.STRING(80),
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
    msg: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    bidcount: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'orders'
  });
};
