/**
 * Created by roi.levy on 10/5/14.
 */
'use strict';
describe('Service: adValidator', function () {

  // load the controller's module
  beforeEach(module('MediaMindApp'));

  describe('defaultImage', function(){

    var errors = {};
//    it('should return true if media type is Image and size is smaller than 110KB', inject(function(adValidator) {
//      var image = creativeModels().imageAsset;
//      expect(adValidator.validateImage(image,errors)).toBe(true);
//    }));
//
//    it('should return false if file size is larger than 110KB', inject(function(adValidator) {
//      var image = creativeModels().imageAsset;
//      image.formatContext.fileSize = creativeTestHelper().maxAssetSizes.MAX_DEFAULT_IMAGE_SIZE + 1;
//      expect(adValidator.validateImage(image, errors)).toBe(false);
//    }));
//
//    it('should return false if media type is not Image', inject(function(adValidator) {
//      var image = creativeModels().imageAsset;
//      image.mediaType =  creativeTestHelper().mediaType.flash;
//      expect(adValidator.validateImage(image,errors)).toBe(false);
//    }));

    it('should return true if asAsset size is smaller than 110KB', inject(function(adValidator) {
      var ad = creativeTestHelper().generateAd("standardBanner");
      ad.defaultImage = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_DEFAULT_IMAGE_SIZE, creativeTestHelper().mediaType.image);
      expect(adValidator.validateImage(ad.defaultImage, errors)).toBe(true);
    }));

    it('should return false if asAsset size is larger than 110KB', inject(function(adValidator) {
      var ad = creativeTestHelper().generateAd("standardBanner");
      ad.defaultImage = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_DEFAULT_IMAGE_SIZE + 1, creativeTestHelper().mediaType.image);
      expect(adValidator.validateImage(ad.defaultImage, errors)).toBe(false);
    }));

    it('should return false if ad Asset media type is not Image', inject(function(adValidator) {
      var ad = creativeTestHelper().generateAd("standardBanner");
      ad.defaultImage = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_DEFAULT_IMAGE_SIZE, creativeTestHelper().mediaType.flash);
      expect(adValidator.validateImage(ad.defaultImage, errors)).toBe(false);
    }));
  });

  describe('bannerAsset', function(){

    var errors = {};

//    it('should return true if media type is FLASH and size is smaller than 110KB', inject(function(adValidator) {
//      var formatType = creativeTestHelper().adFormatTypes.standardBanner.format;
//      var flashAsset = creativeModels().flashAsset;
//      flashAsset.formatContext.fileSize = creativeTestHelper().maxAssetSizes.MAX_ASSET_SIZE_STANDARD;
//      expect(adValidator.validateBanner(flashAsset, formatType, errors)).toBe(true);
//    }));

//    it('should return true if media type is FLASH and size is larger than 110KB', inject(function(adValidator) {
//      var formatType = creativeTestHelper().adFormatTypes.standardBanner.format;
//      var flashAsset = creativeModels().flashAsset;
//      flashAsset.formatContext.fileSize = creativeTestHelper().maxAssetSizes.MAX_ASSET_SIZE_STANDARD + 1;
//      expect(adValidator.validateBanner(flashAsset, formatType, errors)).toBe(false);
//    }));
//
//    it('should return false if media type is not Flash', inject(function(adValidator) {
//      var formatType = creativeTestHelper().adFormatTypes.standardBanner.format;
//      var image = creativeModels().imageAsset;
//      expect(adValidator.validateBanner(image, formatType, errors)).toBe(false);
//    }));

    it('should return true if media type is FLASH and size is smaller than 110KB', inject(function(adValidator) {
      var formatType = creativeTestHelper().adFormatTypes.standardBanner.format;
      var ad = creativeTestHelper().generateAd("standardBanner");
      ad.banner = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_ASSET_SIZE_STANDARD, creativeTestHelper().mediaType.flash);
      expect(adValidator.validateBanner(ad.banner, formatType, errors)).toBe(true);
    }));

    it('should return false if media type is FLASH and size is larger than 110KB', inject(function(adValidator) {
      var formatType = creativeTestHelper().adFormatTypes.standardBanner.format;
      var ad = creativeTestHelper().generateAd("standardBanner");
      ad.banner = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_ASSET_SIZE_STANDARD + 1, creativeTestHelper().mediaType.flash);
      expect(adValidator.validateBanner(ad.banner, formatType, errors)).toBe(false);
    }));

    it('should return false if media type is not Flash', inject(function(adValidator) {
      var formatType = creativeTestHelper().adFormatTypes.standardBanner.format;
      var ad = creativeTestHelper().generateAd("standardBanner");
      ad.banner = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_DEFAULT_IMAGE_SIZE, creativeTestHelper().mediaType.image);
      expect(adValidator.validateBanner(ad.banner, formatType, errors)).toBe(false);
    }));

  });

  describe('preloadBanner', function(){

    var errors = {};

//    it('should return true if media type is FLASH and size is smaller than 110KB', inject(function(adValidator) {
//      var formatType = creativeTestHelper().adFormatTypes.enhancedStandard.format;
//      var flashAsset = creativeModels().flashAsset;
//      flashAsset.formatContext.fileSize = creativeTestHelper().maxAssetSizes.MAX_ASSET_SIZE_STANDARD;
//      expect(adValidator.validatePreLoadBanner(flashAsset, formatType, errors)).toBe(true);
//    }));
//
//    it('should return true if media type is FLASH and size is larger than 110KB', inject(function(adValidator) {
//      var formatType = creativeTestHelper().adFormatTypes.enhancedStandard.format;
//      var flashAsset = creativeModels().flashAsset;
//      flashAsset.formatContext.fileSize = creativeTestHelper().maxAssetSizes.MAX_ASSET_SIZE_STANDARD + 1;
//      expect(adValidator.validatePreLoadBanner(flashAsset, formatType, errors)).toBe(false);
//    }));
//
//    it('should return false if media type is not Flash', inject(function(adValidator) {
//      var formatType = creativeTestHelper().adFormatTypes.enhancedStandard.format;
//      var image = creativeModels().imageAsset;
//      expect(adValidator.validatePreLoadBanner(image, formatType, errors)).toBe(false);
//    }));

    it('should return true if media type is FLASH and size is smaller than 110KB', inject(function(adValidator) {
      var formatType = creativeTestHelper().adFormatTypes.enhancedStandard.format;
      var ad = creativeTestHelper().generateAd("enhancedStandard");
      ad.preloadBanner= creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_ASSET_SIZE_STANDARD, creativeTestHelper().mediaType.flash);
      expect(adValidator.validatePreLoadBanner(ad.preloadBanner, formatType, errors)).toBe(true);
    }));

    it('should return false if media type is FLASH and size is larger than 110KB', inject(function(adValidator) {
      var formatType = creativeTestHelper().adFormatTypes.enhancedStandard.format;
      var ad = creativeTestHelper().generateAd("enhancedStandard");
      ad.preloadBanner = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_ASSET_SIZE_STANDARD + 1, creativeTestHelper().mediaType.flash);
      expect(adValidator.validatePreLoadBanner(ad.preloadBanner, formatType, errors)).toBe(false);
    }));

    it('should return false if media type is not Flash', inject(function(adValidator) {
      var formatType = creativeTestHelper().adFormatTypes.enhancedStandard.format;
      var ad = creativeTestHelper().generateAd("enhancedStandard");
      ad.preloadBanner = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_DEFAULT_IMAGE_SIZE, creativeTestHelper().mediaType.image);
      expect(adValidator.validatePreLoadBanner(ad.preloadBanner, formatType, errors)).toBe(false);
    }));
  });

  describe('html5', function(){

    var errors = {};

    it('should return true if media type is Archive and largest manifest item size is smaller than 110KB', inject(function(adValidator) {
      var formatType = creativeTestHelper().adFormatTypes.standardBanner.format;
      var html5Asset = creativeModels().html5Asset;
      var archiveManifestObj = creativeModels().archiveManifestObj;
      archiveManifestObj.size = creativeTestHelper().maxAssetSizes.MAX_ASSET_SIZE_STANDARD;
      html5Asset.archiveManifest.push(archiveManifestObj);
      expect(adValidator.validateFolder(html5Asset, formatType, errors)).toBe(true);
    }));

    it('should return true if media type is Archive and largest manifest item size is larger than 110KB', inject(function(adValidator) {
      var formatType = creativeTestHelper().adFormatTypes.standardBanner.format;
      var html5Asset = creativeModels().html5Asset;
      var archiveManifestObj = creativeModels().archiveManifestObj;
      archiveManifestObj.size = creativeTestHelper().maxAssetSizes.MAX_ASSET_SIZE_STANDARD + 1;
      html5Asset.archiveManifest.push(archiveManifestObj);
      expect(adValidator.validateFolder(html5Asset, formatType, errors)).toBe(false);
    }));

    it('should return false if media type is not Archive', inject(function(adValidator) {
      var formatType = creativeTestHelper().adFormatTypes.standardBanner.format;
      var image = creativeModels().imageAsset;
      expect(adValidator.validateFolder(image, formatType, errors)).toBe(false);
    }));

  });

});


