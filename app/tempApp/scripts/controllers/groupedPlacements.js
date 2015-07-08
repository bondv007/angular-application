'use strict';

app.controller('groupedPlacementsCtrl', ['$scope', 'placementService', function ($scope, placementService) {
	var placements = placementService.getPlacements();

	var props = [];
	var newPlacement = new Placement();
	for (var propertyName in newPlacement) {
		if (newPlacement.hasOwnProperty(propertyName)) {
			props.push(propertyName);
		}
	}

	function sortByMember(items, groupBy) {
		var groups = {};
		for (var i = 0; i < items.length; i++) {
			var name = items[i][groupBy];
			if (!groups[name]) {
				groups[name] = [];
			}
			groups[name].push(items[[i]]);
		}
		return groups;
	}

	$scope.sortBy = 'siteName';
	$scope.open = false;
	$scope.groupByOptions = props;
//    $scope.placements = placements;
	$scope.sortedPlacements = sortByMember(placements, 'siteName');

	$scope.changeSort = function (opt) {
		$scope.sortBy = opt;
		$scope.open = false;
		$scope.sortedPlacements = sortByMember(placements, $scope.sortBy);
	};


	$scope.asdf = [
		{value: 'a', id: 1},
		{value: 'b', id: 2},
		{value: 'c', id: 3 }
	];
}]);
