
const getMaxMinAvg = arr => {
	 if ( arr && arr.length ){}
	 else {return [ null , null , null , null ]}
	let max = arr[0];
	let min = arr[0];
	let sum = arr[0];
	let idxminval = 0
	for (var i = 1; i < arr.length; i++){		
		if (arr[i] > max){
			max = arr[i]
		}
		if (arr[i] < min){
			min = arr[i];
			idxminval = i 
		}
		sum = sum + arr[i];
	}
	return [max, min, sum / arr.length , idxminval ]
}

module.exports={
	getMaxMinAvg 
}
