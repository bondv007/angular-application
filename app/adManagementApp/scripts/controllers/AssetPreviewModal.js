app.controller('AssetPreviewModalCtrl', ['$scope', '$modalInstance',  'EC2Restangular','adAsset', function($scope, $modalInstance, EC2Restangular, adAsset)
{
	$scope.ok = function () {
		$modalInstance.close();
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
}]);