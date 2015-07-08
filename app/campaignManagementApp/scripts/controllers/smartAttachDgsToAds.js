/**
 * Created by Ofir.Fridman on 9/4/14.
 */
'use strict';

app.controller('smartAttachDgsToAdsCtrl', ['$scope', '$modalInstance', 'selected', 'enums',
  'adService', 'smartAttachAdsToDgs', 'dgConstants', 'dgAdCalculateDecision', 'dgValidation', 'dgHelper', 'EC2Restangular', 'mmAlertService', 'mmModal', 'dgPreviewHelperService',
  function ($scope, $modalInstance, selected, enums,
            adService, smartAttachAdsToDgs, dgConstants, dgAdCalculateDecision, dgValidation, dgHelper, EC2Restangular, mmAlertService, mmModal, dgPreviewHelperService) {
    //region init params
    $scope.selectedAssignmentStrategy = {selected: 'AddToRotation'};
    $scope.strCreateSubGroup = "Create Sub Group";
    $scope.strRemoveSubGroup = "Remove Sub Group";
    $scope.displaySubGroup = false;
    $scope.placementTypes = smartAttachAdsToDgs.mapPlacementFormat();
    $scope.rotations = enums.rotationSettingType;
    $scope.assignmentStrategy = enums.assignmentStrategy;
    $scope.rotations = enums.rotationSettingType;
    $scope.mapAdFormatToPlacementType = enums.mapOfAdFormatToPlacementType;
    $scope.selected = selected;
    $scope.subGroup = smartAttachAdsToDgs.getDefaultSubGroupContainer(dgConstants.strEvenDistribution);
    $scope.sdButtonName = $scope.strCreateSubGroup;
    $scope.mapAdFormats = smartAttachAdsToDgs.mapAdFormats();
    $scope.subGroup.subContainers = smartAttachAdsToDgs.fillSubContainersWithAds($scope.subGroup.subContainers, $scope.selected.ads, dgConstants.strEvenDistribution);
    smartAttachAdsToDgs.getAssetDimension($scope.subGroup.subContainers);
    $scope.mapRotationType = dgHelper.mapRotationType();
    var actionOptions = dgAdCalculateDecision.actionOptions();
    var subDgToggleButton = {
      "Create Sub Group": $scope.strRemoveSubGroup,
      "Remove Sub Group": $scope.strCreateSubGroup
    };
    var isSubGroup = false;
    $scope.deliveryGroups;
    smartAttachAdsToDgs.getCampaignAds(selected.campaignId).then(function (ads) {
      $scope.mapIdToNameAds = smartAttachAdsToDgs.mapIdToNameForAds(ads);
    }, function (response) {
      mmAlertService.addError(response);
    });
    //endregion

    $scope.onAssignmentStrategyChange = function () {
      if ($scope.subGroup.subContainers.length == 0) {
        mmAlertService.addError("No Ads! Please discard changes.");
        initDataOnChangeToAddToRotation();
        return;
      }
      if ($scope.isScheduledSwap()) {
        $scope.openScheduledSwap()
      } else {
        initDataOnChangeToAddToRotation();
      }
    };

    $scope.openScheduledSwap = function () {
      if ($scope.subGroup.timeBased && $scope.subGroup.timeBased.startDate) {
        $scope.subGroup.timeBased.name = $scope.subGroup.name;
      }

      var modal = mmModal.open({
        templateUrl: 'campaignManagementApp/views/deliveryGroup/smartAttachDgsToAds/settings/modal/scheduledSwap.html',
        controller: 'scheduledSwapCtrl',
        title: "Scheduled Swap",
        modalWidth: 600,
        bodyHeight: 450,
        discardButton: {name: "Close", funcName: "cancel"},
        additionalButtons: [
          {name: "Ok", funcName: "ok", hide: false, isPrimary: true}
        ],
        resolve: {
          subGroup: function () {
            return $scope.subGroup;
          }
        }
      });

      modal.result.then(function (subGroup) {
        $scope.subGroup = smartAttachAdsToDgs.setSubDgRotationSettingToTimeBase($scope.subGroup, subGroup);
        createSwapSubGroup();
      }, function () {
        if ($scope.subGroup.timeBased && !$scope.subGroup.timeBased.startDate) {
          initDataOnChangeToAddToRotation();
        }
      }).then(function () {
        mmAlertService.closeError();
      });
    };

    $scope.next = function () {
      if (nextValidation()) {
        mmAlertService.closeError();
        var cloneSelectedDgs = EC2Restangular.copy($scope.selected.deliveryGroups);
        var cloneSubGroup = EC2Restangular.copy($scope.subGroup);
        if ($scope.isScheduledSwap()) {
          $scope.gridColumns = smartAttachAdsToDgs.getScheduledSwapColumnNames();
          $scope.deliveryGroups = smartAttachAdsToDgs.convertDgsToScheduledSwap(cloneSelectedDgs, cloneSubGroup);
        } else {
          $scope.gridColumns = smartAttachAdsToDgs.getColumnNames();
          $scope.deliveryGroups = smartAttachAdsToDgs.addAdsToDgs(cloneSelectedDgs, cloneSubGroup, isSubGroup);
        }
      } else {
        return false; // Prevent from moving next
      }
    };

    $scope.createSubGroup = function () {
      $scope.sdButtonName = subDgToggleButton[$scope.sdButtonName];
      isSubGroup = $scope.sdButtonName != $scope.strCreateSubGroup;
      initDataOnChangeToAddToRotation();
    };

    $scope.preview = function () {
      var adsIds = _.pluck($scope.selected.ads, 'id');
      dgPreviewHelperService.previewAdsByDgId(adsIds, true);
    };

    $scope.onSubGroupRotationChange = function () {
      dgAdCalculateDecision.calculate($scope.subGroup, actionOptions.rotationChange);
    };

    $scope.onGridRotationChange = function (dg) {
      var stop = dg.rootContainer.subContainers.length;
      for (var i = 0; i < stop; i++) {
        dg.rootContainer.subContainers[i].rotationSetting.type = dg.rootContainer.childRotationType;
        dg.rootContainer.subContainers[i].rotationSetting.rotationType = dg.rootContainer.childRotationType;
      }
      dgAdCalculateDecision.calculate(dg.rootContainer, actionOptions.rotationChange);
    };

    $scope.onWeightedChange = function (ad) {
      dgValidation.weightValueValidation(ad);
      dgAdCalculateDecision.calculate($scope.subGroup, actionOptions.adWeightChange);
    };

    $scope.back = function () {
      mmAlertService.closeAllExceptSuccess();
    };

    $scope.attach = function () {
      if (smartAttachAdsToDgs.attachValidation($scope.deliveryGroups)) {
        smartAttachAdsToDgs.attachAction($scope.deliveryGroups, $modalInstance);
      }
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    function createSwapSubGroup() {
      if ($scope.sdButtonName == $scope.strCreateSubGroup) {
        $scope.sdButtonName = subDgToggleButton[$scope.sdButtonName];
      }
      isSubGroup = $scope.sdButtonName != $scope.strCreateSubGroup;
      if ($scope.isScheduledSwap() && !isSubGroup) {
        initDataOnChangeToAddToRotation();
      }
    }

    function initDataOnChangeToAddToRotation() {
      $scope.selectedAssignmentStrategy = {selected: 'AddToRotation'};
      $scope.subGroup = smartAttachAdsToDgs.setSubDgRotationSettingToEvenDistribution($scope.subGroup);
    }

    $scope.isScheduledSwap = function () {
      return smartAttachAdsToDgs.isScheduledSwap($scope.selectedAssignmentStrategy.selected);
    };

    //region validation
    function nextValidation() {
      var valid = true;
      if (isSubGroup) {
        valid = dgValidation.weightValidation(undefined, $scope.subGroup.childRotationType, $scope.subGroup);
      }
      if ($scope.isScheduledSwap()) {
        if (!dgValidation.isValidNumOfNestedSubGroupForSwapAction($scope.selected.deliveryGroups)) {
          valid = false;
        }
      }
      return valid;
    }

    //endregion

    $scope.wizardSteps = [
      {
        text: "Settings",
        templatePath: "campaignManagementApp/views/deliveryGroup/smartAttachDgsToAds/smartAttach.html",
        onClick: $scope.back,
        next: {
          onClick: $scope.next
        },
        cancel: {
          onClick: $scope.cancel
        }
      },
      {
        text: "Assign Ads",
        onClick: $scope.next,
        templatePath: "campaignManagementApp/views/deliveryGroup/smartAttachDgsToAds/attachAd/smartAttachAds.html",
        back: {
          onClick: $scope.back
        },
        cancel: {
          onClick: $scope.cancel
        },
        done: {
          name: "Assign",
          onClick: $scope.attach
        }
      }
    ];

  }]);
