'use strict';

app.controller('placementsCtrl', ['$scope', '$stateParams', 'placementService', function ($scope, $stateParams, placementService) {
	var changer = 1;
	var memberName = $stateParams.groupByKey;
	var memberValue = $stateParams.groupByValue;
	var placements = placementService.getPlacementsByMemberValue(memberName, memberValue);
	$scope.pls = placements;
	$scope.sortBy = function (sortBy) {
		function compare(a, b) {
			if (a[sortBy] < b[sortBy]) {
				return changer;
			}
			if (a[sortBy] > b[sortBy]) {
				return -1 * changer;
			}
			return 0;
		}

		placements.sort(compare);
		$scope.pls = placements;

		changer = changer * -1;
	};
}]);
