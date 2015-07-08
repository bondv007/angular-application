'use strict';

app.controller('placementEditCtrl', ['$scope', '$stateParams', 'mmRest', 'mmModal', 'mmAlertService', 'enums', '$state', 'mmUtils', 'entityMetaData',
	'placementHelper', 'validationHelper', 'placementValidation', 'placementRest', 'tagGenerationService', 'servingAndCostService', 'placementJsonObjects', 'mmPermissions',
  'EC2Restangular',
  function ($scope, $stateParams, mmRest, mmModal, mmAlertService, enums, $state, mmUtils, entityMetaData,
            placementHelper, validationHelper, placementValidation, placementRest, tagGenerationService,
            servingAndCostService, placementJsonObjects, mmPermissions, EC2Restangular) {
    var allPackages = null;
    var packageIndex = {};
    var packageBySiteAndCampaignIndex = {};
		var validationResult = {
			isSuccess: true,
			fields: []
		};
		var lockImpressionTrecking = "row.entity['trackingType'] == 'ImpressionsAndClicks'";
    var siteSectionId = null;

    var serverCampaigns = EC2Restangular.all('campaigns');


    $scope.IN_BANNER = "IN_BANNER";
    $scope.TRACKING_ONLY = 'TRACKING_ONLY';
    $scope.IN_STREAM_VIDEO = 'IN_STREAM_VIDEO';

    $scope.entityObj = {};
    $scope.siteSections = [];
    $scope.selected = { servingAndCosts: [] };
    $scope.isEditMode = !!$stateParams.placementId || !!$scope.isEntral;
    $scope.labelWidth = 150;
    $scope.infoBoxLabelWidth = 150;
    $scope.settingsLabelWidth = 180;
    $scope.cacheBustingTokenWidth = 165;
    $scope.selectedBannerSize = {id: null};
    $scope.servingAndCostDisplay = true;
    $scope.showLabelFalse = false;
    $scope.isPackageSelected = false;
    $scope.placementId = $stateParams.placementId || '';
    $scope.campaignId = $stateParams.campaignId || $scope.contextData.contextEntityId;
    $scope.showServingAndCostContainer = true;
    $scope.displayAdvertiserLink = false;

    // Default entities
    $scope.defaultPlacement = entityMetaData.placement.defaultJson;
    $scope.defaultPlacement.campaignId = $scope.campaignId;
    $scope.dummyPackage = entityMetaData.placementPackage.defaultJson;
    $scope.dummyPackage.campaignId = $stateParams.campaignId || $scope.campaignId;

    // Get enums values
    $scope.costModels = enums.packageCostModels;
    //$scope.servingCompleteMethods = enums.packageServingCompleteMethods;
    $scope.costActionTypes = enums.packageCostActionTypes;
    $scope.httpTypes = enums.httpTypes;
    $scope.cacheBustingTokenTypes = enums.cacheBustingTokenTypes;
    $scope.inAppTypes = enums.placementInAppTypes;

    $scope.types = _.remove(angular.copy(enums.placementTypes), function (type) {
      return type.placementType != 'OUT_OF_BANNER'
    });

    $scope.trackingType = enums.trackingType;
    $scope.statuses = enums.placementStatuses;
    $scope.tagTypeOptions = { values: [ "Script", "IFrame", "Auto Detect" ] };

    $scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: discard, ref: null, nodes: []};
    $scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: save, ref: null, nodes: [], isPrimary: true};

		$scope.trackingAdsToggleOpen = true;
		$scope.trackingAdsTableColumns = [
      {field: 'trackingType', displayName: 'Tracking type', isColumnEdit: true, isShowToolTip: true, listDataArray: enums.trackingType, functionOnCellEdit: onTrackingTypeChange, gridControlType: enums.gridControlType.getName("SelectList")},
			{field: 'id', displayName: 'Ad ID', isColumnEdit: false, isShowToolTip: true, gridControlType: enums.gridControlType.getName("TextBox")},
			{field: 'clickthrough.url', displayName: 'Click-Through', validationFunction: validateClickThroughUrl,isColumnEdit: true, isShowToolTip: true, gridControlType: enums.gridControlType.getName("TextBox")},
			{field: 'thirdPartyImpressionTracker.url', displayName: 'Impression tracking', validationFunction: validateThirdPartyImpressionUrl,isColumnEdit: true, cellEditableCondition: lockImpressionTrecking,isShowToolTip: true, gridControlType: enums.gridControlType.getName("TextBox")},
			{field: 'thirdPartyClickTracker.url', displayName: 'click tracking', validationFunction: validateThirdPartyClickUrl, isColumnEdit: true, isShowToolTip: true, gridControlType: enums.gridControlType.getName("TextBox")},
			{field: 'firstPartyAdName', displayName: 'ext. ad name', isColumnEdit: true, isShowToolTip: true, gridControlType: enums.gridControlType.getName("TextBox"), isPinned: true},
			{field: 'firstPartyAdId', displayName: 'ext. ad ID', validationFunction: validateFirstPartyAdIdsUniqueness, isColumnEdit: true, isShowToolTip: true, gridControlType: enums.gridControlType.getName("TextBox")}
		];
		$scope.trackingAdsTableActions = [
			{
        mmId: "addTracking",
				name: "Add Tracking Ad",
				func: addTrackingAd,
				isDisable: false
			},
			{
        mmId: "removeTracking",
				name: "Remove Tracking Ad",
				func: removeTrackingAds,
				isDisable: true
			}
		]

    getCampaign($scope.campaignId);
    getSites();
    updateState();
    getPackages();
    getBannerSizes();

    function getAdvertiser(id){
      mmRest.advertiser(id).get().then(processAdvertiser, processError);
    }

    function processAdvertiser(advertiser){
      $scope.displayAdvertiserLink = mmPermissions.hasPermissionByEntity(advertiser, entityMetaData['advertiser'].permissions.entity);
    }

    function getCampaign(id){
      mmRest.campaign(id).get().then(processCampaign, processError);
    }

    function processCampaign(campaign){
      $scope.campaignName = campaign.name;
      getAdvertiser(campaign.relationsBag.parents.advertiser.id);
    }

    function getSites(){
      mmRest.sitesGlobal.getList().then(processSites, processError);
    }

    function processSites(data){
      $scope.sites = (data) ? data : [];
      $scope.entityObj.sites = $scope.sites;
      getSiteSections();
      getSiteContacts();
    }

		$scope.selectedAds = [];
		$scope.onTrackingAdRowSelected = function(){
			$scope.trackingAdsTableActions[1].isDisable = !($scope.selectedAds.length > 0 && $scope.editObject.trackingAds.length > 1);
		};

		//var trackingAdsTableValid = true;
		$scope.trackingAdsValidationHandler = function () {
			return validationResult;
		};

		$scope.onGenerateMultiChange = function(){
			for (var i = 0; i < $scope.editObject.trackingAds.length; i++ ) {
				var row = {};
				row.entity = $scope.editObject.trackingAds[i];
				validateFirstPartyAdIdsUniqueness(row);
			}
			if(!$scope.editObject.tagBuilderParams.siteServing.generateMultipleTags){
				validationResult.isSuccess = false;
				validationResult.fields.push({'fieldName': 'firstPartyAdId', 'value': '', message: 'Mandatory when generate one tag'});
        $scope.firstPartyAdIdTokenError = {text: 'Mandatory when generate one tag'};
			}
			else{
				validationResult = {
					isSuccess: true,
					fields: []
				}
			}
		};

		function updateState() {
      if ($scope.$parent.mainEntity != null && $scope.isEditMode) {
        if (!$scope.$root.isDirtyEntity){
          $scope.editObject = mmRest.EC2Restangular.copy($scope.$parent.mainEntity);
        }

        $scope.entityObj.siteId = $scope.editObject.siteId;
        $scope.originalCopy = mmRest.EC2Restangular.copy($scope.editObject);
        siteSectionId = $scope.editObject.sectionId;

        getSiteSections();
        getSiteContacts();
      }
      else {
        $scope.editObject = _.cloneDeep($scope.defaultPlacement);
        $scope.editObject.packageId = null;

        serverCampaigns.get($scope.campaignId).then(function(campaign){
          $scope.editObject.accountId = campaign.relationsBag.parents.account.id;
        });
      }

      $scope.selectedBannerSize = $scope.editObject.bannerSize ? {id: $scope.editObject.bannerSize.width + 'X' + $scope.editObject.bannerSize.height} : {id: null};
      $scope.editObject.mobileApplicationAdEnabler = enums.placementInAppTypes.getName('None');

      servingAndCostService.init($scope);
      initError();
    }

    var watcher = $scope.$watch('$parent.mainEntity', function () {
      updateState();
    });

    function getSiteSections(){
      if ($scope.editObject.siteId){
        $scope.editObject.sectionId = null;
        mmRest.sitesSectionsGlobal.getList({'siteId': $scope.editObject.siteId}).then(processSiteSections, processError);
      }
    }

    function getSiteContacts(){
      if ($scope.editObject.siteId){
        placementRest.getSiteContacts($scope.campaignId, $scope.editObject.siteId).then(function (siteContacts) {
          $scope.siteContacts = siteContacts;
        });
      }
    }

    function processSiteSections(data){
      $scope.siteSections = (data) ? data : [];
      if (siteSectionId){
        $scope.editObject.sectionId = siteSectionId;
      }
    }

    function getPackages(){
      mmRest.placementPackages.getList({campaignId: $stateParams.campaignId}).then(processPlacementPackages, processError);
    }

    function processPlacementPackages(packages){
      allPackages = [];

      // Create a none value to be able to de-select the package value
      $scope.dummyPackage.name = 'None';
      allPackages.push($scope.dummyPackage);

      packages.forEach(function(item){

        allPackages.push(item);

        packageIndex[item.id] = item;
        if(!packageBySiteAndCampaignIndex[item.siteId + '_' + item.campaignId]){
          packageBySiteAndCampaignIndex[item.siteId + '_' + item.campaignId] = [];
        }
        packageBySiteAndCampaignIndex[item.siteId + '_' + item.campaignId].push(item);
      });

      $scope.selectedPackages = allPackages;
    }

    function getBannerSizes(){
      mmRest.bannerSizes.getList().then(processBannerSizes, processError);
    }

    function processBannerSizes(bannerSize){
      $scope.bannerSize = bannerSize;
      $scope.bannerSizeDD = [];
      $scope.bannerSizeIndex = {};
      $scope.bannerSize.forEach(function(item){
        var name = item['width'] + 'X' + item['height'];
        if(!$scope.bannerSizeIndex[name]){
          $scope.bannerSizeIndex[name] = name;
          $scope.bannerSizeDD.push({id: name, name: name});
        }
      })
    }

    // ***** Events *****
    $scope.onSelectedBannerSize = function () {
      var splitedSelectedBanerSize = $scope.selectedBannerSize.id.split("X");
      $scope.editObject.bannerSize.width = splitedSelectedBanerSize[0];
      $scope.editObject.bannerSize.height = splitedSelectedBanerSize[1];
    };

    $scope.changePackage = function () {
      if ($scope.editObject && $scope.editObject.packageId) {
        if ($scope.editObject.packageId != null) {
          var selectedPackage = packageIndex[$scope.editObject.packageId];

          if (selectedPackage == undefined){
            for(var i=0; i<$scope.selectedPackages.length; i++){
              var obj = $scope.selectedPackages[i];
              if (obj.id == $scope.editObject.packageId)
                selectedPackage = obj;
            }
          }

          $scope.editObject = defaultsDeep($scope.editObject, $scope.defaultPlacement);
          if (selectedPackage) {
            $scope.editObject.servingAndCostData.mediaServingData = selectedPackage.mediaServingData;
            $scope.editObject.servingAndCostData.mediaCostData = selectedPackage.mediaCostData;
            servingAndCostService.init($scope);
            $scope.editObject.servingAndCostData.placementLevel = false;
            $scope.isPackageSelected = true;
          }
        }
        else { // package is null - dont do nothin (maybe check for dummy package)
          $scope.isPackageSelected = false;
          $scope.editObject.servingAndCostData.placementLevel = true; // dummy package
        }
      }

      // Dummy package selected
      if ($scope.editObject && $scope.editObject.packageId == null){
        $scope.editObject.servingAndCostData.mediaServingData = $scope.dummyPackage.mediaServingData;
        $scope.editObject.servingAndCostData.mediaCostData = $scope.dummyPackage.mediaCostData;
        servingAndCostService.init($scope);
        $scope.editObject.servingAndCostData.placementLevel = false;
        $scope.isPackageSelected = true;
      }
    };

    $scope.changeSectionsBySiteId = function () {
      if ($scope.editObject && $scope.editObject.siteId) {
        $scope.entityObj.siteId = $scope.editObject.siteId;//save site id for site section modal using

        siteSectionId = null;

        getSiteSections();
        getSiteContacts();

        $scope.selectedPackages = packageBySiteAndCampaignIndex[$scope.editObject.siteId + '_' + $scope.campaignId];
      }
    };

    $scope.changePlacementType = function () {
      if ($scope.editObject.placementType === undefined) return;
	    $scope.editObject.trackingAds = [];
      switch ($scope.editObject.placementType) {
        case $scope.IN_BANNER:
          $scope.editObject.bannerSize = $scope.editObject.bannerSize || { height: null, width: null, type: "APIBannerSize" };
          $scope.editObject.mobileApplicationAdEnabler = enums.placementInAppTypes.getName('None');
          break;
        case 'TRACKING_ONLY':
          $scope.editObject.trackingAds.push(placementJsonObjects.createNewTrackingAd());
          break;
        default:
          break;
      }
    };

    $scope.updateAdvertiserSiteContacts = function () {
      $scope.editObject.siteContacts = {selectedContacts:$scope.siteContacts.selectedContacts};
      placementRest.updateAdvertiserSiteContacts($scope.editObject);
    };

    function initError() {
      $scope.bannerSizeError = { text: '' };
      $scope.trackingTypeError = { text: '' };
      $scope.numOfTrackingAdsError = { text: '' };
      $scope.placementNameError = { text: '' };
      $scope.placementSiteError = { text: '' };
      $scope.placementSiteSectionError = { text: '' };
      $scope.placementTypeError = { text: '' };
      $scope.placementBookedImpressionError = { text: '' };
      $scope.servingDateError = { text: '' };
      $scope.siteContactsError = { text: '' };
      $scope.firstPartyAdIdTokenError = { text: '' };
    }

    function discard() {
      if ($scope.originalCopy) {
        $scope.editObject = $scope.originalCopy;
      }

      updateState();
    }

    function fillSelectedContacts() {
      console.log('fillSelectedContacts');
      var selected = [];
      $scope.siteContacts.selectedContacts.forEach(function(selectedContact){
        $scope.siteContacts.siteContacts.forEach(function(siteContact){
          if (siteContact.contactId == selectedContact){
            selected.push({type: siteContact.type, siteId: siteContact.siteId, contactId: siteContact.contactId});
          }
        });
      });
      return selected;
    }

    function save() {
      initError();
      // This is a temporary method till the server supports an array of flat objects
      if (saveValidation()) {
        servingAndCostService.tempSetServingAndCostData();
        setPlacementTypeBeforeSave();
        $scope.editObject.selectedContacts = fillSelectedContacts();
        $scope.selectedContacts = $scope.siteContacts.selectedContacts;
        if($scope.editObject.tagBuilderParams) $scope.editObject.tagBuilderParams.type = "TagBuilderParams";

        if ($scope.editObject.mobileApplicationAdEnabler == enums.placementInAppTypes.getName('None')){
          $scope.editObject.mobileApplicationAdEnabler = null;
        }

        if (!$scope.editObject.id) {
          return mmRest.placements.post($scope.editObject).then(processData, processError);
        } else {
          return mmRest.placements.customPUT($scope.editObject).then(processData, processError);
        }
      } else {
        mmAlertService.addErrorOnTop("Please fix the errors below.");
      }
    }

    function setPlacementTypeBeforeSave() {
      switch ($scope.editObject.placementType) {
        case $scope.TRACKING_ONLY:
          delete $scope.editObject['bannerSize'];
          $scope.editObject.type = "TrackingOnlyPlacement";
          if ($scope.editObject.impressionTrackingURL) {
            $scope.editObject.impressionTrackingURL.type = "MainClickthrough";
          }
          if ($scope.editObject.clickThroughURL) {
            $scope.editObject.clickThroughURL.type = "MainClickthrough";
          }
          if ($scope.editObject.clickTrackingURL) {
            $scope.editObject.clickTrackingURL.type = "MainClickthrough";
          }

          break;
        case $scope.IN_STREAM_VIDEO:
          delete $scope.editObject['bannerSize'];
          $scope.editObject.type = "InStreamVideoPlacement";
          break;
        case $scope.IN_BANNER:
          $scope.editObject.type = "InBannerPlacement";
          $scope.editObject.bannerSize.type = "APIBannerSize";
          break;
        default:
          delete $scope.editObject['bannerSize'];
      }
    }

    function processData(data) {
      $scope.editObject = data[0] ? data[0] : data;
      $scope.entityObj.placement = $scope.editObject;
      $scope.numberOfTrackingAdsThreshold = $scope.editObject.numOfTrackingAds;
      servingAndCostService.init($scope);
      mmAlertService.addSuccess("Placement has been saved successfully.");
      if (!!$scope.isEntral || $scope.isEditMode) {
        $scope.siteContacts.selectedContacts = $scope.selectedContacts;
        return $scope.editObject;
      } else {
        //replace is needed here to replace the last history record
        $state.go("spa.placement.placementEdit", {campaignId: $scope.editObject.campaignId, placementId: $scope.editObject.id}, {location : "replace"});
      }
    }
    function processError(error) {
      console.log('ohh no!');
      console.log(error);
      if (error.data.error === undefined) {
        mmAlertService.addError("Server error. Please try again later.");
      } else {
//				mmAlertService.addError(error.data.error);
      }
    }

    function saveValidation() {
      var valid = true;
      if (!bannerSizeValidation())
        valid = false;
			if(!placementValidation.validateTrackingAdsBeforeSave())
				valid = false;
      if (!placementNameValidation())
        valid = false;
      if (!placementSiteValidation())
        valid = false;
      if (!placementSiteSectionValidation())
        valid = false;
      if (!placementTypeValidation())
        valid = false;
      if(!servingAndCostService.validate()){
        valid = false;
      }
      return valid;
    }

    function placementTypeValidation() {
      var value = $scope.editObject.placementType;
      return validationHelper.requiredValidation({value: value, error: $scope.placementTypeError, fieldName: "Placement Type"});
    }

    function placementNameValidation() {
      var value = $scope.editObject.name;

      var requiredValidation = validationHelper.requiredValidation({value: value, error: $scope.placementNameError, fieldName: "Placement Name"});
      var maxLengthValidation = validationHelper.maxLengthValidation({value: value, error: $scope.placementNameError, fieldName: "Placement Name", maxLength: 300});
      return requiredValidation & maxLengthValidation;
    }

    function placementSiteValidation() {
      var value = $scope.editObject.siteId;
      return validationHelper.requiredValidation({value: value, error: $scope.placementSiteError, fieldName: "Site"});
    }

    function placementSiteSectionValidation() {
      var value = $scope.editObject.sectionId;
      return validationHelper.requiredValidation({value: value, error: $scope.placementSiteSectionError, fieldName: "Section"});
    }

    function bannerSizeValidation() {
      $scope.bannerSizeError = {text: ''};
      var valid = true;
      if ($scope.editObject.placementType == $scope.IN_BANNER && !$scope.selectedBannerSize.id) {
        valid = false;
        $scope.bannerSizeError = {text: 'A value is required.'};
      }
      return valid;
    }

    //function trackingTypeErrorValidation() {
    //  $scope.trackingTypeError = {text: ''};
    //  var valid = true;
    //  if ($scope.editObject.placementType == "TRACKING_ONLY" && !$scope.editObject.trackingType) {
    //    valid = false;
    //    $scope.trackingTypeError = {text: 'A value is required.'};
    //  }
    //  return valid;
    //}

    //function numOfTrackingAdsValidation() {
    //  $scope.numOfTrackingAdsError = {text: ''};
    //  var valid = true;
    //  if ($scope.editObject.placementType == "TRACKING_ONLY") {
    //    if (!placementHelper.isInt($scope.editObject.numOfTrackingAds)) {
    //      valid = false;
    //      $scope.numOfTrackingAdsError = {text: 'Please add atleast.'};
    //    }
    //    else if ($scope.editObject.numOfTrackingAds < $scope.numberOfTrackingAdsThreshold) {
    //      valid = false;
    //      $scope.numOfTrackingAdsError = {text: "Number of attached ads can't be reduced."};
    //    }
		//
    //  }
    //  return valid;
    //}

		function addTrackingAd (){
			var trackingAds = $scope.editObject.trackingAds;
			//var length = $scope.editObject.trackingAds.length;
			if(trackingAds.length < 1){
				return;
			}

			var protoAd =  $scope.editObject.trackingAds[trackingAds.length - 1];
			var newTrackingAd = placementJsonObjects.createNewTrackingAd();
			newTrackingAd.trackingType = protoAd.trackingType;
			newTrackingAd.clickthrough.url = protoAd.clickthrough.url;
			newTrackingAd.thirdPartyImpressionTracker.url = protoAd.thirdPartyImpressionTracker.url;
			newTrackingAd.thirdPartyClickTracker.url = protoAd.thirdPartyClickTracker.url;
			trackingAds.push(newTrackingAd);
			placementValidation.addTrackingAdValidationObj(newTrackingAd.clientRefId);
			$scope.$root.isDirtyEntity = true;
	}

	//var defaults = _.partialRight(_.merge, function(a, b) {
	//	return !a ? b : a;
	//});

	function removeTrackingAds(){
	  var trackingAd;
	  var selectedItem;

	  if($scope.editObject.trackingAds.length === 1 || $scope.editObject.trackingAds.length === $scope.selectedAds.length){
		  mmAlertService.addInfo("You can't delete all ads");
		  return;
	  }
	  for (var i = $scope.selectedAds.length - 1; i >= 0; i--) {
		  selectedItem = $scope.selectedAds[i];
		  for (var j = $scope.editObject.trackingAds.length - 1; j >=0; j--) {
			  trackingAd = $scope.editObject.trackingAds[j];
			  if(selectedItem === trackingAd){
					placementValidation.removeTrackingAdValidationObj(trackingAd.clientRefId);
				  $scope.editObject.trackingAds.splice(j,1);
				  break;
			  }
		  }
		  $scope.selectedAds.splice(i,1);
	  }
		$scope.$root.isDirtyEntity = true;
	}

	function validateClickThroughUrl(row) {
		var result = validationHelper.gridValidationHelper.validateUrl(row.entity.clickthrough, 'url');
		placementValidation.setTrackingAdValidationObjPropertyValue(row.entity.clientRefId, 'clickThrough', result.isSuccess);
		return result;
	}

	function validateThirdPartyImpressionUrl(row){
		var result =  validationHelper.gridValidationHelper.validateUrl(row.entity.thirdPartyImpressionTracker, 'url');
		placementValidation.setTrackingAdValidationObjPropertyValue(row.entity.clientRefId, 'thirdPartyImpression', result.isSuccess);
		return result;
	}

	function validateThirdPartyClickUrl(row){
		var result = validationHelper.gridValidationHelper.validateUrl(row.entity.thirdPartyClickTracker, 'url');
		placementValidation.setTrackingAdValidationObjPropertyValue(row.entity.clientRefId, 'thirdPartyClick', result.isSuccess);
		return result;
	}

	function validateFirstPartyAdIdsUniqueness(row) {
		var result = {
			isSuccess: true,
			message: []
		};
		var entity = row.entity;
		if(!$scope.editObject.tagBuilderParams.siteServing.generateMultipleTags && !entity.firstPartyAdId){
			result.message.push("Mandatory");
			result.isSuccess =  false;
			placementValidation.setTrackingAdValidationObjPropertyValue(row.entity.clientRefId, 'firstPartyAdId', result.isSuccess);
			return result;
		}

		for ( var i = 0; i < $scope.editObject.trackingAds.length; i++ ) {
			var trackingAd = $scope.editObject.trackingAds[i];

			if(entity.firstPartyAdId && trackingAd.clientRefId !== entity.clientRefId && trackingAd.firstPartyAdId === entity.firstPartyAdId){
				result.message.push("Must be unique");
				result.isSuccess =  false;
				placementValidation.setTrackingAdValidationObjPropertyValue(row.entity.clientRefId, 'firstPartyAdId', result.isSuccess);
				break;
			}
		}
		placementValidation.setTrackingAdValidationObjPropertyValue(row.entity.clientRefId, 'firstPartyAdId', result.isSuccess);
		return result;
	}

	function onTrackingTypeChange(col, selectedArray, index, field){
		if(selectedArray === "Clicks" && $scope.editObject.trackingAds.length > index){
			var trackingAd =  $scope.editObject.trackingAds[index];
			trackingAd.thirdPartyImpressionTracker.url = '';
		}
	}

	  //ToDo remove or move to lodash prototype
    var defaultsDeep = _.partialRight(_.merge, function deep(value, other) {
      return _.merge(value, other, deep);
    });

    $scope.onMinZIndexChange = function(){
      if($scope.editObject.tagBuilderParams.siteServing.minZIndex == ''){
        $scope.editObject.tagBuilderParams.siteServing.minZIndex = null;
      }
    };

    $scope.$on('$destroy', function () {
      $scope.editObject = null;
      if (watcher) watcher();
      if ($scope.selectedPackages) $scope.selectedPackages.length = 0;
      if ($scope.bannerSize) $scope.bannerSize.length = 0;
      if ($scope.bannerSizeDD) $scope.bannerSizeDD.length = 0;
      if ($scope.sites) $scope.sites.length = 0;
      if ($scope.siteSections) $scope.siteSections.length = 0;
    });
  }]);
