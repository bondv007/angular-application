/**
 * Created by liad.ron on 11/24/14.
 */

'use strict';

app.controller('campaignEditCtrl', ['$scope', '$rootScope', '$state', '$stateParams', 'mmRest',
	'mmAlertService', '$q', 'enums', 'mmSession', 'contactsService', 'entityMetaData', 'mmUtils', 'adminUtils', 'mmPermissions', '$timeout',
	function ($scope, $rootScope, $state, $stateParams, mmRest, mmAlertService, $q, enums, mmSession, contactsService, entityMetaData, mmUtils, adminUtils, mmPermissions, $timeout) {
		var relatedEntitiesName = ["accounts", "advertisers", "brands"];
		var adminSettings = ["campaignSettings", /*"analyticsSettings",*/, "privacy"];//for the admin settings inheritance
		$scope.isEditMode = !!$stateParams.campaignId || !!$scope.isEntral;
		$scope.campaignId = $stateParams.campaignId ? $stateParams.campaignId : $scope.$parent.entityId;
		$scope.accountId = $scope.contextData.key == 'accountId' ? $scope.contextData.contextEntityId : undefined;
		$scope.advertiserId = $scope.contextData.key == 'advertiserId' ? $scope.contextData.contextEntityId : undefined;
		$scope.brandId = $scope.contextData.key == 'brandId' ? $scope.contextData.contextEntityId : undefined;

		$rootScope.mmIsPageDirty = false;
		$scope.isPreSave = true;
		$scope.relatedEntities = {};
		$scope.relatedEntitiesSet = false;
		$scope.pageReady = false;
		$scope.labelWidth = 160;
		$scope.infoBoxlabelWidth = 145;
		$scope.infoBoxControlWidth = !!$scope.isEntral ? 246 : 270;
		$scope.isRequired = true;
		$scope.isSignleAccountUser = false;
		$scope.invalidContacts = {};
		$scope.validation = {};
		$scope.isTabValid = {};
		$scope.tabHandler = {};
		$scope.showSPinner = true;
		$scope.togglesStatus = {settings: false, contacts: false};
		$scope.isInheritedAdminSettigns = false;
		$scope.isPlacementsExist = false;
		$scope.isPlacementAdsExist = true;
		$scope.placementsCentralLink = {link : "spa.campaign.campaignsCentral"};
		$scope.placementAdsCentralLink = {link : "spa.campaign.placementAdList"};
		$scope.isMultipleAccounts = true;
		$scope.displayDataAccess = false;
		$scope.campSettingsLabelWidth = 160;
		$scope.permissions = {entity:{viewAdvanced: true, createEdit: true}, common: {sizmekContacts: {createEdit: false}}};
		$scope.editCampaign = true;
		$scope.hasCreateAdvertiserBrandPermission = false;
    $scope.lazyTypeParams = 'accounts?accountType=CampaignManager&permissionNames=' + entityMetaData['campaign'].permissions.entity.createEdit;

		//set enums objects
		$scope.thirdPartyTracking = enums.thirdpartyURLsTypes;
		$scope.dateFormats = enums.dateFormats;
		$scope.thirdPartyAdTags = enums.thirdPartyAdTags;
		$scope.regulationProgram = enums.regulationProgram;
		$scope.gmtOffset = enums.GMTOffset;
		$scope.settings = $scope.mmModel;
		$scope.hardStops = enums.hardStop;
		$scope.traffickingMode = enums.traffickingMode;

		//for the modal (new Advertiser/Brand from dd)
		$scope.entityObj = {accountId : $scope.accountId, context : null};

		if($scope.accountId)
			$scope.entityObj.context = 'account';
		else if($scope.brandId)
			$scope.entityObj.context = 'brand';

		$scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: rollback, ref: null, nodes: []};
		$scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: save, ref: null, nodes: [], isPrimary: true};

		var watcher = $scope.$watch('$parent.mainEntity', function (newValue, oldValue) {
			updateState();
		});

		initialize();

		function initialize(){
			setTabHandlerObj();
			setTabValidationObj();
			setRelatedEntities();
			updateState();
		}

    function updateState() {
      $rootScope.mmIsPageDirty = false;
      //edit mode
      if ($scope.$parent.mainEntity != null && $scope.isEditMode) {
        $scope.validation = {};
        $scope.editObject = mmRest.EC2Restangular.copy($scope.$parent.mainEntity);
        dataManipulation();
        $scope.originalCopy = mmRest.EC2Restangular.copy($scope.editObject);
        $scope.pageReady = $scope.editObject != null;
        $scope.editCampaign = adminUtils.permissions.checkOnEditMode($scope.editObject, $scope.permissions);
        updateTabHandlerObj();
      }
      //new mode
      else if(!$scope.isEditMode){
        $scope.isPlacementsExist = false;
        $scope.isPlacementAdsExist = false;
        $scope.editObject = $scope.editObject || mmRest.EC2Restangular.copy(entityMetaData["campaign"].defaultJson);
        $scope.editObject.relationsBag.parents.brand.id = $scope.brandId || null;
        $scope.editObject.brandId = $scope.editObject.relationsBag.parents.brand.id;
        adminUtils.permissions.checkOnNewModeCommon(entityMetaData['campaign'].type, $scope.permissions.common);
        updateTabHandlerObj();
        //not in context
        if (!$scope.contextData.isInContext) newModeOutOfContext();
        //in context
        else if (!$scope.isInheritedAdminSettigns) {
          $scope.isInheritedAdminSettigns = true;
          //account context
          if($scope.accountId) newModeAccountContext();
          //advertiser context
          else if($scope.advertiserId) newModeAdvertiserContext();
          //brand context
          else if($scope.brandId) newModeBrandContext();
        }else{
          $scope.originalCopy = mmRest.EC2Restangular.copy($scope.editObject);
          $scope.pageReady = true;
        }
      }
    }

    //TODO: ask liad - maybe better way to check this condition
    function newModeOutOfContext(){
      if(!$scope.relatedEntitiesSet){
        $scope.relatedEntitiesSet = true;
        mmRest.accounts.getList({accountType: 'CampaignManager',from: '0', max: '2', permissionNames: entityMetaData['campaign'].permissions.entity.createEdit}).then(function(data) {
          if(data.length > 1 || data.length == 0){
            setRelatedEntity('accounts', data);
            $scope.originalCopy = mmRest.EC2Restangular.copy($scope.editObject);
            $scope.pageReady = true;
          }else if(data.length == 1) {
            $scope.isMultipleAccounts = false;
            $scope.accountId = data[0].id;
            newModeAccountContext();
          }
       }, function (error) {
          processError(error);
       });
      }
    }

		function newModeAccountContext(){
      //TODO ask liad still need to get account?
			mmRest.account($scope.accountId).get().then(function(data){
				$scope.editObject.relationsBag.parents.account.id = data.id;
				$scope.editObject.relationsBag.parents.account.name = data.name;
				setRelatedEntity('accounts', [data]);
				$scope.onAccountSelected(true);
				$scope.originalCopy = mmRest.EC2Restangular.copy($scope.editObject);
				$scope.pageReady = true;
			},function(error){processError(error);});
		}

		function newModeAdvertiserContext(){
      //TODO ask liad still need to get advertiser?
			mmRest.advertiser($scope.advertiserId).get().then(function(data) {
				$scope.editObject.relationsBag.parents.account.id = data.relationsBag.parents.account.id;
				$scope.editObject.relationsBag.parents.account.name = data.relationsBag.parents.account.name;
				$scope.editObject.relationsBag.parents.advertiser.id = data.id;
				$scope.editObject.relationsBag.parents.advertiser.name = data.name;
				setRelatedEntity('advertisers', [data]);

        mmRest.account(data.relationsBag.parents.account.id).get().then(function(account){
          adminUtils.inherit.analyticsSettings($scope.editObject.accountAnalyticsSettings, account.analyticsSettings);
          $scope.$broadcast('accountChange', null);
          $scope.onAdvertiserSelected(true);
          $scope.originalCopy = mmRest.EC2Restangular.copy($scope.editObject);
          $scope.pageReady = true;
        });
			});
		}

		function newModeBrandContext(){
			mmRest.brand($scope.brandId).get().then(function(data){
				setBrand(data);
        mmRest.account($scope.editObject.relationsBag.parents.account.id).get().then(function(account){
          adminUtils.inherit.analyticsSettings($scope.editObject.accountAnalyticsSettings, account.analyticsSettings);
          $timeout(function(){
            $scope.$broadcast('accountChange', null);
            mmRest.advertiser($scope.editObject.relationsBag.parents.advertiser.id).get().then(function(advertiser){
              adminUtils.inherit.analyticsSettings($scope.editObject.advertiserAnalyticsSettings, advertiser.analyticsSettings);
              $timeout(function(){
                $scope.$broadcast('advertiserChange', null);
              }, 100);
            });
          }, 100);
        });
				inheritBrandAdminSettings(data);
				$scope.originalCopy = mmRest.EC2Restangular.copy($scope.editObject);
				$scope.pageReady = true;
			});
		}

		function setTabHandlerObj(){
			$scope.tabHandler.settings = {campaign: {isActive: true}, analytics:{isActive: false}, privacy:{isActive: false}};
			$scope.tabHandler.contacts = {
				sizmekContacts:{isActive: false, permission : true},
				campaignManagerContacts:{isActive: false, permission : true},
				creativeManagerContacts:{isActive: true, permission : true},
				siteContacts:{isActive: false, permission : true}};
		}

    function setTabValidationObj(){
      $scope.isTabValid.settings = {campaign: true, analytics: true, privacy: true};
      $scope.isTabValid.contacts = {sizmekContacts: true, campaignManagerContacts: true, creativeManagerContacts: true, siteContacts: true};
    }

    function updateTabHandlerObj(){
      $scope.tabHandler.contacts.sizmekContacts.permission = $scope.permissions.common.sizmekContacts.createEdit && $scope.editCampaign;

      if($scope.isEditMode){
        $scope.tabHandler.contacts.campaignManagerContacts.permission = $scope.editCampaign;
        $scope.tabHandler.contacts.creativeManagerContacts.permission = $scope.editCampaign;
        $scope.tabHandler.contacts.siteContacts.permission = $scope.editCampaign;
      }
      $scope.$broadcast('mmTabHandlerChanged', null);
    }

		function setBrand(brand){
			$scope.editObject.relationsBag.parents.brand.id = brand.id;
			$scope.editObject.brandId = $scope.editObject.relationsBag.parents.brand.id;
			relatedEntitiesName.forEach(function(name){
				var entityName = name.substring(0, name.length - 1);
				var entity = brand.relationsBag.parents[entityName];
				if(_.isNull(entity) || _.isNull(entity.id)){
					entity = brand;
				}
				$scope.editObject.relationsBag.parents[entityName].id = entity.id;
				$scope.editObject.relationsBag.parents[entityName].name = entity.name;
			});
		}

		function inheritBrandAdminSettings(brand, removePreviousContacts){
			$scope.isInheritedAdminSettigns = true;
			adminSettings.forEach(function (settings) {
				$scope.editObject.adminSettings[settings] = brand.adminSettings[settings];
			});
			setParentDefaultContacts(brand.adminSettings.defaultContacts, removePreviousContacts);
		}

		function setParentDefaultContacts(defaultContacts, removePreviousContacts){
			var contactTypes = enums.defaultContactsTypes;
			if(!!removePreviousContacts){
				$scope.editObject.adminSettings.defaultContacts = defaultContacts;
				return;
			}
			contactTypes.forEach(function(type){
				defaultContacts[type.name].forEach(function(contact){
					if(_.isUndefined(_.find($scope.editObject.adminSettings.defaultContacts[type.name], contact))){
						$scope.editObject.adminSettings.defaultContacts[type.name].push(contact);
					}
				});
			});
			//$scope.editObject.adminSettings.defaultContacts.creativeAccounts = defaultContacts.creativeAccounts;
			defaultContacts.creativeAccounts.forEach(function(creativeAccount){
				if(_.isUndefined(_.find( $scope.editObject.adminSettings.defaultContacts.creativeAccounts, {accountId : creativeAccount.accountId}))) {
					$scope.editObject.adminSettings.defaultContacts.creativeAccounts.push(creativeAccount);
				}
			});
		}

		function setRelatedEntities() {
			relatedEntitiesName.forEach(function (entityName) {
				$scope.relatedEntities[entityName] = $scope.relatedEntities[entityName] || {};
				$scope.relatedEntities[entityName].list = $scope.relatedEntities[entityName].list || [];
				$scope.relatedEntities[entityName].index = {};
				$scope.relatedEntities[entityName]["filtered" + entityMetaData[entityName.substring(0, entityName.length - 1)].name + 's'] = [];
			});
		}

		function setRelatedEntity(entityName, data) {
			$scope.relatedEntities[entityName].list = $scope.relatedEntities[entityName].list.concat(data);
			$scope.relatedEntities[entityName].isInitialize = true;
			//$scope.relatedEntities[entityName].list.forEach(function (entity) {
			//	$scope.relatedEntities[entityName].index[entity.id] = entity;
			//});
		}

		function initRelatedEntitiesobject(){
			$scope.relatedEntities.accounts.accountAdvertisersIndex = {};
			$scope.relatedEntities.advertisers.advertiserBrandsIndex = {};
		}

		function indexEntitiesById(entitiesNameToBeIndex, comparisonProperty, id, indexEntityType){
			$scope.relatedEntities[entitiesNameToBeIndex].list.forEach(function(entity){
				if(entity[comparisonProperty] == id){
					var capitalEntityNameToBeIndex = entitiesNameToBeIndex.slice(0,1).toUpperCase() + entitiesNameToBeIndex.slice(1, entitiesNameToBeIndex.length);
					var indexListName = indexEntityType + capitalEntityNameToBeIndex + 'Index';
					if(!$scope.relatedEntities[indexEntityType + 's'][indexListName][id]){
						$scope.relatedEntities[indexEntityType + 's'][indexListName][id] = [];
					}
					$scope.relatedEntities[indexEntityType + 's'][indexListName][id].push(entity);
				}
			});
		}

		function addEntityToIndex(indexArr, entitiesArr){
			entitiesArr.forEach(function(entity){
				if(_.isUndefined(indexArr[entity.id])){
					indexArr[entity.id] = entity;
				}
			})
		}

		function save() {
      $scope.$broadcast('analyticsManipulator', null);
			if(saveValidation()) {
				$scope.validation = {};
				if ($scope.isEditMode) {
					return $scope.editObject.put().then(function (data) {
							$rootScope.mmIsPageDirty = false;
							$scope.showSPinner = false;
							mmAlertService.addSuccess('Campaign ' + data.name + ' was successfully updated.');
							//$scope.$parent.mainEntity = data;
							return data;
						},
						function (error) {
							processError(error);
						});
				} else {
					return mmRest.campaigns.post($scope.editObject).then(function (data) {
							$rootScope.mmIsPageDirty = false;
							$scope.showSPinner = false;
							mmAlertService.addComplexAlert("success",	[{
								msg: 'Campaign ' + data.name + ' was successfully updated.',
								linkText: "Create a new placement", func: function(){
									$state.go('spa.placement.placementNew', {campaignId: data.id, sid: 'mdx3', mdx2: false});
								}}]);
							if (!$scope.isEntral) {
								//replace is needed here to replace the last history record
                var state = entityMetaData[$scope.entityType].editPageURL;
                $state.go(state, {campaignId: data.id}, {location : "replace"});
							}
							//$scope.$parent.mainEntity = data;
							return data;
						},
						function (error) {
							processError(error);
						});
				}
			}
		}

		function rollback() {
			$scope.editObject = mmRest.EC2Restangular.copy($scope.originalCopy);
			var traffickingMode = $scope.editObject.adminSettings.campaignSettings ? $scope.editObject.adminSettings.campaignSettings.traffickingMode : null;
			$scope.$root.setAdsMenu(traffickingMode);
			$scope.validation = {};
		}

		function saveValidation() {
			var isValid = true;
			$scope.validation = {};

			if (_.isUndefined($scope.editObject.name) || _.isNull($scope.editObject.name) || $scope.editObject.name.length <= 1) {
				$scope.validation.name = "Please enter a name longer than 1 characters";
				isValid = false;
			}
			if(_.isUndefined($scope.editObject.relationsBag.parents.account.id) || _.isNull($scope.editObject.relationsBag.parents.account.id)) {
				isValid = false;
				$scope.validation.account = "Account is required";
			}

			if(_.isUndefined($scope.editObject.relationsBag.parents.advertiser.id) || _.isNull($scope.editObject.relationsBag.parents.advertiser.id)){
				isValid = false;
				$scope.validation.advertiser = "Advertiser is required";
			}

			if(_.isUndefined($scope.editObject.relationsBag.parents.brand.id) || _.isNull($scope.editObject.relationsBag.parents.brand.id)){
				isValid = false;
				$scope.validation.brand = "Brand is required";
				return isValid;
			}

			var typeIds = ['SIZMEK', 'MEDIA', 'CREATIVE', 'SITE'];
			var isContactsValid = contactsService.preSaveValidation(
				$scope,
				typeIds,
				$scope.invalidContacts,
				$scope.editObject.adminSettings.defaultContacts.creativeAccounts,
				$scope.isTabValid.contacts,
				$scope.editObject.adminSettings.defaultContacts);
			if(!isContactsValid.isValid){
				isValid = false;
				if(isContactsValid.msg) mmAlertService.addError(isContactsValid.msg);
			}

			if(isValid) $scope.validation = {};
			openTogglesAndMarkTabsAsInvalid();
			return isValid;
		}

		function openTogglesAndMarkTabsAsInvalid(){
			if(!$scope.isTabValid.contacts.sizmekContacts){
				changedSelectedTab('contacts', 'sizmekContacts');
				$scope.togglesStatus.contacts = true;
			}
			if(!$scope.isTabValid.contacts.creativeManagerContacts){
				changedSelectedTab('contacts', 'creativeManagerContacts');
				$scope.togglesStatus.contacts = true;
			}
			if(!$scope.isTabValid.contacts.campaignManagerContacts){
				changedSelectedTab('contacts', 'campaignManagerContacts');
				$scope.togglesStatus.contacts = true;
			}
		}

		function changedSelectedTab(toggleName, tabName){
			$scope.tabHandler[toggleName][tabName].isActive = true;
		}

		function processError(error) {
			console.log('ohh no!');
			console.log(error);
			$scope.showSPinner = false;
			if (error && error.data){
				if(!error.data.error) {
					mmAlertService.addError("Server error. Please try again later.");
				} else {
					mmAlertService.addError(error.data.error);
				}
			}else{
				mmAlertService.addError("Server error. Please try again later.");
			}
		}

		function selectBrand(){
			$scope.validation.brand = '';
			//setDefault brand as selected or if there if 1 brand, select it
			if($scope.relatedEntities.brands.filteredBrands.length == 1){
				$scope.editObject.relationsBag.parents.brand.id = $scope.relatedEntities.brands.filteredBrands[0].id;
				$scope.editObject.brandId = $scope.editObject.relationsBag.parents.brand.id;
				inheritBrandAdminSettings($scope.relatedEntities.brands.filteredBrands[0], true);
				return;
			}
      //TODO need to get default brand by adv id
      $scope.editObject.relationsBag.parents.brand.id = null;
      $scope.editObject.brandId = $scope.editObject.relationsBag.parents.brand.id;

      //TODO dont use filtered brand
			var brand = _.find($scope.relatedEntities.brands.filteredBrands, {name :  $scope.entityObj.advertiser.name});
			if(!_.isUndefined(brand)){
        $scope.editObject.relationsBag.parents.brand.id = brand.id;
        $scope.editObject.brandId = $scope.editObject.relationsBag.parents.brand.id;
        mmRest.brand($scope.editObject.relationsBag.parents.brand.id).get().then(function(data) {
          inheritBrandAdminSettings(data, true);
        }, function (error) {
          processError(error);
        });
			}
		}

		function dataManipulation(){
			var ctr = $scope.editObject.ctr;
			var placementsText = " Placements";
			var placementsAdsText = " Placement Ads";
			if(!_.isNull(ctr) && !_.isUndefined(ctr) && ctr != 0){
				$scope.editObject.ctr = Number(ctr).toFixed(3);
			}
			if($scope.editObject.placementsCount === 1) $scope.placementsText = placementsText.slice(0, placementsText.length - 1);
			else $scope.placementsText = placementsText;

			if($scope.editObject.placementAdsCount === 1) $scope.placementsAdsText = placementsAdsText.slice(0, placementsAdsText.length - 1);
			else $scope.placementsAdsText = placementsAdsText;
		}

		$scope.onCampaignNameChange = function(){
			if($scope.editObject.name.length > 1) $scope.validation.name = '';
			else $scope.validation.name = "Please enter a name longer than 1 characters";
		};

		$scope.onAccountSelected = function(forcedEventFire){
			if(!forcedEventFire) $rootScope.isDirtyEntity = true
			$scope.validation.account = '';

      mmRest.account($scope.editObject.relationsBag.parents.account.id).get().then(function(data) {
        $scope.editObject.account = data;
        adminUtils.inherit.analyticsSettings($scope.editObject.accountAnalyticsSettings, $scope.editObject.account.analyticsSettings);
        $scope.$broadcast('accountChange',null);
        if(!_.isUndefined($scope.relatedEntities.accounts)){
          if(mmPermissions.hasPermissionByEntity($scope.editObject.account, entityMetaData['advertiser'].permissions.entity))
            $scope.hasCreateAdvertiserBrandPermission = true;
          $scope.entityObj.accountId = $scope.editObject.relationsBag.parents.account.id;
          $scope.entityObj.account = $scope.editObject.account;
          mmRest.advertisers.getList({'accountId': $scope.editObject.relationsBag.parents.account.id}).then(function (data) {
            $scope.relatedEntities.advertisers.filteredAdvertisers = data;
            if(data.length == 1){
              $scope.editObject.relationsBag.parents.advertiser.id = data[0].id;
              $scope.onAdvertiserSelected(true);
            }
          }, function (error) {
            processError(error);
          });
        }

        //TODO is still necessary? ask liad
        if(!_.find($scope.advertisers, {"id" :  $scope.editObject.relationsBag.parents.advertiser.id})){
          $scope.editObject.relationsBag.parents.advertiser.id = null;
          $scope.editObject.relationsBag.parents.brand.id = null;
          $scope.editObject.brandId = $scope.editObject.relationsBag.parents.brand.id;
        }
      });
		};

		$scope.onAdvertiserSelected = function(forcedEventFire){
			if(!forcedEventFire) $rootScope.isDirtyEntity = true;
			$scope.validation.advertiser = '';
      mmRest.advertiser($scope.editObject.relationsBag.parents.advertiser.id).get().then(function(data) {
        adminUtils.inherit.analyticsSettings($scope.editObject.advertiserAnalyticsSettings, data.analyticsSettings);
        $timeout(function(){
          $scope.$broadcast('advertiserChange', null);
        }, 100);
        $scope.entityObj.advertiserId = $scope.editObject.relationsBag.parents.advertiser.id;
        $scope.entityObj.advertiser = data;

        if(!_.isUndefined($scope.relatedEntities.advertisers)){
            mmUtils.cacheManager.removeResource('brands');
            mmRest.brands/*.withHttpConfig({cache: false})*/.getList({'advertiserId': $scope.editObject.relationsBag.parents.advertiser.id}).then(function (data) {
              $scope.relatedEntities.brands.filteredBrands = data;
              selectBrand();
            }, function (error) {
              processError(error);
            });
        }
      }, function (error) {
        processError(error);
      });
		};

		$scope.onBrandSelected = function(forcedEventFire){
			if(!forcedEventFire) $rootScope.isDirtyEntity = true;
			$scope.validation.brand = '';
      mmRest.brand($scope.editObject.relationsBag.parents.brand.id).get().then(function(data) {
        $scope.editObject.brandId = $scope.editObject.relationsBag.parents.brand.id;
        inheritBrandAdminSettings(data, true);
      }, function (error) {
        processError(error);
      });
		};

		$scope.ondDateFormatSelected = function(){
			$scope.validation.dateFormat = '';
		};

		$scope.onTraffickingModeChange = function(){
			$scope.$root.setAdsMenu($scope.editObject.adminSettings.campaignSettings.traffickingMode);
		};

		$scope.$on('$destroy', function(){
			if(watcher) watcher();
			if ($scope.relatedEntities.accounts){
				if ($scope.relatedEntities.accounts.list) $scope.relatedEntities.accounts.list.length = 0;
				if ($scope.relatedEntities.accounts.index) $scope.relatedEntities.accounts.index = {};
				delete $scope.relatedEntities.accounts;
			}
			if ($scope.relatedEntities.advertisers){
				if ($scope.relatedEntities.advertisers.index) $scope.relatedEntities.advertisers.index = {};
				if ($scope.relatedEntities.advertisers.list) $scope.relatedEntities.advertisers.list.length = 0;
				delete $scope.relatedEntities.advertisers;
			}
			if($scope.relatedEntities.brands){
				if ($scope.relatedEntities.brands.list) $scope.relatedEntities.brands.list.length = 0;
				if ($scope.relatedEntities.brands.index) $scope.relatedEntities.brands.index = {};
				delete $scope.relatedEntities.brands;
			}

			$scope.invalidContacts = null;
			delete $scope.relatedEntities;
		});
	}]);
