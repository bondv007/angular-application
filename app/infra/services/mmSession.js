/*
to use mmSession:

add/change:
	mmSession.set(name, nameObj, mmSession.storage.disk); // last argument optional - default: memory


retrieve:
	mmSession.get(name, defaultValue)

subscribe:
	$scope.mmSubscribe('name', function (scope, newNameObj, oldNameObj) {
		$scope.whatever = newNameObj.property;
	});

 */

app.service('mmSession', ['$rootScope', 'webStorage', function ($rootScope, ws) {
	var memory = {};

	var _storage = {
		'memory': 1,
		'session': 2,
		'disk': 3
	};

	var _get = function (name, defaultValue) {
		// return value
		var value = memory[name];
		if (value === undefined) {
			value = ws.get(name);
			memory[name] = value === undefined ? null : value;
		}
		return value == null ? defaultValue : value;
	};

	var _set = function (name, newValue, storageType) {
		var oldValue = memory[name];
		if (oldValue === undefined) {
			oldValue = ws.get(name);
		}
		memory[name] = newValue;
		if (storageType === _storage.session) {
			ws.session.add(name, newValue);
		}
		if (storageType === _storage.disk) {
			ws.local.add(name, newValue);
		}
		$rootScope.$emit('mmSession.' + name, newValue, oldValue);
	};

	var _remove = function (name, storageType) {
		delete memory[name];
		if (storageType === _storage.session) {
			ws.session.remove(name);
		}
		if (storageType === _storage.disk) {
			ws.local.remove(name);
		}
	};

	var _removeStartWith = function (startsWith, storageType){
		var currentStorage;
		var myLength = startsWith.length;
		if (storageType === _storage.session) {
			currentStorage = ws.session;
		}
		if (storageType === _storage.disk) {
			currentStorage = ws.local;
		}


		for (var storageKey in memory){
			if (storageKey.substring(0,myLength) == startsWith){
				currentStorage.remove(storageKey);
			}
		}
	}



	return {
		set: _set,
		get: _get,
		remove: _remove,
		removeAllStartWith: _removeStartWith,
		storage: _storage
	}
}]);

app.config(['$provide', function($provide){
	$provide.decorator('$rootScope', ['$delegate', function($delegate){
		Object.defineProperty($delegate.constructor.prototype, 'mmSubscribe', {
			value: function(name, listener){
				var unsubscribe = $delegate.$on('mmSession.' + name, listener);
				this.$on('$destroy', unsubscribe);
			},
			enumerable: false
		});
		return $delegate;
	}]);
}]);