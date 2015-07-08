/**
 * Created by atdg on 6/30/14.
 */
'use strict';

app.controller('brandCtrl', ['$scope', '$state', '$stateParams', 'flowToolBar', 'mmPermissions', 'entityMetaData', 'adminUtils',
	function ($scope, $state, $stateParams, flowToolBar, mmPermissions, entityMetaData, adminUtils) {

		var hasAccountsPermissions = false;
		var hasAdvertisersPermissions = false;
		var hasCampaignsPermissions = false;

		$scope.type = 'brand';
		$scope.showHistory = true;
		$scope.entityId = $stateParams.brandId;
		$scope.childModel = {};
		$scope.entityActions = [];
		$scope.goToData = {};
		$scope.goToData.links = [];
		$scope.goToData.actions = [];
		$scope.hideGoTo = false;

		var watcher = $scope.$watch('childModel', function (newValue, oldValue) {
			if(!_.isEmpty($scope.childModel))
			{
				if($scope.childModel.accessLevel == 'Basic'){
					$state.go('spa.accessDenied');
				}
				else{
					setEntityActions();
					setGoToData();
				}
			}
		});

		function setEntityActions(brand) {
			hasAccountsPermissions = mmPermissions.hasPermissionByEntity($scope.childModel, entityMetaData["account"].permissions.entity);
			hasAdvertisersPermissions = mmPermissions.hasPermissionByEntity($scope.childModel, entityMetaData["advertiser"].permissions.entity);
			hasCampaignsPermissions = mmPermissions.hasPermissionByEntity($scope.childModel, entityMetaData["campaign"].permissions.entity);

			var tempArr = [];
			tempArr.push(
				{
					name: 'Setup',
					ref: '.brandEdit',
					func: changeToBrandEditView,
					preventOpenMenu: true
				});

			if(hasCampaignsPermissions){
				tempArr.push(
					{
						name: 'Campaigns',
						ref: '.campaigns',
						func: changeToCampaignView,
						preventOpenMenu: true
					}
				)}

			$scope.entityActions = tempArr;

			flowToolBar.setPrefixToEntityActions('spa.brand', $scope.entityActions);
			$scope.entityActions.parentMenuItem = 'Media';
			if ($scope.$parent.isActive) $scope.$parent.isActive($scope.entityActions.parentMenuItem);
		}

		//GoTo - set links & actions by entity logic and permissions
		function setGoToData(){

			$scope.goToData.links.push({type: 'brand id', namePath: 'id', sref: 'spa.brand.brandEdit', paramKey: 'brandId', paramPath: 'id'});
			if(hasAccountsPermissions) $scope.goToData.links.push({type: 'account', namePath: 'relationsBag.parents.account.name', sref: 'spa.account.accountEdit', paramKey: 'accountId', paramPath: 'relationsBag.parents.account.id'});
			if(hasAdvertisersPermissions) $scope.goToData.links.push({type: 'advertiser', namePath: 'relationsBag.parents.advertiser.name', sref: 'spa.advertiser.advertiserEdit', paramKey: 'advertiserId', paramPath: 'relationsBag.parents.advertiser.id'});
			if(hasCampaignsPermissions) $scope.goToData.links.push({type: 'campaigns', namePath: 'relationsBag.children.campaigns.count', sref: 'spa.brand.campaigns', paramKey: 'brandId', paramPath: 'id'});

			$scope.goToData.actions.splice(0, 0, { name: 'New Brand', func: newBrand});
			$scope.goToData.actions.splice(1, 0, { name: 'Delete', func: deleteEntity});
		}
		function newBrand(){
			changeView({ref : 'spa.brand.brandNew', brandId: $scope.childModel.id});
		}

		function deleteEntity(){
			adminUtils.crudOperations.deleteEntity($scope.childModel, "spa.media.advertisers");
		}

		function changeToBrandEditView(){
			var view = {ref: 'spa.brand.brandEdit', brandId: $state.params.brandId};
			changeView(view);
		}
		function changeToCampaignView(){
			var view = {ref: 'spa.brand.campaigns', brandId: $state.params.brandId};
			changeView(view);
		}
		function changeView(view) {
			$state.go(view.ref, { brandId: view.brandId});
		}

		$scope.$on('$destroy', function() {
			if (watcher) watcher();
		});
	}]);
