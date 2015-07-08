/**
 * Created by Ofir.Fridman on 11/13/14.
 */
"use strict";
app.directive('deliveryGroup', ['dgConstants', function (dgConstants) {
    return {
      restrict: 'E',
      templateUrl: 'campaignManagementApp/directives/dg/dg/views/dg.html',
      scope: {
        deliveryGroup: "=",
        filter: "=?",
        mmId: "@"
      },
      controller: ['$scope', 'dgHelper', function ($scope, dgHelper) {
        $scope.isMM2 = dgHelper.isMM2();
        $scope.hideDisabled = {val: false};
        $scope.defaultAdsCB = {isSelected: false};
        $scope.hideTree = {isFirstTime: !$scope.deliveryGroup.dgToggleOpen};
        $scope.onDgSelected = function () {
          $scope.$emit(dgConstants.dgBroadcastAction.dgSelected);
        };

        $scope.openDeliveryGroup = function () {
          //if($scope.deliveryGroup.centralDrag){
          //  $scope.deliveryGroup.dgToggleOpen = {open: true};
          //}
        };
      }]
    }
  }]
);
