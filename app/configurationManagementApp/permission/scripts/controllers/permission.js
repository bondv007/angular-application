/**
 * Created by rotem perets on 24/3/2014.
 */

'use strict';

app.controller('permissionCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {
  $scope.type = 'permission';
  $scope.entityId = $stateParams.permissionId;
	$scope.showHistory = true;
  $scope.entityActions = [
    {
      name: 'Setup',
      ref: '.userEdit',
      preventOpenMenu: true
    }
  ];
    $scope.entityActions.parentMenuItem = 'Configuration';
    if($scope.$parent.isActive) $scope.$parent.isActive($scope.entityActions.parentMenuItem);
}]);
