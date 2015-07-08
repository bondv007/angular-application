/**
 * Created by roi.levy on 10/6/14.
 */
'use strict';
app.factory('enhancedStandardBl', ['baseAdBl','adValidator', 'adService',
  function(baseAdBl, adValidator, adService) {

    var enhancedStandardBl = Object.create(baseAdBl);

    enhancedStandardBl.validateBeforeSave = function(ad, errors, isMultiple){
      var isValid = true;
      isValid = baseAdBl.validateBeforeSave(ad, errors, isMultiple);

      if(ad.preloadBanner && ad.preloadBanner.assetId){
        isValid = isValid && adValidator.validatePreLoadBanner(ad.preloadBanner, ad.adFormat, errors);
      }

      if(ad.banner && ad.banner.assetId){
        isValid = isValid && adValidator.validateBanner(ad.banner, ad.adFormat, errors);
      }

      return isValid;
    }

    enhancedStandardBl.setInitialSize = function(ad){
      var adAssets = [ad.defaultImage, ad.banner];
      var initialSize = 0;
      for (var i = 0; i < adAssets.length; i++) {
        var asset = adAssets[i];
        if(asset && initialSize < asset.size){
          initialSize = asset.size;
        }
      }
      initialSize +=  ad.preloadBanner ? ad.preloadBanner.size : 0;
      ad.initialSize = initialSize;
    }

		enhancedStandardBl.setOverallAndBillingSize = function(ad){
            baseAdBl.resetSize(ad);
            var priceAssetArr = [];
            var overallSizeAssetArr = [];
			if(ad.banner && ad.banner.assetId){
				adService.calculateSize(ad, ad.banner,true, priceAssetArr, overallSizeAssetArr);
			}
			if(ad.preloadBanner && ad.preloadBanner.assetId){
				adService.calculateSize(ad, ad.preloadBanner,true, priceAssetArr, overallSizeAssetArr);
			}
			var defaultimageAssetID ="";

			if((!ad.preloadBanner || !ad.preloadBanner.assetId ) &&
				(!ad.banner || !ad.banner.assetId )){
				adService.calculateSize(ad, ad.defaultImage,true, priceAssetArr, overallSizeAssetArr);
			}
			else{
				adService.calculateSize(ad, ad.defaultImage,false, priceAssetArr, overallSizeAssetArr);
			}
			console.log(ad);
		}

		enhancedStandardBl.nextAssignAssetStep = function(selectedCreativeType){
			var nextStepCreativeType;
			switch(selectedCreativeType){
				case "defaultImage":
					nextStepCreativeType = "preloadBanner";
					break;
				case "preloadBanner":
					nextStepCreativeType= "banner";
					break;
				case "banner":
					break;
			}
			return nextStepCreativeType;
		}
    enhancedStandardBl.setPanelSettingsType = function(){
      return '';
    }
    enhancedStandardBl.fillEditMultipleMissingValues = function(ad){
      if(!ad.banner){
        ad.banner = {}
      }
      if(!ad.preloadBanner){
        ad.preloadBanner = {}
      }
    }

    return enhancedStandardBl;

}]);
