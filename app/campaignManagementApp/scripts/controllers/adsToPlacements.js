/**
 * Created by ofir.fridman on 9/17/14.
 */
'use strict';
app.controller('adsToPlacementsCtrl', ['$scope', '$modalInstance', 'adsToPlacement', 'selected',
	function ($scope, $modalInstance, adsToPlacement, selected) {
		$scope.gridColumns = adsToPlacement.getColumnNames();
		$scope.gridData = selected.placementsWithAds;
		$scope.isAtListOneAdSelected = true;
		var isAllSelectedObj = adsToPlacement.isAllAdsSelected($scope.gridData, $scope.isAtListOneAdSelected);
		$scope.isAtListOneAdSelected = isAllSelectedObj.isAtListOneAdSelected;
		$scope.parentAdCheckBox = {selected: isAllSelectedObj.isAllSelected};

		$scope.attach = function(){
			adsToPlacement.attachAction($scope.gridData, $modalInstance);
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};

		$scope.disableAttachButton = function (disable) {
			disable = disable !== undefined ? disable : true;
			angular.element("[ng-click='attach()']").attr("disabled", disable);
		};

		$scope.onAdCBChange = function () {
			var isAllSelectedObj = adsToPlacement.isAllAdsSelected($scope.gridData);
			$scope.isAtListOneAdSelected = isAllSelectedObj.isAtListOneAdSelected;
			$scope.parentAdCheckBox.selected = isAllSelectedObj.isAllSelected;
			$scope.disableAttachButton(!$scope.isAtListOneAdSelected);
		};

		$scope.onParentCbChange = function(){
			$scope.isAtListOneAdSelected = $scope.parentAdCheckBox.selected;
			$scope.disableAttachButton(!$scope.parentAdCheckBox.selected);
			for (var i = 0; i < $scope.gridData.length; i++) {
				var row = $scope.gridData[i];
				for (var j = 0; j < row.adsToAttach.length; j++) {
					row.adsToAttach[j].isSelected = $scope.parentAdCheckBox.selected;
				}
			}
		};
	}]);