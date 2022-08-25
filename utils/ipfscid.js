const crypto = require("crypto");
const bs58 = require("bs58");
const CONSOLEON = 0; // const data = 'hello world'
const fs = require("fs");
const LOGGER = console.log;
const get_ipfsformatcid_file = (filename) => {
  return new Promise((resolve, reject) => {
    const hashFunction = Buffer.from("12", "hex"); // 0x20 //	const digest = crypto.createHash('sha256') .update(str).digest() // data
    let input = fs.createReadStream(filename);
    let hash = crypto.createHash("sha256");
    input.on("readable", (_) => {
      var data = input.read();
      if (data) {
        hash.update(data);
      } else {
        //			console.log(`${hash.digest('hex')} ${fileName}`);
        const digest = hash.digest(); // data
        CONSOLEON && console.log(digest.toString("hex")); // b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
        const digestSize = Buffer.from(digest.byteLength.toString(16), "hex");
        CONSOLEON && console.log(digestSize.toString("hex")); // 20
        const combined = Buffer.concat([hashFunction, digestSize, digest]);
        CONSOLEON && console.log(combined.toString("hex")); // 1220b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
        const multihash = bs58.encode(combined);
        CONSOLEON && console.log(multihash.toString()); // QmaozNR7DZHQK1ZcU9p7QdrshMvXqWK6gpu5rmrkPdT3L4
        resolve(multihash.toString());
      }
    });
  });
};
const get_ipfsformatcid_str = (str) => {
  const hashFunction = Buffer.from("12", "hex"); // 0x20
  const digest = crypto.createHash("sha256").update(str).digest(); // data
  CONSOLEON && console.log(digest.toString("hex")); // b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
  const digestSize = Buffer.from(digest.byteLength.toString(16), "hex");
  CONSOLEON && console.log(digestSize.toString("hex")); // 20
  const combined = Buffer.concat([hashFunction, digestSize, digest]);
  CONSOLEON && console.log(combined.toString("hex")); // 1220b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
  const multihash = bs58.encode(combined);
  CONSOLEON && console.log(multihash.toString()); // QmaozNR7DZHQK1ZcU9p7QdrshMvXqWK6gpu5rmrkPdT3L4
  return multihash.toString();
};
module.exports = {
  get_ipfsformatcid_file,
  get_ipfsformatcid_str,
};
const testmain = (_) => {
  const filename = "/Users/janglee/Downloads/audusLauncher-20190803.png";
  get_ipfsformatcid_file(filename).then(LOGGER);
};
0 && testmain();

// => 46 chars
