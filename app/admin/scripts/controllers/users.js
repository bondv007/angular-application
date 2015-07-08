/**
 * Created by rotem.perets on 5/27/14.
 * Updated by atd 6/14
 */
app.controller('usersCtrl', ['$scope', 'mmModal', 'adminUtils', 'entityMetaData', 'infraEnums',
  function ($scope, mmModal, adminUtils, entityMetaData, infraEnums) {
		var type = 'user';
		$scope.hideGoTo = true;
    var centralUserActions = [
			{name: 'Delete', func: onDeleteBtnClicked, relationType: infraEnums.buttonRelationToRowType.any}
    ];

    $scope.centralDataObject = [
        { type: type, centralActions: centralUserActions, dataManipulator: null, isEditable: true, editButtons: [], isEditMultiple: false}
    ];

		var isModalConfirmDeleteOpen = false;
		function onDeleteBtnClicked(items, selectedItems){
			if(isModalConfirmDeleteOpen){
				return;
			}
			isModalConfirmDeleteOpen = adminUtils.crudOperations.deleteEntities(items, selectedItems, entityMetaData[type].name);
		}
}]);