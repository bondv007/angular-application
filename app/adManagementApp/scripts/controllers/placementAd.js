/**
 * Created by alon.shemesh on 2/23/14.
 */
'use strict';
app.controller('placementAdCtrl', ['$scope', '$rootScope', '$stateParams',  'EC2Restangular', '$filter', '$state', '$timeout',
	'mmModal', 'adService', 'configuration', 'enums', 'mmAlertService',
	function($scope, $rootScope, $stateParams, EC2Restangular, $filter, $state, $timeout, mmModal, adService, configuration, enums, mmAlertService)
	{
		$scope.type= 'placementAd';
		$scope.entityId = $stateParams.adId;
		$scope.entityActions =[];
    $scope.entityActions.parentMenuItem = 'Creative';
    var placementAdGoToData = {
      links: [

        {type: 'Placement Ad id', namePath: 'id', sref: 'spa.ad.adEdit', paramKey: 'adId', paramPath: 'id'},
        {type: 'Master ad id', namePath: 'masterAdId', sref: 'spa.ad.adEdit', paramKey: 'adId', paramPath: 'masterAdId'},
        {type: 'Creative Manager', namePath: 'adAssignmentData.accountName', sref: 'spa.account.accountEdit', paramKey: 'accountId', paramPath: 'adAssignmentData.accountId'},
        {type: 'campaign', namePath: 'adAssignmentData.campaignName', sref: 'spa.campaign.campaignEdit', paramKey: 'campaignId', paramPath: 'adAssignmentData.campaignId'},
        {type: 'advertiser', namePath: 'adAssignmentData.advertiserName', sref: 'spa.advertiser.advertiserEdit', paramKey: 'advertiserId', paramPath: 'adAssignmentData.advertiserId'},
        {type: 'brand', namePath: 'adAssignmentData.brandName', sref: 'spa.brand.brandEdit', paramKey: 'brandId', paramPath: 'adAssignmentData.brandId'},
        {type: 'placement', namePath: 'placementName', sref: 'spa.placement.placementEdit', paramKey: 'placementId', paramPath: 'placementId'},
        {type: 'site', namePath: 'siteName', sref: 'spa.site.siteEdit', paramKey: 'siteId', paramPath: 'siteId'}

      ],
      actions: [
        { name: 'New Master Ad', func: adService.addNewMasterAd },
        { name: 'Duplicate', func: duplicateAds },
        { name: 'Delete', func: deleteAds}
      ]};
    if($scope.$parent.isActive) $scope.$parent.isActive($scope.entityActions.parentMenuItem);



		$scope.cancel = function() {
			$state.go("spa.adList");
		};

		$scope.getAsset = function(id){
			return _.findWhere($scope.assets, {'id': id});
		};
    $scope.goToData = placementAdGoToData;

    function deleteAds(){
      baseAdBl.deleteAds($scope.centralDataObject[0].centralList , $scope.centralDataObject[0].selectedItems);
    }
    function duplicateAds() {
      baseAdBl.duplicateAds($scope.centralDataObject[0].centralList , $scope.centralDataObject[0].selectedItems);
    }

/*
		$scope.openAssignCampaignModal = function () {
			if ($scope.isModalOpen) {
				return;
			}
			$scope.isModalOpen = true;
			var modalInstance = $modal.open({
				windowClass: "app-modal-window",
				templateUrl: './adManagementApp/views/attachAdToCampaign.html',
				controller: 'attachAdToCampaignCtrl',
				resolve: {
					ad: function() {
						return  $scope.ad;
					},
					campaigns : function() {
						return $scope.campaigns;
					},
					accounts : function() {
						return $scope.accounts;
					}
				}
			});
			modalInstance.result.then(function () {
				console.log('save');
				$scope.isModalOpen = false;
				//$state.reload(); //not working because of a bug
				//$state.transitionTo($state.current, $stateParams, { reload: true, inherit: false, notify: true }); // refresh too much

			}, function () {
				console.log('cancel');
				$scope.isModalOpen = false;
			});
		};*/
	}]);
