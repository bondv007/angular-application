/**
 * Created by liron.tagger on 3/3/14.
 */
'use strict';

app.controller('attachmentCentralCtrl', ['$scope', '$stateParams', '$filter', 'EC2Restangular', 'mmAlertService', 'mmModal', 'dgHelper', 'enums',
  '$timeout', 'assetsLibraryService', '$state', 'placementCentralService',
  function ($scope, $stateParams, $filter, EC2Restangular, mmAlertService, mmModal, dgHelper, enums, $timeout, assetsLibraryService, $state, placementCentralService) {
    var timeOut;

    $scope.entityId = $stateParams.campaignId;
    $scope.entityLayoutInfraButtons.attachButton = {
      name: 'attach',
      func: attachPlacementsAndAds,
      ref: null,
      nodes: [],
      isPrimary: true,
      disable: true
    };

    var placementActions = [
      {name: 'Edit', func: goToPlacementEdit},
      {name: "Replace Ads" , func: replaceAdsInDG},
      {name: "Enable/Disable" , func: enableDisablePlacementsAds, disableFunc: disableEnableDisablePlacementsAds}];
    var placementsAdsButtons = [
      {name: 'Edit', func: goToAdEdit, disableFunc: disableEdit},
      {name: "Enable/Disable" , func: enableDisablePlacementsAds, disableFunc: disableEnableDisablePlacementsAds}];

    $scope.placementDataObject = [
      {type: 'placement', centralActions: placementActions, dataManipulator: placementChanger},
      {type: 'campaignsPlacementAd', centralActions: placementAdsActions, dataManipulator: getPlacementAds, hideAddButton: true}
    ];

    function goToPlacementEdit() {
      placementCentralService.goToPlacementEdit($state, $scope.placementDataObject, $stateParams.campaignId);
    }

    function goToAdEdit() {
      placementCentralService.goToAdEdit($state, $scope.placementDataObject, $stateParams.campaignId);
    }

    function previewAds(){
      placementCentralService.previewAds($scope.placementDataObject[1]);
    }

    function disableEdit(centralSelectedList) {
      return placementCentralService.disableEdit(centralSelectedList);
    }
    function disablePreview(centralSelectedList){
      return placementCentralService.disablePreview(centralSelectedList);
    }

    var adsActions = [
      {name: 'Edit', func: goToAdEdit, disableFunc: disableEdit},
      {name: 'Preview', func: previewAds, disableFunc: disablePreview},
      {name: 'Assign to Campaign', func: previewAds, disableFunc: disablePreview}
    ];
    $scope.adDataObject = [
      {
        type: 'masterAd',
        centralActions: [],
        dataManipulator: manipulateAd,
        hideAddButton: true,
        filters: [{key: "adType", value: "MasterAd"}]
      }
    ];

    function enableDisablePlacementsAds(){
      var serverEnableDisable = EC2Restangular.all('deliveryGroups/enableDisable');
      var selectedPlacementAds = $scope.placementDataObject[1].selectedItems;
      var actionType = null;
      var placementsAds = [];
      var numOfEnabled = 0;
      var numOfDisabled = 0;

      selectedPlacementAds.forEach(function(placementAd){
        placementsAds.push({masterAdId: placementAd.masterAdId, placementAdId: placementAd.id});

        if (placementAd.enabled) {
          numOfEnabled += 1;
        }
        if (!placementAd.enabled) {
          numOfDisabled += 1;
        }
      })

      if (numOfEnabled > 0 && numOfDisabled == 0){
        actionType = 'Disable';
      }
      if (numOfEnabled == 0 && numOfDisabled > 0){
        actionType = 'Enable';
      }

      if (actionType != null) {
        var jsonBody = {
          type: "EnabledDisableContainer",
          placementAdIds: placementsAds,
          campaignId: $stateParams.campaignId,
          action: actionType
        };

        return serverEnableDisable.customPUT(jsonBody).then(processEnableDisable, processError);
      }
    }

    function processEnableDisable(){
      refreshCentral(true);
    }

    function disableEnableDisablePlacementsAds(){
      var selectedPlacementsAds = $scope.placementDataObject[1].selectedItems;
      var numOfEnabled = 0;
      var numOfDisabled = 0;
      var caption;

      if (selectedPlacementsAds == undefined || selectedPlacementsAds.length == 0){
        caption = 'Enable/Disable';
      } else {
        if (selectedPlacementsAds.length != 0) {
          selectedPlacementsAds.forEach(function (placementAd) {
            if (placementAd.enabled) {
              numOfEnabled += 1;
            }
            if (!placementAd.enabled) {
              numOfDisabled += 1;
            }
          });
        }

        if (numOfEnabled > 0 && numOfDisabled == 0) {
          caption = 'Disable';
        }
        if (numOfEnabled == 0 && numOfDisabled > 0) {
          caption = 'Enable';
        }
      }

      $scope.placementDataObject[1].centralActions[0].name = caption;

      return ((numOfEnabled == 0 && numOfDisabled == 0) || (numOfEnabled != 0 && numOfDisabled != 0)) ? true : false;
    }

    function placementChanger(placements){

      for (var i = 0; i < placements.length; i++) {

        if (placements[i].bannerSize != undefined && placements[i].placementType == enums.placementTypes.getId('In Banner'))
          placements[i].dimension = placements[i].bannerSize.width + 'x' + placements[i].bannerSize.height;

        if (placements[i].relationsBag.parents.site != null) {
          placements[i].siteName = placements[i].relationsBag.parents.site.name;
        }

        if (placements[i].servingAndCostData) {
          if (placements[i].servingAndCostData.mediaServingData) {
            placements[i].startDate = placements[i].servingAndCostData.mediaServingData.startDate;
            placements[i].endDate = placements[i].servingAndCostData.mediaServingData.endDate;
            placements[i].hardStopMethod = enums.hardStop.getName(placements[i].servingAndCostData.mediaServingData.hardStopMethod);
          }
          if (placements[i].servingAndCostData.mediaCostData) {
            placements[i].costModel = placements[i].servingAndCostData.mediaCostData.costModel;
          }
        }
      }
    }

    function replaceAdsInDG() {

      if (typeof ($scope.placementDataObject) == "undefined" || $scope.placementDataObject[0].centralList.length == 0) {
        mmAlertService.addError("cannot swap master ads,no placement is available");
        return false;
      }
      if (typeof ($scope.adDataObject) == "undefined" || $scope.adDataObject[0].centralList.length <= 1) {
        mmAlertService.addError("cannot swap master ads,only one master ad is available");
        return false;
      }

      mmAlertService.closeAll();
      var modalInstance = mmModal.open({
        templateUrl: 'infra/directives/views/template/wizard/modalWizard.html',
        controller: 'findReplaceAdsInPlacementCtrl',
        title: 'Swap Ads in Placement',
        modalWidth: 1100,
        bodyHeight: 600,
        resolve: {
          ads: function () {
            return $scope.adDataObject[0].centralList;
          },
          placements: function(){
            return $scope.placementDataObject[0].centralList;
          },
          placementsAds: function () {
            return $scope.pAds;
          }
        },
        discardButton: {name: "Close", funcName: "cancel"}
      });
      modalInstance.result.then(function () {
        refreshCentral(true);
      }, function () {
        refreshCentral(true);
      }).then(function () {
        $scope.$root.isDirtyEntity = false;
      });

    }

    function getPlacementAds(pAds) {
      var i;
      for (i = 0; i < pAds.length; i++) {
        if (!pAds[i].masterAdId) {
          pAds.splice(i, 1);
          i--;
        }
      }
      $scope.pAds = pAds;
      for (i = 0; i < $scope.pAds.length; i++){
        fillExternalData($scope.pAds[i]);
      }
    }

    function manipulateAd(ads) {
      $scope.ads = ads;
      for (var i = 0; i < $scope.ads.length; i++) {
        fillExternalData($scope.ads[i]);
      }
    }

    function fillExternalData(ad) {
      ad.overallSizeParsed = assetsLibraryService.parseSizeFromBytes(ad.overallSize);
      ad.dimensions = assetsLibraryService.getAssetDimension(ad.defaultImage);
    }

    function attachPlacementsAndAds() {
      var selected = getSelected();
      if (selected.isManyToMany) {
        return advanceAttache(selected);
      } else {
        return simpleAttach(selected);
      }
    }

    function advanceAttache(selected) {
      createAttachOptions(selected);
      if (selected.placementsWithAds.length > 0) {
        selected.title = "Attach Placements to Ads";
        var cloneSelected = EC2Restangular.copy(selected);
        smartAttach(cloneSelected);
      }
      else {
        mmAlertService.addError("The selected ads not match to placements type.");
      }
    }

    function simpleAttach(selected) {
      if (selected.numOfPlacements > 0 && selected.numOfAds > 0) {
        var placementsWithAds = [];
        for (var i = 0; i < selected.placements.length; i++) {
          var placementWithAds = selected.placements[i];
          placementWithAds.adsToAttach = selected.ads;
          placementsWithAds.push(placementWithAds);
        }
        var serverDelivery = EC2Restangular.all('deliveryGroups/attachAdsToPlacements');
        return serverDelivery.customPUT(placementsWithAds).then(processData, processError);
      }
      else {
        mmAlertService.addError("Please select at least 1 placement and 1 ad.");
      }
    }

    function smartAttach(cloneSelected) {
      mmAlertService.closeAll();
      var modalInstance = mmModal.open({
        templateUrl: 'campaignManagementApp/views/attachment/adsToPlacements/adsToPlacements.html',
        controller: 'adsToPlacementsCtrl',
        title: cloneSelected.title,
        modalWidth: 900,
        bodyHeight: 500,
        discardButton: {name: $filter("translate")("Close"), funcName: "cancel"},
        additionalButtons: [
          {name: $filter("translate")("Attach"), funcName: "attach", isPrimary: true}
        ],
        resolve: {
          selected: function () {
            return cloneSelected;
          }
        }
      });
      modalInstance.result.then(function () {
        refreshCentral(true);
      }, function () {
        refreshCentral(true);
      });
    }

    function refreshCentral(closeAlerts) {
      if (closeAlerts) {
        mmAlertService.closeAllExceptSuccess();
      }
      $scope.placementDataObject[0].refreshCentral();
      $scope.placementDataObject[1].refreshCentral();
      $scope.adDataObject[0].refreshCentral();
    }

    function getSelected() {
      var selectedPlacements = $filter('filter')($scope.placementDataObject[0].centralList, {isSelected: true});
      var selectedPlacementsAds = $filter('filter')($scope.placementDataObject[1].centralList, {isSelected: true});
      var selectedAds = $filter('filter')($scope.adDataObject[0].centralList, {isSelected: true});

      var numOfPlacements = selectedPlacements != undefined ? selectedPlacements.length : 0;
      var numOfPlacementsAds = selectedPlacementsAds != undefined ? selectedPlacementsAds.length : 0;
      var numOfAds = selectedAds != undefined ? selectedAds.length : 0;
      var isManyToMany = numOfPlacements > 1 && numOfAds > 1;
      return {
        ads: selectedAds,
        placements: selectedPlacements,
        placementsAds: selectedPlacementsAds,
        isManyToMany: isManyToMany,
        campaignId: $scope.entityId,
        numOfPlacements: numOfPlacements,
        numOfPlacementsAds: numOfPlacementsAds,
        numOfAds: numOfAds
      };
    }

    function processError(error) {
      if (error.data.error === undefined) {
        mmAlertService.addError("Server error. Please try again later");
      } else {
        mmAlertService.addError(error.data.error);
      }
    }

    function processData(data) {
      mmAlertService.addSuccess("Attachment process was completed successfully");
      if (data) {
        data.forEach(function (obj) {
          $scope.insertNewItemToList($scope.placementDataObject[1], obj)
        });
        $scope.placementDataObject[1].refreshCentral();
      }
    }

    function createAttachOptions(selected) {
      var placement, ad, placementsWithAds = [], validAds;
      var adFormats = dgHelper.mapAdFormats();
      var mapAdToPlacementFormat = enums.mapOfAdFormatToPlacementType;
      var placementTypes = dgHelper.getMapPlacementType();

      for (var i = 0; i < selected.numOfPlacements; i++) {
        placement = selected.placements[i];
        validAds = [];
        for (var j = 0; j < selected.numOfAds; j++) {
          ad = EC2Restangular.copy(selected.ads[j]);
          if (placement.placementType == mapAdToPlacementFormat[adFormats[ad.adFormat]]) {
            ad.isSelected = true;
            validAds.push(ad);
          }
        }
        if (validAds.length > 0) {
          placement.uiPlacementType = placementTypes[placement.placementType];
          placement.adsToAttach = validAds;
          placementsWithAds.push(placement);
        }
      }
      selected.placementsWithAds = placementsWithAds;
    }

    var selectedPlacementWatcher = $scope.$watch('placementDataObject[0].selectedItems.length', function (newSelectedPlacement, oldSelectedPlacement) {
      if (newSelectedPlacement != oldSelectedPlacement) {
        var selectedAds = $scope.adDataObject[0].selectedItems;
        $scope.entityLayoutInfraButtons.attachButton.disable = placementCentralService.disableAttachButton(newSelectedPlacement, selectedAds)
      }
    });

    var selectedAdWatcher = $scope.$watch('adDataObject[0].selectedItems.length', function (newSelectedAds, oldSelectedAds) {
      if (newSelectedAds != oldSelectedAds) {
        var selectedPlacements = $scope.placementDataObject[0].selectedItems;
        $scope.entityLayoutInfraButtons.attachButton.disable = placementCentralService.disableAttachButton(selectedPlacements, newSelectedAds)
      }
    });

    $scope.$on('$destroy', function () {
      if (timeOut) {$timeout.cancel(timeOut);}
      if(selectedPlacementWatcher){selectedPlacementWatcher()}
      if(selectedAdWatcher){selectedAdWatcher()}
    });
  }]);
