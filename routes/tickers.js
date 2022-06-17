var express = require('express');
var router = express.Router();
const cliredisa=require('async-redis').createClient()
const {respok}=require('../utils/rest')

router.get('/', function(req, res, next) {
  cliredisa.hgetall ('TICKERS').then( list =>{
    respok ( res, null,null, { payload : {list , basecurrency: 'USD' }} )

  })
});

module.exports = router;
