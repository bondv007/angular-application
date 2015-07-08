/**
 * Created by oren.levy on 3/30/2015.
 */

app.service('placementTrackingService',['enums','placementJsonObjects','placementValidation','mmAlertService','validationHelper',
  function(enums, placementJsonObjects, placementValidation, mmAlertService, validationHelper) {

    var scope;
    var validationResult = {
      isSuccess: true,
      fields: []
    };
    var lockImpressionTrecking = "row.entity['trackingType'] == 'ImpressionsAndClicks'";

    var placementTrackingSettings = {
      columns: [
        {field: 'trackingType', displayName: 'Tracking type', isColumnEdit: true, isShowToolTip: true, listDataArray: enums.trackingType, functionOnCellEdit: onTrackingTypeChange, gridControlType: enums.gridControlType.getName("SelectList")},
        {field: 'id', displayName: 'Ad ID', isColumnEdit: false, isShowToolTip: true, gridControlType: enums.gridControlType.getName("TextBox")},
        {field: 'clickthrough.url', displayName: 'Click-Through', validationFunction: validateClickThroughUrl,isColumnEdit: true, isShowToolTip: true, gridControlType: enums.gridControlType.getName("TextBox")},
        {field: 'thirdPartyImpressionTracker.url', displayName: 'Impression tracking', validationFunction: validateThirdPartyImpressionUrl,isColumnEdit: true, cellEditableCondition: lockImpressionTrecking,isShowToolTip: true, gridControlType: enums.gridControlType.getName("TextBox")},
        {field: 'thirdPartyClickTracker.url', displayName: 'click tracking', validationFunction: validateThirdPartyClickUrl, isColumnEdit: true, isShowToolTip: true, gridControlType: enums.gridControlType.getName("TextBox")},
        {field: 'firstPartyAdName', displayName: 'ext. ad name', isColumnEdit: true, isShowToolTip: true, gridControlType: enums.gridControlType.getName("TextBox"), isPinned: true},
        {field: 'firstPartyAdId', displayName: 'ext. ad ID', validationFunction: validateFirstPartyAdIdsUniqueness, isColumnEdit: true, isShowToolTip: true, gridControlType: enums.gridControlType.getName("TextBox")}
      ],
      actions: [
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
    };

    function init(controllerScope){
      if (controllerScope){
        scope = controllerScope;
      }

      scope.selectedAds = [];
      scope.trackingAdsToggleOpen = true;
    }

    function trackingAdRowSelected(){
      scope.trackingAdsTableActions[1].isDisable = !(scope.selectedAds.length > 0 && scope.editObject.trackingAds.length > 1);
    }

    function addTrackingAd (){
      var trackingAds = scope.placementEdit.trackingAds;
      if(trackingAds.length < 1){
        return;
      }

      var protoAd =  scope.editObject.trackingAds[trackingAds.length - 1];
      var newTrackingAd = placementJsonObjects.createNewTrackingAd();
      newTrackingAd.trackingType = protoAd.trackingType;
      newTrackingAd.clickthrough.url = protoAd.clickthrough.url;
      newTrackingAd.thirdPartyImpressionTracker.url = protoAd.thirdPartyImpressionTracker.url;
      newTrackingAd.thirdPartyClickTracker.url = protoAd.thirdPartyClickTracker.url;
      trackingAds.push(newTrackingAd);
      placementValidation.addTrackingAdValidationObj(newTrackingAd.clientRefId);
      scope.$root.isDirtyEntity = true;
    }

    //var defaults = _.partialRight(_.merge, function(a, b) {
    //	return !a ? b : a;
    //});

    function removeTrackingAds(){
      var trackingAd;
      var selectedItem;

      if(scope.editObject.trackingAds.length === 1 || scope.editObject.trackingAds.length === scope.selectedAds.length){
        mmAlertService.addInfo("You can't delete all ads");
        return;
      }
      for (var i = scope.selectedAds.length - 1; i >= 0; i--) {
        selectedItem = scope.selectedAds[i];
        for (var j = scope.editObject.trackingAds.length - 1; j >=0; j--) {
          trackingAd = scope.editObject.trackingAds[j];
          if(selectedItem === trackingAd){
            placementValidation.removeTrackingAdValidationObj(trackingAd.clientRefId);
            scope.editObject.trackingAds.splice(j,1);
            break;
          }
        }
        scope.selectedAds.splice(i,1);
      }
      scope.$root.isDirtyEntity = true;
    }

    function onTrackingTypeChange(col, selectedArray, index, field){
      if(selectedArray === "Clicks" && scope.editObject.trackingAds.length > index){
        var trackingAd =  scope.editObject.trackingAds[index];
        trackingAd.thirdPartyImpressionTracker.url = '';
      }
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
      if(!scope.editObject.tagBuilderParams.siteServing.generateMultipleTags && !entity.firstPartyAdId){
        result.message.push("Mandatory");
        result.isSuccess =  false;
        placementValidation.setTrackingAdValidationObjPropertyValue(row.entity.clientRefId, 'firstPartyAdId', result.isSuccess);
        return result;
      }

      for ( var i = 0; i < scope.editObject.trackingAds.length; i++ ) {
        var trackingAd = scope.editObject.trackingAds[i];

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

    return{
      init: init,
      trackingAdRowSelected: trackingAdRowSelected,
      placementTrackingSettings: placementTrackingSettings,
      validationResult: validationResult
    }
  }
]);
