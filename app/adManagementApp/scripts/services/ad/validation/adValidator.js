/**
 * Created by roi.levy on 9/22/14.
 */
'use strict';

app.service('adValidator', ['creativeConsts', 'validationHelper', function (creativeConsts, validationHelper) {

  var assetMaxSize = {
    STANDARD_BANNER_AD: {
      banner: creativeConsts.MAX_ASSET_SIZE_STANDARD,
      html5: creativeConsts.MAX_ASSET_SIZE_STANDARD
    },
    ENHANCED_STANDARD_BANNER_AD: {
      preloadBanner: creativeConsts.MAX_ASSET_SIZE_STANDARD,
      banner: creativeConsts.MAX_ASSET_SIZE_STANDARD
    },
    RICH_MEDIA_BANNER_AD: {
      preloadBanner: creativeConsts.MAX_ASSET_SIZE_STANDARD,
      banner: creativeConsts.MAX_ASSET_SIZE_RICH
    },
    EXPANDABLE_BANNER_AD: {
      banner: creativeConsts.MAX_ASSET_SIZE_RICH
    },
    PUSHDOWN_BANNER_AD: {
      banner: creativeConsts.MAX_ASSET_SIZE_RICH
    },
    HTML5_RICH_MEDIA_BANNER_AD: {
      html5: creativeConsts.MAX_ASSET_SIZE_RICH
    },
    HTML5_EXPANDABLE_BANNER_AD: {
      html5: creativeConsts.MAX_ASSET_SIZE_RICH
    },
    HTML5_SINGLE_EXPANDABLE_BANNER_AD: {
      html5: creativeConsts.MAX_ASSET_SIZE_RICH
    },
    SINGLE_EXPANDABLE_BANNER_AD: {
      banner: creativeConsts.MAX_ASSET_SIZE_RICH
    }
  }

  var validateDefaultImageSize = function (asset) {
    var maxSize = creativeConsts.MAX_ASSET_SIZE_STANDARD;
    return asset.size && asset.size <= maxSize; //: asset.formatContext.fileSize <= maxSize;
  }

  var validateBannerSize = function (asset, adFormatType) {
    var maxSize = assetMaxSize[adFormatType].banner || creativeConsts.MAX_ASSET_SIZE_STANDARD;
    return asset.size && asset.size <= maxSize;// : asset.formatContext.fileSize <= maxSize;
  }

  var validatePreLoadBannerSize = function (asset, adFormatType) {
    var maxSize = assetMaxSize[adFormatType].preloadBanner || creativeConsts.MAX_ASSET_SIZE_STANDARD;
    return asset.size && asset.size <= maxSize;// : asset.formatContext.fileSize <= maxSize;
  }

  var validateInStreamLinearSize = function (asset, adFormatType) {
    var maxSize = creativeConsts.MAX_ASSET_SIZE_LINEAR;
    return asset.size && asset.size <= maxSize;// : asset.formatContext.fileSize <= maxSize;
  }

  var validateMaxManifestItemSize = function (asset, adFormatType) {
    var maxSize = assetMaxSize[adFormatType].html5 || creativeConsts.MAX_ASSET_SIZE_STANDARD;

    if (asset.archiveFileContext) {
      var overSizedFile = _.find(asset.archiveFileContext, function (manifestFile) {
        return manifestFile.size > maxSize;
      });
    }
    else if (asset.archiveManifest) {
      var overSizedFile = _.find(asset.archiveManifest, function (manifestFile) {
        return manifestFile.size > maxSize;
      });
    }

    return !overSizedFile;
  }

  var validateMediaType = function (asset, creativeType) {
    return asset.mediaType ? asset.mediaType.toUpperCase() === creativeType.toUpperCase() : false;
  }

  var validateMediaTypes = function (asset, creativeTypes) {

    if (!asset || !asset.mediaType) {
      return false;
    }

    if (!creativeTypes || !Array.isArray(creativeTypes) || creativeTypes.length === 0) {
      return false;
    }

    for (var i = 0; i < creativeTypes.length; i++) {
      var creativeType = creativeTypes[i];
      if (asset.mediaType.toUpperCase() === creativeType) {
        return true;
      }
    }

    return false;
  }

  var validateImage = function (asset, errors) {
    if (asset.assetId === "Multiple Values") {
      return true;
    }

    var isValid = true;
    var errors = errors || {};
    if (!validateMediaType(asset, creativeConsts.mediaType.image)) {
      isValid = false;
      errors.creativeAssets = "The format for the default image is not supported. Please replace this asset with a valid format."
      errors.defaultImage = "Format not supported.";
    }
    else if (!validateDefaultImageSize(asset)) {
      isValid = false;
      errors.creativeAssets = "Default image is bigger than 110k";
      errors.defaultImage = "File is bigger than 110k";
    }
    return isValid;
  }

  var validateBanner = function (asset, adFormatType, errors) {
    if (asset.assetId === "Multiple Values") {
      return true;
    }
    var isValid = true;
    var errors = errors || {};
    if (!validateMediaType(asset, creativeConsts.mediaType.flash)) {
      isValid = false;
      errors.creativeAssets = "The format for the banner is not supported. Please replace this asset with a valid format.";
      errors.banner = "Format not supported.";
    }
    else if (!validateBannerSize(asset, adFormatType)) {
      isValid = false;
      errors.creativeAssets = "Banner file size is bigger than 110k"
      errors.banner = "File size exceeds format limit";
    }
    return isValid;
  }

  var validatePreLoadBanner = function (asset, adFormatType, errors) {
    if (asset.assetId === "Multiple Values") {
      return true;
    }
    var isValid = true;
    var errors = errors || {};
    if (!validateMediaType(asset, creativeConsts.mediaType.flash)) {
      isValid = false;
      errors.creativeAssets = "The format for the pre load banner is not supported. Please replace this asset with a valid format.";
    }
    else if (!validatePreLoadBannerSize(asset, adFormatType)) {
      isValid = false;
      errors.creativeAssets = "Pre load banner file size is bigger than 110k"
    }
    return isValid;
  }

  var validateFolder = function (asset, adFormatType, errors) {
    if (asset.assetId === "Multiple Values") {
      return true;
    }
    var isValid = true;
    var errors = errors || {};
    if (asset.type != 'AdAssetFolder') {
      isValid = false;
      errors.creativeAssets = "The work space folder you selected was corrupted during upload.";
    }
    else if (!validateMaxManifestItemSize(asset, adFormatType)) {
      isValid = false;
      errors.creativeAssets = "The work space folder contains a file that exceeds size limit.";
    }
    return isValid;
  }

  var validateInStreamLinear = function (asset, adFormatType, errors) {
    if (asset.assetId === "Multiple Values") {
      return true;
    }
    var isValid = true;
    var errors = errors || {};
    if (!validateMediaTypes(asset, [creativeConsts.mediaType.archive, creativeConsts.mediaType.flash, creativeConsts.mediaType.video, creativeConsts.mediaType.image]) &&
        asset.type != 'AdAssetFolder') {
      isValid = false;
      errors.inStream = "The format for the linear is not supported. Please replace this asset with a valid format.";
    }

    if (asset.type != 'AdAssetFolder' && !validateInStreamLinearSize(asset, adFormatType)) {
      isValid = false;
      errors.inStream = "The linear asset file exceeds size limit.";
    }

    return isValid;
  }

  var validateMassCreateAsset = function (asset, adFormatType) {
    var isValid = true;
    var adFormatType = adFormatType || "STANDARD_BANNER_AD";

    if (!validateDefaultImageSize(asset) && !validateBannerSize(asset, adFormatType)) {
      isValid = false;
    }

    if (asset.mediaType !== creativeConsts.mediaType.image && asset.mediaType !== creativeConsts.mediaType.flash) {
      isValid = false;
    }

    return isValid;
  }

  var validateCustomInteractions = function (customInteractions, errors) {
    var errors = errors || {};
    if (!customInteractions || customInteractions.length < 500) {
      return true;
    }
    errors.customInteractions = "A master ad should support up to 500 Custom Interaction per ad";
    return false;
  }

  var validationPanelsDefaultRequired = function (panels) {
    var OK = panels === undefined || panels.length === 0;
    if (!OK) {
      var defaultPanel = _.filter(panels, {'defaultPanel': true});
      return defaultPanel && defaultPanel == 1;
    }
  }

  function validateUrl(value, isMultiple, errors) {
    var urlObj = {value: value, error: {}};
    var isValid = true;
    if (!value || (isMultiple && value === 'Multiple Values')) {
      return isValid;
    }

    if (!validationHelper.isValidUrlFormat(urlObj)) {
      errors.clickthroughs = urlObj.error.text;
      isValid = false;
    }
    return isValid;
  }

  return {
    assetMaxSize: assetMaxSize,
    validateImage: validateImage,
    validateBanner: validateBanner,
    validatePreLoadBanner: validatePreLoadBanner,
    validateFolder: validateFolder,
    validateMassCreateAsset: validateMassCreateAsset,
    validateInStreamLinear: validateInStreamLinear,
    validateCustomInteractions: validateCustomInteractions,
    validateClickUrl: validateUrl
  }

}]);
