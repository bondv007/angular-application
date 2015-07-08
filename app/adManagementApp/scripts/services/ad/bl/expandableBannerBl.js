/**
 * Created by roi.levy on 10/6/14.
 */
'use strict';
app.factory('expandableBannerBl', ['baseAdBl', 'adValidator', 'adService',
  function (baseAdBl, adValidator, adService) {

    var expandableBannerBl = Object.create(baseAdBl);

    expandableBannerBl.validateBeforeSave = function (ad, errors, isMultiple) {
      var isValid = true;
      isValid = baseAdBl.validateBeforeSave(ad, errors, isMultiple);

      if (ad.banner && ad.banner.assetId) {
        isValid = isValid && adValidator.validateBanner(ad.banner, ad.adFormat, errors);
      }
      else {
        isValid = false;
        if (errors.creativeAssets.length > 0) {
          errors.creativeAssets += " ";
        }
        errors.creativeAssets += "You must supply a banner.";
      }
      return isValid;
    }

    expandableBannerBl.prepareSaveData = function(ad){
      baseAdBl.preparePanelSettingsForSave(ad);
    }

    expandableBannerBl.setInitialSize = function (ad) {
      var adAssets = [ad.defaultImage, ad.banner];
      var initialSize = 0;
      for (var i = 0; i < adAssets.length; i++) {
        var asset = adAssets[i];
        if (asset && initialSize < asset.size) {
          initialSize = asset.size;
        }
      }
      if (ad.panelsSettings && ad.panelsSettings.autoExpandDefaultPanel && ad.panels) {
        var defaultPanel = _.find(ad.panels, function (panel) {
          return panel.defaultPanel;
        })
        initialSize += defaultPanel ? defaultPanel.size : 0;
      }
      ad.initialSize = initialSize;
    }

    expandableBannerBl.setOverallAndBillingSize = function (ad) {
      baseAdBl.resetSize(ad);
      var priceAssetArr = [];
      var overallSizeAssetArr = [];
      adService.calculateOnlyMaxSizeOfList(ad, ad.additionalAssets, priceAssetArr, overallSizeAssetArr);
      if (ad.panels) {
        for (var i = ad.panels.length - 1; i >= 0; i--) {
          adService.calculateSize(ad, ad.panels[i], true, priceAssetArr, overallSizeAssetArr);
        }
        ;
      }
      if (ad.banner && ad.banner.assetId) {
        adService.calculateSize(ad, ad.banner, true, priceAssetArr, overallSizeAssetArr);
      }

      var defaultimageAssetID = "";

      if ((!ad.banner || !ad.banner.assetId )) {
        adService.calculateSize(ad, ad.defaultImage, true, priceAssetArr, overallSizeAssetArr);
      }
      else {
        adService.calculateSize(ad, ad.defaultImage, false, priceAssetArr, overallSizeAssetArr);
      }
      console.log(ad);
    }

    expandableBannerBl.nextAssignAssetStep = function (selectedCreativeType) {
      var nextStepCreativeType;
      switch (selectedCreativeType) {
        case "defaultImage":
          nextStepCreativeType = "banner";
          break;
        case "banner":
          break;
      }
      return nextStepCreativeType;
    }

    expandableBannerBl.setPanelSettingsType = function(){
      return 'PanelsSettings';
    }

    expandableBannerBl.fillEditMultipleMissingValues = function(ad){
      if(!ad.banner){
        ad.banner = {}
      }
    }

    return expandableBannerBl;

  }]);
