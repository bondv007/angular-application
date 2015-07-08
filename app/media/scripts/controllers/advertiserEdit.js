/**
 * Created by liad.ron on 10/27/14.
 */
'use strict';

app.controller('advertiserEditCtrl', ['$scope', '$rootScope', '$stateParams', 'mmAlertService', 'enums', 'mmRest', '$state', 'contactsService', 'mmSession', '$q', 'adminUtils',
                'entityMetaData', '$modalInstance', 'entity', 'mediaValidationService', 'mmPermissions', '$timeout',
  function ($scope, $rootScope, $stateParams, mmAlertService, enums, mmRest, $state, contactsService, session, $q, adminUtils,
            entityMetaData, $modalInstance, entity, mediaValidationService, mmPermissions, $timeout) {

    var adminSettings = ["regionalSettings", "thirdPartyTracking", "servingSettings", "privacy", "campaignSettings"],
		  relatedEntitiesName = ['brands', 'campaigns'],
      currentAccount = {};

    $scope.isEditMode = !!$stateParams.advertiserId || !!$scope.isEntral;
    $scope.isAccountContext = false;
    $scope.validation = {};
    $scope.isTabValid = {};
    $scope.tabHandler = {};
    $scope.isRequired = true;
    $scope.isMultipleAccounts = false;
    $scope.isBrandsExist = false;
    $scope.isInheritedAdminSettigns = false;
    $rootScope.mmIsPageDirty = false;
    $scope.miniSection = false;
    $scope.pageReady = false;
    $scope.togglesStatus = {settings: false, contacts: false, adChoicesIcon: true};
    $scope.initialLoad = true;
    $scope.showSPinner = true;
    $scope.invalidContacts = {};
    $scope.externalId = {};
    $scope.centralLinks = {brands : {text : 'Brands', link : 'spa.advertiser.brands'}, campaigns : {text : 'Campaigns', link : 'spa.advertiser.campaigns'}};
    $scope.preSaveStatus = true;
    $scope.accounts = [];
		$scope.displayDataAccess = true;
		$scope.campSettingsLabelWidth = 160;
    $scope.permissions = {entity:{createEdit: true}, common: {externalId : {view: false, edit : false}, sizmekContacts: {createEdit: false}}};
    $scope.analyticsLinkText = "full page mode";
    $scope.lazyTypeParams = 'accounts?accountType=CampaignManager&permissionNames=' + entityMetaData['advertiser'].permissions.entity.createEdit;

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
        $scope.context = entity.context;
        $scope.labelWidth = 80;
        $scope.accountId = entity.accountId || null;
      }else{
        $scope.accountId = $scope.contextData.key == 'accountId' ? $scope.contextData.contextEntityId : undefined;
        $scope.isAccountContext = $scope.contextData.isInContext;
        $scope.labelWidth = 165;
      }
      if(!$scope.isEditMode && !$scope.accountId)
        indexAccountsByAccountId();

      setTabHandlerObj();
      setTabValidationObj();
      updateState();
    }

    //TODO: ask liad - maybe better way to check this condition
    function indexAccountsByAccountId(){
      mmRest.accounts.getList({accountType: 'CampaignManager',from: '0', max: '2', permissionNames: entityMetaData['advertiser'].permissions.entity.createEdit}).then(function(data) {
        if(data.length == 1){
          $scope.editObject.relationsBag.parents.account.name = data[0].name;
          $scope.editObject.relationsBag.parents.account.id = data[0].id;
          $scope.editObject.accountId = data[0].id;
          currentAccount = data[0];
          inheritAccountAdminSettings(data[0].id);
        }
        else {
          $scope.isMultipleAccounts = true;
        }

      },function(error){
				adminUtils.alerts.error(error);
      });
    }

    function updateState() {
      $rootScope.mmIsPageDirty = false;
      if ($scope.$parent.mainEntity != null && $scope.isEditMode) {
        $scope.isAccountContext = $scope.$parent.mainEntity.accountId ? true : false;
        $scope.preSaveStatus = false;
        $scope.editObject = mmRest.EC2Restangular.copy($scope.$parent.mainEntity);
        setRelatedEntitiesCount();
        initExternalId();
        //save the original object (for rollback)
        $scope.originalCopy = mmRest.EC2Restangular.copy($scope.editObject);
        $scope.pageReady = $scope.editObject != null;
        adminUtils.permissions.checkOnEditMode($scope.editObject, $scope.permissions);
        updateTabHandlerObj();
      } else if(!$scope.isEditMode){
        $scope.preSaveStatus = true;
        $scope.isBrandsExist = false;
        $scope.editObject = $scope.editObject || mmRest.EC2Restangular.copy(entityMetaData["advertiser"].defaultJson);
        $scope.editObject.accountId = $scope.accountId || null;
        $scope.editObject.relationsBag.parents.account.id = $scope.editObject.accountId;
        initExternalId();
        adminUtils.permissions.checkOnNewModeCommon(entityMetaData['advertiser'].type, $scope.permissions.common);
        updateTabHandlerObj();
        $scope.originalCopy = mmRest.EC2Restangular.copy($scope.editObject);
        //get parent Admin Settings on new advertiser creation
        if (!!$scope.editObject.relationsBag.parents.account.id && !$scope.isInheritedAdminSettigns) {
          $scope.isInheritedAdminSettigns = true;
          inheritAccountAdminSettings($scope.editObject.relationsBag.parents.account.id).then(function () {
            adminUtils.inherit.analyticsSettings($scope.editObject.accountAnalyticsSettings,  currentAccount.analyticsSettings);
            $timeout(function(){
              $scope.$broadcast('accountChange', null);
            }, 100);
            $scope.originalCopy = mmRest.EC2Restangular.copy($scope.editObject);
            $scope.pageReady = true;
          }, function (error) {
						adminUtils.alerts.error(error);
          });
        }
      }
    }

    function setTabHandlerObj(){
      $scope.tabHandler.settings = {campaign: {isActive: true}, regional:{isActive: true}, privacy:{isActive: false}, analytics:{isActive: false}};
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
      $scope.isTabValid.settings = {campaign: true, regional: true, privacy: true, analytics: true};
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

    function inheritAccountAdminSettings(parentId){
      var deferred = $q.defer();
      if(!_.isEmpty(currentAccount)){
        setAdminSettings();
        return;
      }

      mmRest.account(parentId).get().then(function(data){
        currentAccount = data;
        $scope.editObject.relationsBag.parents.account.name = data.name;//TODO find another place to set advertiser name
        setAdminSettings();
        deferred.resolve();
      },function(error){
        $scope.isInheritedAdminSettigns = false;
        deferred.reject(error);
      });
      return deferred.promise;
    }

    function setAdminSettings(){
      adminSettings.forEach(function(settings){
        if(currentAccount.adminSettings[settings]){
          $scope.editObject.adminSettings[settings] = mmRest.EC2Restangular.copy(currentAccount.adminSettings[settings]);
        }
      });
      setParentDefaultContacts(currentAccount.adminSettings.defaultContacts);
      $scope.isInheritedAdminSettigns = true;
    }

    function setParentDefaultContacts(defaultContacts){
      $scope.editObject.adminSettings.defaultContacts = mmRest.EC2Restangular.copy(defaultContacts);
      $scope.isTabValid.contacts.campaignManagerContacts = true;
    }

    function saveValidation() {
      var isValid = true;
      $scope.validation = {};

      //external id directive validation
      var validExternalId = $scope.externalId.externalIdValidation();
      if(!validExternalId){
        isValid = false;
      }
      if (_.isUndefined($scope.editObject.name) || _.isNull($scope.editObject.name) || $scope.editObject.name.length <= 1) {
        $scope.validation.advertiserName = "Please enter a name longer than 1 characters";
        isValid = false;
      }
      if (_.isUndefined($scope.editObject.vertical) || _.isNull($scope.editObject.vertical)) {
        $scope.validation.vertical = "Please Select Vertical";
        isValid = false;
      }
      if ($scope.isMultipleAccounts) {
        if (_.isUndefined($scope.editObject.relationsBag.parents.account.id) || _.isNull($scope.editObject.relationsBag.parents.account.id)) {
          $scope.validation.accountName = "Please Select Account";
          isValid = false;
        } else {
          if (_.isUndefined($scope.editObject.relationsBag.parents.account.name) || _.isNull($scope.editObject.relationsBag.parents.account.name)) {
            $scope.validation.accountName = "Please Select Account";
            isValid = false;
          }
        }
      }
      var validMarkerClickThroughURL = isValidUrl($scope.editObject.adminSettings.privacy.adMarker.markerClickthroughURL);
      if(!validMarkerClickThroughURL && !_.isEmpty($scope.editObject.adminSettings.privacy.adMarker.markerClickthroughURL)){
        $scope.validation.markerClickthroughURL = "Please Enter Valid URL";
        isValid = false;
        $scope.togglesStatus.privacy = true;
        $scope.isTabValid.settings.privacy = false;
      }

      if(!analyticsValidation()) isValid = false;

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

    //TODO move to validation helper
    function isValidUrl(url) {
      var valid = true;
      $scope.urlError = {text: ''};
      if (url !== null && url !== "") {
        var validUrl = /^(http|https):\/\/[^ "]+$/;
        return validUrl.test(url)
      }
    }

    function analyticsValidation(){
      var minSurface = $scope.editObject.analyticsSettings.viewabilityThreshold.minimumSurface;
      var minDuration = $scope.editObject.analyticsSettings.viewabilityThreshold.minimumDuration;

      if(!_.isNull(minSurface)){
        if(isNaN(minSurface)){
          return false;
        }
        else if(minSurface < 1 || minSurface > 100){
          return false;
        }
      }

      if(!_.isNull(minDuration)){
        if(isNaN(minDuration)){
          return false;
        }
        else if(minDuration < 1){
          return false;
        }
      }

      return true;
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
      if(!$scope.isTabValid.settings.analytics){
        changedSelectedTab('settings', 'analytics');
        $scope.togglesStatus.settings = true;
      }
    }

    function changedSelectedTab(toggleName, tabName){
      $scope.tabHandler[toggleName][tabName].isActive = true;
    }

    function save(skipValidation) {
      $scope.$broadcast('analyticsManipulator', null);
      var isValid = true;
      if(!skipValidation){
        isValid = saveValidation();
      }
      if (isValid) {
        if ($scope.isEditMode) {
          var serverSaveAdv = mmRest.EC2Restangular.one("advertisers", $scope.editObject.id);
          return serverSaveAdv.customPUT({entities: [$scope.editObject]}).then(function(data){
            $scope.preSaveStatus = false;
            $rootScope.mmIsPageDirty = false;
            $scope.showSPinner = false;
            //$scope.$parent.mainEntity = data;
            mmAlertService.addSuccess('Advertiser ' + data.name + ' was successfully updated.');
            return data;
          }, function(error){
            adminUtils.alerts.error(error);
          });
        } else {
          return mmRest.EC2Restangular.all("advertisers").post($scope.editObject).then(function (data) {
            $scope.preSaveStatus = false;
            $rootScope.mmIsPageDirty = false;
            $scope.showSPinner = false;
            var linkToBrand = '';
            var successMsg = '';
            if(!$scope.isModal){
              linkToBrand = 'spa.brand.brandNew';
              successMsg = 'Create a new Brand';
            }
            mmAlertService.addSuccess('Advertiser ' + data.name + ' was successfully created.', linkToBrand, successMsg);
            if(!!$scope.isModal){
              $modalInstance.close(data);
            }
            else if (!!$scope.isEntral) {
              //$scope.$parent.mainEntity = data;
              return data;
            } else {
              //replace is needed here to replace the last history record
              $state.go("spa.advertiser.advertiserEdit", {advertiserId: data.id}, {location : "replace"});
            }
          }, function(error){
						adminUtils.alerts.error(error);
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

    $scope.onAdvNameChange = function(){
      if($scope.editObject.name.length > 1) $scope.validation.advertiserName = '';
			else $scope.validation.advertiserName = "Please enter a name longer than 1 characters";
    };
    $scope.onVerticalSelected = function(){
      $scope.validation.vertical = '';
    };
    $scope.onAccountNameModified = function(){
      $scope.validation.accountName = '';
      mmRest.account($scope.editObject.relationsBag.parents.account.id).get().then(function(data) {
        currentAccount = data;
        $scope.editObject.relationsBag.parents.account.name = data.name;
        $scope.editObject.accountId = $scope.editObject.relationsBag.parents.account.id;
        adminUtils.inherit.analyticsSettings($scope.editObject.accountAnalyticsSettings, data.analyticsSettings);
        $scope.$broadcast('accountChange', null);
        $q.when(inheritAccountAdminSettings($scope.editObject.relationsBag.parents.account.id)).then(function() {
          $scope.pageReady = true;
        },function(error){
					adminUtils.alerts.error(error);
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
      if($scope.context == 'brand'){
        if ($scope.editObject.relationsBag.parents.account.id === undefined || _.isNull($scope.editObject.relationsBag.parents.account.id)) {
          $scope.validation.accountName = "Please Select Account";
          isValid = false;
        }else{
          //inherit account Admin settings
          inheritAccountAdminSettings($scope.editObject.relationsBag.parents.account.id);
        }
      }
			if (_.isUndefined($scope.editObject.name) || _.isNull($scope.editObject.name) || $scope.editObject.name.length <= 1) {
				$scope.validation.advertiserName = "Please enter a name longer than 1 characters";
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
		//TODO Reut complete task
		/* $scope.onAccountNameModified = function(){
		 //if account change & properties were modified
		 if(!_.isEmpty($scope.inheritObj) &&
		 (!_.isEqual($scope.inheritObj.adminSettings, $scope.editObject.adminSettings))) {
		 mediaValidationService.openOverwriteChangesModal("advertiser").then(function(overwrite) {
		 if (overwrite)
		 accountNameChangedActions();
		 else
		 $scope.editObject.relationsBag.parents.account.id = $scope.editObject.accountId;
		 })}
		 else
		 accountNameChangedActions();
		 }
		 function accountNameChangedActions(){
		 $scope.validation.accountName = '';
		 $scope.editObject.relationsBag.parents.account.name = $scope.accountsIndex[$scope.editObject.relationsBag.parents.account.id].name;
		 $scope.editObject.accountId = $scope.editObject.relationsBag.parents.account.id;
		 $q.when(inheritAccountAdminSettings($scope.editObject.relationsBag.parents.account.id)).then(function() {
		 $scope.pageReady = true;
		 $scope.inheritObj = mmRest.EC2Restangular.copy($scope.editObject);
		 },function(error){
		 adminUtils.alerts.error(error);
		 });
		 }*/

    $scope.$on('$destroy', function() {
      if (watcher) watcher();
      if($scope.accounts) $scope.accounts.length = 0;
     // if($scope.accountsIndex) $scope.accountsIndex = {};
    });
  }]);
