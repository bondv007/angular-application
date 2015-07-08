'use strict';

app.controller('OrderCtrl', ['$scope', '$timeout', 'Restangular', function ($scope, $timeout, Restangular) {
	var baseOrder = Restangular.all('order');

	$scope.campaigns = baseOrder.getList();
	$scope.type = {};
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
			$scope.gridOptions.filterOptions.filterText = 'EntityId:' + searchText + '; ';
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
			// DELETE //
			$scope.lastST = $scope.searchTerm; // fix a bug on ngGrid if you filter and delete a row and then delete the filter
			$scope.searchTerm = ''; // fix a bug on ngGrid if you filter and delete a row and then delete the filter
			var index = $scope.campaigns.indexOf(ntt);
			$scope.campaigns.splice(index, 1);
			$scope.$digest(); // fix a bug on ngGrid when click inside the table but outside of a row
		} else {
			// EDIT //
			Restangular.one('order', ntt.OrderID).get().then(function (order) {
				order.IsDeleted = ntt.IsDeleted;
				order.put();
			});
		}
	});
	$scope.gridOptions = {
		data: 'campaigns',
		enableCellSelection: true,
		enableRowSelection: false,
		enableCellEditOnFocus: true,
		filterOptions: $scope.filterOptions,
		columnDefs: [
			{field: 'Customer', visible: false},
			{field: 'EntityId', displayName: 'Entity ID', enableCellEdit: false},
			{field: 'OrderID', visible: false},
			{field: 'OrderDate', displayName: 'Date', cellFilter: 'moment:"DD/MM/YYYY HH:mm"', enableCellEdit: false},
			{field: 'IsDeleted', displayName: 'Deleted', cellTemplate: '<div class="ngSelectionCell"><input disabled="true" tabindex="-1" class="ngSelectionCheckbox" type="checkbox" ng-checked="row.entity.IsDeleted"/></div>',
				editableCellTemplate: '<div class="ngSelectionCell"><input ng-input="COL_FIELD" ng-model="COL_FIELD" tabindex="-1" class="ngSelectionCheckbox" type="checkbox" ng-checked="row.entity.IsDeleted"/></div>'}
		]
	};
}]);