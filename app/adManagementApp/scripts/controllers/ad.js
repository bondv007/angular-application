/**
 * Created by alon.shemesh on 2/23/14.
 */
'use strict';
app.controller('adCtrl', ['$scope', '$rootScope', '$stateParams',  'EC2Restangular', '$filter', '$state', '$timeout',
	'mmModal', 'adService', 'baseAdBl', 'configuration', 'enums', 'mmAlertService',
	function($scope, $rootScope, $stateParams, EC2Restangular, $filter, $state, $timeout, mmModal, adService, baseAdBl, configuration, enums, mmAlertService)
	{
		$scope.type= 'masterAd';
		$scope.entityId = $stateParams.adId;
		$scope.entityActions =[];
    $scope.entityActions.parentMenuItem = 'Creative';
    var masterAdGoToData = {
      links: [
        {type: 'Master ad id', namePath: 'id', sref: 'spa.ad.adEdit', paramKey: 'adId', paramPath: 'id'},
        {type: 'Creative Manager', namePath: 'adAssignmentData.accountName', sref: 'spa.account.accountEdit', paramKey: 'accountId', paramPath: 'adAssignmentData.accountId'},
        {type: 'campaign', namePath: 'adAssignmentData.campaignName', sref: 'spa.campaign.campaignEdit', paramKey: 'campaignId', paramPath: 'adAssignmentData.campaignId'},
        {type: 'advertiser', namePath: 'adAssignmentData.advertiserName', sref: 'spa.advertiser.advertiserEdit', paramKey: 'advertiserId', paramPath: 'adAssignmentData.advertiserId'},
        {type: 'brand', namePath: 'adAssignmentData.brandName', sref: 'spa.brand.brandEdit', paramKey: 'brandId', paramPath: 'adAssignmentData.brandId'},
        {type: 'placements Ads', namePath: 'numberOfPlacementAds', sref: 'spa.campaign.placementAdList', paramKey: 'masterAdId', paramPath: 'numberOfPlacementAds'}
      ],
      actions: [
        { name: 'New Master Ad', func: adService.addNewMasterAd },
        { name: 'Duplicate', func: duplicateAd },
        { name: 'Delete', func: deleteAds}
      ]};

    if($scope.$parent.isActive) $scope.$parent.isActive($scope.entityActions.parentMenuItem);

		$scope.cancel = function() {
			$state.go("spa.adList");
		};

		$scope.getAsset = function(id){
			return _.findWhere($scope.assets, {'id': id});
		};

    $scope.goToData = masterAdGoToData;

    function duplicateAd(){
      baseAdBl.duplicateAdIDs($state.params.adIds)
    }
    function deleteAds(){
      baseAdBl.deleteAdIDs($state.params.adIds);
    }
	}]);
