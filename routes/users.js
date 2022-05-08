var express = require("express");
var router = express.Router();
const { REFERERCODELEN } = require("../configs/configs");
const {
  findone,
  findall,
  createrow,
  updaterow,
  countrows_scalar,
  createorupdaterow,
  fieldexists,
  tableexists,
  updateorcreaterow,
  updaterows,
} = require("../utils/db");
const crypto = require("crypto");
const { respok, resperr } = require("../utils/rest");
const { generateSlug } = require("random-word-slugs");
const { LOGGER, generaterandomstr, generaterandomstr_charset, gettimestr, ISFINITE } = require("../utils/common");
const { messages } = require("../configs/messages");
const { isethaddressvalid } = require("../utils/validates");
const { TOKENLEN } = require("../configs/configs");
const { getuseragent, getipaddress } = require("../utils/session");
const db = require("../models");
const ejs = require("ejs");
const multer = require("multer");
const path = require("path");
const moment = require("moment");

const getfilename = (file) => {
  const ext = path.extname(file.originalname);
  const md5 = crypto.createHash("md5").update(file.originalname).digest("hex");
  return `${moment().unix()}-${md5}${ext}`;
};
const filehandler = multer({
  storage: multer.diskStorage({
    destination: "/var/www/html/usersProp",
    filename(req, file, cb) {
      cb(null, getfilename(file));
    },
  }),
  limits: { fileSize: 45 * 1024 * 1024 },
});

router.put("/:address", filehandler.single("file"), async (req, res) => {
  LOGGER("", req.file);
  let { address } = req.params;
  let { email, pw, image64 } = req.body;
  const filename = req.file.filename;
  if (filename === undefined) {
    resperr(res, "ERR-FILE-WRITE-ERR", null, { reason: "img-file" });
  }
  let imageurl = "https://nftinfinity.world/UsersProp/" + filename;
  if (email && pw) {
    await updateorcreaterow(
      "users",
      {
        username: address,
      },
      {
        profileimageurl: imageurl,
        email: email,
        pw: pw,
      }
    );
  } else {
    resperr(res, messages.MSG_ARGMISSING);
    return;
  }
  respok(res, null, { image64: image64 });
});

/* GET users listing. */
router.get("/info/:username", async(req, res) => {
  let { username } = req.params;
	let {nettype}=req.query
  findone("users", { username , nettype }).then(async(resp) => {
    if (resp) {
    } else {
      resperr(res, messages.MSG_DATANOTFOUND);
      return;
    }
		let respreferer = await findone('users', { myreferercode : resp.referer , nettype } )
    respok(res, null, null, { respdata: {
			... resp 
			, refereraddress : respreferer.username 
		} });
  });
});
router.get("/randomreferercode", (req, res) => {
  let code = generaterandomstr_charset(REFERERCODELEN, "notconfusing");
  respok(res, null, null, { payload: { code } });
});

router.post("/signup", (req, res) => {});
router.post("/login", async (req, res) => {
  const { address, cryptotype } = req.body;
  LOGGER("pM34zwlLCQ", req.body); //	respok(res);return
  if (address && cryptotype) {
  } else {
    resperr(res, messages.MSG_ARGMISSING);
    return;
  }
  let respfind = await findone("users", { username: address });
  if (respfind) {
  } else {
    resperr(res, messages.MSG_DATANOTFOUND);
    return;
  }

  const token = generaterandomstr(TOKENLEN);
  let username = address;
  createrow("sessionkeys", {
    username,
    token,
    useragent: getuseragent(req),
    ipaddress: getipaddress(req),
  }).then((resp) => {
    respok(res, null, null, { respdata: token });
  });
});
router.post("/login/crypto", async (req, res) => {
  const { address, cryptotype } = req.body;
  LOGGER("m9m9hptxoA", req.body); //	respok(res);return
  if (address && cryptotype) {
  } else {
    resperr(res, messages.MSG_ARGMISSING);
    return;
  }
  let isaddressvalid = isethaddressvalid(address); //  WAValidator.validate(address , cryptotype.toLowerCase() )
  if (isaddressvalid) {
  } else {
    resperr(res, messaegs.MSG_ARGINVALID);
    return;
  }
  const token = generaterandomstr(TOKENLEN);
  let username = address;
  createrow("sessionkeys", {
    username,
    token,
    useragent: getuseragent(req),
    ipaddress: getipaddress(req),
  }).then(async (resp) => {
    respok(res, null, null, { respdata: token });
    let respfind = await findone("users", { username });
    if (respfind) {
      return;
    } else {
    }
    const myreferercode = generaterandomstr_charset(8, "notconfusing");
    const nickname = generateSlug(3, { format: "sentence" }); //255**2 *301
    createrow("users", {
      username,
      type: 0,
      typestr: "CRYPTO",
      myreferercode,
      basecrypto: cryptotype,
      nickname,
    });
    /** .then(respcreate=>{
			createrow_mon('users',{
				id:respcreate.dataValues.id
				,	username
				, type: 0
				, typestr: 'CRYPTO'
				, myreferercode
				, basecrypto:cryptotype
				, nickname
			})
		}) */
  });
});
router.post("/logout", (req, res) => {
  LOGGER("/logout", req.headers.token);
  if (req.headers.token) {
  } else {
    resperrwithstatus(res, 403, messages.MSG_PLEASELOGIN, 36632);
    return;
  }
  db.sessionkeys
    .findOne({ where: { token: req.headers.token } })
    .then((respfind) => {
      if (respfind && respfind.dataValues) {
      } else {
        resperrwithstatus(res, 403, messages.MSG_PLEASELOGIN);
        return;
      }
      if (respfind.dataValues.active) {
      } else {
        resperrwithstatus(res, 412, messages.MSG_SESSIONEXPIRED);
        return;
      }
      respfind
        .update({ active: 0 })
        .then((respupdate) => {
          respok(res);
          /** 			let {dataValues}=respfind ;      if(dataValues.isoauth){} else {return}
      db.oauthsessions.findOne({where:{id:dataValues.idtooauthtable}}).then(respoauth=>{
        respupdate.update({active:0})
			}).catch(err=>{LOGGER('PCXENcujpp' ,err) ; resperr(res) })
*/
        })
        .catch((err) => {
          LOGGER("sHw1wZpAZ4", err);
          resperr(res);
        });
    })
    .catch((err) => {
      LOGGER("Cf9NiZEEY7", err);
      resperr(res);
    });
});
router.post("/email/auth", (req, res) => {
  const { email: emailaddress, authNum: code } = req.body; //  M_emailAuth.updateOne(
  findone("emailverifycode", { emailaddress, code }).then((resp) => {
    if (resp) {
    } else {
      resperr(res, messages.MSG_VERIFYFAIL);
      return;
    }
    updaterow("emailverifycode", { emailaddress, code }, { emailauth: true });
  });
});
const RESTRICT_EMAIL_REUSE_COUNT = 10;
router.post("/email/request", async (req, res) => {
  const { email, walletAddress } = req.body;
  const authNum = Math.floor(Math.random() * (9999 - 1) + 1);
  let respcountemail = await countrows_scalar("users", { email });
  if (ISFINITE(+respcountemail) && +respcountemail < RESTRICT_EMAIL_REUSE_COUNT) {
  } else {
    resperr(res, "EMAIL-REUSE-COUNT-EXCEEDED");
    return;
  }
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.mailId, pass: process.env.mailPw },
  });
  let emailForm;
  ejs.renderFile(__dirname + "/../template/authMail.ejs", { email, walletAddress, authNum }, (err, data) => {
    if (err) console.log(err);
    emailForm = data;
  });
  transporter.sendMail(
    {
      from: "nip",
      to: email,
      subject: "nip 인증메일",
      html: emailForm,
      attachments: [
        {
          filename: "logo.png",
          path: __dirname + "/../template/img/logo.png",
          cid: "logo",
        },
      ],
    },
    (error, info) => {
      if (error) {
        LOGGER(error); // res.status(400).send("이메일 전송 실패");
        resperr(res, messages.MSG_EMAIL_SEND_ERR);
        return;
      } else {
        let TABLENAME = "emailverifycode";
        findone(TABLENAME, { emailaddress: email }).then((resp) => {
          //     M_emailAuth.find({ email }, (err, item) => {
          if (resp) {
            LOGGER(resp); // console.log(item[0]);
            updaterow(
              TABLENAME, //) M_emailAuth.updateOne(
              { emailaddress: email },
              { code: authNum } // { $set: { authNum } },
            ).then((resp) => {
              // (err, res) => {
              LOGGER(resp);
            });
          } else {
            createrow(TABLENAME, {
              emailaddress: email,
              code: authNum,
              expiry: moment().unix() + 24 * 60 * 60 * 1000,
            });
          }
          setTimeout((_) => {
            deleterow(TABLENAME, { emailaddress: email });
          }, 24 * 60 * 60 * 1000);
          respok(res); //        res.status(200).send("이메일 전송 성공");
        });
      }
    }
  );
});

router.put("/user_active/:address", async (req, res) => {
  LOGGER("active", req.body);
  let { active } = req.body;
  let { address } = req.params;
  if (active === 1 || active === 0) {
    updaterow("users", { username: address }, { active: active }).then((resp) => {
      respok(res);
    });
  } else {
    resperr(res, "ARG-MISSING");
    return;
  }
});

module.exports = router;
