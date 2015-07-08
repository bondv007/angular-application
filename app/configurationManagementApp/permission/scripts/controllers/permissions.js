/**
 * Created by rotem.perets on 5/27/14.
 */
app.controller('permissionsCtrl', ['$scope', 'adminUtils', 'mmPermissions', 'entityMetaData', function ($scope, adminUtils, mmPermissions, entityMetaData) {
	var type = 'permission';
  var centralPermissionActions = [
		{ name: 'Delete',  func: onDeleteBtnClicked, disabledByPermission : true}
  ];

  var hasCreatePermissionPermission = mmPermissions.hasPermissionBySession(entityMetaData["permission"].permissions.entity.createEdit);
  $scope.centralDataObject = [
    { type: type, centralActions: centralPermissionActions, dataManipulator: null, isEditable: true, editButtons: [], hideAddButton:!hasCreatePermissionPermission }
  ];

	var isModalConfirmDeleteOpen = false;
	function onDeleteBtnClicked(items){
		if(isModalConfirmDeleteOpen){
			return;
		}
		var selectedItems = $scope.centralDataObject[0].selectedItems;
		isModalConfirmDeleteOpen = adminUtils.crudOperations.deleteEntities(selectedItems, items, type);
	}
}]);
