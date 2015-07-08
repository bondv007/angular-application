/**
 * Created by Cathy Winsor on 4/16/14.
 */
'use strict';

app.controller('assetCtrl', ['$scope', '$stateParams', '$state', 'mmAlertService', function ($scope, $stateParams, $state, mmAlertService) {
	$scope.type = 'asset';
	$scope.id = $stateParams.assetId;
	$scope.entityId = $stateParams.assetId;
  $scope.entityActions =[];
  $scope.showHistory = false;
  $scope.entityActions.parentMenuItem = 'Creative';
  if($scope.$parent.isActive) $scope.$parent.isActive($scope.entityActions.parentMenuItem);

	function changeView(view) {
		$state.go(view);
	}

	function deleteAsset() {
		console.log("delete asset", $scope);
		//$scope.asset.remove();
		$state.go("spa.creativeCentralMain.assetList");
	};

	function placeholderFunc() {
		console.log("Function not implemented yet");
		mmAlertService.addWarning("Function not implemented yet.");
	}
}]);
