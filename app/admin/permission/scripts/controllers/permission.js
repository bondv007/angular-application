/**
 * Created by rotem perets on 24/3/2014.
 */

'use strict';

app.controller('permissionCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {
  $scope.type = 'permission';
  $scope.entityId = $stateParams.permissionId;
  $scope.entityActions = [];
    $scope.entityActions.parentMenuItem = 'Admin';
    if($scope.$parent.isActive) $scope.$parent.isActive($scope.entityActions.parentMenuItem);
}]);