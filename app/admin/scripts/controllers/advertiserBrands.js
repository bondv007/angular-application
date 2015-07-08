/**
 * Created by Atdg on 6/5/14.
 */
'use strict';

app.controller('advertiserBrandsCtrl', ['$scope', '$stateParams', 'EC2Restangular', 'mmModal', '$state', function ($scope, $stateParams, EC2Restangular, mmModal, $state) {

	var centralBrandActions = [
		{ name: 'Delete', func: confirmBrandDelete, disable: true }
	];

	var centralAdvertiserActions = [
		{ name: 'Delete', func: confirmAdvertiserDelete, disable: true }
	];

  var addSubEntity = {
    index: 1,
    text: 'Add new Brand'
  };

	function deleteAdvertiser(list, selectedItems) {
		for (var i = 0; i < selectedItems.length; i++) {
			selectedItems[i].remove();
			list.splice(list.indexOf(selectedItems[i]), 1);
		}
	}

	function deleteBrand(list, selectedItems) {
		for (var i = 0; i < selectedItems.length; i++) {
			selectedItems[i].remove();
			list.splice(list.indexOf(selectedItems[i]), 1);
		}
	}

	$scope.centralDataObject = [
		{ type: 'advertiser', centralActions: centralAdvertiserActions, isEditable: true, editButtons: [], addSubEntity: addSubEntity },
		{ type: 'advertiserBrand', centralActions: centralBrandActions, isEditable: true, editButtons: [] }
	];

	function confirmAdvertiserDelete(list, selectedItems) {
		var modalInstance = mmModal.open({
			templateUrl: './infra/views/mmDeleteDialog.html',
			controller: 'mmDiscardDialogCtrl',
			title: "Delete selected advertisers",
			modalWidth: 420,
			bodyHeight: 40,
			confirmButton: { name: "Delete items", funcName: "discard" },
			discardButton: { name: "Cancel", funcName: "cancel"}
		});
		modalInstance.result.then(function () {
			$scope.isDiscardModalOpen = false;
			deleteAdvertiser(list, selectedItems);
		}, function () {
			$scope.isDiscardModalOpen = false;
		});
	}

	function confirmBrandDelete(list, selectedItems) {
		var modalInstance = mmModal.open({
			templateUrl: './infra/views/mmDeleteDialog.html',
			controller: 'mmDiscardDialogCtrl',
			title: "Delete selected brands",
			modalWidth: 420,
			bodyHeight: 40,
			confirmButton: { name: "Delete items", funcName: "discard" },
			discardButton: { name: "Cancel", funcName: "cancel"}
		});
		modalInstance.result.then(function () {
			$scope.isDiscardModalOpen = false;
			deleteBrand(list, selectedItems);
		}, function () {
			$scope.isDiscardModalOpen = false;
		});
	}

}]);
