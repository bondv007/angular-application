/**
 * Created by alon.shemesh on 25/1/14.
 */
'use strict';
app.factory('html5ExpandableBannerBl', ['baseAdBl', 'adValidator', 'adService',
  function (baseAdBl, adValidator, adService) {
    var html5ExpandableBannerBl = Object.create(baseAdBl);
    html5ExpandableBannerBl.validateBeforeSave = function (ad, errors) {
      var isValid = true;
      isValid = baseAdBl.validateBeforeSave(ad, errors);

      if (!ad.html5 || !ad.html5.assetId) {
        isValid = false;
        if (errors.creativeAssets.length > 0) {
          errors.creativeAssets += " ";
        }
        errors.creativeAssets = "Work space folder is mandatory.";
      }
      else {
        isValid = isValid && adValidator.validateFolder(ad.html5, ad.adFormat, errors);
      }
      return isValid;
    }
    html5ExpandableBannerBl.setInitialSize = function (ad) {
      var adAssets = [ad.defaultImage, ad.html5];
      var initialSize = 0;
      for (var i = 0; i < adAssets.length; i++) {
        var asset = adAssets[i];
        if (asset && initialSize < asset.size) {
          initialSize = asset.size;
        }
      }
      ad.initialSize = initialSize;
    }
    html5ExpandableBannerBl.setOverallAndBillingSize = function (ad) {
      baseAdBl.resetSize(ad);
      var priceAssetArr = [];
      var overallSizeAssetArr = [];

      if (ad.html5 && ad.html5.assetId) {
        if (!ad.html5.archiveManifest) {
          adService.getAllHtml5assets(ad.html5.assetId).then(function (response) {
            ad.html5.archiveManifest = response;
            adService.calculateOnlyMaxSizeOfList(ad, ad.html5.archiveManifest, priceAssetArr, overallSizeAssetArr);
          });
        }
        else {
          adService.calculateOnlyMaxSizeOfList(ad, ad.html5.archiveManifest, priceAssetArr, overallSizeAssetArr);
        }
      }
      if (!ad.html5 || !ad.html5.assetId) {
        adService.calculateSize(ad, ad.defaultImage, true, priceAssetArr, overallSizeAssetArr);
      }
      else {
        //check if default image is part of the folder.
        if(ad.defaultImage.assetId){
          var defaultImage = _.findWhere(ad.html5.archiveManifest, {'assetId': ad.defaultImage.assetId});
          if (!defaultImage) { //if not calculate its size.
            if (ad.defaultImage.size > ad.pricingSize) {
              //remove folder assets from the calculation since default image is bigger.
              ad.pricingSize = 0;
              priceAssetArr = [];
              adService.calculateSize(ad, ad.defaultImage, true, priceAssetArr, overallSizeAssetArr);
            }
            else {
              adService.calculateSize(ad, ad.defaultImage, false, priceAssetArr, overallSizeAssetArr);
            }
          }
        }
      }
      adService.calculateOnlyMaxSizeOfList(ad, ad.additionalAssets, priceAssetArr, overallSizeAssetArr);
      console.log(ad);
    }
    html5ExpandableBannerBl.nextAssignAssetStep = function (selectedCreativeType) {
      var nextStepCreativeType;
      switch (selectedCreativeType) {
        case "defaultImage":
          nextStepCreativeType = "preloadBanner";
          break;
        case "preloadBanner":
          nextStepCreativeType = "banner";
          break;
        case "banner":
          break;
      }
      return nextStepCreativeType;
    }
    html5ExpandableBannerBl.setPanelSettingsType = function(){
      return 'BasePanelsSettings';
    }
    html5ExpandableBannerBl.fillEditMultipleMissingValues = function(ad){}
    return html5ExpandableBannerBl;
  }]);
