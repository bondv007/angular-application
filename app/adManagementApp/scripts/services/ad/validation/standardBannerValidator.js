/**
 * Created by roi.levy on 10/2/14.
 */
'use strict';
app.factory('standardBannerValidator', ['creativeConsts', 'adValidator',function(creativeConsts, adValidator) {

  var standardBannerValidator =  Object.create(adValidator);

  function validateBanner(asset, errors){
    var isValid = true;

    if(standardBannerValidator.validateMediaType(asset, creativeConsts.mediaType.flash)){
      isValid = false;
      errors.creativeAssetsError = "The format for the banner is not supported. Please replace this asset with a valid format.";
    }

    if(standardBannerValidator.validateBannerSize(asset)){
      isValid = false;
      errors.creativeAssetsError = "Banner file size is bigger than 10k"
    }
    return isValid;
  }

  standardBannerValidator.validateBannerSize = function(asset){
    return asset.formatContext.fileSize <= creativeConsts.MAX_ASSET_SIZE_STANDARD;
  }

  standardBannerValidator.validateMaxManifestItemSize = function(asset){

    if(!asset.archiveManifest){
      return false;
    }

    if(asset.archiveManifest.length === 0){
      return false;
    }

    var overSizedFile = _.find(asset.archiveManifest, function(manifestFile){
      return manifestFile.size > creativeConsts.MAX_ASSET_SIZE_STANDARD;
    });

    return !overSizedFile;
  }

  standardBannerValidator.validateMassCreateAsset = function(asset){
    return asset.formatContext.fileSize <= creativeConsts.MAX_ASSET_SIZE_STANDARD  &&
      (asset.mediaType === creativeConsts.mediaType.image  || asset.mediaType === creativeConsts.mediaType.flash);
  }

  standardBannerValidator.validateBeforeSave = function(ad,errors){
    var isValid = true;
    isValid = standardBannerValidator.prototype.validateBeforeSave(ad, errors);

    if(ad.banner && !standardBannerValidator.validateBannerSize(ad.banner, errors)){
      isValid = false;
    }
  }

  return standardBannerValidator;

}]);