/**
 * Created by rotem perets on 24/3/2014.
 */

'use strict';

app.controller('permissionSetCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {
  $scope.type = 'permissionSet';
  $scope.entityId = $stateParams.permissionSetId;
  $scope.entityActions = [];
    $scope.entityActions.parentMenuItem = 'Admin';
    if($scope.$parent.isActive) $scope.$parent.isActive($scope.entityActions.parentMenuItem);
}]);