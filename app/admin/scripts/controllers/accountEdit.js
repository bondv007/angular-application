/**
 * Created by liad.ron on 11/20/14.
 */

'use strict';

app.controller('accountEditCtrl', ['$scope', '$rootScope', '$state', 'enums', '$stateParams', 'mmAlertService', 'mmRest', 'contactsService', 'mmUtils', 'adminUtils', 'mmModal', '$q', 'entityMetaData', 'mmPermissions',
	function ($scope, $rootScope, $state, enums, $stateParams, mmAlertService, mmRest, contactsService, mmUtils, adminUtils, mmModal, $q, entityMetaData, mmPermissions) {

		var relatedEntitiesName = ["users", "advertisers", "campaigns"/*, "sites"*/],
			org = {},
			billingNameEdited = false;
		$scope.originalCopy = {};
		$scope.labelWidth = 165;
		$scope.validation = {};
		$scope.isTabValid = {};
		$scope.tabHandler = {};
		$scope.isEditMode = !!$stateParams.accountId || !!$scope.isEntral;
		$scope.isRequired = true;
		$scope.showAsLabel = {central : true};
		$rootScope.mmIsPageDirty = false;
		$scope.miniSection = false;
		$scope.pageReady = false;
		$scope.externalId = {};
		$scope.showSPinner = true;
		$scope.invalidContacts = {};
		$scope.relatedEntities = {};
		$scope.isCreateContactModalOpen = false;
		$scope.billingContact = {isCreated : false, name: "Please Create Billing Contact", labelNameWidth: 186, entity: {}, addBillingContactLink: "Add New"};
		$scope.togglesStatus = {settings: !$stateParams.accountId, contacts: !$scope.isEditMode, analytics: false, addChioceIcon: true};
		$scope.disablePayingAccount = false;
		$scope.globalContacts = {};
		$scope.entityObj = {};
		$scope.postSave = false;
		$scope.displayDataAccess = true;
		$scope.campSettingsLabelWidth = 160;
    $scope.permissions = {entity:{editBasic: true, editAdvanced: true},
                          common: {externalId : {view: false, edit : false}, sizmekContacts: {createEdit: false}}};
    $scope.editAccount = true;
    $scope.editBilling = true;
    $scope.analyticsValidation = {};

		//set enums objects
		$scope.accountTypes = enums.accountTypes;
		$scope.thirdPartyTracking = enums.thirdpartyURLsTypes;
		$scope.thirdPartyAdTags = enums.thirdPartyAdTags;
		$scope.regulationProgram = enums.regulationProgram;
		$scope.gmtOffset = enums.GMTOffset;
		$scope.hardStops = enums.hardStop;
		$scope.traffickingMode = enums.traffickingMode;

		$scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: rollback, ref: null, nodes: []};
		$scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: save, ref: null, nodes: [],isPrimary:true};

		initialize();

		var watcher = $scope.$watch('$parent.mainEntity', function (newValue, oldValue) {

			updateState();
		});

		function initialize(){
			setTabHandlerObj();
			setTabValidationObj();
			if(!$scope.isEditMode) updateState();
			//if($scope.isEntral) $scope.hideGoTo = true;
		}

		function updateState() {
			$rootScope.mmIsPageDirty = false;
			if ($scope.$parent.mainEntity != null) {
				setTabValidationObj();
				$scope.validation = {};
				setBillingContact($scope.isEditMode);
				$scope.editObject = mmRest.EC2Restangular.copy($scope.$parent.mainEntity);
				setPermissionsOnEditMode();
				billingNameEdited = false;
				if($scope.editObject.billingSettings && $scope.editBilling){
					billingNameEdited = $scope.editObject.name != $scope.editObject.billingSettings.billingAccountName;
				}
        updateTabHandlerObj();
				$scope.disablePayingAccount = $scope.editObject.accountTypes.payingAccount;
				$scope.postSave = $scope.editObject.accountTypes.campaignManager;
				setRelatedEntities();
				setRelatedEntitiesTotalAmount();
				initExternalId();
				$scope.originalCopy = mmRest.EC2Restangular.copy($scope.editObject);
				$scope.pageReady = $scope.editObject != null;
				getGlobalContactsByAccountID();
				$scope.entityObj.id = $scope.editObject.id;
				$scope.entityObj.type = $scope.editObject.type;
				updateEntityLayoutButtons();
			}

			else if(!$scope.isEditMode){
				$scope.postSave = false;
				setUserObj();
				setBillingContact($scope.isEditMode);
				$scope.editObject = mmRest.EC2Restangular.copy(entityMetaData["account"].defaultJson.account);
				initExternalId();
				$scope.originalCopy = mmRest.EC2Restangular.copy($scope.editObject);
				$scope.pageReady = $scope.editObject != null;
        adminUtils.permissions.checkOnNewModeCommon(entityMetaData["account"].type, $scope.permissions.common);
			}
		}

		function setPermissionsOnEditMode() {
			$scope.editAccount = adminUtils.permissions.checkOnEditMode($scope.editObject, $scope.permissions);
			$scope.editBilling = _.isNull($scope.editObject.billingSettings);
		}

    function setTabHandlerObj(){
      $scope.tabHandler.settings = {billing:{isActive: false}, regional:{isActive: true}, campaign: {isActive: false},
        video:{isActive: false}, privacy:{isActive: false}, analytics: {isActive: false}};
      $scope.tabHandler.contacts = {
        sizmekContacts:{isActive: true, permission : true},
        campaignManagerContacts:{isActive: false, permission : true},
        creativeManagerContacts:{isActive: false, permission : true},
        siteContacts:{isActive: false, permission : true}};
    }

		function setTabValidationObj(){
			$scope.isTabValid.settings = {billing: true, regional: true, privacy: true, analytics: true};
			$scope.isTabValid.contacts = {sizmekContacts: true, campaignManagerContacts: true, creativeManagerContacts: true, siteContacts: true};
		}

    function updateTabHandlerObj(){
      $scope.tabHandler.contacts.sizmekContacts.permission = $scope.permissions.common.sizmekContacts.createEdit && $scope.editAccount;
      $scope.tabHandler.contacts.campaignManagerContacts.permission = $scope.editAccount;
      $scope.tabHandler.contacts.creativeManagerContacts.permission = $scope.editAccount;
      $scope.tabHandler.contacts.siteContacts.permission = $scope.editAccount;

      $scope.$broadcast('mmTabHandlerChanged', null);
    }

		function setBillingContact(isEditMode){
			if(isEditMode){
				$scope.billingContact.isCreated = true;
				$scope.billingContact.addLink = "Change Contact";
				$scope.billingContact.entity = {};
				$scope.billingContact.labelNameWidth = 226;
			}else {
				$scope.billingContact.isCreated = false;
				$scope.billingContact.addLink = "Add New";
				$scope.billingContact.entity = {};
				$scope.billingContact.name = "Please Create Billing Contact";
				$scope.billingContact.labelNameWidth = 266;
			}
		}

		//TODO Reut: fix when will move to GoTo
		function updateEntityLayoutButtons(){
			if(!$scope.isEntral){
				var disableButton = true;
				if ($scope.editObject.accountTypes.campaignManager)
					disableButton = false;

				$scope.entityLayoutButtons.forEach(function (button) {
					if (button.name == "Advertisers" || button.name == "Campaigns" || button.name == "Strategies") {
						button.isDisabled = disableButton; }})
			}
		}

		function save() {
      $scope.$broadcast('analyticsManipulator', null);
			if (saveValidation()) {
				preSaveManipulation();
				if ($scope.isEditMode === true) {
					return $scope.editObject.put().then(function(data){
						$scope.postSave = data.accountTypes.campaignManager;
						$rootScope.mmIsPageDirty = false;
						$scope.showSPinner = false;
						//$scope.$parent.mainEntity = data;
						updateEntityLayoutButtons();
						$scope.disablePayingAccount = $scope.editObject.accountTypes.payingAccount;
						mmAlertService.addSuccess('Account ' + data.name + ' was successfully updated.');
						if($scope.editObject.accountTypes.payingAccount){
							$scope.editBilling = _.isNull($scope.editObject.billingSettings);
						}
						return data;
					}, function(error){
						//TODO contacts postSaveValidation
						//var filteredError = postSaveValidation(error, contacts, invalidContacts);
						processError(error);
					});
				} else {
					setAccountCreationRequestObj();
					return mmRest.accounts.post($scope.accountCreationRequestObj).then(function(data){
						$scope.postSave = data.accountTypes.campaignManager;
						$rootScope.mmIsPageDirty = false;
						$scope.showSPinner = false;
						if(!_.isNull(data.billingSettings)) $scope.editObject.billingSettings.billingUserId = data.billingSettings.billingUserId;
						mmUtils.cacheManager.removeResource('globalContacts');
						mmAlertService.addSuccess('Account ' + data.name + ' was successfully created.',  'spa.user.userNew', 'Create a new user');
						if (!!$scope.isEntral) {
							//$scope.$parent.mainEntity = data;
							return data;
						} else {
							//replace is needed here to replace the last history record
							$state.go("spa.account.accountEdit", {accountId: data.id}, {location : "replace"});
						}
					}, function(error){
						//TODO contacts postSaveValidation
						//var filteredError = postSaveValidation(error, contacts, invalidContacts);
						$rootScope.isDirtyEntity = true;
						processError(error);
					});
				}
			}
		}

		function rollback(){
			$scope.editObject = mmRest.EC2Restangular.copy($scope.originalCopy);
			$scope.externalId = $scope.editObject.externalId;
			setBillingContact($scope.isEditMode);
			$scope.validation = {};
		}

		function saveValidation() {
			var isValid = true;
			$scope.validation = {};
			//external id directive validation
			var validExternalId = $scope.externalId.externalIdValidation();
			if(!validExternalId) isValid = false;

			if ($scope.editObject.name === undefined || $scope.editObject.name === null || $scope.editObject.name.length <= 1) {
				$scope.validation.accountName = "Please enter a name longer than 1 characters";
				isValid = false;
			}
      //check validation only if billing section is editable
      if($scope.editBilling){
        if($scope.editObject.accountTypes.campaignManager || $scope.editObject.accountTypes.payingAccount){
          var validBilling = billingValidations();
          if(!validBilling) isValid = false;
        }
      }

			if($scope.editObject.office.id === undefined || $scope.editObject.office.id === null) {
				$scope.validation.office = "Please select office";
				isValid = false;
			}

			if($scope.editObject.accountTypes.campaignManager){
				var validMarkerClickThroughURL = isValidUrl($scope.editObject.adminSettings.privacy.adMarker.markerClickthroughURL);
				if(!validMarkerClickThroughURL && !_.isEmpty($scope.editObject.adminSettings.privacy.adMarker.markerClickthroughURL)){
					$scope.validation.markerClickthroughURL = "Please Enter Valid URL";
					isValid = false;
					$scope.isTabValid.settings.privacy = false;
				}
			}

      if(!analyticsValidation()) isValid = false;

			var typeIds = ['SIZMEK', 'MEDIA', 'CREATIVE', 'SITE'];
			if(!$scope.editObject.accountTypes.campaignManager) typeIds.length = 1;
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

    function analyticsValidation(){
      var isValid = true;
      var minSurface = $scope.editObject.analyticsSettings.viewabilityThreshold.minimumSurface;
      var minDuration = $scope.editObject.analyticsSettings.viewabilityThreshold.minimumDuration;
      $scope.analyticsValidation.surfaceError = "";
      $scope.analyticsValidation.durationError= "";

      if(!_.isNull(minSurface)){
        if(minSurface === undefined || minSurface < 1 || minSurface > 100){
          isValid = false;
          $scope.analyticsValidation.surfaceError = "Please enter a positive number between 1 and 100";
        }
      }

      if(!_.isNull(minDuration)){
        if(minDuration === undefined || minDuration < 1){
          isValid = false;
          $scope.analyticsValidation.durationError = "Please enter a positive number bigger than 1";
        }
      }

      if(!isValid)
        $scope.isTabValid.settings.analytics = false;

      return isValid;
    }

		function billingValidations(){
			var isValid = true;
			if ($scope.editObject.billingSettings.billingAccountName === undefined || $scope.editObject.billingSettings.billingAccountName === null ||
				_.isEmpty($scope.editObject.billingSettings.billingAccountName)) {
				$scope.validation.billingAccountName = "Please enter billing account name";
				isValid = false;
			}
			if ($scope.editObject.billingSettings.billingAddress === undefined || $scope.editObject.billingSettings.billingAddress === null  ||
				$scope.editObject.billingSettings.billingAddress.length <= 2) {
				$scope.validation.billingAddress = "Please enter billing address longer than 2 characters";
				isValid = false;
			}
			if ($scope.editObject.billingSettings.city === undefined || $scope.editObject.billingSettings.city === null ||
				$scope.editObject.billingSettings.city.length <= 2) {
				$scope.validation.billingCity = "Please enter billing city longer than 2 characters";
				isValid = false;
			}
			if ($scope.editObject.billingSettings.zipCode === undefined || $scope.editObject.billingSettings.zipCode === null ||
				_.isEmpty($scope.editObject.billingSettings.zipCode)) {
				$scope.validation.billingZipCode = "Please enter billing account name";
				isValid = false;
			}
			if(!$scope.isEditMode && !$scope.billingContact.isCreated){
				$scope.validation.firstCreationContact = "Please Create billing Contact and 'Save' again";
				mmAlertService.addError($scope.validation.firstCreationContact);//TODO temporary, must be display only on the link/label!
				isValid = false;
			}
			if($scope.isEditMode && !$scope.editObject.billingSettings.billingUserId){
				$scope.validation.existingContact = "Please Create billing Contact and 'Save' again";
				isValid = false;
			}
			if(!isValid) $scope.isTabValid.settings.billing = false;
			return isValid
		}

		function isBillingValid(){
			if(!_.isEmpty($scope.validation.billingAccountName) ||
				!_.isEmpty($scope.validation.billingAddress) ||
				!_.isEmpty($scope.validation.billingCity) ||
				!_.isEmpty($scope.validation.billingZipCode) ||
				!_.isEmpty($scope.validation.firstCreationContact) ||
				!_.isEmpty($scope.validation.existingContact)){
				return false;
			}
			return true;
		}

		function preSaveManipulation(){
			if(!$scope.editObject.accountTypes.creativeManager){
				if(!_.isNull($scope.editObject.adminSettings.video)){
					org.video = mmRest.EC2Restangular.copy($scope.editObject.adminSettings.video);
					$scope.editObject.adminSettings.video = null;
				}
			}
			if(!$scope.editObject.accountTypes.campaignManager && !$scope.editObject.accountTypes.payingAccount){
				if(!_.isNull($scope.editObject.billingSettings)){
					org.billingSettings = mmRest.EC2Restangular.copy($scope.editObject.billingSettings);
					$scope.editObject.billingSettings = null;
				}
			}
			if(!$scope.editObject.accountTypes.campaignManager){
				if(!_.isNull($scope.editObject.adminSettings.privacy)) {
					org.privacy = mmRest.EC2Restangular.copy($scope.editObject.adminSettings.privacy);
					$scope.editObject.adminSettings.privacy = null;
				}
				if(!_.isEmpty($scope.editObject.adminSettings.defaultContacts.campaignManagerContacts)){
					org.campaignManagerContacts = mmRest.EC2Restangular.copy($scope.editObject.adminSettings.defaultContacts.campaignManagerContacts);
					$scope.editObject.adminSettings.defaultContacts.campaignManagerContacts.length = 0;
				}
				if(!_.isEmpty($scope.editObject.adminSettings.campaignSettings)){
					org.campaignSettings = mmRest.EC2Restangular.copy($scope.editObject.adminSettings.campaignSettings);
					$scope.editObject.adminSettings.campaignSettings = null;
				}
			}
		}

		function openTogglesAndMarkTabsAsInvalid(){
			if(!$scope.isTabValid.settings.regional){
				changedSelectedTab('settings', 'regional');
				$scope.togglesStatus.settings = true;
			}
			if(!$scope.isTabValid.settings.billing){
				changedSelectedTab('settings', 'billing');
				$scope.togglesStatus.settings = true;
			}
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
      if(!$scope.isTabValid.settings.analytics){
        changedSelectedTab('settings', 'analytics');
        $scope.togglesStatus.settings = true;
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

		//TODO move to validation helper
		function isValidUrl(url) {
			$scope.urlError = {text: ''};
			if (url !== null && url !== "") {
				var validUrl = /^(http|https):\/\/[^ "]+$/;
				return validUrl.test(url)
			}
		}

		function setAccountCreationRequestObj(){
			$scope.accountCreationRequestObj = {};
			$scope.accountCreationRequestObj.type = "AccountCreationRequest";
			$scope.accountCreationRequestObj.account = $scope.editObject;
			setFirstBillingCampaignManagerContact();
		}

		function setFirstBillingCampaignManagerContact(){
			if($scope.editObject.accountTypes.campaignManager || $scope.editObject.accountTypes.payingAccount){
				$scope.accountCreationRequestObj.firstBillingCampaignManagerContact = {
					"type": "User",
					"clientRefId": $scope.billingContact.entity.clientRefId || mmUtils.clientIdGenerator.next(),
					"name": $scope.billingContact.entity.name,
					"accountId": null,
					"salesManager":  $scope.billingContact.entity.salesManager,
					"clientServiceManager": $scope.billingContact.entity.clientServiceManager,
					"creativeServiceSpecialist": $scope.billingContact.entity.creativeServiceSpecialist,
					"username": $scope.billingContact.entity.username,
					"password": $scope.billingContact.entity.password,
					"address": $scope.billingContact.entity.address,
					"timeZone": null,
					"language": null,
					"regional": null,
					"enableForIntegration": false,
					"status": $scope.billingContact.entity.status, //TODO: remove status when server side is done
					"platformUser": $scope.billingContact.entity.platformUser,
					"email": $scope.billingContact.entity.email,
					"phone": $scope.billingContact.entity.phone}
			}
			else{
				$scope.accountCreationRequestObj.firstBillingCampaignManagerContact = null;
			}
		}

		function setUserObj(){
			$scope.billingContact.entity = {
				type: "User",
				id: null,
				clientRefId: null,
				name: null,
				accountId: null,
				salesManager: false,
				clientServiceManager: false,
				creativeServiceSpecialist: false,
				username: null,
				password: null,
				address: null,
				timeZone: null,
				language: null,
				regional: null,
				enableForIntegration: false,
				status: "Enabled", //TODO: remove status when server side is done
				platformUser: false,
				email: null,
				phone: null
			}
		}

		function setRelatedEntities(){
			var objOrder = ["a_", "b_", "c_"];
			var i = 0;
			relatedEntitiesName.forEach(function(entity){
				var nameWithCapitalFirstLatter = entity.charAt(0).toUpperCase() + entity.substring(1, entity.length);
				//var nameWithEdit = entity.substring(0,entity.length - 1) + "Edit";
				var entityType = entity.substring(0,entity.length - 1);
				var hasPermissions = mmPermissions.hasPermissionByEntity($scope.editObject, entityMetaData[entityType].permissions.entity)
				$scope.relatedEntities[objOrder[i] + entity] = {type: entityType, caption: nameWithCapitalFirstLatter,
					isExist : true, list: [], amountText: nameWithCapitalFirstLatter, centralLink : "spa.account." +  entity, hasPermission : hasPermissions};
				i++;
			});
		}

		function setRelatedEntitiesTotalAmount(){
			var objOrder = ["a_", "b_", "c_"];
			var k = 0;
			var generatedLink = adminUtils.linksBuilder.linksForList(relatedEntitiesName, $scope.editObject.type, $scope.editObject.relationsBag);
			relatedEntitiesName.forEach(function(entity){
				$scope.relatedEntities[objOrder[k] + entity].amountText = generatedLink[entity].text;
				$scope.relatedEntities[objOrder[k] + entity].centralLink = generatedLink[entity].link;
				k++;
			});
		}

		function getGlobalContactsByAccountID(){
			mmUtils.cacheManager.removeResource('globalContacts');
			mmRest.globalContacts.getList({'accountId': $scope.editObject.id}).then(function (data) {
				$scope.globalContacts = data;
			}, function (error) {
				processError(error);
			});
		}

		function initExternalId() {
			if (!_.isUndefined($scope.editObject)) {
				if (_.isUndefined($scope.editObject.externalId) || _.isNull($scope.editObject.externalId)) {
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

		/**************************** EVENTS HANDLER *****************************/

		$scope.onAccountNameChange = function() {
			if($scope.editObject.name.length > 1 ) $scope.validation.accountName = '';
			else $scope.validation.accountName = "Please enter a name longer than 1 characters";;
			if ($scope.editObject.billingSettings) {
				if (!billingNameEdited && $scope.editBilling) {
					$scope.editObject.billingSettings.billingAccountName = mmRest.EC2Restangular.copy($scope.editObject.name);
				}
			}
		};
		$scope.onCampainManagerToggle = function(){
			//avoid remove check on edit mode and if there are advertisers under account
			if(!$scope.isEditMode || !$scope.disablePayingAccount) $scope.editObject.accountTypes.payingAccount = $scope.editObject.accountTypes.campaignManager;
      //only if billing tab is editable
      if($scope.editBilling){
        //if remove checkbox
        if(!$scope.editObject.accountTypes.campaignManager){
          $scope.tabHandler.settings.billing.isActive = false;
        }
        else if($scope.editObject.accountTypes.payingAccount){
          $scope.tabHandler.settings.billing.isActive = true;
        }
      }
//      if($scope.isEditMode && !$scope.editObject.accountTypes.campaignManager &&
//        !_.isNull($scope.editObject.relationsBag.advertiser) && $scope.editObject.relationsBag.advertiser.count > 0){
//        $scope.editObject.accountTypes.accountTypes.campaignManager = true;
//        mmAlertService.addInfo("Can't remove Campaign Manager type, account contain Advertisers.");
//      }
			if(_.isNull($scope.editObject.billingSettings))
				$scope.editObject.billingSettings = org.billingSettings || {
					"type": "BillingSettings",
					"city": null,
					"zipCode": null,
					"billingAddress": null,
					"billingAccountName": mmRest.EC2Restangular.copy($scope.editObject.name),
					"vat_tin": null
				};
			if(_.isNull($scope.editObject.adminSettings.privacy))
				$scope.editObject.adminSettings.privacy = org.privacy || {
					"type": "Privacy",
					"adMarker": {
						"includeInAllAds": null,
						"regulationProgram": "IAB_EU",
						"markerClickthroughURL": null
					},
					"disableCookies": null
				};
			if( _.isNull($scope.editObject.adminSettings.campaignSettings))
				$scope.editObject.adminSettings.campaignSettings = org.campaignSettings || {
					"type": "CampaignSettings",
					"hardStopMethod": "KEEP_SERVING_AS_USUAL",
					"creativeManagerAccess": true,
					"traffickingMode": "AdvancedMode"
				}
			if(_.isEmpty($scope.editObject.adminSettings.defaultContacts.campaignManagerContacts) && !_.isEmpty(org.campaignManagerContacts))
				org.campaignManagerContacts.forEach(function(contact){
					$scope.editObject.adminSettings.defaultContacts.campaignManagerContacts.push(contact);
				});
		};
		$scope.onCreativeManagerToggle = function(){
			if(_.isNull($scope.editObject.adminSettings.video))
				$scope.editObject.adminSettings.video = org.video || {
					"type": "Video",
					"autoTranscode": true
				};
		};
		$scope.onPayingAccountToggle = function(){
			if(!$scope.editObject.accountTypes.payingAccount) $scope.editObject.accountTypes.campaignManager = false;
      if($scope.editObject.accountTypes.payingAccount){
        $scope.tabHandler.settings.billing.isActive = true;
      }
			if(_.isNull($scope.editObject.billingSettings)) {
				$scope.editObject.billingSettings = org.billingSettings || {
					"type": "BillingSettings",
					"city": null,
					"zipCode": null,
					"billingAddress": null,
					"billingAccountName": mmRest.EC2Restangular.copy($scope.editObject.name),
					"vat_tin": null,
					"billingUserId": null
				};
				$scope.editBilling = true;
			}
		};
		$scope.onOfficeSelected = function(){
      $scope.validation.office = '';
		};
		$scope.onBillingAccountNameChanged = function(){
			billingNameEdited = true;
			$scope.validation.billingAccountName = '';
			if(isBillingValid()) $scope.isTabValid.settings.billing = true;
		};
		$scope.onBillingAddressChanged = function(){
			$scope.validation.billingAddress = '';
			if(isBillingValid()) $scope.isTabValid.settings.billing = true;
		};
		$scope.onBillingCityChanged = function(){
			$scope.validation.billingCity = '';
			if(isBillingValid()) $scope.isTabValid.settings.billing = true;
		};
		$scope.onBillingZipCodeChanged = function(){
			$scope.validation.billingZipCode = '';
			if(isBillingValid()) $scope.isTabValid.settings.billing = true;
		};
		$scope.onBillingVatTin = function(){
			$scope.validation.vat_tin = '';
		};
		$scope.onBillingContactSelected = function(){
			$scope.validation.existingContact = '';
			if(isBillingValid()) $scope.isTabValid.settings.billing = true;
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
		$scope.onCreateFirstBillingContactLinkClicked = function(){
			if ($scope.isCreateContactModalOpen) {
				return;
			}
			$scope.isCreateContactModalOpen = true;

			var modalInstance = mmModal.open({
				templateUrl: './admin/views/userEdit.html',
				controller: 'userEditCtrl',
				title: "Create New User",
				modalWidth: 520,
				bodyHeight: 335,//do not changes height! [liad.ron]
				confirmButton: { name: "Create", funcName: "onNewEntitySave", hide: false, isPrimary: true},
				discardButton: { name: "Cancel", funcName: "onNewEntityCancel"},
				resolve: {
					entity: function(){
						return $scope.billingContact.entity;
					}
				}
			});
			modalInstance.result.then(function (user) {
        $rootScope.isDirtyEntity = true //because validate user name is POST - make page not dirty
				$scope.billingContact.entity = user;
				$scope.billingContact.name = user.name;
				$scope.billingContact.isCreated = true;
				$scope.billingContact.addLink = "Change Contact";
				$scope.billingContact.labelNameWidth = 226;//146;
				$scope.isCreateContactModalOpen = false;
				$scope.validation.firstCreationContact = '';
				if(isBillingValid()) $scope.isTabValid.settings.billing = true;
			}, function () {
				$scope.isCreateContactModalOpen = false;
			});
		};

		$scope.$on('$destroy', function() {
			if (watcher) watcher();
			mmUtils.cacheManager.removeResource('accounts');
		});
	}]);
