/**
 * Created by rotem perets on 24/3/2014.
 */

'use strict';

app.controller('permissionSetCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {
  $scope.type = 'permissionSet';
  $scope.entityId = $stateParams.permissionSetId;
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
