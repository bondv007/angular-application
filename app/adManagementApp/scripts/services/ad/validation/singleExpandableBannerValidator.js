/**
 * Created by roi.levy on 10/2/14.
 */
'use strict';
app.factory('singleExpandableBannerValidator', ['creativeConsts', 'adValidator', function (creativeConsts, adValidator) {

  var singleExpandableBannerValidator = Object.create(adValidator);

  function validateBanner(asset, errors) {
    var isValid = true;

    if (singleExpandableBannerValidator.validateMediaType(asset, creativeConsts.mediaType.flash)) {
      isValid = false;
      errors.creativeAssetsError = "The format for the banner is not supported. Please replace this asset with a valid format.";
    }

    if (singleExpandableBannerValidator.validateBannerSize(asset)) {
      isValid = false;
      errors.creativeAssetsError = "Banner file size is bigger than 10k"
    }
    return isValid;
  }

  singleExpandableBannerValidator.validateBannerSize = function (asset) {
    return asset.formatContext ? asset.formatContext.fileSize <= creativeConsts.MAX_ASSET_SIZE_STANDARD : asset.size ? asset.size <= creativeConsts.MAX_ASSET_SIZE_STANDARD : true;
  }

  singleExpandableBannerValidator.validateMaxManifestItemSize = function (asset) {

    if (!asset.archiveManifest) {
      return false;
    }

    if (asset.archiveManifest.length === 0) {
      return false;
    }

    var overSizedFile = _.find(asset.archiveManifest, function (manifestFile) {
      return manifestFile.size > creativeConsts.MAX_ASSET_SIZE_STANDARD;
    });

    return !overSizedFile;
  }

  singleExpandableBannerValidator.validateMassCreateAsset = function (asset) {
    return (asset.mediaType === creativeConsts.mediaType.image || asset.mediaType === creativeConsts.mediaType.flash) &&
        asset.formatContext ? asset.formatContext.fileSize <= creativeConsts.MAX_ASSET_SIZE_STANDARD : asset.fileSize ? asset.fileSize <= creativeConsts.MAX_ASSET_SIZE_STANDARD : true;
  }

  singleExpandableBannerValidator.validateBeforeSave = function (ad, errors) {
    var isValid = true;
    if (ad.panelsSettings.autoExpandDefaultPanel && (!ad.banner && (!ad.panels || ad.panels.length == 0))) {
      isValid = false;
      errors.autoExpand = "Enabled only when a panel asset is assigned to the ad."
    }
    return isValid;
  }
  return singleExpandableBannerValidator;

}]);
