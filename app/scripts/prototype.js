/**
 * Created by yoav.karpeles on 26/3/2014.
 */

/** [].getByProperty(<propertyName>, <value>)
 *			get the object inside the array that contain a property that equals to this value
 *		 	work best for properties with unique values
 *		example:
 *		[{id: 'a', name: 'qwe'}, {id: 'b', name: 'rty'}, {id: 'c', name: 'uio'}].getByProperty('id', 'c') == {id: 'c', name: 'uio'}
 *
 *		[{id: 'a', name: 'qwe'}, {id: 'b', name: 'rty'}, {id: 'c', name: 'uio'}].getByProperty('name', 'rty') == {id: 'b', name: 'rty'}
 */

/** [].getById(<value>)
 * 			do: getByProperty('id', <value>)
 *			example:
 *		[{id: 'a', name: 'qwe'}, {id: 'b', name: 'rty'}, {id: 'c', name: 'uio'}].getById('c') == {id: 'c', name: 'uio'}
 */

var listOfFunctionModArray = ['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'];
for (var i = 0; i < listOfFunctionModArray.length; i++) {
	var name = listOfFunctionModArray[i];
	Array.prototype['_old' + name] = Array.prototype[name];
	Array.prototype[name] = function(name) {return function() {
		delete(this._mmHash);
		return this['_old' + name].apply(this, arguments);
	}}(name);
}

Array.prototype.getByProperty = function(propertyName, value) {
	if (this._mmHash === undefined) {
		this._mmHash = {};
	}
	if (this._mmHash[propertyName] === undefined) {
		var p = this._mmHash[propertyName] = {};
		for (var i = 0 ; i < this.length; i++) {
			p[this[i][propertyName]] = i;
		}
	}
	var index = this._mmHash[propertyName][value];
	if (index === undefined) {
		return undefined;
	}
	return this[index];
};

Array.prototype.getById = function(value) {
	return this.getByProperty('id', value);
};

