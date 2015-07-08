/**
 * Created by roi.levy on 11/17/14.
 */
'use strict';
app.service('massCreateLogic', ['creativeConsts', 'adService' , function(creativeConsts, adService){

  function fillAdNameFromAssetName(newAd, assetName){
    var adName = assetName;
    adName = adName.substring(0, adName.indexOf('.'));
    newAd.name = adName;
  }

  function createNewAdForSelectedImage(defaultImage, accountId, adFormat){
    var newAd = adService.createNewAd(adFormat);
    newAd.accountId = accountId;
    fillAdNameFromAssetName(newAd, defaultImage.title);
    newAd.defaultImage = assignAsset(defaultImage);
    return newAd;
  }

  function createNewAdForSelectedBanner(flashAsset, defaultImage,accountId, adFormat){
    var newAd = adService.createNewAd(adFormat);
    newAd.accountId = accountId;
    fillAdNameFromAssetName(newAd, flashAsset.title);
    newAd.banner = assignAsset(flashAsset);
    newAd.defaultImage = assignAsset(defaultImage);
    return newAd;
  }

  function matchAssetsByName(imageAsset,flashAssets){
    var imageName = imageAsset.title.substring(0, imageAsset.title.indexOf('.'));
    return _.filter(flashAssets, {title: imageName});
  }

  function matchAssetByDimensions(imageAsset, flashAssets){
    return  _.filter(flashAssets, {dimension: imageAsset.dimension});
  }

  function matchFlashAssetToImageAsset(imageAsset, flashAssets){
    var matchingBanners = matchAssetsByName(imageAsset, flashAssets);
    matchingBanners = matchAssetByDimensions(imageAsset, matchingBanners);
    return matchingBanners;
  }

  function assignAsset(selectedAsset){
    var creativeAsset = {};
    creativeAsset.type = "AdAsset";
    creativeAsset.assetId = selectedAsset.id;
    creativeAsset.assetName = selectedAsset.title;
    creativeAsset.dimension = selectedAsset.dimension ? selectedAsset.dimension : 'N/A';
    creativeAsset.fileSize =  selectedAsset.displayFileSize ? selectedAsset.displayFileSize : 'N/A';
    creativeAsset.thumbnail = selectedAsset.thumbnails[0].url;
    return creativeAsset;
  }

  var createAdsFromImages = function(selectedImages, selectedBanners,accountId, adFormat){
    var newAds = [];

    for (var i = 0; i < selectedImages.length; i++){
      var defaultImage = selectedImages[i];
      var newAd = createNewAdForSelectedImage(defaultImage, accountId, adFormat);
      var matchingBanners = matchFlashAssetToImageAsset(defaultImage, selectedBanners);
      if(matchingBanners.length == 1){
        newAd.banner = assignAsset(selectedBanners[0]);
      }
      newAds.push(newAd);
    }
    return newAds;
  }

  var createAdsFromFlashAssets = function(selectedImage, selectedBanners, accountId, adFormat){
    var newAds = [];
    for (var i = 0; i < selectedBanners.length; i++) {
      var banner = selectedBanners[i];
      var defaultImage = selectedImage;
      var newAd = createNewAdForSelectedBanner(banner, defaultImage, accountId, adFormat);
      newAds.push(newAd);
    }
    return newAds;
  }

  return {
    createAdsFromImages: createAdsFromImages,
    createAdsFromFlashAssets: createAdsFromFlashAssets,
    assignAsset: assignAsset
  }

}]);
