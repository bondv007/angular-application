app.controller('accountsCtrl', ['$scope', 'infraEnums', 'mmPermissions', 'adminUtils', 'entityMetaData', '$state', 'mmContextService',
	function ($scope, infraEnums, mmPermissions, adminUtils, entityMetaData, $state, mmContextService) {

	var type = 'account';
	var goToData = {links: [], actions : []};
	var centralAccountActions = [{ name: 'Delete', func: onDeleteBtnClicked, relationType: infraEnums.buttonRelationToRowType.any}];
	var hasCreateAccountPermission = mmPermissions.hasPermissionBySession(entityMetaData[type].permissions.entity.create);
	var isModalConfirmDeleteOpen = false;
	$scope.currEntralEntity = {};	//hold ref to the entral entity
	$scope.accountsRef = [];

	setGoToData();

	$scope.centralDataObject = [{
		type: type,
		centralActions: centralAccountActions,
		hideGoTo : false,
		goToData : goToData,
		goToManipulator : setGoToData,
		hideAddButton:!hasCreateAccountPermission ,
		dataManipulator: dataManipulator,
		isEditable: true,
		editButtons: [],
		isEditMultiple: false
	}];

	//GoTo - set links & actions by entity logic and permissions
	function setGoToData(selectedEntity){
		var hasUsersPermissions = false;
		var hasCampaignsPermissions = false;
		var hasAdvertisersPermissions = false;
		var hasCreateCamp = false;
		if(selectedEntity){
			hasCampaignsPermissions = mmPermissions.hasPermissionByEntity(selectedEntity, entityMetaData["campaign"].permissions.entity);
			hasAdvertisersPermissions = mmPermissions.hasPermissionByEntity(selectedEntity, entityMetaData["advertiser"].permissions.entity);
			hasCreateCamp = mmPermissions.hasPermissionByEntity(selectedEntity, entityMetaData["campaign"].permissions.entity.createEdit);
			hasUsersPermissions =  mmPermissions.hasPermissionByEntity(selectedEntity, entityMetaData['user'].permissions.entity);
			$scope.currEntralEntity = selectedEntity;
		}
		goToData.links.length = 0;
		goToData.actions.length = 0;

		//set links array
		goToData.links.push({type: 'account id', namePath: 'id', sref: 'spa.account.accountEdit', paramKey: 'accountId', paramPath: 'id'});
		if(hasUsersPermissions)
			goToData.links.push({type: 'user', namePath: 'relationsBag.children.users.count', sref: 'spa.account.users', paramKey: 'accountId', paramPath: 'id'});
		if(hasAdvertisersPermissions && selectedEntity && selectedEntity.accountTypes.campaignManager)
			goToData.links.push({type: 'advertiser', namePath: 'relationsBag.children.advertisers.count', sref: 'spa.account.advertisers', paramKey: 'accountId', paramPath: 'id'});
		if(hasCampaignsPermissions && selectedEntity && selectedEntity.accountTypes.campaignManager)
			goToData.links.push({type: 'campaign', namePath: 'relationsBag.children.campaigns.count', sref: 'spa.account.campaigns', paramKey: 'accountId', paramPath: 'id'});

		goToData.links.push({type: 'strategies', namePath: '', sref: 'spa.account.strategies', paramKey: 'accountId', paramPath: 'id'});

		//due to the fact that HISTORY action was already added by entityLayout.js, needs to reorder the actions and add HISTORY to be last
		//set actions array
		if(hasUsersPermissions) goToData.actions.push({name: 'New User', func: newUser});
		if(hasAdvertisersPermissions) goToData.actions.push({name: 'New Advertiser', func: newAdvertiser});
		if(hasCreateCamp) goToData.actions.push({name: 'New Campaign', func: newCampaign});
	}

	function dataManipulator(data){
		var relatedEntitiesName = ["users", "advertisers", "campaigns"];
		//add countLink property for the central display
		data.forEach(function(entity){
			var generatedLink = adminUtils.linksBuilder.linksForList(relatedEntitiesName, entity.type, entity.relationsBag);
			relatedEntitiesName.forEach(function(name){
				if(entity.relationsBag && entity.relationsBag.children){
					entity.relationsBag.children[name].countLink = generatedLink[name].text;
				}
			});

			//account type manipulation to be able to display multiple types as a string. e.g : "Campaign Manager, Creative Manager".
			adminUtils.manipulator.accountTypes(entity);
		});

		//save reference to the list items (accounts)
		if(!_.isEmpty($scope.accountsRef)){
			$scope.accountsRef = $scope.accountsRef.concat(data);
		}else{
			$scope.accountsRef = data;
		}
	}

	function onDeleteBtnClicked(items, selectedItems){
		if(isModalConfirmDeleteOpen){
			return;
		}
		isModalConfirmDeleteOpen = adminUtils.crudOperations.deleteEntities(items, selectedItems, entityMetaData[type].name);
	}

	function newUser() {
		mmContextService.addContextItem($scope.currEntralEntity.id, type, $scope.currEntralEntity.name, true);
		$state.go('spa.user.userNew',{ userId: ''});
	}
	function newAdvertiser() {
		mmContextService.addContextItem($scope.currEntralEntity.id, type, $scope.currEntralEntity.name, true);
		$state.go('spa.advertiser.advertiserNew',{ userId: ""});
	}

	function newCampaign() {
		mmContextService.addContextItem($scope.currEntralEntity.id, type, $scope.currEntralEntity.name, true);
		$state.go('spa.campaign.campaignNew',{ userId: ""});
	}

	function changeView(view) {
		$state.go(view.ref, { accountId: view.accountId});
	}
}]);
/**
 * Created by rotem.perets on 5/27/14.
 */
