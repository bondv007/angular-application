/**
 * Created by roi.levy on 10/12/14.
 */
'use strict';
describe('Service: pushDownBannerBlTest', function () {

  // load the controller's module
  beforeEach(module('MediaMindApp'));

  var adType = "pushDownBanner";

  //base ad validator methods
  describe('initialSizeCalculation', function () {

    it('should return default image size, no other assets', inject(function (pushDownBannerBl) {
      var pushDownAd = creativeTestHelper().generateAd(adType);
      pushDownAd.defaultImage = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_DEFAULT_IMAGE_SIZE, creativeTestHelper().assetType.image);
      pushDownBannerBl.setInitialSize(pushDownAd);
      expect(pushDownAd.initialSize).toBe(creativeTestHelper().maxAssetSizes.MAX_DEFAULT_IMAGE_SIZE);
    }));

    it('should return banner asset size, no panels added', inject(function (pushDownBannerBl) {
      var pushDownAd = creativeTestHelper().generateAd(adType);
      pushDownAd.defaultImage = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_DEFAULT_IMAGE_SIZE, creativeTestHelper().assetType.image);
      pushDownAd.banner = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_ASSET_SIZE_RICH, creativeTestHelper().assetType.flash);
      pushDownBannerBl.setInitialSize(pushDownAd);
      expect(pushDownAd.initialSize).toBe(creativeTestHelper().maxAssetSizes.MAX_ASSET_SIZE_RICH);
    }));

    it('should return banner asset size + default panel size', inject(function (pushDownBannerBl) {
      var pushDownAd = creativeTestHelper().generateAd(adType);
      pushDownAd.panelsSettings = {autoExpandDefaultPanel: true};
      pushDownAd.defaultImage = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_DEFAULT_IMAGE_SIZE, creativeTestHelper().assetType.image);
      pushDownAd.banner = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_ASSET_SIZE_RICH, creativeTestHelper().assetType.flash);
      creativeTestHelper().addPanels(pushDownAd, 3);
      pushDownAd.panels[0].defaultPanel = true;
      pushDownBannerBl.setInitialSize(pushDownAd);
      expect(pushDownAd.initialSize).toBe(creativeTestHelper().maxAssetSizes.MAX_ASSET_SIZE_RICH + pushDownAd.panels[0].size);
    }));

    it('should return banner asset size, auto expand set to false', inject(function (pushDownBannerBl) {
      var pushDownAd = creativeTestHelper().generateAd(adType);
      pushDownAd.panelsSettings = {autoExpandDefaultPanel: false};
      pushDownAd.defaultImage = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_DEFAULT_IMAGE_SIZE, creativeTestHelper().assetType.image);
      pushDownAd.banner = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_ASSET_SIZE_RICH, creativeTestHelper().assetType.flash);
      creativeTestHelper().addPanels(pushDownAd, 3);
      pushDownAd.panels[0].defaultPanel = true;
      pushDownBannerBl.setInitialSize(pushDownAd);
      expect(pushDownAd.initialSize).toBe(creativeTestHelper().maxAssetSizes.MAX_ASSET_SIZE_RICH);
    }));

    it('should return default Image size, auto expand set to true no default panel', inject(function (pushDownBannerBl) {
      var pushDownAd = creativeTestHelper().generateAd(adType);
      pushDownAd.panelsSettings = {autoExpandDefaultPanel: true};
      pushDownAd.defaultImage = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_DEFAULT_IMAGE_SIZE, creativeTestHelper().assetType.image);
      pushDownAd.banner = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_ASSET_SIZE_RICH, creativeTestHelper().assetType.flash);
      creativeTestHelper().addPanels(pushDownAd, 3);
      pushDownBannerBl.setInitialSize(pushDownAd);
      expect(pushDownAd.initialSize).toBe(creativeTestHelper().maxAssetSizes.MAX_ASSET_SIZE_RICH);
    }));

  });

});