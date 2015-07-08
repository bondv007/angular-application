/**
 * Created by ahmad.alinat on 12/3/2014.
 */
'use strict';
app.service('findReplaceAdsInPlacementService', ['mmAlertService','adService','$filter','EC2Restangular',
  function (mmAlertService,adService,$filter,EC2Restangular) {

    function initPlacementGridColumns()
    {
      return  [
        {field: 'id', displayName: 'Delivery Group ID'},
        {field: 'name', displayName: 'Placement Name'},
        {field: 'type', displayName: 'Placement Type'},
        {field: 'dimensions', displayName: 'Dimensions'}
      ];
    }
    function validateBeforeSave(selectedSwapAdItems,selectedWithAdItems,selectedPlacementItems){
      return selectedSwapAdItems.length == 1 && selectedWithAdItems.length ==1 && selectedPlacementItems.length > 0;
    }
    function swapAdsInPlacements(masterAdIdToReplace,masterAdIdToSet,selectedPlacements,$modalInstance){
      var placementIds = [];
      for (var i=0;i<selectedPlacements.length;i++){
        var placementId =selectedPlacements[i].id;
        placementIds.push(placementId);
      }
      var replaceAdsMethodRequest = [{
        type : "PlacementAdsIds",
        masterAdIdToBeReplaced :masterAdIdToReplace,
        newMasterAdId :masterAdIdToSet,
        placementsIds :placementIds
      }
      ];
      var service = EC2Restangular.all('placements/replaceAds');
      service.customPUT(replaceAdsMethodRequest).then(function(){
        mmAlertService.addSuccess("ads has been swapped successfully.");
        $modalInstance.close();
      }, function (error) {
        if (error.data.error === undefined) {
          mmAlertService.addError("Server error. Please try again later");
        } else {
          mmAlertService.addError(error.data.error);
        }
      });
    }
    function fillPlacementsGrid(placements)
    {
      var InPlacementItems = [];
      if (placements.length > 0) {
        for (var i = 0; i < placements.length; i++) {
          var placement = {};
          placement.id = placements[i].id;
          placement.name = placements[i].name;
          placement.type = placements[i].placementType;
          InPlacementItems.push(placement);
        }
      }
      return InPlacementItems;
    }
    return {
      initPlacementGridColumns : initPlacementGridColumns,
      fillPlacementsGrid : fillPlacementsGrid,
      validateBeforeSave : validateBeforeSave,
      swapAdsInPlacements : swapAdsInPlacements
    };
  }]);
