/**
 * Created by roi.levy on 10/12/14.
 */
'use strict';
describe('Service: richMediaBannerBlTest', function () {

  // load the controller's module
  beforeEach(module('MediaMindApp'));

  var adType = "richMedia";

  //base ad validator methods
  describe('initialSizeCalculation', function(){

    it('should return default image size', inject(function(richMediaBannerBl) {
      var richMediaAd = creativeTestHelper().generateAd(adType);
      richMediaAd.defaultImage = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_DEFAULT_IMAGE_SIZE, creativeTestHelper().assetType.image);
      richMediaBannerBl.setInitialSize(richMediaAd);
      expect(richMediaAd.initialSize).toBe(creativeTestHelper().maxAssetSizes.MAX_DEFAULT_IMAGE_SIZE);
    }));

    it('should return banner asset size', inject(function(richMediaBannerBl) {
      var richMediaAd = creativeTestHelper().generateAd(adType);
      richMediaAd.defaultImage = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_DEFAULT_IMAGE_SIZE - 1, creativeTestHelper().assetType.image);
      richMediaAd.banner = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_ASSET_SIZE_STANDARD, creativeTestHelper().assetType.flash);
      richMediaBannerBl.setInitialSize(richMediaAd);
      expect(richMediaAd.initialSize).toBe(creativeTestHelper().maxAssetSizes.MAX_ASSET_SIZE_STANDARD);
    }));

    it('should return  banner + preload banner asset size', inject(function(richMediaBannerBl) {
      var richMediaAd = creativeTestHelper().generateAd(adType);
      richMediaAd.defaultImage = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_DEFAULT_IMAGE_SIZE - 1, creativeTestHelper().assetType.image);
      richMediaAd.banner = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_ASSET_SIZE_STANDARD, creativeTestHelper().assetType.flash);
      richMediaAd.preloadBanner = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_ASSET_SIZE_RICH, creativeTestHelper().assetType.flash);
      richMediaBannerBl.setInitialSize(richMediaAd);
      expect(richMediaAd.initialSize).toBe(creativeTestHelper().maxAssetSizes.MAX_ASSET_SIZE_STANDARD + creativeTestHelper().maxAssetSizes.MAX_ASSET_SIZE_RICH);
    }));

  });

});
