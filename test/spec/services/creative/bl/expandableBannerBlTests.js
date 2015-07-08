/**
* Created by roi.levy on 10/12/14.
*/
'use strict';
describe('Service: expandableBannerBlTest', function () {

  // load the controller's module
  beforeEach(module('MediaMindApp'));

  var adType = "expandableBanner";

  //base ad validator methods
  describe('initialSizeCalculation', function(){

    it('should return default image size, no other assets', inject(function(expandableBannerBl) {
      var expandableAd = creativeTestHelper().generateAd(adType);
      expandableAd.defaultImage = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_DEFAULT_IMAGE_SIZE, creativeTestHelper().assetType.image);
      expandableBannerBl.setInitialSize(expandableAd);
      expect(expandableAd.initialSize).toBe(creativeTestHelper().maxAssetSizes.MAX_DEFAULT_IMAGE_SIZE);
    }));

    it('should return banner asset size, no panels added', inject(function(expandableBannerBl) {
      var expandableAd = creativeTestHelper().generateAd(adType);
      expandableAd.defaultImage = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_DEFAULT_IMAGE_SIZE, creativeTestHelper().assetType.image);
      expandableAd.banner = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_ASSET_SIZE_RICH, creativeTestHelper().assetType.flash);
      expandableBannerBl.setInitialSize(expandableAd);
      expect(expandableAd.initialSize).toBe(creativeTestHelper().maxAssetSizes.MAX_ASSET_SIZE_RICH);
    }));

    it('should return banner asset size + default panel size', inject(function(expandableBannerBl) {
      var expandableAd = creativeTestHelper().generateAd(adType);
      expandableAd.panelsSettings = {autoExpandDefaultPanel: true};
      expandableAd.defaultImage = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_DEFAULT_IMAGE_SIZE, creativeTestHelper().assetType.image);
      expandableAd.banner = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_ASSET_SIZE_RICH, creativeTestHelper().assetType.flash);
      creativeTestHelper().addPanels(expandableAd, 3);
      expandableAd.panels[0].defaultPanel = true;
      expandableBannerBl.setInitialSize(expandableAd);
      expect(expandableAd.initialSize).toBe(creativeTestHelper().maxAssetSizes.MAX_ASSET_SIZE_RICH + expandableAd.panels[0].size);
    }));

    it('should return banner asset size, auto expand set to false', inject(function(expandableBannerBl) {
      var expandableAd = creativeTestHelper().generateAd(adType);
      expandableAd.panelsSettings = {autoExpandDefaultPanel: false};
      expandableAd.defaultImage = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_DEFAULT_IMAGE_SIZE, creativeTestHelper().assetType.image);
      expandableAd.banner = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_ASSET_SIZE_RICH, creativeTestHelper().assetType.flash);
      creativeTestHelper().addPanels(expandableAd, 3);
      expandableAd.panels[0].defaultPanel = true;
      expandableBannerBl.setInitialSize(expandableAd);
      expect(expandableAd.initialSize).toBe(creativeTestHelper().maxAssetSizes.MAX_ASSET_SIZE_RICH);
    }));

    it('should return default Image size, auto expand set to true no default panel', inject(function(expandableBannerBl) {
      var expandableAd = creativeTestHelper().generateAd(adType);
      expandableAd.panelsSettings = {autoExpandDefaultPanel: true};
      expandableAd.defaultImage = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_DEFAULT_IMAGE_SIZE, creativeTestHelper().assetType.image);
      expandableAd.banner = creativeTestHelper().generateAdAsset(creativeTestHelper().MAX_ASSET_SIZE_RICH, creativeTestHelper().assetType.flash);
      creativeTestHelper().addPanels(expandableAd, 3);
      expandableBannerBl.setInitialSize(expandableAd);
      expect(expandableAd.initialSize).toBe(creativeTestHelper().maxAssetSizes.MAX_ASSET_SIZE_RICH );
    }));

  });

});
