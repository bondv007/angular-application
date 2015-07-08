/**
 * Created by roi.levy on 10/13/14.
 */
'use strict';
app.factory('inStreamAdBl', ['baseAdBl','adService','adValidator', 'validationHelper', 'inStreamTemplatesJson', 'enums',
  function(baseAdBl, adService, adValidator, validationHelper, inStreamTemplatesJson, enums) {

    var inStreamAdBl = Object.create(baseAdBl);

    inStreamAdBl.validateBeforeSave = function(ad, errors, isMultiple){
      var isValid = true;
      var ignoreDefaultImage = true;
      isValid = baseAdBl.validateBeforeSave(ad, errors, isMultiple, ignoreDefaultImage);
      if(!ad.linears || ad.linears.length < 1){
        isValid = false;
        errors.inStream = "You must define at least 1 linear parts";
      }
      else{
        for (var i = 0; i < ad.linears.length; i++) {
          isValid = isValid && adValidator.validateInStreamLinear(ad.linears[i], ad.adFormat, errors)
        }
      }

      if(ad.linearSettings.clickthrough && !validationHelper.isValidUrlFormat({
            value: ad.linearSettings.clickthrough,
            error: errors.linearSettingsClickhrough,
            fieldName:""})){
          isValid = false;
        }

      return isValid;
    }

    inStreamAdBl.setInitialSize = function(ad){
      var adAssets = ad.linears ? ad.linears : [];
      var initialSize = 0;
      for (var i = 0; i < adAssets.length; i++) {
        var asset = adAssets[i];
        if(asset && initialSize < asset.size){
          initialSize = asset.size;
        }
      }
      ad.initialSize = initialSize;
    }
	  inStreamAdBl.setOverallAndBillingSize = function(ad){
        baseAdBl.resetSize(ad);
        var priceAssetArr = [];
        var overallSizeAssetArr = [];
        adService.calculateOnlyMaxSizeOfList(ad, ad.linears, priceAssetArr, overallSizeAssetArr);
        adService.calculateOnlyMaxSizeOfList(ad, ad.additionalAssets, priceAssetArr, overallSizeAssetArr);
        /*for(var i = ad.nonLinears.length - 1; i >= 0; i--){
					adService.calculateSize(ad, ad.nonLinears[i] ,true, priceAssetArr, overallSizeAssetArr);
        };*/
        for(var i = ad.companions.length - 1; i >= 0; i--){
            adService.calculateSize(ad, ad.companions[i] ,true, priceAssetArr, overallSizeAssetArr);
        };
	}

    inStreamAdBl.setPanelSettingsType = function(){
      return '';
    }

    inStreamAdBl.fillEventTypes = function fillEventTypes(ad) {
      if(ad && ad.adURLs){
        for ( var i = 0; i < ad.adURLs.length; i++ ) {
          var obj = ad.adURLs[i];
          obj.gridListDataArray = enums.inStreamThirdPartyURLTypes;
        }
      }
    }

    inStreamAdBl.fillEditMultipleMissingValues = function(ad){
      if(!ad.banner){
        ad.banner = {}
      }
    }
    return inStreamAdBl;
}]);
