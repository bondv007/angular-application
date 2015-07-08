/**
 * Created by roi.levy on 10/5/14.
 */
'use strict';

function creativeTestHelper(){

  var mediaType = {
    image: "IMAGE",
    flash: "FLASH",
    archive: "ARCHIVE"
  }

  var assetType = {
    image: 'imageAsset',
    flash: 'flashAsset',
    html5: 'html5Asset'
  }

  var maxAssetSizes = {
    MAX_ASSET_SIZE_RICH: 10485760, //10MB
    MAX_ASSET_SIZE_STANDARD: 112640, //110KB
    MAX_DEFAULT_IMAGE_SIZE: 112640 //110KB
  };

  var adFormatTypes = {
    standardBanner: {format: 'STANDARD_BANNER_AD', type: 'StandardBannerAd'},
    enhancedStandard: {format: 'ENHANCED_STANDARD_BANNER_AD', type: 'EnhancedStandardBannerAd'},
    expandableBanner: {format: 'EXPANDABLE_BANNER_AD', type: 'ExpandableBannerAd'},
    richMedia: {format: 'RICH_MEDIA_BANNER_AD', type: 'RichMediaBannerAd'},
    tracking: {format: 'TRACKING_PIXEL_AD', type: ''},
    inStream: {format: 'INSTREAM_AD', type: 'InStreamAd'},
    inStreamInteractive: {format: 'INSTREAM_VIDEO_INTERACTIVE', type: ''},
    pushDownBanner: {format: 'PUSHDOWN_BANNER_AD', type: 'PushdownBannerAd'},
    html5Rich: {format: 'HTML5_RICH_MEDIA_BANNER_AD', type: 'HTML5RichMediaBannerAd'}
  };

  var generateAdAsset = function(fileSize, assetType) {
    var adAsset = {
      "type":"AdAsset",
      "assetId": ""
    }
    adAsset.size = fileSize;
    adAsset.mediaType = assetType;
    return  adAsset;
  };

  var generatePanel =  function(fileSize){
    var panel = {
      "type": "Panel",
      "id": "",
      "name": "",
      "assetId":"",
      "defaultPanel": false,
      "positionX": 0,
      "positionY": 0,
      "positionType": "BANNER_RELATIVE",
      "autoExpand": [0],
      "delayedExpansion": [0],
      "retraction": "Never",
      "transparent": [],
      "isNew": true
    }
    panel.size = fileSize;
    return panel;
  };

  var addPanels = function(ad, amount){
    if(!ad.panels){
      ad.panels = [];
    }
    if(amount && amount > 0){
      for (var i = 0; i < amount; i++) {
        ad.panels.push(generatePanel(randomGenerator().randFileSize()));
      }
    }else{
      ad.panels.push(generatePanel());
    }
  };

  var generateAd = function(type){
    var ad = creativeModels().ad;
    ad.type = adFormatTypes[type].type;
    ad.adFormat = adFormatTypes[type].format;
    return ad;
  }

   var generateAds = function(type, numOfAds){
     var ads = [];
     for (var i = 0; i < numOfAds.length; i++) {
         var ad = generateAd(type);
         ads.push(ad);
     }
   }

  return{
    MAX_ASSET_SIZE_RICH: 10485760, //10MB
    MAX_ASSET_SIZE_STANDARD: 112640, //110KB
    MAX_DEFAULT_IMAGE_SIZE: 112640, //110KB
    adFormatTypes: adFormatTypes,
    mediaType: mediaType,
    maxAssetSizes: maxAssetSizes,
    generateAdAsset: generateAdAsset,
    addPanels: addPanels,
    assetType: assetType,
    generateAd: generateAd
  }
}