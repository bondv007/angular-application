/**
 * Created by roi.levy on 10/12/14.
 */
'use strict';
describe('Service: html5RichMediaBannerBlTest', function () {

  // load the controller's module
  beforeEach(module('MediaMindApp'));

  var adType = "html5Rich";

  //base ad validator methods
  describe('initialSizeCalculation', function(){

    it('should return default image size', inject(function(html5RichMediaBannerBl) {
      var html5RichMediaAd = creativeTestHelper().generateAd(adType);
      html5RichMediaAd.defaultImage = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_DEFAULT_IMAGE_SIZE, creativeTestHelper().assetType.image);
      html5RichMediaBannerBl.setInitialSize(html5RichMediaAd);
      expect(html5RichMediaAd.initialSize).toBe(creativeTestHelper().maxAssetSizes.MAX_DEFAULT_IMAGE_SIZE);
    }));


    it('should return workspace overall sizee', inject(function(html5RichMediaBannerBl) {
      var html5RichMediaAd = creativeTestHelper().generateAd(adType);
      html5RichMediaAd.defaultImage = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_DEFAULT_IMAGE_SIZE - 1, creativeTestHelper().assetType.image);
      html5RichMediaAd.html5 = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_ASSET_SIZE_RICH, creativeTestHelper().assetType.html5);
      html5RichMediaBannerBl.setInitialSize(html5RichMediaAd);
      expect(html5RichMediaAd.initialSize).toBe(creativeTestHelper().maxAssetSizes.MAX_ASSET_SIZE_RICH);
    }));

  });

});
