/**
 * Created by roi.levy on 10/12/14.
 */
'use strict';
describe('Service: enhancedStandardBlTest', function () {

  // load the controller's module
  beforeEach(module('MediaMindApp'));

  var adType = "enhancedStandard";

  //base ad validator methods
  describe('initialSizeCalculation', function(){

    it('should return default image size', inject(function(enhancedStandardBl) {
      var richMediaAd = creativeTestHelper().generateAd(adType);
      richMediaAd.defaultImage = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_DEFAULT_IMAGE_SIZE, creativeTestHelper().assetType.image);
      enhancedStandardBl.setInitialSize(richMediaAd);
      expect(richMediaAd.initialSize).toBe(creativeTestHelper().maxAssetSizes.MAX_DEFAULT_IMAGE_SIZE);
    }));

    it('should return banner asset size', inject(function(enhancedStandardBl) {
      var richMediaAd = creativeTestHelper().generateAd(adType);
      richMediaAd.defaultImage = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_DEFAULT_IMAGE_SIZE - 1, creativeTestHelper().assetType.image);
      richMediaAd.banner = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_ASSET_SIZE_STANDARD, creativeTestHelper().assetType.flash);
      enhancedStandardBl.setInitialSize(richMediaAd);
      expect(richMediaAd.initialSize).toBe(creativeTestHelper().maxAssetSizes.MAX_ASSET_SIZE_STANDARD);
    }));

    it('should return  banner + preload banner asset size', inject(function(enhancedStandardBl) {
      var richMediaAd = creativeTestHelper().generateAd(adType);
      richMediaAd.defaultImage = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_DEFAULT_IMAGE_SIZE - 1, creativeTestHelper().assetType.image);
      richMediaAd.banner = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_ASSET_SIZE_STANDARD, creativeTestHelper().assetType.flash);
      richMediaAd.preloadBanner = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_ASSET_SIZE_STANDARD, creativeTestHelper().assetType.flash);
      enhancedStandardBl.setInitialSize(richMediaAd);
      expect(richMediaAd.initialSize).toBe(creativeTestHelper().maxAssetSizes.MAX_ASSET_SIZE_STANDARD * 2);
    }));

  });

});