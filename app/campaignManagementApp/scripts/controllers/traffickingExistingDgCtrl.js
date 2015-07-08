/**
 * Created by Ofir.Fridman on 11/23/14.
 */
'use strict';

app.controller('traffickingExistingDgCtrl', ['$scope', '$modalInstance',
	function ($scope, $modalInstance) {


		$scope.dgs = [
			{id: "A17H12", name: "DG1", dimension: "120X600", childRotationType: "Even Dis",targetAudienceId:"A"},
			{id: "BCD123", name: "DG2"},
			{id: "BCD123", name: "DG2"},
			{id: "BCD123", name: "DG2"},
			{id: "BCD123", name: "DG2"},
			{id: "BCD123", name: "DG2"},
			{id: "BCD123", name: "DG2"}
		];

		angular.forEach($scope.dgs, function (dg){
			dg.selectEnabled = !dg.targetAudienceId;
		});


		$scope.selectedItems = [];
		$scope.columns = [
			{field: 'id', displayName: 'DELIVERY GROUP ID'},
			{field: 'name', displayName: 'NAME' },
			{field: 'dimension', displayName: 'dimension'},
			{field: 'childRotationType', displayName: 'rotation'}
		];


		$scope.onSelect = function () {
			$modalInstance.close();
		}

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	}]);