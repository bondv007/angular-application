/**
 * Created by atd.
 */

app.controller('sitesCtrl', ['$scope', 'mmModal', '$state', 'adminUtils', 'entityMetaData', 'mmPermissions', 'infraEnums',
  function ($scope, mmModal, $state, adminUtils, entityMetaData, mmPermissions, infraEnums) {

	var type = 'site';
	$scope.hideGoTo = true;
	var centralSiteActions = [
		{ name: 'Delete', func: onDeleteBtnClicked, relationType: infraEnums.buttonRelationToRowType.any}
	];

	function addSite(){
		$state.go('spa.site.siteEdit');
	}

  var hasCreateSitePermission = mmPermissions.hasPermissionBySession(entityMetaData["site"].permissions.entity.create);
	$scope.centralDataObject = [
		{ type: type, centralActions: centralSiteActions, dataManipulator: dataManipulator, isEditable: true, editButtons: [], isEditMultiple: false, hideAddButton:!hasCreateSitePermission}
	];

	function dataManipulator(data){
		$scope.sites = data;
		//add countLink property for the central display
		data.forEach(function(entity){
			if(entity.relationsBag.campaign){
				entity.relationsBag.campaign.countLink =  entity.relationsBag.campaign.count + ' ' + 'Campaign';
				if(entity.relationsBag.campaign.count == 0 || entity.relationsBag.campaign.count > 1)
					entity.relationsBag.campaign.countLink += 's';
			}
		});
	}

	var isModalConfirmDeleteOpen = false;
	function onDeleteBtnClicked(items, selectedItems){
		if(isModalConfirmDeleteOpen){
			return;
		}
		isModalConfirmDeleteOpen = adminUtils.crudOperations.deleteEntities(items, selectedItems, entityMetaData[type].name);
	}
}]);
