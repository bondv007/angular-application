/**
* Created by roi.levy on 10/7/14.
*/

'use strict';
describe('Service: standardBannerBlTest', function () {

  // load the controller's module
  beforeEach(module('MediaMindApp'));

  var adType = "standardBanner";

  //base ad validator methods
  describe('initialSizeCalculation', function(){

    it('should return default image size', inject(function(standardBannerBl) {
      var standardAd = creativeTestHelper().generateAd(adType);
      standardAd.defaultImage = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_DEFAULT_IMAGE_SIZE, creativeTestHelper().assetType.image);
      standardBannerBl.setInitialSize(standardAd);
      expect(standardAd.initialSize).toBe(creativeTestHelper().maxAssetSizes.MAX_DEFAULT_IMAGE_SIZE);
    }));

    it('should return banner asset size', inject(function(standardBannerBl) {
      var standardAd = creativeTestHelper().generateAd(adType);
      standardAd.defaultImage = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_DEFAULT_IMAGE_SIZE - 1, creativeTestHelper().assetType.image);
      standardAd.banner = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_ASSET_SIZE_STANDARD, creativeTestHelper().assetType.flash);
      standardBannerBl.setInitialSize(standardAd);
      expect(standardAd.initialSize).toBe(creativeTestHelper().maxAssetSizes.MAX_ASSET_SIZE_STANDARD);
    }));

    it('should return workspace overall size', inject(function(standardBannerBl) {
      var standardAd = creativeTestHelper().generateAd(adType);
      standardAd.defaultImage = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_DEFAULT_IMAGE_SIZE - 1, creativeTestHelper().assetType.image);
      standardAd.banner = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_ASSET_SIZE_STANDARD - 1, creativeTestHelper().assetType.flash);
      standardAd.html5 = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_ASSET_SIZE_STANDARD, creativeTestHelper().assetType.html5);
      standardBannerBl.setInitialSize(standardAd);
      expect(standardAd.initialSize).toBe(creativeTestHelper().maxAssetSizes.MAX_ASSET_SIZE_STANDARD);
    }));

  });

});


