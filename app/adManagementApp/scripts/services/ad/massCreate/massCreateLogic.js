/**
 * Created by roi.levy on 11/17/14.
 */
'use strict';
app.service('massCreateLogic', ['creativeConsts', 'adBlFactory', 'creativeJsonObjects', 'matchingAlgorithm', 'adService', '$q', 'mmAlertService',
  function(creativeConsts, adBlFactory, creativeJsonObjects, matchingAlgorithm, adService, $q, mmAlertService){

    function fillAdNameFromAssetName(newAd, assetName){
      var adName = assetName;
      adName = adName.substring(0, adName.indexOf('.'));
      newAd.name = adName;
    }

    function createNewAdForSelectedImage(defaultImage, accountId, adFormat){
      var newAd = creativeJsonObjects.createNewAd(adFormat, accountId);
      fillAdNameFromAssetName(newAd, defaultImage.title);
      newAd.defaultImage = assignAsset(defaultImage);
      return newAd;
    }

    function createNewAdForSelectedBanner(flashAsset, defaultImage,accountId, adFormat){
      var newAd = creativeJsonObjects.createNewAd(adFormat, accountId);
      fillAdNameFromAssetName(newAd, flashAsset.title);
      newAd.banner = assignAsset(flashAsset);
      if(defaultImage){
        newAd.defaultImage = assignAsset(defaultImage);
      }
      return newAd;
    }

    function assignAsset(selectedAsset){
      return creativeJsonObjects.createAdAssetFromAsset(selectedAsset);
    }

    var createNewAd = function(adFormatType, accountId){
      var newAd = creativeJsonObjects.createNewAd(adFormatType, accountId);
      return newAd;
    }

    var createAdsFromImages = function(selectedImages, selectedBanners,accountId, adFormat){
      var newAds = [];

      for (var i = 0; i < selectedImages.length; i++){
        var defaultImage = selectedImages[i];
        var newAd = createNewAdForSelectedImage(defaultImage, accountId, adFormat);
        var matchingBanners = matchingAlgorithm.matchFlashAssetToImageAsset(defaultImage, selectedBanners);
        if(matchingBanners.length === 1){
          newAd.banner = assignAsset(matchingBanners[0]);
        }
        newAds.push(newAd);
      }
      return newAds;
    }

    var createAdsFromFlashAssets = function(selectedImages, selectedBanners, accountId, adFormat){
      var newAds = [];
      if(!selectedImages || !selectedBanners){
        return newAds;
      }

      for (var i = 0; i < selectedBanners.length; i++) {
        var banner = selectedBanners[i];
        var defaultImage;
        if(selectedImages.length === 1){
          defaultImage = selectedImages[0];
        }
        else{
          var matchingImages = matchingAlgorithm.matchImageAssetToFlash(banner, selectedImages);
          matchingImages.length === 1 ? defaultImage =  matchingImages[0] : defaultImage = null;
        }
        var newAd = createNewAdForSelectedBanner(banner, defaultImage, accountId, adFormat);
        newAds.push(newAd);
      }
      return newAds;
    }

    var validateBeforeSave = function(ad, errors){
      var adBl = adBlFactory.getAdBl(ad.adFormat);
      return adBl.validateBeforeSave(ad, errors);
    }

    function validateAdsNameUnique(ads, errorsObj){
      var deferred = $q.defer();
      adService.validateAdsNameUnique(ads).then(function(result){
        deferred.resolve(result);
      },function(errors){
        if(errors && errors.length){
          for (var i = 0; i < errors.length; i++) {
            var obj = errors[i];
            if(!errorsObj[obj.clientRefId]){
              errorsObj[obj.clientRefId] = {};
            }
            errorsObj[obj.clientRefId].adName = 'Name all ready exists.';
            mmAlertService.closeError();
          }
        }
        deferred.reject(errors);
      });
      return deferred.promise;
    }

    return {
      createAdsFromImages: createAdsFromImages,
      createAdsFromFlashAssets: createAdsFromFlashAssets,
      assignAsset: assignAsset,
      createNewAd: createNewAd,
      validateBeforeSave: validateBeforeSave,
      validateAdsNameUnique: validateAdsNameUnique
    }

  }]);
