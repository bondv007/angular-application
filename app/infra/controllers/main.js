'use strict';

app.controller('MainCtrl', ['$scope', 'recentItemsService', '$state','$modal','mmModal', 'adService',
	function ($scope, recentItemsService,$state,$modal, mmModal, adService) {
	$scope.filterBy = { type: ''};
	$scope.filterOptions = ['All Items', 'Pinned Items', 'Campaigns', 'Placements', 'Ads', 'Accounts', 'Users'];
  $scope.isModalOpen = false;

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

  function showUploadAssetModal() {

    if ($scope.isModalOpen) {
      return;
    }
    $scope.isModalOpen = true;

		var adDetails = adService.getAdDetailsForUpload(false, false, null, null, null);

    var modalInstance = $modal.open({
      templateUrl: './adManagementApp/views/uploadAsset.html',
      controller: 'uploadAssetCtrl',
      windowClass: 'upload-newux',
      backdrop: 'static',
			resolve: {
				adDetailsForUpload: function () {
					return adDetails;
				}
			}
    });
    modalInstance.result.then(function () {
      $scope.isModalOpen = false;
    }, function () {
      $scope.isModalOpen = false;
    });
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
			{ name: 'Upload Creative Assets', func:showUploadAssetModal },
			{ name: 'Mass Create Standard Banners' }
		]}
	];
	$scope.recentlyViewedItems = recentItemsService.recentlyViewedItems;
}]);
