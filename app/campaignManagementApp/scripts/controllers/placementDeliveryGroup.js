'use strict';

app.controller('placementDeliveryGroupCtrl', ['$scope', '$stateParams', '$filter', 'EC2Restangular', 'mmAlertService',
  'adService', 'mmModal', '$state','placementRest','placementCentralService',
  function ($scope, $stateParams, $filter, EC2Restangular, mmAlertService, adService, mmModal, $state,placementRest,placementCentralService) {

    $scope.entityId = $stateParams.campaignId;
    $scope.entityLayoutInfraButtons.attachButton = {
      name: $filter("translate")('attach'),
      func: attachPlacementsAndDGs,
      ref: null,
      nodes: [],
      isPrimary: true
    };

    var placementActions = [
      {
        name: $filter("translate")('Edit'), func: function () {
        var selectedPlacements = $filter('filter')($scope.placementDataObject[0].centralList, {isSelected: true});
        if(selectedPlacements && selectedPlacements.length == 1){
          var placementId = selectedPlacements[0].id;
          $state.go('spa.placement.placementEdit',{campaignId:$scope.entityId,placementId:placementId});
        }
        else{
          mmAlertService.addWarning("Please select one placement.");
        }
      }
      },
      {name: $filter("translate")('Delete'), func: confirmDelete,disableFunc:disableDelete},
      {name: $filter("translate")('Publish'), func: action,disableFunc:disablePublish},
      {name: $filter("translate")('Bypass IO'), func: enableServing, disableFunc:disableByPassIo}
    ];

    function confirmDelete(selectedPlacements) {
        var modalInstance = mmModal.openAlertModal("Delete placements", "Are you sure you want to permanently delete the selected placements?");
        modalInstance.result.then(function () {
          $scope.isDiscardModalOpen = false;
          placementRest.deletePlacements(selectedPlacements,$scope.placementDataObject[0]);
        }, function () {
          $scope.isDiscardModalOpen = false;
        });
    }

    var deliveryGroupActions = [
      {name: $filter("translate")('Edit'), func: action},
      {name: $filter("translate")('Preview'), func: action}
    ];

    $scope.placementDataObject = [
      {type: 'placement', centralActions: placementActions},
      {type: 'deliveryGroup', centralActions: [], dataManipulator: getDGs}
    ];

    function getDGs(dgs) {
      $scope.dgs = dgs;
    }

    $scope.deliveryGroupDataObject = [
      {type: 'deliveryGroup', centralActions: deliveryGroupActions}
    ];

    function action() {
      mmAlertService.addWarning("Not implemented yet");
    }

    function attachPlacementsAndDGs() {
      var selectedPlacements = $filter('filter')($scope.placementDataObject[0].centralList, {isSelected: true});
      var selectedDeliveryGroups = $filter('filter')($scope.deliveryGroupDataObject[0].centralList, {isSelected: true});

      if (validationBeforeAttach(selectedDeliveryGroups, selectedPlacements)) {
        var deliveryGroupsWithPlacements = [];
        for (var i = 0; i < selectedDeliveryGroups.length; i++) {
          var deliveryGroupWithPlacements = selectedDeliveryGroups[i];
          var tempPlacements = {};
          var dgPlacements = selectedDeliveryGroups[i].placements;
          if (dgPlacements && dgPlacements.length > 0) {

            for (var k = 0; k < dgPlacements.length; k++) {
              if (dgPlacements[k]) {
                tempPlacements[dgPlacements[k]] = dgPlacements[k];
              }
            }
          }

          for (var z = 0; z < selectedPlacements.length; z++) {
            tempPlacements[selectedPlacements[z].id] = selectedPlacements[z].id;
          }

          deliveryGroupWithPlacements.placements = _.values(tempPlacements);

          deliveryGroupsWithPlacements.push(deliveryGroupWithPlacements);
        }

        var serverDelivery = EC2Restangular.all('deliveryGroups').all('attachPlacementsToDeliveryGroups');
        serverDelivery.customPUT(deliveryGroupsWithPlacements).then(processData, processError);
      }
    }

    var placementDimension = null;
    var dgDimension = null;

    function validationBeforeAttach(selectedDeliveryGroups, selectedPlacements) {

      ValidateDimension(selectedDeliveryGroups, selectedPlacements);

      var isValid = true;
      if (selectedDeliveryGroups.length < 1 || selectedPlacements < 1) {
        mmAlertService.addError($filter("translate")("Please select Placements and Delivery Groups."));
        isValid = false;
      }
      return isValid;
    }

    function ValidateDimension(selectedDeliveryGroups, selectedPlacements) {

      var isDimensionOk = true;

      var i = 0;
      while (isDimensionOk && i < selectedPlacements.length) {

        var placement = selectedPlacements[i];

        if (placement.type == 'IN_BANNER') {
          placementDimension = {
            width: placement.bannerSize.width,
            height: placement.bannerSize.height
          };

          var j = 0;
          while (isDimensionOk && j < selectedDeliveryGroups.length) {

            var dg = selectedDeliveryGroups[j];

            dgDimension = {width: dg.width, height: dg.height};

            if (Math.abs(placementDimension.width - dgDimension.width) > 5 || Math.abs(placementDimension.height - dgDimension.height) > 5) {
              isDimensionOk = false;
            }

            j += 1;
          }
        }

        i += 1;
      }

      if (!isDimensionOk) {
        mmAlertService.addWarning("41022");
      }
    }

    function processError(error) {
      console.log('ohh no!');
      console.log(error);
      $scope.showSPinner = false;
      if (error.data.error === undefined) {
        mmAlertService.addError($filter("translate")("Server error. Please try again later."));
      } else {
        mmAlertService.addError(error.data.error);
      }
    }

    function processData(data) {
      $scope.placementDataObject[0].refreshCentral();
      $scope.placementDataObject[1].refreshCentral();
      $scope.dgs.refreshCentral();
      mmAlertService.addSuccess($filter("translate")("Attachment process was completed successfully."));
    }

    function enableServing(centralList, selectedPlacements) {
      return placementRest.enableServing(selectedPlacements, $scope.placementDataObject[0]);
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
