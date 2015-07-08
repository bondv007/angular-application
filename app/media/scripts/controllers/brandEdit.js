/**
 * Created by liad.ron on 11/27/14.
 */
'use strict';

app.controller('brandEditCtrl', ['$scope', '$rootScope', '$stateParams', 'mmAlertService', 'mmRest', 'enums', 'adminUtils', '$state',
	'contactsService', 'mmSession', '$q', 'entityMetaData', '$modalInstance', 'entity', 'mmPermissions',
	function ($scope, $rootScope, $stateParams, mmAlertService, mmRest, enums, adminUtils, $state, contactsService, mmSession, $q, entityMetaData, $modalInstance, entity, mmPermissions) {

		var adminSettings = ["regionalSettings", "thirdPartyTracking", "servingSettings", "privacy", "campaignSettings"],
			relatedEntitiesName = ['campaigns'],
      currentAdvertiser = {};

		$scope.isEditMode = !!$stateParams.brandId || !!$scope.isEntral;
		$scope.inContext = false;
		$scope.accountId = null;
		$scope.advertisers = [];
		$scope.labelWidth = 165;
		$scope.validation = {};
		$scope.isTabValid = {};
		$scope.tabHandler = {};
		$scope.isRequired = true;
		$scope.isMultipleAdvertisers = false;
		$scope.isCampaignsExist = false;
		$scope.isInheritedAdminSettigns = false;
		$rootScope.mmIsPageDirty = false;
		$scope.miniSection = false;
		$scope.pageReady = false;
		$scope.togglesStatus = {settings: false, contacts: false, adChoicesIcon: true};
		$scope.initialLoad = true;
		$scope.showSPinner = true;
		$scope.invalidContacts = {};
		$scope.externalId = {};
		$scope.centralLinks = {campaigns : {text : 'Campaigns', link : 'spa.brand.campaigns'}};
		$scope.entityObj = {context : 'brand'};
		$scope.isModal = false;
		$scope.displayDataAccess = true;
		$scope.campSettingsLabelWidth = 160;
		$scope.permissions = {entity:{createEdit: true}, common: {externalId : {view: false, edit : false}, sizmekContacts: {createEdit: false}}};
    $scope.lazyTypeParams = 'advertisers?permissionNames=' + entityMetaData['advertiser'].permissions.entity.createEdit;

		//set enums objects
		$scope.verticals = enums.verticals;
		$scope.thirdPartyTracking = enums.thirdpartyURLsTypes;
		$scope.thirdPartyAdTags = enums.thirdPartyAdTags;
		$scope.regulationProgram = enums.regulationProgram;
		$scope.gmtOffset = enums.GMTOffset;
		$scope.hardStops = enums.hardStop;
		$scope.traffickingMode = enums.traffickingMode;

		if(!_.isUndefined($scope.entityLayoutInfraButtons)){
			$scope.entityLayoutInfraButtons.discardButton = {name : 'discard', func : rollback, ref : null, nodes : []};
			$scope.entityLayoutInfraButtons.saveButton = {name : 'save', func : save, ref : null, nodes : [], isPrimary : true};
		}

		var watcher = $scope.$watch('$parent.mainEntity', function (newValue, oldValue) {
			if (newValue != oldValue || oldValue == null || !!$scope.isEntral) {
				updateState();
			}
		});

		initialize();

		function initialize(){
			if(!_.isNull(entity)){
				$scope.isModal = true;
				$scope.labelWidth = 80;
				$scope.accountId = entity.accountId || null;
				$scope.advertiserId = entity.advertiserId;
			}else{
				$scope.advertiserId = $scope.contextData.key == 'advertiserId' ? $scope.contextData.contextEntityId : undefined;
				$scope.inContext = $scope.contextData.isInContext;
				$scope.labelWidth = 165;
				$scope.labelWidth = 165;
			}
			if(!$scope.advertiserId){
			}
			setTabHandlerObj();
			setTabValidationObj();
			updateState();
		}

    function updateState() {
      $rootScope.mmIsPageDirty = false;
      if ($scope.$parent.mainEntity != null && $scope.isEditMode) {
        setTabValidationObj();
        setAccountId().then(function(){
          $scope.editObject = mmRest.EC2Restangular.copy($scope.$parent.mainEntity);
          setRelatedEntitiesCount();
          initExternalId();
          $scope.originalCopy = mmRest.EC2Restangular.copy($scope.editObject);
          $scope.pageReady = $scope.editObject != null;
          adminUtils.permissions.checkOnEditMode($scope.editObject, $scope.permissions);
          updateTabHandlerObj();
        });
      } else if(!$scope.isEditMode){
        $scope.isCampaignsExist = false;
        $scope.editObject = $scope.editObject || mmRest.EC2Restangular.copy(entityMetaData["brand"].defaultJson);
        $scope.editObject.advertiserId = $scope.advertiserId || null;
        $scope.editObject.relationsBag.parents.advertiser.id =  $scope.editObject.advertiserId;
        $scope.originalCopy = mmRest.EC2Restangular.copy($scope.editObject);
        initExternalId();
        adminUtils.permissions.checkOnNewModeCommon(entityMetaData['brand'].type, $scope.permissions.common);
        updateTabHandlerObj();
        //get parent Admin Settings on new brand creation under advertiser context
        if(!!$scope.editObject.relationsBag.parents.advertiser.id && !$scope.isInheritedAdminSettigns){
          $scope.isInheritedAdminSettigns = true;
          $q.when(inheritAdvertiserAdminSettings($scope.editObject.relationsBag.parents.advertiser.id)).then(function(){
            setRelatedEntities(currentAdvertiser);
            $scope.originalCopy = mmRest.EC2Restangular.copy($scope.editObject);
            $scope.pageReady = true;
          },function(error){
            processError(error);
          });
        }
      }
    }

		function setTabHandlerObj(){
			$scope.tabHandler.settings = {campaign: {isActive: true}, regional:{isActive: true}, privacy:{isActive: false}};
			$scope.tabHandler.contacts = {
				sizmekContacts:{isActive: true, permission : true},
				campaignManagerContacts:{isActive: false, permission : true},
				creativeManagerContacts:{isActive: false, permission : true},
				siteContacts:{isActive: false, permission : true}};
		}

    function updateTabHandlerObj(){
      $scope.tabHandler.contacts.sizmekContacts.permission = $scope.permissions.common.sizmekContacts.createEdit;
      $scope.$broadcast('mmTabHandlerChanged', null);
    }

		function setTabValidationObj(){
			$scope.isTabValid.settings = {campaign: true, regional: true, privacy: true};
			$scope.isTabValid.contacts = {sizmekContacts: true, campaignManagerContacts: true, creativeManagerContacts: true, siteContacts: true};
		}

		function setRelatedEntitiesCount(){
			var generatedLink = adminUtils.linksBuilder.linksForList(relatedEntitiesName, $scope.editObject.type, $scope.editObject.relationsBag);
			relatedEntitiesName.forEach(function(entity){
				$scope.centralLinks[entity].text = generatedLink[entity].text;
				$scope.centralLinks[entity].link = generatedLink[entity].link;
				$scope.centralLinks[entity].caption = entity.charAt(0).toUpperCase() + entity.substring(1, entity.length);
				var hasPermissions = true;
				if(entity == 'campaigns'){
					hasPermissions = mmPermissions.hasPermissionByEntity($scope.editObject, entityMetaData['campaign'].permissions.entity)
				}
				$scope.centralLinks[entity].hasPermission = hasPermissions;
			});
		}

		function inheritAdvertiserAdminSettings(parentId){
			var deferred = $q.defer();
      if(!_.isEmpty(currentAdvertiser)){
				setAdminSettings(currentAdvertiser);
				return;
			}
			mmRest.advertiser(parentId).get().then(function (data) {
        currentAdvertiser = data;
				$scope.showSPinner = false;
				setAdminSettings(data);
				deferred.resolve();
			}, function (error) {
				$scope.isInheritedAdminSettigns = false;
				deferred.reject(error);
			});
			return deferred.promise;
		}

		function setRelatedEntities(advertiser){
			$scope.accountId = advertiser.accountId;
			$scope.editObject.relationsBag.parents.account.id = $scope.accountId;
			$scope.entityObj.accountId = $scope.accountId;
			$scope.editObject.advertiserId = advertiser.id;
			$scope.editObject.relationsBag.parents.advertiser.name = advertiser.name;
		}

		function setAdminSettings(advertiser){
			$scope.isInheritedAdminSettigns = true;
			adminSettings.forEach(function (settings) {
				if(advertiser.adminSettings[settings]) {
					$scope.editObject.adminSettings[settings] = mmRest.EC2Restangular.copy(advertiser.adminSettings[settings]);
				}
			});
			setParentDefaultContacts(advertiser.adminSettings.defaultContacts);
			//inherit vertical
			$scope.editObject.vertical = advertiser.vertical;
		}

		function setParentDefaultContacts(defaultContacts){
			$scope.editObject.adminSettings.defaultContacts = mmRest.EC2Restangular.copy(defaultContacts);
		}

		function setAccountId(){
			var deferred = $q.defer();
			mmRest.advertiser($scope.$parent.mainEntity.advertiserId).get().then(function (data) {
				$scope.showSPinner = false;
        currentAdvertiser = data;
				$scope.accountId = data.accountId;
				$scope.$parent.mainEntity.accountId = $scope.accountId;//TODO avoid saving accountId twice, is ok to save on mainEntity?
				deferred.resolve();
			}, function (error) {
				processError(error);
				deferred.reject();
			});
			return deferred.promise;
		}

		function processError(error) {
			console.log('ohh no!');
			console.log(error);
			if (_.isUndefined(error.data.error)){
				mmAlertService.addError("Server error. Please try again later.");
			} else {
				mmAlertService.addError(error.data.error);
			}
		}

		function saveValidation() {
			var isValid = true;
			$scope.validation = {};
			//external id directive validation
			var validExternalId = $scope.externalId.externalIdValidation();
			if(!validExternalId){
				isValid = false;
			}
			if ($scope.editObject.name === undefined || $scope.editObject.name === null || $scope.editObject.name.length <= 1) {
				$scope.validation.brandName = "Please enter a name longer than 1 characters";
				isValid = false;
			}
			if ($scope.editObject.vertical === undefined || $scope.editObject.vertical === null) {
				$scope.validation.vertical = "Please Select Vertical";
				isValid = false;
			}
			if ($scope.editObject.relationsBag.parents.advertiser.id === undefined || $scope.editObject.relationsBag.parents.advertiser.id === null) {
				$scope.validation.advertiser = "Please Select Advertiser";
				isValid = false;
			}
			var validMarkerClickThroughURL = isValidUrl($scope.editObject.adminSettings.privacy.adMarker.markerClickthroughURL);
			if(!validMarkerClickThroughURL && !_.isEmpty($scope.editObject.adminSettings.privacy.adMarker.markerClickthroughURL)){
				$scope.validation.markerClickthroughURL = "Please Enter Valid URL";
				isValid = false;
				$scope.togglesStatus.privacy = true;
				$scope.isTabValid.settings.privacy = false;
			}

			var typeIds = ['SIZMEK', 'MEDIA', 'CREATIVE'];
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

		//TODO move to validation helper
		function isValidUrl(url) {
			var valid = true;
			$scope.urlError = {text: ''};
			if (url !== null && url !== "") {
				var validUrl = /^(http|https):\/\/[^ "]+$/;
				return validUrl.test(url)
			}
		}

		function openTogglesAndMarkTabsAsInvalid(){
			if(!$scope.isTabValid.settings.privacy){
				changedSelectedTab('settings', 'privacy');
				$scope.togglesStatus.settings = true;
			}
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

		function save(skipValidation) {
			var isValid = true;
			if(!skipValidation){
				isValid = saveValidation();
			}
			if (isValid) {
				if ($scope.isEditMode) {
					var serverSaveBrand = mmRest.brand($scope.editObject.id);
					return serverSaveBrand.customPUT({entities: [$scope.editObject]}).then(function(data){
						$rootScope.mmIsPageDirty = false;
						$scope.showSPinner = false;
						//$scope.$parent.mainEntity = data;
						mmAlertService.addSuccess('Brand ' + data.name + ' was successfully updated.');
						return data;
					}, function(error){
						processError(error);
					});
				} else {
					return mmRest.brands.post($scope.editObject).then(function (data) {
						$rootScope.mmIsPageDirty = false;
						$scope.showSPinner = false;
						var linkToCampign = '';
						var successMsg = '';
						if(!$scope.isModal){
							linkToCampign = 'spa.campaign.campaignNew';
							successMsg = 'Create a new Campaign';
						}
						mmAlertService.addSuccess('Brand ' + data.name + ' was successfully created.', linkToCampign, successMsg);
						if(!!$scope.isModal){
							$modalInstance.close(data);
						}
						else if (!!$scope.isEntral) {
							//$scope.$parent.mainEntity = data;
							return data;
						} else {
							//replace is needed here to replace the last history record
							$state.go("spa.brand.brandEdit", {brandId: data.id}, {location : "replace"});
						}

          }, function(error){
            processError(error);
          });
        }
      }
    }

		function rollback(){
			$scope.editObject = mmRest.EC2Restangular.copy($scope.originalCopy);
			$scope.externalId = $scope.editObject.externalId;
			$scope.validation = {};
		}

		function initExternalId(){
			if(!_.isUndefined($scope.editObject)){
				if(_.isUndefined($scope.editObject.externalId) ||_.isNull($scope.editObject.externalId)){
					$scope.editObject.externalId = {
						type: 'ExternalId',
						entityType: null,
						id: null
					}
				}
				//add reference to the external id object that is bound to the control model
				$scope.externalId = $scope.externalId || {};
				$scope.externalId = $scope.editObject.externalId;
			}
		}

		$scope.onBrandNameChange = function(){
			if($scope.editObject.name.length > 1) $scope.validation.brandName = '';
			else $scope.validation.brandName = "Please enter a name longer than 1 characters";
		};
		$scope.onVerticalSelected = function(){
			$scope.validation.vertical = '';
		};
		$scope.onAdvertiserSelected = function(){
			$rootScope.isDirtyEntity = true;
			$scope.validation.advertiser = '';

      // TODO: ask Liad what is this
			//if(!$scope.advertisersIndex[$scope.editObject.relationsBag.parents.advertiser.id]){
			//	//find new advertiser that has been created via the modal
			//	$scope.advertisersIndex[$scope.editObject.relationsBag.parents.advertiser.id] = _.find($scope.advertisers, {id : $scope.editObject.relationsBag.parents.advertiser.id});
			//}

      mmRest.advertiser($scope.editObject.relationsBag.parents.advertiser.id).get().then(function(data) {
        currentAdvertiser = data;
        $scope.editObject.relationsBag.parents.advertiser.name = data.name;
        $q.when(inheritAdvertiserAdminSettings($scope.editObject.relationsBag.parents.advertiser.id)).then(function() {
          setRelatedEntities(data);
        });
      });
		};
		$scope.onMarkerClickThroughURLChange = function(){
			if(isValidUrl($scope.editObject.adminSettings.privacy.adMarker.markerClickthroughURL) || _.isEmpty($scope.editObject.adminSettings.privacy.adMarker.markerClickthroughURL)){
				$scope.validation.markerClickthroughURL = '';
				$scope.isTabValid.settings.privacy = true;
			}
			else if(!_.isEmpty($scope.editObject.adminSettings.privacy.adMarker.markerClickthroughURL)){
				$scope.validation.markerClickthroughURL = "Please Enter Valid URL";
				$scope.isTabValid.settings.privacy = false;
			}
		};
		$scope.onNewEntitySave = function(){
			var isValid = true;
			if(_.isNull($scope.editObject.name) || _.isUndefined($scope.editObject.name) || _.isEmpty($scope.editObject.name)) {
				$scope.validation.brandName = "Please enter a name longer than 2 characters";
				isValid = false;
			}
			if(_.isNull($scope.editObject.vertical) || _.isUndefined($scope.editObject.vertical) || _.isEmpty($scope.editObject.vertical)){
				$scope.validation.vertical = "Please Select Vertical";
				isValid = false;
			}

			if(!isValid)
				return;

			save(true);
		};
		$scope.onNewEntityCancel = function(){
			$modalInstance.dismiss('cancel');
		};

		$scope.$on('$destroy', function() {
			if (watcher) watcher();
			if($scope.advertisers) $scope.advertisers.length = 0;
		});
	}]);
