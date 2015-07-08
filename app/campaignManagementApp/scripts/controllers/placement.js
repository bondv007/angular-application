'use strict';

app.controller('placementCtrl', ['$scope', '$stateParams', 'mmModal','$state','EC2Restangular', 'mmAlertService', 'placementRest', function ($scope, $stateParams, mmModal, $state, EC2Restangular, mmAlertService, placementRest) {
  $scope.type = 'placement';
  $scope.entityId = $stateParams.placementId;
  $scope.entityActions = [];

  $scope.goToData = {
    links: [
      {
        type: 'campaign id',
        namePath: 'relationsBag.parents.campaign.name',
        sref: 'spa.campaign.campaignEdit',
        paramKey: 'campaignId',
        paramPath: 'relationsBag.parents.campaign.id'
      },
      {
        type: 'advertiser',
        namePath: 'relationsBag.parents.advertiser.name',
        sref: 'spa.advertiser.advertiserEdit',
        paramKey: 'advertiserId',
        paramPath: 'relationsBag.parents.advertiser.id'
      },
      {
        type: 'brand',
        namePath: 'relationsBag.parents.brand.name',
        sref: 'spa.brand.brandEdit',
        paramKey: 'brandId',
        paramPath: 'relationsBag.parents.brand.id'
      },
      {
        type: 'placements',
        namePath: '',
        sref: 'spa.campaign.campaignsCentral',
        paramKey: 'campaignId',
        paramPath: 'relationsBag.parents.campaign.id'
      },
      {
        type: 'placements Ads',
        namePath: '',
        sref: 'spa.campaign.placementAdList',
        paramKey: 'campaignId',
        paramPath: 'relationsBag.parents.campaign.id'
      }
    ],
    actions: [
      {name: 'New Placement', func: addNewPlacement},
      {name: 'Delete', func: deletePlacement},
      {name: 'Bypass IO', func: enableServing}
    ]
  };

  function addNewPlacement(){
    $state.go('spa.placement.placementNew', { campaignId: $state.params.campaignId, placementId: null });
  }

  function deletePlacement() {
    var modalInstance = mmModal.openAlertModal("Delete placements", "Are you sure you want to permanently delete the selected placement?");
    modalInstance.result.then(function () {
      $scope.isDiscardModalOpen = false;

      var p = $scope.childModel;
      p.remove().then(processDelete, processDeleteError);
    })
  }

  function processDelete(){
    $state.go('spa.campaign.campaignsCentral', { campaignId: $state.params.campaignId });
  }

  function processDeleteError(){
    mmAlertService.addError('Operation failed in back-end on: Placement can not be deleted - it has {} delivery groups attached3');
  }

  function enableServing() {
    var placements = [];
    placements.push($scope.childModel);
    return placementRest.enableServing(placements).then(enableServingResponse, enableServingError);
  }

  function enableServingResponse() {
    mmAlertService.addSuccess("Enable serving done successfully");
    $state.go('spa.campaign.campaignsCentral', { campaignId: $state.params.campaignId });
  }

  function enableServingError(error) {
    if (error.data.error === undefined) {
      mmAlertService.addError("Server error. Please try again later");
    } else {
      mmAlertService.addError(error.data.error);
    }
  }

}]);
