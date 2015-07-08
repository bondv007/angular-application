'use strict';
app.service('monitorService', ['$rootScope', '$window', function ($rootScope, $window) {
	var self = this;
	angular.element($window).on('storage', function (event) {
		$rootScope.$broadcast("syncMonitorData");
		//$rootScope.$apply();
        if (!$rootScope.$$phase) $rootScope.$apply();
	});
	self.setData = function (key, data) {
		if (typeof(Storage) !== "undefined") {
			self.deleteByKey(key);//remove key first
			$window.localStorage.setItem(key, JSON.stringify(data));
		} else {
			console.warn("Sorry! No Web Storage support..")
		}
	};
	self.getData = function (key) {
		return JSON.parse($window.localStorage.getItem(key));
	};
	self.deleteByKey = function (key) {
		$window.localStorage.removeItem(key);
	};
}]);
