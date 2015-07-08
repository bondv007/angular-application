'use strict';

app.controller('placementsListCtrl', ['$scope', '$stateParams', 'campaignsData', function ($scope, $stateParams, campaignsData) {
	$scope.campaigns = campaignsData.campaigns;
	$scope.type = campaignsData.type;
	$scope.typeHash = {};
	$scope.$watch('type', function () {
		$scope.typeHash = {};
		for (var i = 0; i < $scope.type.length; i++) {
			$scope.typeHash[$scope.type[i].id] = $scope.type[i].name;
		}
	});
	$scope.columnCollection = [
		{label: 'Name', map: 'name', isEditable: true},
		{label: 'Type', map: 'type', formatFunction: function (value) {
			return $scope.typeHash[value];
		}}
	];
	$scope.globalConfig = {
		isGlobalSearchActivated: true,
		isPaginationEnabled: true,
		itemsByPage: 50,
		maxSize: 9
	};
}]);
