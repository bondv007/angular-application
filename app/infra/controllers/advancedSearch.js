'use strict';

app.controller('advancedSearchCtrl', ['$scope', '$window', 'advancedSearchService', function ($scope, $window, advancedSearchService) {
	$scope.selectedSearchType = '';
	$scope.filterBy = { };

	$scope.search = {};
	var campaignsFilters = advancedSearchService.campaignFilters();
	var placementsFilters = advancedSearchService.placementFilters();
	var adsFilters = advancedSearchService.adFilters();

	$scope.searchResults = advancedSearchService.getCampaigns('');
	$scope.filterResults = campaignsFilters;

	$scope.setFilter = function (filterName, filterValue, isTrue) {
		if (isTrue) {
			$scope.filterBy[filterName] = filterValue;
		}
		else {
			$scope.filterBy[filterName] = '';
		}
	};
	$scope.orderFunc = function (vals) {
		return vals.length;
	};
	$scope.changeSearch = function (searchFor) {
		$scope.filterBy = {  };
		if (searchFor == 'campaign') {
			$scope.searchResults = advancedSearchService.getCampaigns('');
			$scope.filterResults = campaignsFilters;
			$scope.search = {};
		}
		else if (searchFor == 'placement') {
			$scope.searchResults = advancedSearchService.getPlacements('');
			$scope.filterResults = placementsFilters;
			$scope.search = {};
		}
		else if (searchFor == 'ad') {
			$scope.searchResults = advancedSearchService.getAds('');
			$scope.filterResults = adsFilters;
		}
		else {
			$scope.searchResults = [];
			$scope.filterResults = [];
			$scope.search = {};
		}
	};
}]);
