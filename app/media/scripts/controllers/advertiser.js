/**
 * Created by liad.ron on 10/27/14.
 */
'use strict';

app.controller('advertiserCtrl', ['$scope', '$state', '$stateParams', 'flowToolBar', 'entityMetaData', 'mmPermissions', 'adminUtils',
	function ($scope, $state, $stateParams, flowToolBar, entityMetaData, mmPermissions, adminUtils) {

		var hasCampaignsPermissions = false;
		var hasAccountsPermissions = false;
		var hasBrandsPermissions = false;

		$scope.type = 'advertiser';
		$scope.entityId = $stateParams.advertiserId;
		$scope.childModel = {};
		$scope.showHistory = true;
		$scope.entityActions = [];
		$scope.goToData = {};
		$scope.goToData.links = [];
		$scope.goToData.actions = [];
		$scope.hideGoTo = false;

		var watcher = $scope.$watch('childModel', function (newValue, oldValue) {
			if(!_.isEmpty($scope.childModel)){
				setEntityActions($scope.childModel);
				setGoToData();
			}
		});

		function setEntityActions(advertiser) {
			hasAccountsPermissions = mmPermissions.hasPermissionByEntity(advertiser, entityMetaData["account"].permissions.entity);
			hasBrandsPermissions = mmPermissions.hasPermissionByEntity(advertiser, entityMetaData["brand"].permissions.entity);
			hasCampaignsPermissions = mmPermissions.hasPermissionByEntity(advertiser, entityMetaData["campaign"].permissions.entity);

			var tempArr = [];

			tempArr.push(
				{
					name: 'Setup',
					ref: '.advertiserEdit',
					func: changeToAdvertiserEditView,
					preventOpenMenu: true
				},
				{
					name: 'Brands',
					ref: '.brands',
					func: changeToBrandView,
					preventOpenMenu: true
				}
			);

			if (hasCampaignsPermissions) {
				tempArr.push(
					{
						name: 'Campaigns',
						ref: '.campaigns',
						func: changeToCampaignView,
						preventOpenMenu: true
					}
				);
			}

			$scope.entityActions = tempArr;

			flowToolBar.setPrefixToEntityActions('spa.advertiser', $scope.entityActions);
			$scope.entityActions.parentMenuItem = 'Media';
			if ($scope.$parent.isActive) $scope.$parent.isActive($scope.entityActions.parentMenuItem);
		}

		//GoTo - set links & actions by entity logic and permissions
		function setGoToData(){

			$scope.goToData.links.push({type: 'advertiser id', namePath: 'id', sref: 'spa.advertiser.advertiserEdit', paramKey: 'advertiserId', paramPath: 'id'});
			if(hasAccountsPermissions)
				$scope.goToData.links.push({type: 'account', namePath: 'relationsBag.parents.account.name', sref: 'spa.account.accountEdit', paramKey: 'accountId', paramPath: 'relationsBag.parents.account.id'});
			if(hasBrandsPermissions)
				$scope.goToData.links.push({type: 'brands', namePath: 'relationsBag.children.brands.count', sref: 'spa.advertiser.brands', paramKey: 'advertiserId', paramPath: 'id'});
			if(hasCampaignsPermissions)
				$scope.goToData.links.push({type: 'campaigns', namePath: 'relationsBag.children.campaigns.count', sref: 'spa.advertiser.campaigns', paramKey: 'advertiserId', paramPath: 'id'});

			$scope.goToData.actions.splice(0, 0, { name: 'New Advertiser', func: newAdvertiser});
			$scope.goToData.actions.splice(1, 0, { name: 'Delete', func: deleteEntity});
		}

		function newAdvertiser(){
			changeView({ref : 'spa.advertiser.advertiserNew', advertiserId: ''});
		}

		function deleteEntity(){
			adminUtils.crudOperations.deleteEntity($scope.childModel, "spa.media.advertisers");
		}

		function changeToAdvertiserEditView(){
			var view = {ref: 'spa.advertiser.advertiserEdit', advertiserId: $state.params.advertiserId};
			changeView(view);
		}
		function changeToBrandView(){
			var view = {ref: 'spa.advertiser.brands', advertiserId: $state.params.advertiserId};
			changeView(view);
		}
		function changeToCampaignView(){
			var view = {ref: 'spa.advertiser.campaigns', advertiserId: $state.params.advertiserId};
			changeView(view);
		}
		function changeView(view) {
			$state.go(view.ref, { advertiserId: view.advertiserId});
		}

		$scope.$on('$destroy', function() {
			if (watcher) watcher();
		});
	}]);
