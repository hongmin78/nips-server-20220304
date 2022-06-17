const fs = require("fs");
const PATH_STORE_DEF = "/var/www/html";
const shell = require("shelljs");
const URL_SELF_DEF = "http://itemverse1.net/tmp";

const storefile_from_base64data = (datainbase64, filename, hexid, mode_perm_temp) => {
  // const fullpathname=`${__dirname}/repo/${hexid}`
  // ! fs.existsSync  ( fullpathname ) && fs.mkdirSync( fullpathname )
  let fullpathname;
  switch (mode_perm_temp) {
    case "perm":
      fullpathname = `${PATH_STORE_DEF}/repo/${hexid}`;
      break;
    case "temp":
      fullpathname = `${PATH_STORE_DEF}/tmp/${hexid}`;
      break;
  }
  !fs.existsSync(fullpathname) && shell.mkdir("-p", fullpathname);
  return new Promise((resolve, reject) => {
    datainbase64 = datainbase64.replace(/^data:image\/png;base64,/, "");
    datainbase64 = datainbase64.replace(/^data:image\/jpg;base64,/, "");
    datainbase64 = datainbase64.replace(/^data:image\/jpeg;base64,/, "");
    datainbase64 = datainbase64.replace(/^data:image\/gif;base64,/, "");
    //    datainbase64 = datainbase64.replace(/^data:image\/gif;base64,/, "")
    let fullpathfilename = `${fullpathname}/${filename}`;
    fs.writeFile(fullpathfilename, datainbase64, "base64", function (err) {
      // filename
      if (err) {
        console.log("ADlwE6Rctw", err);
        resolve(null);
        return;
      }
      resolve(fullpathfilename);
    });
  });
};
const compose_filename = (hexid, filename) => {
  const fullpathname = `${PATH_STORE_DEF}/repo/${hexid}`;
  let fullpathfilename = `${fullpathname}/${filename}`;
  return fullpathfilename;
};
const compose_url = (hexid, filename) => {
  return `http://itemverse1.net/repo/${hexid}/${filename}`;
};

module.exports = { storefile_from_base64data, compose_filename, compose_url };
