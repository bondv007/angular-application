'use strict';

app.controller('MainCtrl', ['$scope', 'recentItemsService', '$state', function ($scope, recentItemsService,$state) {
	$scope.filterBy = { type: ''};
	$scope.filterOptions = ['All Items', 'Pinned Items', 'Campaigns', 'Placements', 'Ads', 'Accounts', 'Users'];

	$scope.changeFilter = function (filterOption) {
		if (filterOption == 'All Items') {
			$scope.filterBy = { type: '' };
		}
		else if (filterOption == 'Pinned Items') {
			$scope.filterBy = { isPinned: true };
		}
		else {
			$scope.filterBy = { type: filterOption };
		}
	}


	function createNewCampaign(name) {
		alert(name);
	}
	function createNewAd() {
		$state.go("spa.ad.adEdit");
	}

	$scope.tasks = [
		{name: 'Media Tasks', actions: [
			{ name: 'Create new Campaign', func: createNewCampaign },
			{ name: 'Export Media Plan' },
			{ name: 'Import Media Plan' }
		]},
		{name: 'Creative Tasks', actions: [
			{ name: 'Create new Ad',func: createNewAd },
			{ name: 'Create Ad from Bundle' },
			{ name: 'Upload Creative Assets' },
			{ name: 'Mass Create Standard Banners' }
		]}
	];
	$scope.recentlyViewedItems = recentItemsService.recentlyViewedItems;
}]);
