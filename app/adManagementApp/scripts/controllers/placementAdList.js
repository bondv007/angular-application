/**
 * Created by alon.shemesh on 13/4/14.
 */
'use strict';

app.controller('placementAdListCtrl', ['$scope', '$state','EC2Restangular', 'adService','assetsLibraryService', 'enums','$stateParams', 'infraEnums', 'mmAlertService', 'baseAdBl', '$modal', 'mmModal',
	function ($scope, $state, EC2Restangular, adService, assetsLibraryService, enums, $stateParams, infraEnums, mmAlertService,  baseAdBl,  $modal, mmModal) {
		var adServiceUrl = 'ads';
		$scope.hideGoTo = true;
		$scope.alerts = [];
		$scope.master = {};

		var accountId = 1;
		var oneMB =1048576;
		var oneKB =1024;
		var serverCampaigns = EC2Restangular.all('campaigns');
		$scope.entityId = accountId;
		$scope.type = 'Creative Central';
		$scope.adFormats = enums.adFormats;

		var serverAccounts = EC2Restangular.all('accounts');
		var centralAdsActions = [
			{ name: 'Duplicate', func: baseAdBl.duplicateAds, disableFunc:editAdsActionManipulator}, //the disable func handle edit button behavior.
			{ name: 'Delete', func: deleteAds, disableFunc: baseAdBl.enableDeleteButton},
      { name: 'Assign', items:[
        { name: 'Assign to Campaign', func: assignAdToCampaign, disableFunc: changeStateAssignAdToCampaign},
        { name: 'Assign to Campaign Manager', func: assignAdToCampaignManager,  disableFunc: changeStateAssignAdToCampaignManager}
      ] ,disableFunc: changeStateAssignAdToCampaign},
			{ name: 'Preview', func: previewAd, relationType: infraEnums.buttonRelationToRowType.any}];/*,
		 { name: 'Send Ad to QA', func: sendAdToQA, relationType: infraEnums.buttonRelationToRowType.any}];*/ //To-do- remove when comment when back to scope (also in list/Entity)

		var centralPlacementAdActions = [
			{ name: 'Duplicate', func: baseAdBl.duplicateAds, relationType: infraEnums.buttonRelationToRowType.any},
			{ name: 'Preview', func: previewAd, relationType: infraEnums.buttonRelationToRowType.any}
		];
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
        { name: 'Duplicate', func:  duplicateAds },
        { name: 'Delete', func: deleteAds}
      ]};
    var placementAdGoToData = {
      links: [
        {type: 'Placement Ad id', namePath: 'id', sref: 'spa.ad.adEdit', paramKey: 'adId', paramPath: 'id'},
        {type: 'Master ad id', namePath: 'id', sref: 'spa.ad.adEdit', paramKey: 'adId', paramPath: 'masterAdd'},
        {type: 'Creative Manager', namePath: 'adAssignmentData.accountName', sref: 'spa.account.accountEdit', paramKey: 'accountId', paramPath: 'adAssignmentData.accountId'},
        {type: 'campaign', namePath: 'adAssignmentData.campaignName', sref: 'spa.campaign.campaignEdit', paramKey: 'campaignId', paramPath: 'adAssignmentData.campaignId'},
        {type: 'advertiser', namePath: 'adAssignmentData.advertiserName', sref: 'spa.advertiser.advertiserEdit', paramKey: 'advertiserId', paramPath: 'adAssignmentData.advertiserId'},
        {type: 'brand', namePath: 'adAssignmentData.brandName', sref: 'spa.brand.brandEdit', paramKey: 'brandId', paramPath: 'adAssignmentData.brandId'},
        {type: 'placement', namePath: 'placementName', sref: 'spa.placement.placementEdit', paramKey: 'placementId', paramPath: 'placementId'},
        {type: 'site', namePath: 'siteName', sref: 'spa.site.siteEdit', paramKey: 'siteId', paramPath: 'siteId'}

      ],
      actions: [
        { name: 'New Master Ad', func: adService.addNewMasterAd },
        { name: 'Duplicate', func: duplicatePlacementAds},
        { name: 'Delete', func: deletePlacementAds}
      ]};
		$scope.centralDataObject = [
			{ type: 'masterAd', centralActions: centralAdsActions, goToData: masterAdGoToData, dataManipulator: manipulateMaster, isEditable: false, filters: adService.createAdListFilter("masterAd", $stateParams.campaignId)},
			{ type: 'placementAd', centralActions: centralPlacementAdActions, goToData: placementAdGoToData, dataManipulator: adChanger, isEditable: true, hideAddButton:true, filters: adService.createAdListFilter("placementAd", $stateParams.campaignId)}
		];

		function previewAd(list, selectedItems)	{
			if(selectedItems.length === 1){
				var url = $state.href("adPreview", {adId: selectedItems[0].id, sid: 'mdx3', mdx2: false});
				window.open(url,'_blank');
				//$state.go("adPreview", {adId: selectedItems[0].id, sid: 'mdx3', mdx2: false});
			}
			else{
				var adIds = '';
				for (var i = 0; i < selectedItems.length; i++) {
					adIds = adIds + selectedItems[i].id + '|';
				}
				adIds = adIds.substring(0, adIds.length - 1);
				var url = $state.href("csbAdPreview", {adIds: adIds});
				window.open(url,'_blank');
				//$state.go("csbAdPreview", {adIds: adIds});
			}
		}

		function history(list, selectedItems)	{
			if(selectedItems.length === 1){
				mmHistory.open(selectedItems[0].id, 'Ad');
			}
		}

    function assignAdToCampaignManager(selectedItems)	{

      if ($scope.isModalOpen) {
        return;
      }

      if (!selectedItems || selectedItems.length == 0){
        mmAlertService.addError("No ads selected");
        return;
      }

      $scope.isModalOpen = true;
      var modalInstance = mmModal.open({
        templateUrl: './adManagementApp/views/attachAdToCampaignManager.html',
        controller: 'attachAdToCampaignManagerCtrl',
        title: "Assign To Campaign Manager",
        modalWidth: 600,
        bodyHeight: 450,
        confirmButton: { name: "Apply", funcName: "assign", hide: false, isPrimary: true},
        discardButton: { name: "Close", funcName: "cancel" },
        resolve: {
          ads: function() {
            return  selectedItems;
          },
          campaignManagers: function() {
            return EC2Restangular.all('accounts').getList();
          },

          advertisers : function() {
            return EC2Restangular.all('advertisers').getList();
          },
          multipleAttach: function(){
            return false;
          }
        }
      });

      modalInstance.result.then(function (ads) {
        $scope.isModalOpen = false;
        if(ads && ads[0]){}
      }, function () {
        $scope.isModalOpen = false;
      });
    }

    function assignAdToCampaign(selectedItems)	{

      if ($scope.isModalOpen) {
        return;
      }

      if (!selectedItems || selectedItems.length == 0){
        mmAlertService.addError("No ads selected");
        return;
      }

      var assignedAds = _.filter(selectedItems, function(ad){
        return (ad.campaignId && ad.campaignId !== '');
      });

      if(assignedAds.length > 0){
        mmAlertService.addError("One or more of the ads you have selected is all ready assigned, you must first un assign it.");
        return;
      }

      $scope.isModalOpen = true;

      var modalInstance = $modal.open({
        templateUrl: './adManagementApp/views/attachAdToCampaign.html',
        controller: 'attachAdToCampaignCtrl',
        windowClass: 'assign-campaign',
        confirmButton: { name: "Done", funcName: "save", hide: false, isPrimary: true},
        discardButton: { name: "Close", funcName: "cancel" },
        resolve: {
          ads: function() {
            return selectedItems;
          },
          campaigns : function(){
            return EC2Restangular.all('campaigns').getList();
          },
          multipleAttach: function(){
            return true;
          },
          accounts : function(){
            return $scope.accounts;
          }
        }
      });

      modalInstance.result.then(function (ad) {
        $scope.isModalOpen = false;
        $scope.centralDataObject[0].refreshCentral();
      }, function () {
        $scope.isModalOpen = false;
      });
    }
    function changeStateAssignAdToCampaign(items){
      if(items.length && items.length > 0){
        for(var i=0; i < items.length; i++){
          var isDisable = baseAdBl.checkNumberOfPlacementAds(items[i]);
          if(isDisable){
            return isDisable;
          }
        }
        return false;
      }
      else{
        return true;
      }
    }
    function changeStateAssignAdToCampaignManager(items){
      if(items.length && items.length > 0){
        for(var i=0; i < items.length; i++){
          var isDisable = baseAdBl.checkNumberOfPlacementAds(items[i]);
          if(!isDisable){
            isDisable = checkAssigntToAnotherCampaignManager(items[i]);
            if(isDisable){
              return true;
            }
          }
          else{
            return true;
          }
        }
      }
      else{
        return true;
      }
    }

    function sendAdToQA(list, selectedItems)	{
			adService.sendAdToQA($scope, selectedItems)
		}

		function duplicateAsset(list, selectedItems) {
			alert('todo copyAd');
		}

		function preview(list, selectedItems) {
			alert('todo copyAd');
		}

		function addAd() {
			changeView("spa.ad.adEdit");
		}

		function changeView(view) {
			$state.go(view);
		}

		function copiesRemoval(ads){
			for (var i = 0; i < ads.length; i++){
				if(ads.masterAdId != ""){
					ads.remove(ads[i]);
				}
				$scope.ads= ads;
			}
		}

		function manipulateMaster(ads){
			if($stateParams.adId){
				for(var i = ads.length -1; i >= 0 ; i--){
					if(ads[i].id !== $stateParams.adId){
						ads.splice(i, 1);
					}
				}
			}
			$scope.ads = ads;
			for (var i = 0; i < $scope.ads.length; i++){
				fillExternalData($scope.ads[i]);
			}
		}

		function adChanger(masterAdsPlacementAds) {
			for (var i = 0; i < masterAdsPlacementAds.length; i++) {
				masterAdsPlacementAds[i].adsIds = [];
				masterAdsPlacementAds[i].adsIds.push(masterAdsPlacementAds[i].masterAdId);
				adService.fillFormat(masterAdsPlacementAds[i]);
				masterAdsPlacementAds[i].differentFromMaster = masterAdsPlacementAds[i].changed ? "Yes" : " No";
				masterAdsPlacementAds[i].overallSizeParsed = assetsLibraryService.parseSizeFromBytes(masterAdsPlacementAds[i].overallSize);
			}
		}

		function fillExternalData(ad){
			ad.overallSizeParsed = assetsLibraryService.parseSizeFromBytes(ad.overallSize);
			ad.dimensions = assetsLibraryService.getAssetDimension(ad.defaultImage);
		}

		function processError(error) {
			$scope.showSPinner = false;
			mmAlertService.addError(error);
		}

		function func1(){
			alert('todo');
		}

		function editAdsActionManipulator(items){
			if(_.filter(items, {"createdByHTML5Factory":true}).length == 1){
				if(centralAdsActions[0].name != 'Edit'){
					centralAdsActions.unshift( { name: 'Edit', items:[
						{ name: 'Edit', func: editAds, disableFunc: editAds},
						{ name: 'Edit in HTML5 Factory', func: gotoFactory}]});
					$scope.centralDataObject[0].isEditable = false;
				}
			}
			else{
				if(centralAdsActions[0].name === 'Edit'){
					centralAdsActions.splice(0,1);
				}
				$scope.centralDataObject[0].isEditable = true;
			}
		}

		function gotoFactory(list, selectedItems)	{
			adService.gotoFactory($scope.$root.loggedInUserAccountId, $scope.$root.loggedInUserId, $scope.$parent.$parent.$parent.currentLanguage, selectedItems);
		}

		function editAds() {
			$scope.centralDataObject[0].openEntral();
		}

    function duplicateAds() {
      baseAdBl.duplicateAds($scope.centralDataObject[0].centralList , $scope.centralDataObject[0].selectedItems);
    }

    function deleteAds(){
      baseAdBl.deleteAds($scope.centralDataObject[0].centralList , $scope.centralDataObject[0].selectedItems).then(function (){
        $scope.centralDataObject[0].openEntral(false);});
    }

    function duplicatePlacementAds() {
      baseAdBl.duplicateAds($scope.centralDataObject[1].centralList , $scope.centralDataObject[1].selectedItems);
    }

    function deletePlacementAds(){
      baseAdBl.deleteAds($scope.centralDataObject[1].centralList , $scope.centralDataObject[1].selectedItems).then(function (){
        $scope.centralDataObject[1].openEntral(false);
      });
    }

  }]);
