
const USERAGENTLENGTH=200
const getuseragent=req=>req.headers['user-agent'].substr(0,USERAGENTLENGTH)
const getipaddress=(req)=>{	return req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.headers['x-real-ip']}
const getusernamefromsession=req=>{return req.username || req.headers.username}

module.exports={
	getuseragent
	, getipaddress
	, getusernamefromsession
}
