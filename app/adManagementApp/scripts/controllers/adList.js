/**
 * Created by eran.nachum on 1/2/14.
 */
'use strict';

app.controller('adListCtrl', ['$scope', '$state', 'EC2Restangular', 'adService', 'assetsLibraryService', 'enums', 'mmModal', 'mmAlertService', '$stateParams', '$filter', 'baseAdBl', '$modal', 'infraEnums',
  function ($scope, $state, EC2Restangular, adService, assetsLibraryService, enums, mmModal, mmAlertService, $stateParams, $filter, baseAdBl, $modal, infraEnums) {
    var adServiceUrl = 'ads';

    $scope.hideGoTo = false;
    $scope.alerts = [];
    $scope.master = {};
    var oneMB = 1048576;
    var oneKB = 1024;
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
    var centralAdActions = [
      {name: 'Create', items: [
        { name: 'Create Ad From Bundle', func: showImportBundleModal},
        { name: 'Ad Creation Wizard', func: massCreate},
        { name: 'Design HTML5 Ad', func: gotoFactory }
      ]},
      { name: 'Duplicate', func: baseAdBl.duplicateAds, disableFunc: editAdsActionManipulator, relationType: infraEnums.buttonRelationToRowType.any}, //the disable func handle edit button behavior.
      { name: 'Delete', func: deleteAds, disableFunc: baseAdBl.enableDeleteButton},
      { name: 'Assign', items: [
        { name: 'Assign to Campaign', func: assignAdToCampaign, disableFunc: changeStateAssignAdToCampaign},
        { name: 'Assign to Campaign Manager', func: assignAdToCampaignManager, disableFunc: changeStateAssignAdToCampaignManager}
      ], disableFunc: changeStateAssignAdToCampaign},
      { name: 'Preview', func: previewAd, relationType: infraEnums.buttonRelationToRowType.any}
    ]
    /*,
     { name: 'Send Ad to QA', func: sendAdToQA}]*///To-do- remove when comment when back to scope (also in entity)


    $scope.centralDataObject = [
      { type: 'masterAd', goToData: masterAdGoToData, isEditable: true, isEditMultiple:true, disableEditButton: true, centralActions: centralAdActions, dataManipulator: manipulateAd, filters: adService.createAdListFilter("masterAd", $stateParams.campaignId) }
    ];


    function addAd() {
      changeView("spa.ad.adEdit");
    }

    function editAds() {
      $scope.centralDataObject[0].openEntral(true);
    }

    function previewAd(list, selectedItems) {
      if (!selectedItems instanceof Array || selectedItems.length === 1) {
        var url = '/#/adPreview/' + selectedItems[0].id + '/mdx3/false';
        window.open("http:" +  url, '');

        //$state.go("adPreview", {adId: selectedItems[0].id, sid: 'mdx3', mdx2: false});
      }
      else {
        var adIds = '';
        for (var i = 0; i < selectedItems.length; i++) {
          adIds = adIds + selectedItems[i].id + '|';
        }
        adIds = adIds.substring(0, adIds.length - 1);
        var url = $state.href("csbAdPreview.gridView", {adIds: adIds});
        window.open(url, '_blank');
        //$state.go("csbAdPreview", {adIds: adIds});
      }
    }

    function assignAdToCampaignManager(selectedItems) {

      if ($scope.isModalOpen) {
        return;
      }

      if (!selectedItems || selectedItems.length == 0) {
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
          ads: function () {
            return  selectedItems;
          },
          campaignManagers: function () {
            return EC2Restangular.all('accounts').getList();
          },

          advertisers: function () {
            return EC2Restangular.all('advertisers').getList();
          },
          multipleAttach: function () {
            return false;
          }
        }
      });

      modalInstance.result.then(function (ads) {
        $scope.isModalOpen = false;
        $scope.centralDataObject[0].refreshCentral();
      }, function () {
        $scope.isModalOpen = false;
      });
    }

    function assignAdToCampaign(selectedItems) {

      if ($scope.isModalOpen) {
        return;
      }

      if (!selectedItems || selectedItems.length == 0) {
        mmAlertService.addError("No ads selected");
        return;
      }

      var assignedAds = _.filter(selectedItems, function (ad) {
        return (ad.campaignId && ad.campaignId !== '');
      });

      if (assignedAds.length > 0) {
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
          ads: function () {
            return selectedItems;
          },
          campaigns: function () {
            return EC2Restangular.all('campaigns').getList();
          },
          multipleAttach: function () {
            return true;
          },
          accounts: function () {
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

    function sendAdToQA(list, selectedItems) {
      adService.sendAdToQA($scope, selectedItems)
    }

    function changeView(view) {
      $state.go(view);
    }

    function showImportBundleModal() {
      if ($scope.isModalOpen) {
        return;
      }
      $scope.isModalOpen = true;

      var adDetails = adService.getAdDetailsForUpload(false, false, null, null, null);
      var modalInstance = $modal.open({
        templateUrl: './adManagementApp/views/uploadEBS.html',
        controller: 'uploadEBSCtrl',
        windowClass: 'upload-dialog',
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

    function manipulateAd(ads) {
      $scope.ads = ads;
      for (var i = 0; i < $scope.ads.length; i++) {
        fillExternalData($scope.ads[i]);
      }
    }

    function filterByCampaignId(ads) {
      if ($stateParams.campaignId) {
        ads.length = 0;
        ads.concat(_.filter(ads, {campaignId: $stateParams.campaignId}));
        $scope.ads = ads;
      }
      else {
        $scope.ads = ads;
      }
    }

    function fillExternalData(ad) {
      ad.overallSizeParsed = assetsLibraryService.parseSizeFromBytes(ad.overallSize);
      adService.fillStatus(ad);
      ad.dimensions = assetsLibraryService.getAssetDimension(ad.defaultImage);
      if (ad.numberOfPlacementAds == 0 || ad.numberOfPlacementAds > 1)
        ad.numberOfPlacementAds  += ' ' + $filter('T')('Placement ads');
    }

    function copyAd(list, selectedItems) {
      alert('todo copyAd');
    }

    function func1() {
      alert('todo');
    }

    function processError(error) {
      console.log("ERROR: " + JSON.stringify(error));
      $scope.showSPinner = false;
      mmAlertService.addError("Server error. Please try again later.");
    }

    function changeStateAssignAdToCampaign(items) {
      if (items.length && items.length > 0) {
        for (var i = 0; i < items.length; i++) {
          var isDisable = baseAdBl.checkNumberOfPlacementAds(items[i]);
          if (isDisable) {
            return isDisable;
          }
        }
        return false;
      }
      else {
        return true;
      }
    }

    function changeStateAssignAdToCampaignManager(items) {
      if (items.length && items.length > 0) {
        for (var i = 0; i < items.length; i++) {
          var isDisable = baseAdBl.checkNumberOfPlacementAds(items[i]);
          if (!isDisable) {
            isDisable = checkAssigntToAnotherCampaignManager(items[i]);
            if (isDisable) {
              return true;
            }
          }
          else {
            return true;
          }
        }
      }
      else {
        return true;
      }
    }

    function checkAssigntToAnotherCampaignManager(item) {
      if (item.campaignManager && item.campaignManager != '') {
        return true;
      }
      return false;
    }

    function editAdsActionManipulator(items) {
      if (_.filter(items, {"createdByHTML5Factory": true}).length == 1) {
        if (centralAdActions[0].name != 'Edit') {
          centralAdActions.unshift({ name: 'Edit', items: [
            { name: 'Edit', func: editAds, disableFunc: editAds},
            { name: 'Edit in HTML5 Factory', func: gotoFactory}
          ]});
          $scope.centralDataObject[0].isEditable = false;
        }
      }
      else {
        if (centralAdActions[0].name === 'Edit') {
          centralAdActions.splice(0, 1);
        }
        $scope.centralDataObject[0].isEditable = true;
      }
    }

    function gotoFactory(list, selectedItems) {
      adService.gotoFactory($scope.$root.loggedInUserAccountId, $scope.$root.loggedInUserId, $scope.$parent.$parent.$parent.currentLanguage, list);
    }

    function massCreate() {
      mmModal.open({
        templateUrl: 'infra/directives/views/template/wizard/modalWizard.html',
        controller: 'massCreateAdCtrl',
        title: "Ad Creation Wizard",
        modalWidth: 1200,
        bodyHeight: 559,
        discardButton: { name: "Close", funcName: "cancel" }
      });
    };

    function duplicateAds() {
      baseAdBl.duplicateAds($scope.centralDataObject[0].centralList , $scope.centralDataObject[0].selectedItems);
    }

    function deleteAds(){
      baseAdBl.deleteAds($scope.centralDataObject[0].centralList , $scope.centralDataObject[0].selectedItems).then(function (){
        $scope.centralDataObject[0].openEntral(false);
      });
    }
  }]);
