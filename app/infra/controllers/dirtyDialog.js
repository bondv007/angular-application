/**
 * Created by alon.shemesh on 3/31/14.
 */
'use strict';

app.controller('dirtyDialogCtrl', ['$scope', '$modalInstance', function ($scope,  $modalInstance) {

	$scope.discard = function () {
			$modalInstance.close();
	};

	$scope.continueEditing = function () {
		event.preventDefault();
		$modalInstance.dismiss('cancel');
	};
}]);