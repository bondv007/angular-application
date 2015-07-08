/**
 * Created by Atdg on 6/14.
 */
'use strict';

app.controller('accountAdvertiserBrandCtrl', ['$scope', '$stateParams', 'EC2Restangular', 'mmModal', '$state', function ($scope, $stateParams, EC2Restangular, mmModal, $state) {

	var advertisers = EC2Restangular.all('advertisers');

	var centralBrandActions = [
		{ name: 'Delete', func: confirmBrandDelete, disable: true}
	];

	var centralAdvertiserActions = [
		{ name: 'Delete', func: confirmAdvertiserDelete, disable: true }
	];

	var centralAccountActions = [
		{ name: 'Delete', func: confirmAccountDelete, disable: true }
	];

	function deleteAccount(list, selectedItems) {
		for (var i = 0; i < selectedItems.length; i++) {
			selectedItems[i].remove();
			list.splice(list.indexOf(selectedItems[i]), 1);
		}
	}

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

	function modifiedAdvertiserAccts(advertiserAccounts) {
		advertiserAccounts._orig = [];
		var goodAdvAcct = [];
		while (advertiserAccounts.length > 0) {
			var advAcct = advertiserAccounts.pop();
			advertiserAccounts._orig.push(advAcct);
			advAcct.aaId = advAcct.id;
			advAcct._id_ = advAcct.id;
			//advAcct.id = advAcct.advertiserId;
			goodAdvAcct.push(advAcct);
		}
		for (var i = 0; i < goodAdvAcct.length; i++) {
			advertiserAccounts.push(goodAdvAcct[i]);
		}
		$scope.advertiserAccounts = advertiserAccounts;
	}

	function modifiedBAAs(brandAdvertiserAccounts) {
		brandAdvertiserAccounts._orig = [];
		var goodBAA = [];
		while (brandAdvertiserAccounts.length > 0) {
			var brandAA = brandAdvertiserAccounts.pop();
			brandAdvertiserAccounts._orig.push(brandAA);
			brandAA.baaId = brandAA.id;
			brandAA._id_ = brandAA.id;
			brandAA.id = brandAA.brandId;
			goodBAA.push(brandAA);
		}
		for (var i = 0; i < goodAdvAcct.length; i++) {
			brandAdvertiserAccounts.push(goodBAA[i]);
		}
		$scope.brandAdvertiserAccounts = brandAdvertiserAccounts;

	}

	$scope.centralDataObject = [
		{ type: 'account', centralActions: centralAccountActions, isEditable: true, editButtons: [] },
		{ type: 'advertiserAccount', centralActions: centralAdvertiserActions, dataManipulator: null, isEditable: true, editButtons: [], hideAddButton: true },
		{ type: 'brandAdvertiserAccount', centralActions: centralBrandActions, dataManipulator: null, isEditable: true, editButtons: [], hideAddButton: true }
	];

	function confirmAccountDelete(list, selectedItems) {
		var modalInstance = mmModal.open({
			templateUrl: './infra/views/mmDeleteDialog.html',
			controller: 'mmDiscardDialogCtrl',
			title: "Delete selected accounts",
			modalWidth: 420,
			bodyHeight: 40,
			confirmButton: { name: "Delete items", funcName: "discard" },
			discardButton: { name: "Cancel", funcName: "cancel"}
		});
		modalInstance.result.then(function () {
			$scope.isDiscardModalOpen = false;
			deleteAccount(list, selectedItems);
		}, function () {
			$scope.isDiscardModalOpen = false;
		});
	}

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
