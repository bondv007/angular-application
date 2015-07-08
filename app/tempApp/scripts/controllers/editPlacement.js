'use strict';

app.controller('editPlacementCtrl', ['$scope', '$stateParams', '$window', 'placementService', function ($scope, $stateParams, $window, placementService) {
	var placementId = $stateParams.placementId;
	$scope.placement = placementService.getPlacementById(placementId);

	$scope.savePlacement = function (placement) {
		placementService.savePlacement(placement);
		$window.history.back();
	};
}]);
