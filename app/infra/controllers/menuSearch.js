'use strict';

app.controller('menuSearchCtrl', ['$scope', 'searchService', function ($scope, searchService) {
	$scope.mmSearch = '';

	$scope.searchOptions = ['Placements', 'Campaigns', 'Ads'];

	$scope.mmSearchFor = function (term) {
		if (term && term != '') {
			$scope.mmSearch = term;
			searchService.search($scope.mmSearch);
		}
	}
}]);
