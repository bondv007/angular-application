/**
 * Created by ofir.fridman on 9/17/14.
 */
'use strict';

app.service('adsToPlacement', ['EC2Restangular', 'mmAlertService', function (EC2Restangular, mmAlertService) {
	var serverDelivery = EC2Restangular.all('deliveryGroups/attachAdsToPlacements');
	function getColumnNames() {
		return [
			{name: 'Placement id'},
			{name: 'Placement Name'},
			{name: 'Size'},
			{name: 'Type'},
			{isCheckbox: true},
			{name: 'Master Ad id'},
			{name: 'Master Ad Name'}
		];
	}

	function isAllAdsSelected(gridData) {
		var isAllSelected = true;

		var isAtListOneAdSelected = false;
		for (var i = 0; i < gridData.length; i++) {
			var row = gridData[i];
			for (var j = 0; j < row.adsToAttach.length; j++) {
				if (row.adsToAttach[j].isSelected) {
					isAtListOneAdSelected = true;
				} else {
					isAllSelected = false;
				}
				if (isAtListOneAdSelected && !isAllSelected) {
					break;
				}
			}
			if (isAtListOneAdSelected && !isAllSelected) {
				break;
			}
		}
		return {isAllSelected: isAllSelected, isAtListOneAdSelected: isAtListOneAdSelected};
	}

	function attachAction(placementsWithAds, modalInstance) {
		var clonePlacementsWithAds = EC2Restangular.copy(placementsWithAds);
		clonePlacementsWithAds = _getPlacementsWithSelectedAds(clonePlacementsWithAds);
		if(clonePlacementsWithAds.length > 0){
			serverDelivery.customPUT(clonePlacementsWithAds).then(function () {
				mmAlertService.addSuccess("Attach ads to placements success.");
				modalInstance.close();
			}, function (processError) {
				mmAlertService.addError(processError);
			});
		}else{
			mmAlertService.addError("Please select at least 1 ad.");
		}
	}

	function _getPlacementsWithSelectedAds(placementsWithAds){
		for (var i = 0; i < placementsWithAds.length; i++) {
			placementsWithAds[i].adsToAttach = _.filter(placementsWithAds[i].adsToAttach, function (ad) {
				return ad.isSelected;
			});
		}

		return _.filter(placementsWithAds, function (placement) {
			return placement.adsToAttach.length > 0;
		});
	}

	return {
		getColumnNames: getColumnNames,
		attachAction: attachAction,
		isAllAdsSelected: isAllAdsSelected,
		privateFunctionsTest : {getPlacementsWithSelectedAds:_getPlacementsWithSelectedAds}

	};
}]);
