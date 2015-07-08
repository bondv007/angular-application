/**
 * Created by alon.shemesh on 3/31/14.
 */
'use strict';

app.controller('mmDiscardDialogCtrl', ['$scope', '$modalInstance', function ($scope,  $modalInstance) {

	$scope.discard = function () {
			$modalInstance.close();
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
}]);