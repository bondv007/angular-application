/**
 * Created by Ofir.Fridman on 11/17/14.
 */
'use strict';

app.directive('deliveryGroups', [function () {
  return {
    restrict: 'EA',
    templateUrl: 'campaignManagementApp/directives/dg/dgs/views/dgs.html',
    scope: {
      dgs: "=",
      ads: "=",
      campaignId: "@",
      filter: "=?"
    },
    controller: ['$scope', 'EC2Restangular', 'dgConstants', 'dgsService', 'mmModal', '$timeout', '$filter',
      function ($scope, EC2Restangular, dgConstants, dgsService, mmModal, $timeout, $filter) {
        $scope.hideGoTo = true;
        $scope.dgLimit = 15;
        $scope.dgDropDownButton = {
          name: "dg_trafficking_New_Dg", items: [
            {name: 'dg_trafficking_New_Dg', func: createNewDg},
            {name: 'dg_trafficking_Existing_Dg', func: displayExistingDgs}
          ]
        };
        var dgsEnableDisableState = {};

        $scope.loadMore = function () {
          $scope.dgLimit += 5;
        };

        function updateState() {
          $scope.isMM2 = dgsService.isMM2();
          $scope.$root.isDirtyEntity = false;
          $scope.showSpinner = true;
          dgsEnableDisableState = {};
          $scope.detachedDgs = [];
          initButtonState();
          $scope.buttonState = {text: dgConstants.disableEnableButtonOptions.disableEnable};
          $scope.copyTargetAudienceDgs = $scope.targetAudienceDgs ? angular.copy($scope.targetAudienceDgs) : [];
          $scope.dgLimit = 15;
          $scope.dgs = $scope.copyTargetAudienceDgs;
          cloneCampaignDgs();
          dgsService.renderDgs($scope.copyTargetAudienceDgs, $scope.ads);
          hideSpinner();
        }

        updateState();

        function cloneCampaignDgs() {
          $scope.copyCampaignDgs = $scope.campaignDgs ? angular.copy($scope.campaignDgs) : [];
        }

        $scope.preview = function () {
          dgsService.preview($scope.copyTargetAudienceDgs);
        };

        $scope.createSubGroup = function () {
          $scope.$broadcast(dgConstants.dgTreeBroadcastAction.newSubGroup);
        };

        $scope.enableDisableAds = function () {
          $scope.$broadcast(dgConstants.dgTreeBroadcastAction.disableEnable);
        };

        $scope.remove = function () {
          dgsService.openRemoveModal($scope);
          $scope.$broadcast(dgConstants.dgTreeBroadcastAction.remove);
        };

        $scope.callCreateNewDg = function () {
          createNewDg();
        };

        function createNewDg() {
          dgsService.createNewDg($scope.copyTargetAudienceDgs, $scope.campaignId, $scope.selectedTargetAudience, $scope.copyCampaignDgs);
        }

        $scope.displayExistingDgs = function () {
          displayExistingDgs();
        };

        function displayExistingDgs() {
          dgsService.displayExistingDgs($scope.copyCampaignDgs, $scope.selectedTargetAudience).then(function (isAttachSuccess) {
            if (isAttachSuccess) {
              getCampaignAndTargetAudienceDgs();
            }
          }, function () {
            cloneCampaignDgs();
          });
        }

        $scope.save = function () {
          dgsService.save($scope.copyTargetAudienceDgs, $scope.detachedDgs, $scope.copyCampaignDgs).then(function () {
            if (dgsService.isMMNext()) {
              $timeout(function () {
                getCampaignAndTargetAudienceDgs();
              }, 1000);
            }
            else {
              getCampaignAndTargetAudienceDgs();
            }
          });
        };

        $scope.discard = function () {
          var modalInstance = mmModal.open({
            templateUrl: './infra/infraModalMessages/discard/views/mmDiscardDialog.html',
            controller: 'mmDiscardDialogCtrl',
            title: "Discard Changes",
            modalWidth: 420,
            bodyHeight: 86,
            confirmButton: {name: "Discard Changes", funcName: "discard"},
            discardButton: {name: "Return To Page", funcName: "cancel"}
          });
          modalInstance.result.then(function () {
            updateState();
          }, function () {
          });
        };

        function initButtonState() {
          $scope.previewButton = {disable: true};
          $scope.removeButton = {disable: true};
          $scope.disableEnableButton = {disable: true};
          $scope.newSubgroupButton = {disable: true};
        }

        function hideSpinner() {
          var timeOut = 100;
          if ($scope.copyTargetAudienceDgs.length > 3) {
            timeOut = 3000;
          }
          $timeout(function () {
            $scope.showSpinner = false;
          }, timeOut);
        }

        var replaceAdsInDgs = $scope.$on(dgConstants.dgBroadcastAction.replaceAdsInDgs, function (e, dgs) {
          dgsService.updateDgs($scope.copyTargetAudienceDgs, dgs, $scope.ads);
        });

        var assignAdsToDgs = $scope.$on(dgConstants.dgBroadcastAction.assignAdsToDgs, function (e, selectedMasterAds) {
          dgsService.assignAdsToDgs(selectedMasterAds, $scope.copyTargetAudienceDgs, $scope.campaignId).then(function () {
            getCampaignAndTargetAudienceDgs();
          });
        });

        var targetAudienceSelected = $scope.$on(dgConstants.dgsBroadcastAction.targetAudienceSelected, function (e, selectedTargetAudience) {
          $scope.showSpinner = true;
          $scope.selectedTargetAudience = selectedTargetAudience;
          $scope.isDefaultTaSelected = !selectedTargetAudience.id;
          $scope.contextEntityInfo = {id: "", name: ""};
          dgsService.setOnHeaderTargetAudienceName($scope.contextEntityInfo, $scope.selectedTargetAudience);
          getCampaignAndTargetAudienceDgs();
        });

        function getCampaignAndTargetAudienceDgs() {
          dgsService.getCampaignAndTargetAudienceDgs($scope.selectedTargetAudience.id).then(function (responses) {
            if ($scope.isDefaultTaSelected) {
              $scope.campaignDgs = responses[0];
              $scope.targetAudienceDgs = $filter('filter')($scope.campaignDgs, {targetAudienceId: null});
            }
            else {
              $scope.targetAudienceDgs = responses[0];
              $scope.campaignDgs = responses[1];
            }
            updateState();
          });
        }

        var disableEnableResolveEvent = $scope.$on(dgConstants.dgTreeBroadcastAction.disableEnableResolve, function (e, buttonState, dgId) {
          if (buttonState.action == dgConstants.disableEnableButtonAction.remove) {
            delete dgsEnableDisableState[dgId];
            delete buttonState.action;
          }
          else {
            dgsEnableDisableState[dgId] = buttonState;
          }
          var cloneDgsEnableDisableState = angular.copy(dgsEnableDisableState);
          $scope.buttonState = dgsService.setDisableEnableButtonText(cloneDgsEnableDisableState, $scope.buttonState);
          $scope.previewButton.disable = dgsService.disablePreview($scope.copyTargetAudienceDgs, cloneDgsEnableDisableState);
          disableEnableButtons();
        });

        var dgOrAdSelected = $scope.$on(dgConstants.dgBroadcastAction.dgSelected, function () {
          $scope.previewButton.disable = dgsService.disablePreview($scope.copyTargetAudienceDgs, dgsEnableDisableState);
          disableEnableButtons();
        });

        function disableEnableButtonsForUnSupportedDgs(disableButtons) {
          $scope.removeButton.disable = dgsService.disableButton($scope.copyTargetAudienceDgs, false) || dgsService.disableEnableRemoveButton(disableButtons, $scope.isDefaultTaSelected, $scope.copyTargetAudienceDgs);
          var disableButton = dgsService.disableButton($scope.copyTargetAudienceDgs, true);
          $scope.disableEnableButton.disable = disableButton;
          if (disableButton) {
            $scope.newSubgroupButton.disable = disableButton;
          }
          else {
            $scope.newSubgroupButton.disable = !dgsService.isAtListOneDgOrSubGroupSelected($scope.copyTargetAudienceDgs);
          }

          if (disableButton) {
            $scope.buttonState = {text: dgConstants.disableEnableButtonOptions.disableEnable};
          }
          else {
            $scope.buttonState = dgsService.setDisableEnableButtonText(dgsEnableDisableState, $scope.buttonState);
          }
        }

        function disableEnableButtons() {
          var isAtListOneDgOrAdSelected = dgsService.isAtListOneDgOrAdSelected($scope.copyTargetAudienceDgs, true);
          var disableButtons = !isAtListOneDgOrAdSelected;
          $scope.removeButton.disable = disableButtons || dgsService.disableEnableRemoveButton(disableButtons, $scope.isDefaultTaSelected, $scope.copyTargetAudienceDgs);
          $scope.disableEnableButton.disable = disableButtons;
          $scope.newSubgroupButton.disable = true;
          if (isAtListOneDgOrAdSelected) {
            disableEnableButtonsForUnSupportedDgs(disableButtons);
          }
        }

        $scope.$emit(dgConstants.dgsBroadcastAction.dgsDirectiveLoaded);

        $scope.$on('$destroy', function () {
          if (disableEnableResolveEvent) {
            disableEnableResolveEvent();
          }
          if (dgOrAdSelected) {
            dgOrAdSelected();
          }
          if (targetAudienceSelected) {
            targetAudienceSelected();
          }
          if (assignAdsToDgs) {
            assignAdsToDgs();
          }
          if (replaceAdsInDgs) {
            replaceAdsInDgs();
          }
        });
      }]
  }
}]);

