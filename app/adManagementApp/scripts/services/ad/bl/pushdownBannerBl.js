/**
 * Created by roi.levy on 10/7/14.
 */
'use strict';
app.factory('pushDownBannerBl', ['baseAdBl', 'adValidator', 'adService',
  function (baseAdBl, adValidator, adService) {

    var pushDownBannerBl = Object.create(baseAdBl);

    pushDownBannerBl.validateBeforeSave = function (ad, errors, isMultiple) {
      var isValid = true;
      isValid = baseAdBl.validateBeforeSave(ad, errors, isMultiple);

      if (ad.banner && ad.banner.assetId) {
        isValid = isValid && adValidator.validateBanner(ad.banner, ad.adFormat, errors);
      }

      return isValid;
    }

    pushDownBannerBl.setInitialSize = function (ad) {
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
    pushDownBannerBl.setOverallAndBillingSize = function (ad) {
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

    pushDownBannerBl.nextAssignAssetStep = function (selectedCreativeType) {
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
    pushDownBannerBl.setPanelSettingsType = function(){
      return 'PanelsSettings';
    }

    pushDownBannerBl.fillEditMultipleMissingValues = function(ad){}
    return pushDownBannerBl;

  }]);
