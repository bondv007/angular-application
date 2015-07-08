'use strict';
app.service('adPreviewService', ['$rootScope', function ($rootScope) {
  var self = this;
  var oneMB = 1048576;
  var oneKB = 1024;

  self.parseSizeFromBytes = function (fileSize) {
    if (fileSize >= oneMB) {
      fileSize = (fileSize / oneMB).toFixed(2) + 'MB';
    }
    else if (fileSize < oneMB) {
      fileSize = (fileSize / oneKB).toFixed(2) + 'KB';
    }
    return fileSize;
  };

  self.getAssetDimension = function (asset) {
    if (asset && asset.formatContext && asset.formatContext.format) {
      if (asset.formatContext.format.toUpperCase() == "SWF") {
        if (asset.swfContext) {
          return asset.swfContext.width + 'X' + asset.swfContext.height;
        }
      }
      else if (asset.imageContext) {
        return asset.imageContext.width + 'X' + asset.imageContext.height;
      }
      return "";
    }
  }
  /**
   * Conserve aspect ratio of the orignal region. Useful when shrinking/enlarging
   * images to fit into a certain area.
   *
   * @param {Number} srcWidth Source area width
   * @param {Number} srcHeight Source area height
   * @param {Number} maxWidth Fittable area maximum available width
   * @param {Number} maxHeight Fittable area maximum available height
   * @return {Object} { width, height }
   */
  self.calculateAspectRatioFit = function (srcWidth, srcHeight, maxWidth, maxHeight) {

    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

    return { width: Math.round(srcWidth * ratio), height: Math.round(srcHeight * ratio) };
  }


  self.milliSecondsToTime = function (duration) {
    var milliseconds = parseInt((duration % 1000) / 100)
      , seconds = parseInt((duration / 1000) % 60)
      , minutes = parseInt((duration / (1000 * 60)) % 60)
      , hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds;
  };

  var storedAdIds = "";
  var showAllAdsLink = false;
  var storedDisplayTag = "";
  var storedViewBy = "";
  var storedAdDimensionGroup = [];
  var storedSaveBackState = "";

  self.putStoredAdIds = function (adIds) {

    if ( arguments[1] )
      storedViewBy = arguments[1];

    if ( arguments[2] )
      storedSaveBackState = arguments[2];

    if ( arguments[3] )
      storedAdDimensionGroup = arguments[3];

    storedAdIds = adIds;
    showAllAdsLink = true;
  };

  self.getStoredSaveBackState = function () {
    return storedSaveBackState;
  };

  self.getStoredViewBy = function () {
    return storedViewBy;
  };

  self.getStoredAdDimensionGroups = function () {
    return storedAdDimensionGroup;
  };

  self.putStoredAdDimensionGroups = function(adDimensionGroups) {
    storedAdDimensionGroup = adDimensionGroups;
  }

  self.clearStoredValues = function() {
    storedAdIds = "";
    storedViewBy = "";
    storedAdDimensionGroup = [];
    storedSaveBackState = "";
  }

  self.getStoredAdIds = function () {
    return storedAdIds;
  };

  self.getAllAdsLinkState = function () {
    return showAllAdsLink;
  };

  self.putDisplayTag = function (displaytag) {
    storedDisplayTag = displaytag;
  };

  self.getDisplayTag = function () {
    return storedDisplayTag;
  };

}]);

