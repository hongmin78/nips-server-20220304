const rmqq = 'tasks'
const rmqopen = require('amqplib').connect('amqp://localhost')
const STRINGER=JSON.stringify
const { respok, resperr } = require("../utils/rest");
const mqpub=jdata=>{
	let mstr= STRINGER( jdata )
	rmqopen.then(function(conn) {
	  return conn.createChannel();
	}).then(function(ch) {
  	return ch.assertQueue(rmqq).then(function(ok) {
	//		respok ( res ) 
    	return ch.sendToQueue(rmqq, Buffer.from( mstr ));
	  });
	}).catch(err=> { console.warn(err) 
		// resperr(res, 'INTERNAL-ERR' ) 
	})
}
module.exports={
	mqpub
}

