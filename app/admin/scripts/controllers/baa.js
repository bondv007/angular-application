'use strict';

app.controller('baaCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {
  $scope.type = 'brandAdvertiserAccount';
  $scope.entityId = $stateParams.baaId;
	$scope.relationship = true;
  $scope.entityActions = [
  ];


}]);