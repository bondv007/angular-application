
/**
 * Created by roi.levy on 10/5/14.
 */
'use strict';
app.factory('standardBannerBl', ['baseAdBl','adValidator','adService',
	function(baseAdBl, adValidator, adService) {

		var standardBannerBl = Object.create(baseAdBl);

		standardBannerBl.validateBeforeSave = function(ad, errors, isMultiple){
			var isValid = true;
			isValid = baseAdBl.validateBeforeSave(ad, errors, isMultiple);


			if(ad.banner && ad.banner.assetId){
				isValid = isValid && adValidator.validateBanner(ad.banner, ad.adFormat, errors);
			}

			if(ad.html5 && ad.html5.assetId){
				isValid = isValid && adValidator.validateFolder(ad.html5, ad.adFormat);
			}

			return isValid;
		}

    standardBannerBl.prepareSaveData = function(ad){
      ad.videoStartMethod = null;
    }

    standardBannerBl.setInitialSize = function(ad){
			var adAssets = [ad.defaultImage, ad.banner, ad.html5];
			var initialSize = 0;
			for (var i = 0; i < adAssets.length; i++) {
				var asset = adAssets[i];
				if(asset && initialSize < asset.size){
					initialSize = asset.size;
				}
			}
			ad.initialSize = initialSize;
			//    var initialSize =  _.max(_.pluck(adAssets, "formatContext.fileSize"));
		}

		standardBannerBl.setOverallAndBillingSize = function(ad){
			baseAdBl.resetSize(ad);
			var priceAssetArr = [];
			var overallSizeAssetArr = [];
			if(ad.banner && ad.banner.assetId){
				adService.calculateSize(ad, ad.banner, true, priceAssetArr, overallSizeAssetArr);
			}
			if(ad.html5 && ad.html5.assetId){
				if(ad.html5.assetId){
					adService.calculateSize(ad, ad.html5, true, priceAssetArr, overallSizeAssetArr);
				}
			}


			if((!ad.banner || !ad.banner.assetId ) &&
					(!ad.html5 || !ad.html5.assetId ) ){
				adService.calculateSize(ad, ad.defaultImage, true, priceAssetArr, overallSizeAssetArr);
			}
			else{
				adService.calculateSize(ad, ad.defaultImage, false, priceAssetArr, overallSizeAssetArr);
			}
			console.log(ad);
		}

		standardBannerBl.nextAssignAssetStep = function(selectedCreativeType){
			var nextStepCreativeType;
			switch(selectedCreativeType){
				case "defaultImage":
					nextStepCreativeType = "banner";
					break;
				case "banner":
					nextStepCreativeType= "html5";
					break;
				case "html5":
					break;
			}
			return nextStepCreativeType;
		}

    standardBannerBl.setPanelSettingsType = function(){
      return '';
    }

    standardBannerBl.fillEditMultipleMissingValues = function(ad){
      if(!ad.banner){
        ad.banner = {}
      }

      if(!ad.html5){
        ad.html5 = {}
      }
    }

    return standardBannerBl;

	}]);
