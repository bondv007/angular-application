/**
 * Created by Ofir.Fridman on 3/28/2015.
 */

'use strict';
app.service('placementSaveService', ['mmAlertService','placementRestService',
  function (mmAlertService,placementRestService) {

    function onSaveSuccess(placementResponse,$state,scope ){
      mmAlertService.addSuccess("Placement has been saved successfully.");
      scope.placementEdit = placementResponse[0] ? placementResponse[0] : placementResponse;
      if (scope.isEditMode) {
        scope.$parent.mainEntity = placementRestService.restCopy(scope.placementEdit);
      }
      else {
        goToPlacementEditFromPlacementNew($state, scope.placementEdit);
      }
    }

    function goToPlacementEditFromPlacementNew(state,placementEdit){
      state.go("spa.placement.placementEdit", {
        campaignId: placementEdit.campaignId,
        placementId: placementEdit.id
      }, {location: "replace"});
    }

    return {
      onSaveSuccess:onSaveSuccess
    };
  }]);
