
const KEYS=Object.keys
const {findone , findall , countrows_scalar }=require('../utils/db')
const db=require('../models')
const { findone : findone_mon }=require('./dbmon')
const cliredisa=require('async-redis').createClient()
const {getMaxMinAvg}=require('./stats') 

const {ISFINITE , LOGGER }=require('../utils/common')

const queryuserdata=async ( username ) =>{
  let aproms=[]
  return new Promise(async(resolve,reject)=>{
    if( username ){} else {resolve(null)}
		let aproms=[]
    aproms[aproms.length]= findone('users', { username })
		aproms[aproms.length]= findone_mon('users', {username} )			
		Promise.all ( aproms).then(resp=>{
			resolve( {maria : resp[0] , mongo : resp[1] } )
		}).catch(err=>{			LOGGER( err )
			resolve ( null )
		})
	})
}

////////
module.exports={
	queryuserdata 
}

