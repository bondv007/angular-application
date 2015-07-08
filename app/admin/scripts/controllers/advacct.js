'use strict';

app.controller('advAcctCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {
  $scope.type = 'advertiserAccount';
  $scope.entityId = $stateParams.advertiserAccountId;
	$scope.relationship = true;
  $scope.entityActions = [
  ];


}]);