'use strict';

app.controller('placementCtrl', ['$scope', 'placementService', function ($scope, placementService) {
	$scope.placements = placementService.getPlacements();
}]);
