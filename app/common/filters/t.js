angular.module('mm.common.filters').filter('T', ['$filter', function ($filter) {
	return function (arg1, arg2) {
		return $filter('translate')(arg1, arg2);
	};
}]);
