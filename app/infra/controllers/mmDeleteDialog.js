/**
 * Created by liad.ron on 2/19/15.
 */
'use strict';

app.controller('mmDeleteDialogCtrl', ['$scope', '$modalInstance', 'text', function ($scope,  $modalInstance, text) {

	$scope.bodyText = text;

	$scope.discard = function () {
			$modalInstance.close();
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
}]);