/**
 * Created by Ofir.Fridman on 3/25/2015.
 */
'use strict';

app.controller('placementEditController', ['$scope', 'placementHelperService', '$stateParams', 'placementRestService',
  'placementValidationService', 'placementConstants', 'placementFactoryService', 'servingAndCostService', 'mmRest', 'mmAlertService', '$state', 'placementTypeHelperService',
  'placementSaveService', 'placementTrackingService',
  function ($scope, placementHelperService, $stateParams, placementRestService, placementValidationService, placementConstants,
            placementFactoryService, servingAndCostService, mmRest, mmAlertService, $state, placementTypeHelperService, placementSaveService,
            placementTrackingService) {

    $scope.entityObj = {};
    $scope.placementData = {};
    $scope.selectedAds = [];
    $scope.selected = {servingAndCosts: []};
    $scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: updateState, ref: null, nodes: []};
    $scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: save, ref: null, nodes: [], isPrimary: true};
    $scope.placementViewSettings = placementHelperService.placementEditViewSettings;
    $scope.placementTrackingSetting = placementTrackingService.placementTrackingSettings;

    var campaignId = $stateParams.campaignId || $scope.contextData.contextEntityId;
    $scope.onSiteSelected = function () {
      placementHelperService.onSelectedSiteSetToDefault($scope.placementEdit,$scope.placementData);
      getSitesAndSiteContacts();
    };
    $scope.updateAdvertiserSiteContacts = function () {
      $scope.placementEdit.siteContacts = {selectedContacts: $scope.placementData.selectedContacts};
      placementRestService.setAdvertiserSiteContacts($scope.placementEdit);
    };
    $scope.onPlacementTypeSelected = function () {
      placementRestService.getDimensions($scope.placementEdit).then(function (dimensions) {
        $scope.dimensions = dimensions;
      });
    };
    $scope.onBannerSizeSelected = function () {
      placementHelperService.setPlacementWidthAndHeight($scope.placementEdit, $scope.placementData);
    };
    $scope.onPackageSelected = function () {
      placementHelperService.onPackageSelected($scope);
    };
    $scope.onTrackingAdRowSelected = function(){
      placementTrackingService.trackingAdRowSelected($scope);
    };
    $scope.trackingAdsValidationHandler = function () {
      return placementTrackingService.validationResult;
    };
    var centralWatcher = $scope.$watch('$parent.mainEntity', function () {
      updateState();
    });

    function save() {
      if (placementValidationService.saveValidation($scope.placementEdit,$scope.placementViewSettings)) {

        //--------
        servingAndCostService.tempSetServingAndCostData();
        $scope.placementEdit.servingAndCostData = $scope.editObject.servingAndCostData;
        $scope.placementEdit.servingAndCostInfo = $scope.editObject.servingAndCostInfo;
        $scope.placementEdit.servingAndCostData.mediaCostData.type = "MediaCost";
        $scope.placementEdit.servingAndCostData.placementLevel = true;
        //----------

        placementTypeHelperService.beforeSave($scope.placementEdit, $scope.placementData);
        if ($scope.isEditMode) {
          return mmRest.placements.customPUT($scope.placementEdit).then(onSaveSuccess);
        } else {
          return mmRest.placements.post($scope.placementEdit).then(onSaveSuccess);
        }
      }
    }

    function onSaveSuccess(placementResponse) {
      placementSaveService.onSaveSuccess(placementResponse, $state, $scope);
    }

    function getSitesAndSiteContacts() {
      if ($scope.placementEdit.siteId) {
        placementHelperService.setModalSiteId($scope.entityObj, $scope.placementEdit);
        placementRestService.getSitesAndSiteContacts($scope.placementEdit.siteId, campaignId).then(function (responses) {
          $scope.placementData.sections = responses[0];
          $scope.placementData.selectedContacts = responses[1].selectedContacts;
          $scope.placementData.siteContacts = responses[1].siteContacts;
        });
      }
    }

    function updateState() {
      servingAndCostService.init($scope);
      placementTrackingService.init($scope);

      $scope.isEditMode = placementHelperService.isEditMode($scope, $stateParams);
      $scope.placementEdit = placementFactoryService.initPlacementObject(campaignId);
      placementRestService.getDimensions($scope.placementEdit).then(function (dimensions) {
        $scope.dimensions = dimensions;
      });
      placementRestService.getPlacementData(campaignId).then(function (getPlacementData) {
        $scope.placementData = getPlacementData;
        $scope.entityObj.sites = getPlacementData.sites;
        $scope.placementEdit.accountId = getPlacementData.accountId;
        if ($scope.isEditMode) {
          $scope.placementEdit = placementRestService.restCopy($scope.$parent.mainEntity);
          placementTypeHelperService.initEditModeByPlacementType($scope.placementEdit, $scope.placementData);
          getSitesAndSiteContacts();
        }
        $scope.editObject.servingAndCostData = angular.copy($scope.placementEdit.servingAndCostData);
        $scope.editObject.servingAndCostInfo = angular.copy($scope.placementEdit.servingAndCostInfo);
        servingAndCostService.init($scope);
      });
    }

    updateState();

    $scope.$on('$destroy', function () {
      $scope.editObject = null;
      if (centralWatcher) {
        centralWatcher();
      }
    });
  }]);
