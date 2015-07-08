/**
 * Created by yoav.karpeles on 24/3/2014.
 */

'use strict';

app.controller('accountCtrl', ['$scope', '$state', '$stateParams', 'flowToolBar', 'mmPermissions', 'mmRest', 'entityMetaData', 'adminUtils', 'mmContextService',
  function ($scope, $state, $stateParams, flowToolBar, mmPermissions, mmRest, entityMetaData, adminUtils, mmContextService) {

    var hasUsersPermissions = false;
    var hasCampaignsPermissions = false;
    var hasCreateCamp = false;
    var hasAdvertisersPermissions = false;
    var hasCreateAccountPermission = mmPermissions.hasPermissionBySession(entityMetaData['account'].permissions.entity.create);

    $scope.type = 'account';
    $scope.hideGoTo = false;
    $scope.showHistory = true;
    $scope.childModel = {};
    $scope.entityId = $stateParams.accountId;
    $scope.entityActions = [];
    $scope.goToData = {};
    $scope.goToData.links = [];
    $scope.goToData.actions = [];

    var watcher = $scope.$watch('childModel', function (newValue, oldValue) {
      if(!_.isEmpty($scope.childModel))
      {
        setEntityActions();
        setGoToData();
      }
    });

    function setEntityActions(){
      hasUsersPermissions = mmPermissions.hasPermissionByEntity($scope.childModel, entityMetaData["user"].permissions.entity);
      hasCampaignsPermissions = mmPermissions.hasPermissionByEntity($scope.childModel, entityMetaData["campaign"].permissions.entity);
      hasCreateCamp = mmPermissions.hasPermissionByEntity($scope.childModel, entityMetaData["campaign"].permissions.entity.createEdit);
      hasAdvertisersPermissions = mmPermissions.hasPermissionByEntity($scope.childModel, entityMetaData["advertiser"].permissions.entity);
      var tempArr = [];

      tempArr.push(
        {
          name: 'Setup',
          ref: '.accountEdit',
          func: changeToAccountEditView,
          preventOpenMenu: true
        }
      );

      if(hasUsersPermissions){
        tempArr.push(
          {
            name: 'Users',
            ref: '.users',
            func: changeToUserView,
            preventOpenMenu: true
          }
        );
      }

      if(hasAdvertisersPermissions && $scope.childModel.accountTypes.campaignManager){
        tempArr.push(
          {
            name: 'Advertisers',
            ref: '.advertisers',
            func: changeToAdvertiserView,
            preventOpenMenu: true
          })
      }

      if(hasCampaignsPermissions && $scope.childModel.accountTypes.campaignManager){
        tempArr.push(
          {
            name: 'Campaigns',
            ref: '.campaigns',
            func: changeToCampaignView,
            preventOpenMenu: true
          })
      }

      tempArr.push(
        {
          name: 'Strategies',
          ref: '.strategies',
          func: changeToTargetAudienceView,
          preventOpenMenu: true
        }
      );

      $scope.entityActions = tempArr;
      $scope.entityActions.parentMenuItem = 'Admin';
      flowToolBar.setPrefixToEntityActions('spa.account',$scope.entityActions);
      if($scope.$parent.isActive) $scope.$parent.isActive($scope.entityActions.parentMenuItem);
    }

    //GoTo - set links & actions by entity logic and permissions
    function setGoToData(){
      //set links array
      $scope.goToData.links.push({type: 'account id', namePath: 'id', sref: 'spa.account.accountEdit', paramKey: 'accountId', paramPath: 'id'});

      if(hasUsersPermissions) $scope.goToData.links.push({type: 'user', namePath: 'relationsBag.children.users.count', sref: 'spa.account.users', paramKey: 'accountId', paramPath: 'id'});
      if(hasAdvertisersPermissions && $scope.childModel.accountTypes.campaignManager)
        $scope.goToData.links.push({type: 'advertiser', namePath: 'relationsBag.children.advertisers.count', sref: 'spa.account.advertisers', paramKey: 'accountId', paramPath: 'id'});
      if(hasCampaignsPermissions && $scope.childModel.accountTypes.campaignManager)
        $scope.goToData.links.push({type: 'campaign', namePath: 'relationsBag.children.campaigns.count', sref: 'spa.account.campaigns', paramKey: 'accountId', paramPath: 'id'});

      //due to the fact that HISTORY action was already added by entityLayout.js, needs to reorder the actions and add HISTORY to be last
      //set actions array
      var indx = 0;
      if(hasCreateAccountPermission) $scope.goToData.actions.splice(indx++, 0, {name: 'New Account', func: newAccount});
      if(hasUsersPermissions) $scope.goToData.actions.splice(indx++, 0, {name: 'New User', func: newUser});
      if(hasAdvertisersPermissions && $scope.childModel.accountTypes.campaignManager) $scope.goToData.actions.splice(indx++, 0, {name: 'New Advertiser', func: newAdvertiser});
      if(hasCreateCamp && $scope.childModel.accountTypes.campaignManager) $scope.goToData.actions.splice(indx++, 0, {name: 'New Campaign', func: newCampaign});
      $scope.goToData.actions.splice(indx, 0, {name: 'Delete', func: deleteEntity});
    }

    function newAccount() {
      changeView({ref: 'spa.account.accountNew', accountId: ''});
    }
    function newUser() {
      mmContextService.addContextItem($scope.childModel.id, $scope.type, $scope.childModel.name, true);
      changeView({ref: 'spa.user.userNew', userId: ''});
    }
    function newAdvertiser() {
      mmContextService.addContextItem($scope.childModel.id, $scope.type, $scope.childModel.name, true);
      changeView({ref: 'spa.advertiser.advertiserNew', advertiserId: ''});
    }
    function newCampaign() {
      mmContextService.addContextItem($scope.childModel.id, $scope.type, $scope.childModel.name, true);
      changeView({ref: 'spa.campaign.campaignNew', campaignId: ''});
    }
    function deleteEntity(){
      adminUtils.crudOperations.deleteEntity($scope.childModel, "spa.admin.accounts");
    }
    function changeToAccountEditView(){
      var view = {ref: 'spa.account.accountEdit', accountId: $state.params.accountId};
			changeView(view);
		}
		function changeToAdvertiserView(){
			var view = {ref: 'spa.account.advertisers', accountId: $state.params.accountId};
			changeView(view);
		}
		function changeToUserView(){
			var view = {ref: 'spa.account.users', accountId: $state.params.accountId};
			changeView(view);
		}
		function changeToCampaignView(){
			var view = {ref: 'spa.account.campaigns', accountId: $state.params.accountId};
			changeView(view);
		}
		function changeToTargetAudienceView(){
			var view = {ref: 'spa.account.strategies', accountId: $state.params.accountId};
			changeView(view);
		}
		function changeView(view) {
			$state.go(view.ref, { accountId: view.accountId});
		}
		$scope.$on('$destroy', function() {
			if (watcher) watcher();
		});
	}]);
