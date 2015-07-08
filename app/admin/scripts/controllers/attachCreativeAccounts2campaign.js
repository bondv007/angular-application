/**
 * Created by rotem.perets on 19/6/14.
 * This page can be called on from both central and entity page (create\edit). Each context behaves differently
 */

'use strict';

app.controller('attachCreativeAccounts2campaign',
  ['$scope', 'EC2Restangular', '$modalInstance', 'campaign', 'accounts', 'isCentralMode', 'isEditMode', 'accountsToAdd', 'mmAlertService', 'entityMetaData',
  function ($scope, EC2Restangular, $modalInstance, campaign, accounts, isCentralMode, isEditMode, accountsToAdd, mmAlertService, entityMetaData) {
    $scope.campaign = campaign;
    $scope.accounts = accounts;
    $scope.isCentralMode = isCentralMode;
    $scope.isEditMode = isEditMode;
    $scope.selectedCreativeAccounts = {ids:[], origIds: []};

    if($scope.isCentralMode){
      if($scope.campaign.relations == null){
        console.error('Relation object is null for campaign id: ' + $scope.campaign.id);
        mmAlertService.addError('Save', 'Cannot attach the creative accounts to the campaign.');
        $modalInstance.close();
        return;
      } else {
        if($scope.campaign.relations.ids == null){
          $scope.campaign.relations.ids = [];
        }
        $scope.selectedCreativeAccounts.ids = $scope.campaign.relations.ids.slice();
      }
    } else if ($scope.isEditMode) {
      $scope.selectedCreativeAccounts.ids = accountsToAdd.creativeAccounts.items.slice();
    }

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.attach = function() {
      if($scope.isCentralMode){
        $scope.campaign.relations.ids = [];
        for(var i = 0; i < $scope.selectedCreativeAccounts.ids.length; i++){
          if($scope.campaign.relations.ids.indexOf($scope.selectedCreativeAccounts.ids[i]) < 0){
            $scope.campaign.relations.ids.push($scope.selectedCreativeAccounts.ids[i]);
          }
        }
        return saveCampaignRelations();
      } else {
        accountsToAdd.creativeAccounts.items = [];
        accountsToAdd.creativeAccounts.items = $scope.selectedCreativeAccounts.ids.slice();
        $modalInstance.close();
      }
    }

    function processError(error) {
      console.log('ohh no!');
      console.log(error);
      $scope.showSPinner = false;
      if (error.data.error === undefined) {
        mmAlertService.addError("Message", "Server error. Please try again later.", false);
      } else {
        mmAlertService.addError("Message", error.data.error, false);
      }
    }

    function saveCampaignRelations(){
      return EC2Restangular.one(entityMetaData.campaignRelations.restPath, $scope.campaign.relations.id)
        .customPUT({entities: [$scope.campaign.relations]})
        .then(function(data){
          $scope.$root.mmIsPageDirty = 0;
          $scope.showSPinner = false;
          mmAlertService.addSuccess('Save', 'You successfully attached creative accounts to the campaign');
          $modalInstance.close();
        }, processError);
    }
  }]);
