/**
 * Created by roi.levy on 10/6/14.
 */
'use strict';
app.factory('singleExpandableBannerBl', ['baseAdBl', 'adValidator', 'adService', 'singleExpandableBannerValidator',
  function (baseAdBl, adValidator, adService, singleExpandableBannerValidator) {

    var singleExpandableBannerBl = Object.create(baseAdBl);


    singleExpandableBannerBl.validateBeforeSave = function (ad, errors, isMultiple) {
      var isValid = true;
      isValid = baseAdBl.validateBeforeSave(ad, errors, isMultiple);
      isValid = isValid && singleExpandableBannerValidator.validateBeforeSave(ad, errors);
      if (ad.banner && !singleExpandableBannerValidator.validateBannerSize(ad.banner, errors)) {
        isValid = false;
      }
      return isValid;
    }

    singleExpandableBannerBl.setInitialSize = function (ad) {
      var adAssets = [ad.defaultImage, ad.banner];
      var initialSize = 0;
      for (var i = 0; i < adAssets.length; i++) {
        var asset = adAssets[i];
        if (asset && initialSize < asset.size) {
          initialSize = asset.size;
        }
      }
      if (ad.panelsSettings.autoExpandDefaultPanel && ad.panels) {
        var defaultPanel = _.find(ad.panels, function (panel) {
          return panel.defaultPanel;
        })
        initialSize += defaultPanel ? defaultPanel.size : 0;
      }
      ad.initialSize = initialSize;
    }
    singleExpandableBannerBl.setOverallAndBillingSize = function (ad) {
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

    singleExpandableBannerBl.nextAssignAssetStep = function (selectedCreativeType) {
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
    singleExpandableBannerBl.setPanelSettingsType = function(){
      return 'ExtendedPanelsSettings';
    }

    singleExpandableBannerBl.fillEditMultipleMissingValues = function(ad){}
    return singleExpandableBannerBl;

  }]);
