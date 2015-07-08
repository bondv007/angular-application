/**
 * Created by Ofir.Fridman on 3/25/2015.
 */
'use strict';
app.service('placementHelperService', ['enums', 'placementConstants', '$timeout', '$rootScope', 'servingAndCostService',
  function (enums, placementConstants, $timeout, $rootScope, servingAndCostService) {
    var placementEditViewSettings = {
      labelWidth: 150,
      settingsLabelWidth: 180,
      infoBoxLabelWidth: 150,
      servingAndCost: {open: true},
      httpTypes: enums.httpTypes,
      cacheBustingTokenTypes: enums.cacheBustingTokenTypes,
      inAppTypes: enums.placementInAppTypes
    };

    function getSupportedPlacementTypes() {
      return _.remove(angular.copy(enums.placementTypes), function (type) {
        return type.placementType != placementConstants.strOutOfBanner;
      });
    }

    function isEditMode(scope, stateParams) {
      return scope.$parent.mainEntity != null && (!!stateParams.placementId || !!scope.isEntral);
    }

    function setPlacementWithSelectedContacts(placementEdit, placementData) {
      placementEdit.selectedContacts = [];
      placementData.selectedContacts.forEach(function (selectedContactId) {
        placementData.siteContacts.forEach(function (siteContact) {
          if (siteContact.contactId == selectedContactId) {
            placementEdit.selectedContacts.push({
              type: siteContact.type,
              siteId: siteContact.siteId,
              contactId: siteContact.contactId
            });
          }
        });
      });
    }

    function setPlacementWidthAndHeight(placementEdit, placementData) {
      $timeout(function () {
        $rootScope.isDirtyEntity = true;
      }, 1000);

      var widthAndHeight = placementData["dimensionsId"].split("X");
      placementEdit.bannerSize.width = widthAndHeight[0];
      placementEdit.bannerSize.height = widthAndHeight[1];
    }

    function getPlacementDimensionsId(placementEdit){
      return placementEdit.bannerSize.width + "X" +placementEdit.bannerSize.height;
    }

    function isInBannerPlacement(placementEdit) {
      return placementEdit && placementEdit.placementType == placementConstants.strInBanner;
    }

    function onPackageSelected(scope) {
      if (isDummyPackage(scope.placementEdit)) {
        scope.placementEdit.servingAndCostData.mediaServingData = scope.placementData.dummyPackage.mediaServingData;
        scope.placementEdit.servingAndCostData.mediaCostData = scope.placementData.dummyPackage.mediaCostData;
        scope.placementEdit.servingAndCostData.placementLevel = false;
        initServingAndCost(scope);
      }
      else {
        var selectedPackage = null;

        for(var i=0; i<scope.placementData.packages.length; i++) {
          if (scope.placementData.packages[i].id == scope.placementEdit.packageId){
            selectedPackage = scope.placementData.packages[i];
            break;
          }
        }

        if (selectedPackage) {
          scope.placementEdit.servingAndCostData.mediaServingData = selectedPackage.mediaServingData;
          scope.placementEdit.servingAndCostData.mediaCostData = selectedPackage.mediaCostData;
          scope.placementEdit.servingAndCostData.placementLevel = false;
          scope.isPackageSelected = true;
          initServingAndCost(scope);
        }
      }
    }

    function initServingAndCost(scope){
      scope.editObject = scope.placementEdit;
      servingAndCostService.init(scope);
    }

    function isDummyPackage(placementEdit) {
      return placementEdit.packageId == null;
    }

    function setModalSiteId(entityObj,placementEdit){
      entityObj.siteId = placementEdit.siteId;
    }

    function onSelectedSiteSetToDefault(placementEdit,placementData){
      placementEdit.sectionId = null;
      placementData.selectedContacts = null;
      placementData.siteContacts = null;
    }

    return {
      placementEditViewSettings: placementEditViewSettings,
      getSupportedPlacementTypes: getSupportedPlacementTypes,
      isEditMode: isEditMode,
      setPlacementWithSelectedContacts: setPlacementWithSelectedContacts,
      setPlacementWidthAndHeight: setPlacementWidthAndHeight,
      isInBannerPlacement: isInBannerPlacement,
      onPackageSelected: onPackageSelected,
      getPlacementDimensionsId:getPlacementDimensionsId,
      setModalSiteId:setModalSiteId,
      onSelectedSiteSetToDefault:onSelectedSiteSetToDefault
    };
  }]);
