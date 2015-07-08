/**
 * Created by yoav.karpeles on 24/3/2014.
 */

'use strict';

app.controller('campaignCtrl', ['$scope', '$stateParams', '$state', 'flowToolBar', 'mmModal', 'mmRest', 'mmAlertService', 'enums', 'mmPermissions', 'entityMetaData', 'mmUtils', 'adminUtils',
  function ($scope, $stateParams, $state, flowToolBar, mmModal, mmRest, mmAlertService, enums, mmPermissions, entityMetaData, mmUtils, adminUtils) {

    var hasBillingIoViewPermission = mmPermissions.hasPermissionBySession(entityMetaData['campaignIo'].permissions.entity.view);
		var hasAccountsPermissions = false;
		var hasAdvertisersBrandsPermissions = false;

    $scope.childModel = {};
    $scope.type = 'campaign';
    $scope.entityId = $stateParams.campaignId || '';
    $scope.userName = mmUtils.session.getLoggedInUser().username;
		$scope.showHistory = true;
		$scope.childModel = {};
		$scope.entityActions = [];
		$scope.goToData = {};
		$scope.goToData.links = [];
		$scope.goToData.actions = [];
		$scope.hideGoTo = false;

    var watcher = $scope.$watch('childModel', function (newValue, oldValue) {
      if(!_.isEmpty($scope.childModel))
      {
        setEntityActions();
        setAdMenu();
				setGoToData();
      }
    });

    function setEntityActions() {
			hasAccountsPermissions = mmPermissions.hasPermissionByEntity($scope.childModel, entityMetaData["account"].permissions.entity);
			hasAdvertisersBrandsPermissions = mmPermissions.hasPermissionByEntity($scope.childModel, entityMetaData["advertiser"].permissions.entity);

      $scope.entityActions = [
        {
          name: 'Setup',
          ref: '.accountEdit',
          func: changeToCampaignEditView,
          preventOpenMenu: true
        },
        {
          name: 'Media plan',
          func: goToMediaPlan,
          actions: [
            {
              name: 'Excel', func: func1, nodes: [
              {name: 'Import', func: func1, nodes: []},
              {name: 'Export', func: func1, nodes: []}
            ]
            },
            {name: 'Add new placement', func: newPlacement, nodes: []}
          ], views: [
          {name: 'Media Plan', ref: '.campaignsCentral', nodes: []},
          {name: 'Manage Packages', ref: '.packages', nodes: []},
          {name: 'Placement Spreadsheet', ref: '.placementSpreadsheet', nodes: []}
        ]
        },
        {
          name: 'Ads', actions: [
          {name: 'Import /assign', func: func1, nodes: []},
          {
            name: 'Add new ad', func: func1, nodes: [
            {name: 'Add new ad', func: createNewAd, nodes: []},
            {name: 'Create Ad from Bundle', func: showImportBundleModal, nodes: []},
            {name: 'Ad Creation Wizard', func: massCreate, nodes: []},
            {name: 'Design new video ad', func: func1, nodes: []},
            {name: 'Design new HTML ad', func: func1, nodes: []}
          ]
          }
        ], views: [
          /* This is a dynamic view list - to add new items use the $scope.$root.setAdsMenu method */
        ]
        },
        {
          name: 'Clickthrough & Events',
          func: goToCTAndEvents,
          actions: [ ], views: [ ]
        },
        {
          name: 'Publish',
          func: publishPlacements,
          preventOpenMenu: true
        }
      ];

      if (hasBillingIoViewPermission) {
        $scope.entityActions.push(
          {
            name: 'IO',
              func: ioList,
              preventOpenMenu: true
          }
        )
      }

      flowToolBar.setPrefixToEntityActions('spa.campaign', $scope.entityActions);
      $scope.entityActions.parentMenuItem = 'Media';
      if ($scope.$parent.isActive) $scope.$parent.isActive($scope.entityActions.parentMenuItem);
    }

		//GoTo - set links & actions by entity logic and permissions
		function setGoToData(){

			$scope.goToData.links.push({type: 'campaign id', namePath: 'id', sref: 'spa.campaign.campaignEdit', paramKey: 'campaignId', paramPath: 'id'});

			if(hasAccountsPermissions) $scope.goToData.links.push({type: 'campaign manager', namePath: 'relationsBag.parents.account.name', sref: 'spa.account.accountEdit', paramKey: 'accountId', paramPath: 'relationsBag.parents.account.id'});
			if(hasAdvertisersBrandsPermissions){
				$scope.goToData.links.push({type: 'advertiser', namePath: 'relationsBag.parents.advertiser.name', sref: 'spa.advertiser.advertiserEdit', paramKey: 'advertiserId', paramPath: 'relationsBag.parents.advertiser.id'});
				$scope.goToData.links.push({type: 'brand', namePath: 'relationsBag.parents.brand.name', sref: 'spa.brand.brandEdit', paramKey: 'brandId', paramPath: 'relationsBag.parents.brand.id'});
			}
			$scope.goToData.links.push({type: 'placements', namePath: 'placementsCount', sref: 'spa.campaign.campaignsCentral', paramKey: 'campaignId', paramPath: 'id'});
			$scope.goToData.links.push({type: 'masters ads', namePath: 'masterAdsCount', sref: 'spa.campaign.placementAdList', paramKey: 'campaignId', paramPath: 'id'});
			$scope.goToData.links.push({type: 'placements ads', namePath: 'placementAdsCount', sref: 'spa.campaign.placementAdList', paramKey: 'campaignId', paramPath: 'id'});

			var indx = 0;

			$scope.goToData.actions.splice(indx++, 0, { name: 'New Placement', func: newPlacement});
			$scope.goToData.actions.splice(indx++, 0, { name: 'Placement Spreadsheet', func: placementSpreadsheet});
			$scope.goToData.actions.splice(indx++, 0, { name: 'Clickthroughs & Events Spreadsheet', func: ctsEventSpreadsheet});
			$scope.goToData.actions.splice(indx++, 0, { name: 'New Master Ad', func: createNewAd});
			var campaignSettings = $scope.childModel.adminSettings.campaignSettings;
			if(campaignSettings){
				switch(campaignSettings.traffickingMode){
					case 'SimpleMode':
						$scope.goToData.actions.splice(indx++, 0, { name: 'Attach Ads to Placements', func: attachAdsToPlacements});
						break;
					case 'AdvancedMode':
						$scope.goToData.actions.splice(indx++, 0, { name: 'New Delivery Group', func: addDeliveryGroup});
						$scope.goToData.actions.splice(indx++, 0, { name: 'Attach Delivery Groups to placements', func: attachDeliveryGroupsToPlacements});
						break;
				}
			}
			if(hasBillingIoViewPermission) $scope.goToData.actions.splice(indx++, 0, { name: 'View IO', func: ioList});
            if(hasBillingIoViewPermission) $scope.goToData.actions.splice(indx++, 0, { name: 'Generate IO', func: generateIO });
			$scope.goToData.actions.splice(indx++, 0, { name: 'Publish', func : publishPlacements});
			$scope.goToData.actions.splice(indx, 0, { name: 'Delete', func: deleteEntity});
		}

    function setAdMenu(){
      if ($scope.entityId) {
        mmRest.campaign($scope.entityId).get().then(
          function (campaign) {
            if (campaign.adminSettings.campaignSettings)
              $scope.setAdsMenu(campaign.adminSettings.campaignSettings.traffickingMode);
            else
              $scope.setAdsMenu(null);//backward compatibility for 'old' campaigns
          },
          function (error) {
            $scope.$root.setAdsMenu(null);
            processError(error);
          });
      }

      $scope.$root.setAdsMenu = function (traffickingMode) {
        if (traffickingMode == null) {
          $scope.entityActions.forEach(function (item) { /* If we couldn't find the ad's campaign */
            if (item.name.toLowerCase() == 'ads') {
              item.views.push({name: 'Master Ads', ref: '.adList', nodes: []});
              item.views.push({name: 'Placement Ads', ref: '.placementAdList', nodes: []});
            }
          });
        } else {
          $scope.entityActions.forEach(function (item) { /* Set the view list by traffickingMode */
            if (item.name.toLowerCase() == 'ads') {
              item.views.length = 0;
              if (traffickingMode == enums.traffickingMode.getObject('AdvancedMode').id) {
                item.views.push({name: 'Master Ads', ref: '.adList', nodes: []});
                item.views.push({name: 'Placement Ads', ref: '.placementAdList', nodes: []});
                item.views.push({name: 'Serving Strategies- Delivery Groups', ref: '.servingStrategies', nodes: []});
                item.views.push({name: 'Attach Delivery Groups to Placements', ref: '.placementDeliveryGroup', nodes: []});
              } else {
                item.views.push({name: 'Master Ads', ref: '.adList', nodes: []});
                item.views.push({name: 'Placement Ads', ref: '.placementAdList', nodes: []});
                item.views.push({name: 'Attach Ads to Placements', ref: '.attachmentCentral', nodes: []});
              }
            }
          });
        }
      }
    }

    function func1() {}

    function generateIO() {
      var data = {campaignId: $scope.entityId, userName: $scope.userName};

      return mmRest.io().customPOST(data).then(function (data) {
        processData(data);
      }, function (error) {
        processError(error);
      });
    }

    function processData(data) {
      _.each(data, function (result) {
        if (result.Status) {
          mmAlertService.addSuccess(result.AdditionalData);
        }
        else {
          var errorMessage = result.ErrorMessage == null ? "There was a problem performing this action" : result.ErrorMessage;
          mmAlertService.addError(errorMessage);
        }
      })
    }

    function changeToCampaignEditView() {
      changeView({ref: 'spa.campaign.campaignEdit', campaignId: $state.params.campaignId});
    }

		function placementSpreadsheet(){
			changeView({ref : 'spa.campaign.placementSpreadsheet', campaignId: $state.params.campaignId});
		}

		function ctsEventSpreadsheet(){
			changeView({ref : 'spa.campaign.ctsEventsSpreadsheet', campaignId: $state.params.campaignId});
		}

		function newPlacement() {
			changeView({ref: 'spa.placement.placementNew', campaignId: $state.params.campaignId});
		}

		function deleteEntity(){
			adminUtils.crudOperations.deleteEntity($scope.childModel, "spa.media.campaigns");
		}

    function addDeliveryGroup() {
      changeView({ref: 'spa.campaign.deliveryGroups.deliveryGroupNew', campaignId: $state.params.campaignId});
    }

    function createNewAd() {
      changeView({ref: 'spa.ad.adNew', campaignId: $state.params.campaignId});
    }

		function attachAdsToPlacements(){
			changeView({ref: 'spa.campaign.attachmentCentral', campaignId: $state.params.campaignId});
		}

		function attachDeliveryGroupsToPlacements(){
			changeView({ref: 'spa.campaign.placementDeliveryGroup', campaignId: $state.params.campaignId});
		}
    function goToMediaPlan(){
      changeView({ref: 'spa.campaign.campaignsCentral', campaignId: $state.params.campaignId});
    }

    function goToCTAndEvents(){
      changeView({ref: 'spa.campaign.ctsEventsSpreadsheet', campaignId: $state.params.campaignId});
    }

    function publishPlacements() {
      changeView({ref: 'spa.campaign.publishPlacements', campaignId: $state.params.campaignId});
    }

    function ioList() {
        changeView({ref: 'spa.campaign.ioList.ioEdit', campaignId: $state.params.campaignId});
    }

    function changeView(view) {
      $state.go(view.ref, {campaignId: view.campaignId});
    }

    function processError(error) {
      mmAlertService.addError(JSON.stringify(error));
    }

    function showImportBundleModal() {
      if ($scope.isModalOpen) {
        return;
      }
      $scope.isModalOpen = true;

      $rootScope.IsSingleFileUpload = false;
      $rootScope.showSelectTab = false;

      var modalInstance = $modal.open({
        templateUrl: './adManagementApp/views/uploadEBS.html',
        controller: 'uploadEBSCtrl',
        windowClass: 'upload-dialog'
      });
      modalInstance.result.then(function () {
        $scope.isModalOpen = false;
      }, function () {
        $scope.isModalOpen = false;
      });
    }

    function massCreate(formatType) {
      mmModal.open({
        templateUrl: 'infra/directives/views/template/wizard/modalWizard.html',
        controller: 'massCreateAdCtrl',
        title: "Ad Creation Wizard",
        modalWidth: 1200,
        bodyHeight: 559,
        discardButton: { name: "Close", funcName: "cancel" }
      });
    };

    $scope.$on('$destroy', function() {
      if (watcher) watcher();
    });
  }]);
