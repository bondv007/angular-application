/**
 * Created by roi.levy on 10/6/14.
 */
'use strict';
app.factory('html5RichMediaBannerBl', ['baseAdBl','adValidator','adService',
  function(baseAdBl, adValidator, adService) {

    var html5RichMediaBannerBl = Object.create(baseAdBl);

    html5RichMediaBannerBl.validateBeforeSave = function(ad, errors, isMultiple){
      var isValid = true;
      isValid = baseAdBl.validateBeforeSave(ad, errors, isMultiple);

      if(!ad.html5 || !ad.html5.assetId){
        isValid = false;
        errors.creativeAssets = "Work space folder is mandatory.";
      }
      else{
        isValid = isValid && adValidator.validateFolder(ad.html5, ad.adFormat, errors);
      }
      return isValid;
    }

    html5RichMediaBannerBl.setInitialSize = function(ad){
      var adAssets = [ad.defaultImage, ad.html5];
      var initialSize = 0;
      for (var i = 0; i < adAssets.length; i++) {
        var asset = adAssets[i];
        if(asset && initialSize < asset.size){
          initialSize = asset.size;
        }
      }
      ad.initialSize = initialSize;
    }
		html5RichMediaBannerBl.setOverallAndBillingSize = function(ad){
            baseAdBl.resetSize(ad);
            var priceAssetArr = [];
            var overallSizeAssetArr = [];
			adService.calculateOnlyMaxSizeOfList(ad, ad.additionalAssets, priceAssetArr, overallSizeAssetArr);
			if(ad.html5 && ad.html5.assetId){
				if(ad.html5.assetId){
					adService.calculateSize(ad, ad.html5,true, priceAssetArr, overallSizeAssetArr);
				}
			}
			var defaultimageAssetID ="";


			if((!ad.html5 || !ad.html5.assetId )){
				adService.calculateSize(ad, ad.defaultImage,true, priceAssetArr, overallSizeAssetArr);
			}
			else{
				adService.calculateSize(ad, ad.defaultImage,false, priceAssetArr, overallSizeAssetArr);
			}
			console.log(ad);
		}

		html5RichMediaBannerBl.nextAssignAssetStep = function(selectedCreativeType){
			var nextStepCreativeType;
			switch(selectedCreativeType){
				case "defaultImage":
					nextStepCreativeType = "html5";
					break;
				case "html5":
					break;
			}
			return nextStepCreativeType;
		}
    html5RichMediaBannerBl.setPanelSettingsType = function(){
      return '';
    }

    html5RichMediaBannerBl.fillEditMultipleMissingValues = function(ad){}

    return html5RichMediaBannerBl;

}]);
