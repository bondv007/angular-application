/**
 * Created by
 */
'use strict';

app.controller('firingConditionsFullCtrl', ['$scope', '$state', '$stateParams',
	function ($scope, $state, $stateParams) {
		$scope.type = 'firingConditions';
		$scope.entityId = $stateParams.firingCondition;
		//$scope.entityId = $stateParams.versaTagId;
		$scope.versaTagId = $stateParams.versaTagId;

		$scope.entityActions = [];
	}]);
