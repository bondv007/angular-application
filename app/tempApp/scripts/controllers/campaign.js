'use strict';

app.controller('CampaignCtrl', ['$scope', '$timeout', 'campaignsData', function ($scope, $timeout, campaignsData) {
	$scope.campaigns = campaignsData.campaigns;
	$scope.type = campaignsData.type;
	$scope.maxCampaigns = 10;
	$scope.searchTerm = '';
	$scope.focusCallback = function () {
		$scope.gridOptions.ngGrid.$viewport.scrollTop(0); // fix a bug on ngGrid that try to return to the scroll before filtering
	};
	$scope.filterOptions = {
		filterText: ''
	};
	$scope.typeHash = {};
	$scope.$watch('type', function () {
		$scope.typeHash = {};
		for (var i = 0; i < $scope.type.length; i++) {
			$scope.typeHash[$scope.type[i].id] = $scope.type[i].name;
		}
	});
	$scope.$watch('searchTerm', function (searchText, oldsearchText) {
		if (searchText !== oldsearchText) {
			$scope.gridOptions.ngGrid.$viewport.scrollTop(0); // fix a bug on ngGrid that try to return to the scroll before filtering
			$scope.gridOptions.filterOptions.filterText = 'name:' + searchText + '; ';
		}
	});
	$scope.addRow = function () {
		$scope.searchTerm = '';
		$scope.gridOptions.ngGrid.$viewport.scrollTop(0);
		$scope.campaigns.unshift({ name: '- New Name -', type: 0 });
	};
	/* fix a bug on ngGrid if you filter and delete a row and then delete the filter */
	$scope.$on('ngGridEventFilter', function () {
		if ($scope.lastST !== undefined) {
			var last = $scope.lastST;
			$scope.lastST = undefined;
			$timeout(function () {
				$scope.searchTerm = last;
			}, 10);
		}
	});
	$scope.$on('ngGridEventEndCellEdit', function (evt) {
		var ntt = evt.targetScope.row.entity;
		var name = ntt.name;
		if (name === '') {
			$scope.lastST = $scope.searchTerm; // fix a bug on ngGrid if you filter and delete a row and then delete the filter
			$scope.searchTerm = ''; // fix a bug on ngGrid if you filter and delete a row and then delete the filter
			var index = $scope.campaigns.indexOf(ntt);
			$scope.campaigns.splice(index, 1);
			$scope.$digest(); // fix a bug on ngGrid when click inside the table but outside of a row
		}
	});
	$scope.gridOptions = {
		data: 'campaigns',
		enableCellSelection: true,
		enableRowSelection: false,
		enableCellEdit: true,
		filterOptions: $scope.filterOptions,
		columnDefs: [
			{field: 'id', visible: false},
			{field: 'name', displayName: 'Name', enableCellEdit: true},
			{field: 'type', displayName: 'Type', cellTemplate: '<div class="ngCellText">{{typeHash[row.getProperty(col.field)]}}</div>',
				editableCellTemplate: '<div><select ng-input="COL_FIELD" ng-model="COL_FIELD" ng-options="option.id as option.name for option in type"></select></div>'}
		]
	};
}]);
