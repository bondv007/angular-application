/**
 * Created by rotem.perets on 5/27/14.
 */
'use strict';

app.controller('siteCtrl', ['$scope', '$state', '$stateParams','flowToolBar', 'adminUtils', 'mmPermissions', 'entityMetaData', 'mmContextService',
	function ($scope, $state, $stateParams, flowToolBar, adminUtils, mmPermissions, entityMetaData, mmContextService) {

		var hasCampaignsPermissions = false;
		var hasAccountsPermissions = false;
		var hasCreateSitePermission = mmPermissions.hasPermissionBySession(entityMetaData['site'].permissions.entity.create);

		$scope.type = 'site';
		$scope.showHistory = true;
		$scope.hideGoTo = false;
		$scope.hideSettings = true;
		$scope.childModel = {};
		$scope.goToData = {};
		$scope.goToData.links = [];
		$scope.goToData.actions = [];
		$scope.entityId = $stateParams.siteId;

		var watcher = $scope.$watch('childModel', function (newValue, oldValue) {
			if(!_.isEmpty($scope.childModel))
			{
				getEntityPermissions();
				setGoToData();
			}
		});

		$scope.entityActions = [
			{
				name: 'Setup',
				ref: '.siteEdit',
				func: changeToSiteEditView,
				preventOpenMenu: true
			},
			{
				name: 'Site Sections',
				ref: '.sitesections',
				func: changeToSectionsView,
				preventOpenMenu: true
			}
		];
		$scope.entityActions.parentMenuItem = 'Admin';

		function getEntityPermissions(){
			hasCampaignsPermissions = mmPermissions.hasPermissionByEntity($scope.childModel, entityMetaData["campaign"].permissions.entity);
			hasAccountsPermissions = mmPermissions.hasPermissionByEntity($scope.childModel, entityMetaData["account"].permissions.entity);
		}

		//GoTo - set links & actions by entity logic and permissions
		function setGoToData(){
			$scope.childModel.accountCount = $scope.childModel.siteAccounts ? $scope.childModel.siteAccounts.length : 0;
			//set links array
			$scope.goToData.links.push({type: 'site id', namePath: 'id', sref: 'spa.site.siteEdit', paramKey: 'siteId', paramPath: 'id'});
			if(hasCampaignsPermissions) $scope.goToData.links.push({type: 'campaigns', namePath: 'relationsBag.children.campaigns.count', sref: 'spa.site.campaigns', paramKey: 'siteId', paramPath: 'id'});
			if(hasAccountsPermissions) $scope.goToData.links.push({type: 'accounts', namePath: 'accountCount', sref: 'spa.site.accounts', paramKey: 'siteId', paramPath: 'id'});
			//$scope.goToData.links.push({type: 'site sections', namePath: 'id', sref: 'spa.site.sitesections', paramKey: 'siteId', paramPath: 'id'});

			//due to the fact that HISTORY action was already added by entityLayout.js, needs to reorder the actions and add HISTORY to be last
			//set actions array
			var indx = 0;
			if(hasCreateSitePermission) $scope.goToData.actions.splice(indx++, 0, {name: 'New Site', func: newSite});
			$scope.goToData.actions.splice(indx++, 0, {name: 'New Site Section', func: newSiteSection});
			$scope.goToData.actions.splice(indx, 0, {name: 'Delete', func: deleteEntity});
		}

		function newSite() {
			changeView({ref: 'spa.site.siteNew', siteId: ''});
		}
		function newSiteSection() {
			mmContextService.addContextItem($scope.childModel.id, $scope.type, $scope.childModel.name, true);
			changeView({ref: 'spa.sitesection.sitesectionNew', siteId: ''});
		}
		function deleteEntity() {
			adminUtils.crudOperations.deleteEntity($scope.childModel, "spa.admin.sites");
		}

		flowToolBar.setPrefixToEntityActions('spa.site',$scope.entityActions);

		if($scope.$parent.isActive) $scope.$parent.isActive($scope.entityActions.parentMenuItem);

		function changeToSiteEditView(){
			var view = {ref: 'spa.site.siteEdit',siteId: $scope.entityId};
			changeView(view);
		}
		function changeToSectionsView(){
			var view = {ref: 'spa.site.sitesections',siteId: $scope.entityId};
			changeView(view);
		}
		function changeView(view) {
			$state.go(view.ref, { siteId: view.siteId});
		}
	}]);
