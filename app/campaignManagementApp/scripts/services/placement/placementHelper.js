'use strict';

app.service('placementHelper', [function () {

	function isEmptyOrNull(val) {
		return _.isNull(val) || _.isEmpty(val);
	}

	/**
	 * Check if a number is integer
	 * @param {Number} num
	 * @param {equal value and equal type} useExactlyEqual
	 * @return {Boolean} isInteger
	 */
	function isInt(num,useExactlyEqual) {
		var isInteger;
		if(useExactlyEqual === true){
			isInteger = num === Math.round(num);
		}
		else{
			isInteger = num == Math.round(num);
		}
		return isInteger;
	}

	return {
		isEmptyOrNull:isEmptyOrNull,
		isInt:isInt
	};
}]);
