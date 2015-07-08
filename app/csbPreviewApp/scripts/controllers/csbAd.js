
'use strict';
app.controller('csbAdCtrl', ['$scope', '$stateParams', '$state', 'mmAlertService', function ($scope, $stateParams, $state, mmAlertService) {
	$scope.type = 'ad';
	$scope.entityId = null;
}]);