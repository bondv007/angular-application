/**
 * Created by Ofir.Fridman on 3/27/2015.
 */
'use strict';

app.service('placementTypeHelperService', ['placementConstants', 'placementHelperService','enums',function (placementConstants,placementHelperService,enums) {
  var serverPlacementTypeMap = null;
  function initEditModeByPlacementType(placementEdit,placementData){
    switch (placementEdit.placementType) {
      case placementConstants.strInBanner:
        inBanner(placementEdit,placementData);
        break;
      case placementConstants.strTrackingOnly:

        break;
      case placementConstants.strOutOfBanner:

        break;
      case placementConstants.strInStreamVideo:

        break;
      case placementConstants.strInStreamVideoTracking:

        break;
      default:
    }
  }

  function setServerPlacementType(placementEdit) {
    if (!serverPlacementTypeMap) {
      serverPlacementTypeMap = {};
      enums.placementTypes.forEach(function (placementType) {
        serverPlacementTypeMap[placementType.id] = placementType.serverPlacementType;
      });
    }
    placementEdit.type = serverPlacementTypeMap[placementEdit.placementType];
  }

  function beforeSave(placementEdit,placementData){
    setServerPlacementType(placementEdit);
    placementHelperService.setPlacementWithSelectedContacts(placementEdit, placementData);
    switch (placementEdit.placementType) {
      case placementConstants.strInBanner:

        break;
      case placementConstants.strTrackingOnly:

        break;
      case placementConstants.strOutOfBanner:

        break;
      case placementConstants.strInStreamVideo:

        break;
      case placementConstants.strInStreamVideoTracking:

        break;
      default:
    }
  }

  function inBanner(placementEdit,placementData){
    placementData.dimensionsId = placementHelperService.getPlacementDimensionsId(placementEdit);
  }

  return {
    initEditModeByPlacementType:initEditModeByPlacementType,
    beforeSave:beforeSave
  };
}]);
