
const crypto = require('crypto');
const fs = require('fs');
const stringify = require('fast-json-stable-stringify');

const DefaultHashAlgorithm = 'sha256';
const SupportedAlgorithms = new Set(['sha1', 'sha256', 'sha512']);

const hashString = (str, options = { algorithm: DefaultHashAlgorithm }) => {
  if (!SupportedAlgorithms.has(options.algorithm)) {
    throw new Error(`Unsupported hashing algorithm: ${options.algorithm}`);
  }
  let hash = crypto.createHash(options.algorithm);
  hash.update(str);
  let hashHex = hash.digest('hex');
  return hashHex;
};

const hashObject = (obj, options) => {
  let objText = stringify(obj);
  return hashString(objText, options);
};

const hashFile = async (fullFilePath, options = { algorithm: DefaultHashAlgorithm }) => {
  if (!SupportedAlgorithms.has(options.algorithm)) {
    throw new Error(`Unsupported hashing algorithm: ${options.algorithm}`);
  }
  let hash = crypto.createHash(options.algorithm);
  hash.setEncoding('hex');
  return new Promise((resolve, reject) => {
    let input = fs.createReadStream(fullFilePath);
    input.on('end', () => {
      hash.end();
      let hashHex = hash.read();
      resolve(hashHex);
    });
    input.pipe(hash);
  });
};

module.exports.hashString = hashString;
module.exports.hashObject = hashObject;
module.exports.hashfile = hashFile

const LOGGER=console.log
const moment=require('moment')
const testmain=_=>{const m0=moment()
	hashFile('/Users/janglee/Downloads/marketplace_mobile.ai').then(resp=>{LOGGER(resp , moment()-m0)})
}
// testmain()
