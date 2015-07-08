(function (angular, window) {
	'use strict';
//Usage:------------
//	.controller('MyCtrl', ['$scope,' 'safeApply', function($scope, safeApply) {
//
//		safeApply($scope);                     // no function passed in
//
//		safeApply($scope, function() {   // passing a function in
//
//		});
//
//	}])

	angular.module('SafeApply', []).factory('$safeApply', ['$rootScope', function ($rootScope) {
		return function ($scope, fn) {
			var phase;
			if (!$scope.$root) {
				//if we are here means root is null.
				$scope.$apply();
			}
			else {
				phase = $scope.$root.$$phase;
				if (phase == '$apply' || phase == '$digest') {
					if (fn) {
						$scope.$eval(fn);
					}
				} else {
					if (fn) {
						$scope.$apply(fn);

					} else {
						$scope.$apply();
					}
				}
			}
		}
	}]).run(['$safeApply', function () {}]);
}(this.angular, this));