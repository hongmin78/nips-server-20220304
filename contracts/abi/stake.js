

const abi =[
	{
		name : 'stake'
		, inputs : [
				{ type : 'address' , name : '_stake_token' } // <= usdt
			, { type : 'uint256' , name : '_amounttostake' }   // <= 100_000000_000000_000000
			, { type : 'address' , name : '_to' }  // 		 
		]
		, outputs : [ ]
		, type: 'function'
		,    payable: true 
		,    constant: true,
	}
	, { name : '_balances'
		, inputs :[
			{ type: 'address' , name : '_address' }
		]
		, outputs : [ 
			{ type: 'uint256' , name: 'balances_'}
		]
		, type: 'function'
		, payable: false
		, constant: true,
	}
	, { name : '_tvl'
		, inputs :[
		]
		, outputs : [ 
			{ type: 'uint256' , name: 'tvl_'}
		]
		, type: 'function'
		, payable: false 
		, constant: true,
	}
	, { name : '_tvl_nft'
		, inputs :[
		]
		, outputs : [ 
			{ type: 'uint256' , name: 'tvl_'}
		]
		, type: 'function'
		, payable: false 
		, constant: true,
	}

]
module.exports= {
	abi
}

