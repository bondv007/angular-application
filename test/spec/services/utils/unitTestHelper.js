/**
 * Created by Ofir.Fridman on 8/13/14.
 */
function unitTestHelper() {
	function getRandomPositiveInt(asString) {
		var res = _.random(1, Number.MAX_VALUE);
		if (asString) {
			res = String(res);
		}
		return res;
	}

	function getRandomNegativeInt(asString) {
		var res = _.random(-100000000, -1);
		if (asString) {
			res = String(res);
		}
		return res;
	}

	function getRandomInt(asString) {
		var res = _.random(Number.MIN_VALUE, Number.MAX_VALUE);
		if (asString) {
			res = String(res);
		}
		return res;
	}

	function getRandomPositiveFloat(max,asString){
		if(max == null){
			max = 1000;
		}
		var res = _.random(max,true);
		if (asString) {
			res = String(res);
		}
		return res;
	}

	function getRandomNegativeFloat(max,asString){
		if(max == null){
			max = 1000;
		}
		var res = -1 * _.random(max,true);
		if (asString) {
			res = String(res);
		}
		return res;
	}

	function getRandomAlphabetChar() {
		var alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		return alphabet[_.random(0, alphabet.length - 1)];
	}

	function getUUID() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}

		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	}

	function getRandomString(length) {
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		var string_length = (length) ? length : 8;
		var randomstring = '';
		for (var i = 0; i < string_length; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			randomstring += chars.substring(rnum, rnum + 1);
		}
		return randomstring;
	}

	return {
		getRandomPositiveInt: getRandomPositiveInt,
		getRandomNegativeInt: getRandomNegativeInt,
		getRandomInt: getRandomInt,
		getRandomPositiveFloat:getRandomPositiveFloat,
		getRandomNegativeFloat:getRandomNegativeFloat,
		getRandomAlphabetChar: getRandomAlphabetChar,
		getUUID: getUUID,
		getRandomString: getRandomString
	}
}