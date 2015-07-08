'use strict';

app.service('creativeConsts', [function () {

  var mediaType = {
    image: "IMAGE",
    flash: "FLASH",
    archive: "ARCHIVE",
    video: "VIDEO",
    html: "HTML"
  }

  var adFormatTypes = {
    standardBanner: {format: 'STANDARD_BANNER_AD', type: 'StandardBannerAd'},
    enhancedStandard: {format: 'ENHANCED_STANDARD_BANNER_AD', type: 'EnhancedStandardBannerAd'},
    expandableBanner: {format: 'EXPANDABLE_BANNER_AD', type: 'ExpandableBannerAd'},
    richMedia: {format: 'RICH_MEDIA_BANNER_AD', type: 'RichMediaBannerAd'},
    tracking: {format: 'TRACKING_PIXEL_AD', type: ''},
    inStream: {format: 'INSTREAM_AD', type: 'InStreamAd'},
    inStreamInteractive: {format: 'INSTREAM_INTERACTIVE_AD', type: ''},
    pushDownBanner: {format: 'PUSHDOWN_BANNER_AD', type: 'PushdownBannerAd'},
    html5Rich: {format: 'HTML5_RICH_MEDIA_BANNER_AD', type: 'HTML5RichMediaBannerAd'}
  };

  var creativeTypesMediaTypes = {
    defaultImage: mediaType.flash,
    preloadBanner: mediaType.flash,
    banner: mediaType.flash,
    html5: mediaType.archive
  }

  var expandedAd = {
      "type":'StandardBannerAd',
      "id": "",
      "name": "",
      "masterAdId": "",
      "isChanged":false,
      "adStatus": "NEW",
      "adFormat": 'adFormat',
      "accountId": "",
      "advertiserId": "",
      "campaignId": "",
      "placementId": "",
      "createdBy": "",
      "createdOn": "",
      "lastUpdateBy": "",
      "lastUpdateOn": "",
      "overallSize": 0,
      "pricingSize": 0,
      "downloadMode": 0,
      "mainClickthrough":{
        "type":"MainClickthrough",
        "url": "",
        "targetWindowType":"NEW",
        "showAddressBar":true,
        "showMenuBar":true,
        "closeAllAdParts":false
      },
      "defaultImage": {
        "type":"AdAsset",
        "assetId": ""
      },
      "defaultImageClickthrough":{
        "type":"MainClickthrough",
        "url":"",
        "targetWindowType":"NEW",
        "showAddressBar":true,
        "showMenuBar":true,
        "closeAllAdParts":false
      },
      "banner":{
        "type":"AdAsset",
        "assetId": ""
      },
      "tooltip": "",
      "changed":false,
      "panelsAppearance": true,
      "preloadPanels": false,
      "videoStartOn": "userStart",
      "preloadBanner":{
        "type":"AdAsset",
        "assetId":""
      },
      "panels": [],
      "additionalAssets": [],
      "customInteractions": []
  }

  return {
    MAX_ASSET_SIZE_RICH: 1073741824, //1GB
    MAX_ASSET_SIZE_STANDARD: 112640, //110KB
    MAX_DEFAULT_IMAGE_SIZE: 112640, //110KB
    MAX_ASSET_SIZE_LINEAR: 1073741824, //1GB
    mediaType: mediaType,
    adFormats: adFormatTypes,
    creativeTypesMediaTypes: creativeTypesMediaTypes,
    expandedAd: expandedAd
  };

}]);
