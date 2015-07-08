/**
 * Created by Atdg on 6/5/14.
 */
'use strict';

app.controller('siteSitesectionCtrl', ['$scope', 'mmModal', function ($scope, mmModal) {

	var centralSiteActions = [
		{ name: 'Delete', func: confirmSiteDelete, disable: true}
	];

	var centralSectionActions = [
		{ name: 'Delete', func: confirmSectionDelete }
	];

  var addSubEntity = {
    index: 1,
    text: 'Add new Section'
  };

	function deleteSection(list, selectedItems) {
		for (var i = 0; i < selectedItems.length; i++) {
			selectedItems[i].remove();
			list.splice(list.indexOf(selectedItems[i]), 1);
		}
	}

	function deleteSite(list, selectedItems) {
		for (var i = 0; i < selectedItems.length; i++) {
			selectedItems[i].remove();
			list.splice(list.indexOf(selectedItems[i]), 1);
		}
	}

	$scope.centralDataObject = [
		{ type: 'site', centralActions: centralSiteActions, isEditable: true, editButtons: [], addSubEntity: addSubEntity },
		{ type: 'siteSitesection', centralActions: centralSectionActions, isEditable: true, editButtons: [] }
	];

	function confirmSiteDelete(list, selectedItems) {
		var modalInstance = mmModal.open({
			templateUrl: './infra/views/mmDeleteDialog.html',
			controller: 'mmDiscardDialogCtrl',
			title: "Delete selected sites",
			modalWidth: 420,
			bodyHeight: 40,
			confirmButton: { name: "Delete items", funcName: "discard" },
			discardButton: { name: "Cancel", funcName: "cancel"}
		});
		modalInstance.result.then(function () {
			$scope.isDiscardModalOpen = false;
			deleteSite(list, selectedItems);
		}, function () {
			$scope.isDiscardModalOpen = false;
		});
	}

	function confirmSectionDelete(list, selectedItems) {
		var modalInstance = mmModal.open({
			templateUrl: './infra/views/mmDeleteDialog.html',
			controller: 'mmDiscardDialogCtrl',
			title: "Delete selected items",
			modalWidth: 420,
			bodyHeight: 40,
			confirmButton: { name: "Delete selected sections", funcName: "discard" },
			discardButton: { name: "Cancel", funcName: "cancel"}
		});
		modalInstance.result.then(function () {
			$scope.isDiscardModalOpen = false;
			deleteSection(list, selectedItems);
		}, function () {
			$scope.isDiscardModalOpen = false;
		});
	}
	}]);
