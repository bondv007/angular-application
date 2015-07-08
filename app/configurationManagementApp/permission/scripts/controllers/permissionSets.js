/**
 * Created by rotem.perets on 5/27/14.
 */
app.controller('permissionSetsCtrl', ['$scope','adminUtils', 'mmPermissions', 'entityMetaData', function ($scope, adminUtils, mmPermissions, entityMetaData) {
	var type = 'permissionSet';
  var centralPermissionActions = [
		{ name: 'Delete',  func: onDeleteBtnClicked, disabledByPermission : true}
  ];

  var hasCreatePermissionSetPermission = mmPermissions.hasPermissionBySession(entityMetaData["permissionSet"].permissions.entity.createEdit);
  $scope.centralDataObject = [
    { type: type, centralActions: centralPermissionActions, dataManipulator: null, isEditable: true, editButtons: [], hideAddButton:!hasCreatePermissionSetPermission}
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
