const moment = require("moment");
const KEYS = Object.keys;
const ISFINITE = Number.isFinite;
const STRINGER = JSON.stringify;
const LOGGER = console.log;
const PARSER = JSON.parse;
const { v4: uuidv4, v5: uuidv5 } = require("uuid");
const mnemonicwords = require("mnemonic-words");
const getrandomint = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};
function shufflearray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

const create_uuid_via_namespace = (str) => uuidv5(str, Array.from(Array(16).keys()));
const getobjtype = (object) => {
  var stringConstructor = "test".constructor;
  var arrayConstructor = [].constructor;
  var objectConstructor = {}.constructor;
  if (object === null) {
    return "null";
  }
  if (object === undefined) {
    return "undefined";
  }
  if (object.constructor === stringConstructor) {
    return "String";
  }
  if (object.constructor === arrayConstructor) {
    return "Array";
  }
  if (object.constructor === objectConstructor) {
    return "Object";
  }
  return null;
};
const convaj = (arr, keyname, valuename) => {
  let jdata = {};
  arr.forEach((elem) => {
    jdata[elem[keyname]] = elem[valuename];
  });
  return jdata;
};
const getRandomElementsFromArray = (arr, n) => {
  console.log("arr", arr.length, "n", n);
  let minNum = Math.min(arr.length, n);

  let result = new Array(minNum);

  while (minNum--) {
    let x = Math.floor(Math.random() * minNum);
    result[minNum] = arr[x];
  }

  //    return result;

  /*  while (n--) {
    var x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
*/
  console.log("result", result);
  return result;
};

const getrandomwords = (N) => {
  return getRandomElementsFromArray(mnemonicwords, N);
};
const separatebycommas = (strcsv) => strcsv.split(/,/).filter((elem) => elem && elem.length);
// /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const isuuid = (str) => {
  return str.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
};
function generaterandomstr(length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
const generaterandomhex = (length, type) => {
  var result = "";
  var characters = "abcdef0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
const TIMEFORMATSTR = "YYYY-MM-DDTHH:mm:ss";
const TIMEFORMATSTR_RAW = "YYYYMMDDHHmmss";
const gettimestr = (_) => moment().format(TIMEFORMATSTR);
const gettimestr_raw = (_) => moment().format(TIMEFORMATSTR_RAW);
const gettimeunix = (_) => moment().unix();

const cyrb53 = function (str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};
function hashFnv32a(str, asString, seed) {
  /*jshint bitwise:false */
  var i,
    l,
    hval = seed === undefined ? 0x811c9dc5 : seed;
  for (i = 0, l = str.length; i < l; i++) {
    hval ^= str.charCodeAt(i);
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  if (asString) {
    // Convert to 8 digit hex string
    return ("0000000" + (hval >>> 0).toString(16)).substr(-8);
  }
  return hval >>> 0;
}
const gettimestrwithspace = (_) => moment().format("YYYY-MM-DD HH:mm:ss");
/**  const crypto = require('crypto')
const configsha256=require('../configs/config-sha256')
const hashviasha256=_data=>{return crypto.createHmac('sha256', configsha256.secret ).update(configsha256.password ).digest('hex') }
*/
const sha256 = require("js-sha256").sha256;
const hashviasha256 = (str) => sha256(str);

const filter_json_by_nonnull_criteria = (jdata) => {
  KEYS(jdata).forEach((key) => {
    if (jdata[key]) {
    } else {
      delete jdata[key];
    }
  });
  return jdata;
};
const generaterandomstr_charset = (length, charsetcode) => {
  let characters;
  if (charsetcode == "base58") {
    characters = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
  } else if (charsetcode == "numbers") {
    characters = "0123456789";
  } else if (charsetcode == "lower") {
    characters = "abcdefghijklmnopqrstuvwxyz";
  } else if (charsetcode == "hex") {
    characters = "abcdef0123456789";
  } else if (charsetcode == "notconfusing") {
    characters = "2345679BCDEGHKLQSUZadehipqstu";
  } else {
    characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  }

  var charactersLength = characters.length;
  let result = "";
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

// => 594ae48dcdc55777fdc05ceea4b40c45ec5118946a12797228dd8106e8f1e5fb
module.exports = {
  convaj,
  generaterandomhex,
  getrandomwords,
  getrandomint,
  shufflearray,
  LOGGER: console.log,
  PARSER,
  cyrb53,
  hash53: cyrb53,
  hashFnv32a,
  gettimestr,
  create_uuid_via_namespace,
  isuuid,
  gettimestr_raw,
  gettimestrwithspace,
  gettimeunix,
  hashviasha256,
  filter_json_by_nonnull_criteria,
  generaterandomstr,
  generaterandomstr_charset,
  ISFINITE,
  KEYS,
  STRINGER,
  uuidv4,
  separatebycommas,
  getobjtype,
  getRandomElementsFromArray,
};

const main = (_) => {
  let { generaterandomhex, hashFnv32a, hash53 } = require("./common");
  let arr = [];
  for (let i = 0; i < 10; i++) {
    arr.push(generaterandomhex(100));
  }
  let arr1 = arr.map((elem) => hashFnv32a(elem, 1));
  let arr2 = arr.map((elem) => hash53(elem));
  arr2[0].toString(16).padStart(16, 0);
};
