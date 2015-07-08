'use strict';

app.controller('placementCentralCtrl',
  ['$scope', '$stateParams', 'placementService', 'adService', 'deliveryGroupService', '$state','mmModal', 'EC2Restangular','mmAlertService', 'tagGenerationService', 'enums', 'infraEnums','placementRest',
    'placementCentralService',
    function ($scope, $stateParams, placementService, adService, deliveryGroupService, $state, mmModal, EC2Restangular, mmAlertService, tagGenerationService, enums, infraEnums,placementRest
    ,placementCentralService) {
      $scope.entityId = $stateParams.campaignId;

      var centralPlacementsActions = [
        { name: 'Delete', func: confirmDelete, relationType: infraEnums.buttonRelationToRowType.any, disableFunc:disableDelete },
        { name: 'Publish', func: openMultipleTags, disableFunc: disablePublish },
        { name: 'Bypass IO', func: enableServing, disableFunc: disableByPassIo }
      ];

      $scope.centralDataObject = [
        { type: 'placement', centralActions: centralPlacementsActions, dataManipulator: placementChanger, isEditable: true, editButtons: []}
      ];

      function confirmDelete(selectedPlacements){
        var modalInstance = mmModal.openAlertModal("Delete placements","Are you sure you want to permanently delete the selected placements?");
        modalInstance.result.then(function () {
          $scope.isDiscardModalOpen = false;
          placementRest.deletePlacements(selectedPlacements,$scope.centralDataObject[0]);
        }, function () {
          $scope.isDiscardModalOpen = false;
        });
      }

      function addPlacement(){
        $state.go('spa.placement.placementEdit');
      }

      function placementChanger(placements){

        for (var i = 0; i < placements.length; i++) {

          if (placements[i].bannerSize != undefined && placements[i].placementType == enums.placementTypes.getId('In Banner'))
            placements[i].dimension = placements[i].bannerSize.width + 'x' + placements[i].bannerSize.height;

          if (placements[i].relationsBag.parents.site != null){
            placements[i].siteName = placements[i].relationsBag.parents.site.name;
          }

          if (placements[i].servingAndCostData){
            if (placements[i].servingAndCostData.mediaServingData){
              placements[i].startDate = placements[i].servingAndCostData.mediaServingData.startDate;
              placements[i].endDate = placements[i].servingAndCostData.mediaServingData.endDate;
              placements[i].hardStopMethod = enums.hardStop.getName(placements[i].servingAndCostData.mediaServingData.hardStopMethod);
            }
            if(placements[i].servingAndCostData.mediaCostData){
              placements[i].costModel = placements[i].servingAndCostData.mediaCostData.costModel;
            }
          }
        }
      }

      function enableServing(centralList, selectedPlacements) {
        return placementRest.enableServing(selectedPlacements, $scope.centralDataObject[0]);
      }

      function openMultipleTags(centralList,selectedPlacements) {
        if (selectedPlacements.length == 0) {
          mmAlertService.addError("You didn't select placements");
        }
        else {
          tagGenerationService.generateTags($scope, selectedPlacements);
        }
      }

      function disableByPassIo(centralSelectedList){
        return placementCentralService.disableByPassIo(centralSelectedList);
      }

      function disablePublish(centralSelectedList){
        return placementCentralService.disablePublish(centralSelectedList);
      }

      function disableDelete(centralSelectedList){
        return placementCentralService.disableDelete(centralSelectedList);
      }
    }]);
