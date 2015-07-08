/**
 * Created by Ofir.Fridman on 10/23/14.
 */
"use strict";
app.directive('dgTree', [function () {
  return {
    restrict: 'E',
    templateUrl: 'campaignManagementApp/directives/dg/tree/views/dgTree.html',
    scope: {
      mmDeliveryGroup: "=",
      mmDefaultAdsCb: "=",
      mmEnableDisableState: "=",
      mmHideDisabled: "=",
      mmDisable: "@",
      filter: "=?",
      mmId:"@"
    },
    controller: ['$scope', 'enums', 'dgTreeHelper', 'dgAdCalculateDecision', 'dgConstants', '$timeout',
      function ($scope, enums, dgTreeHelper, dgAdCalculateDecision, dgConstants, $timeout) {
        var timeoutRemoveFirstItem;
        var actionOptions = dgAdCalculateDecision.actionOptions();
        var numOfItemInSourceBeforeDrop = 0;
        $scope.removeDrop = false;
        $scope.buttonState = {text: dgConstants.disableEnableButtonOptions.disableEnable};
        $scope.rotations = enums.rotationSettingType;
        $scope.defaultServe = {selected: false};
        $scope.onItemSelected = function (selected) {
          if (dgTreeHelper.isSubGroup(selected)) {
            dgTreeHelper.onParentSelectedSelectAllChildes(selected);
          }
          $scope.buttonState = dgTreeHelper.enableDisableButtonState($scope.mmDeliveryGroup, $scope.mmDefaultAdsCb);
          $scope.$emit(dgConstants.dgTreeBroadcastAction.disableEnableResolve, $scope.buttonState, $scope.mmDeliveryGroup.id);
        };
        $scope.onRotationChange = function (item) {
          dgTreeHelper.changeAndCalcAllSubContainer(item, $scope.mmDeliveryGroup.rootContainer.subContainers);
        };
        $scope.hideShowDisableAds = function () {
          $scope.buttonState = dgTreeHelper.onAfterHideDisabledClick($scope.mmDeliveryGroup, $scope.mmDefaultAdsCb);
        };
        $scope.toggle = function () {
          $scope.collapsed = !$scope.collapsed;
        };
        $scope.selectVisibleServeAds = function () {
          dgTreeHelper.selectVisibleServeAds($scope.mmDeliveryGroup.defaultAds, $scope.mmHideDisabled, $scope.mmDefaultAdsCb);
          $scope.buttonState = dgTreeHelper.enableDisableButtonState($scope.mmDeliveryGroup, $scope.mmDefaultAdsCb);
          $scope.$emit(dgConstants.dgTreeBroadcastAction.disableEnableResolve, $scope.buttonState, $scope.mmDeliveryGroup.id);
        };
        $scope.centralDropEvent = function (event) {
          if ($scope.removeDrop) {
            if ($scope.mmDeliveryGroup.rootContainer.subContainers.length == 1) {
              timeoutRemoveFirstItem = $timeout(function () {
                event.dest.nodesScope.removeNode(event.source.nodeScope)
              }, 200);
              dgTreeHelper.setPlacementTypeNull($scope.mmDeliveryGroup);
            }
            else {
              event.dest.nodesScope.removeNode(event.source.nodeScope);
            }
          } else {
            recalculateAfterDrop(event);
          }
        };
        $scope.onWeightedChange = function (parentContainer) {
          parentContainer = parentContainer ? parentContainer : $scope.mmDeliveryGroup.rootContainer;
          dgAdCalculateDecision.calculate(parentContainer, actionOptions.adWeightChange);
        };

        var previewEvent = $scope.$on(dgConstants.dgTreeBroadcastAction.preview, function () {

        });
        var newSubGroupEvent = $scope.$on(dgConstants.dgTreeBroadcastAction.newSubGroup, function () {
          if (dgTreeHelper.allowCreateSubContainer($scope.mmDeliveryGroup.rootContainer.subContainers, 0).allow) {
            $scope.$root.isDirtyEntity = true;
            dgTreeHelper.createSubGroup($scope.mmDeliveryGroup);
          }
        });
        var disableEnableEvent = $scope.$on(dgConstants.dgTreeBroadcastAction.disableEnable, function () {
          $scope.$root.isDirtyEntity = true;
          $scope.buttonState = dgTreeHelper.enableDisableAds($scope.mmDeliveryGroup, $scope.buttonState.text, $scope.mmDefaultAdsCb);
          $scope.$emit(dgConstants.dgTreeBroadcastAction.disableEnableResolve, $scope.buttonState, $scope.mmDeliveryGroup.id);
        });
        var removeEvent = $scope.$on(dgConstants.dgTreeBroadcastAction.remove, function () {
          $scope.$root.isDirtyEntity = true;
          _.remove($scope.mmDeliveryGroup.defaultAds, function (item) {
            return item.selected;
          });
          $scope.buttonState = dgTreeHelper.removeAds($scope.mmDeliveryGroup.rootContainer);
          dgTreeHelper.checkIfToSetPlacementTypeAsNull($scope.mmDeliveryGroup);
          $scope.$emit(dgConstants.dgTreeBroadcastAction.disableEnableResolve, $scope.buttonState, $scope.mmDeliveryGroup.id);
        });

        $scope.rotationTreeOptions = {
          accept: function (sourceNodeScope, destinationNodesScope) {
            return dgTreeHelper.acceptDropToRotation(sourceNodeScope, destinationNodesScope, $scope.mmDeliveryGroup);
          },
          dragStart: function (event) {
            var item = dgTreeHelper.getEventDragOrDropItem(event);
            item.from = dgConstants.strFromRotation;
            item.dgId = $scope.mmDeliveryGroup.id;
          },
          beforeDrop: function (event) {
            dgTreeHelper.setRefIdWithNull(event);
            numOfItemInSourceBeforeDrop = event.source.nodesScope.$modelValue.length;
          },
          dropped: function (event) {
            recalculateAfterDrop(event);
          }
        };

        $scope.defaultServetreeOptions = {
          accept: function (sourceNodeScope, destinationNodesScope) {
            var dropItem = dgTreeHelper.getAcceptDropItem(sourceNodeScope);
            return dgTreeHelper.acceptDropToDefaultServe(dropItem, destinationNodesScope, $scope.mmDeliveryGroup);
          },
          dragStart: function (event) {
            var item = dgTreeHelper.getEventDragOrDropItem(event);
            item.from = dgConstants.strFromDefault;
          },
          dropped: function (event) {
            var dropItem = dgTreeHelper.getEventDragOrDropItem(event);
            if (dgTreeHelper.isCentralAd(dropItem)) {
              dgTreeHelper.convertCentralAdToDgDefaultServeAd(dropItem);
            }
            dropItem.showRotation = false;
          }
        };

        var watcher = $scope.$watch('mmDeliveryGroup.defaultAds', function (newValue, oldValue) {
          $scope.defaultServeRoot = [
            {from: dgConstants.strFromDefault, defaultServe: $scope.mmDeliveryGroup.defaultAds}
          ];
        });

        $scope.defaultServeRoot = [
          {from: dgConstants.strFromDefault, defaultServe: $scope.mmDeliveryGroup.defaultAds}
        ];

        function recalculateAfterDrop(event) {
          var dropItem = dgTreeHelper.getEventDragOrDropItem(event);
          var dropDestination = dgTreeHelper.getDropDestination(event, $scope.mmDeliveryGroup.rootContainer);
          var parentSource = dgTreeHelper.getParentSource(event, $scope.mmDeliveryGroup.rootContainer);

          if (dgTreeHelper.isCentralAd(dropItem)) {
            dgTreeHelper.convertCentralAdToDgRotationAd(dropItem, dropDestination);
            if (!dgTreeHelper.isFromDefaultServe(dropDestination)) {
              dgAdCalculateDecision.calculate(dropDestination, actionOptions.add);
            }
          }
          else if (dropDestination != parentSource) {
            dropItem.rotationSetting.__type = dgConstants.mm2RotationSettingType[dropDestination.childRotationType];
            dropItem.rotationSetting.type = dropDestination.childRotationType;
            dropItem.rotationSetting.rotationType = dropDestination.childRotationType;
            dropItem.rotationSetting.weight = undefined;
            if (!dgTreeHelper.isFromDefaultServe(dropDestination)) {
              dgAdCalculateDecision.calculate(dropDestination, actionOptions.add);
            }
            dgAdCalculateDecision.calculate(parentSource, actionOptions.remove, numOfItemInSourceBeforeDrop);
          }

          if (dgTreeHelper.isFromDefaultServe(dropDestination)) {
            dgTreeHelper.convertCentralAdToDgDefaultServeAd(dropItem);
          }
        }

        $scope.$on("$destroy", function () {
          if (watcher) {
            watcher();
          }
          if (previewEvent) {
            previewEvent();
          }
          if (newSubGroupEvent) {
            newSubGroupEvent();
          }
          if (disableEnableEvent) {
            disableEnableEvent();
          }
          if (removeEvent) {
            removeEvent();
          }
          if (timeoutRemoveFirstItem) {
            $timeout.cancel(timeoutRemoveFirstItem);
          }
        });
      }]
  }
}]);
