'use strict';

app.controller('campaignsCentralCtrl',
  ['$scope', '$stateParams', 'placementService', 'adService', 'deliveryGroupService', '$state','mmModal', 'EC2Restangular','mmAlertService', 'tagGenerationService', 'enums', 'infraEnums',
    function ($scope, $stateParams, placementService, adService, deliveryGroupService, $state, mmModal, EC2Restangular, mmAlertService, tagGenerationService, enums, infraEnums) {
      $scope.entityId = $stateParams.campaignId;

      var centralPlacementsActions = [
        { name: 'Delete', func: confirmDelete, relationType: infraEnums.buttonRelationToRowType.any },
        { name: 'Publish', func: openMultipleTags, disableFunc: disablePublish },
        { name: 'Bypass IO', func: enableServing, disableFunc: disableServing }
      ];

      $scope.centralDataObject = [
        { type: 'placement', centralActions: centralPlacementsActions, dataManipulator: placementChanger, isEditable: true, editButtons: []}
      ];

      function confirmDelete(list, selectedItems){
        var modalInstance = mmModal.openAlertModal("Delete placements","Are you sure you want to permanently delete the selected placement?");
        modalInstance.result.then(function () {
          $scope.isDiscardModalOpen = false;
          deletePlacements(list, selectedItems);
        }, function () {
          $scope.isDiscardModalOpen = false;
        });
      }

      function deletePlacements(centralSelectedList, placements){
        for (var i = 0; i < placements.length; i++) {
          var p = placements[i];
          p.remove().then(function () {

            var index = _.indexOf(centralSelectedList, p);
            centralSelectedList.splice(index, 1);
          }, function (response) {
            console.log(response);
          });
        }
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

      function enableServing(centralList,selectedPlacements) {
        if (selectedPlacements.length == 0) {
          mmAlertService.addError("You didn't select placements");
        }
        else { // Selected 1 or more placements
          var serverPlacements = EC2Restangular.all('placements').one('enableServing');
          var placementIds = [];
          for (var i = 0; i < selectedPlacements.length; i++) {
            var _placement = selectedPlacements[i];
            placementIds.push(_placement.id);
          }

          $scope.showSPinner = true;
          return serverPlacements.customPUT(placementIds).then(enableServingResponse, enableServingError);
        }
      }

      function enableServingResponse(data) {
        mmAlertService.addSuccess("Enable serving done successfully");
        $scope.centralDataObject[0].refreshCentral();
      }


      function enableServingError(error) {
        if (error.data.error === undefined) {
          mmAlertService.addError("Server error. Please try again later");
        } else {
          mmAlertService.addError(error.data.error);
        }
      }

      function openMultipleTags(centralList,selectedPlacements) {
        if (selectedPlacements.length == 0) {
          alert("You didn't select placements");
        }
        else {
          tagGenerationService.openTagSettings($scope, selectedPlacements);
        }
      }

      function disableServing(centralSelectedList){

        var disable = centralSelectedList.length == 0;
        if (centralSelectedList != null){
          for (var i = 0; i < centralSelectedList.length; i++) {
            if (centralSelectedList[i].status != enums.placementStatuses.getName("New")){
              disable = true;
            }
          }
        }
        return disable;
      }

      function disablePublish(centralSelectedList){

        var disable = centralSelectedList.length == 0;
        if (centralSelectedList != null){
          for (var i = 0; i < centralSelectedList.length; i++) {
            if (centralSelectedList[i].status != enums.placementStatuses.getName("Enabled") && centralSelectedList[i].status != enums.placementStatuses.getName("Published")){
              disable = true;
            }
          }
        }
        return disable;
      }
    }]);
