/**
* Created by roi.levy on 11/24/14.
*/
'use strict';
describe('Service: massCreateLogic', function () {

  // load the controller's module
  beforeEach(module('MediaMindApp'));

  var errors = {};

  it('should create an ad with default image for each image asset', inject(function(massCreateLogic) {
    var images  = [];
    var flashAssets = [];
    var numOfImages = randomGenerator().randInteger(1, 10);
    for (var i = 0; i < numOfImages; i++) {
      images.push(creativeModels().imageAsset);
    }
    var ads = massCreateLogic.createAdsFromImages(images, flashAssets, 'XXXY', creativeTestHelper().adFormatTypes.standardBanner.format);
    expect(ads.length).toBe(numOfImages);
  }));

  it('should create an ad with banner for each flash asset', inject(function(massCreateLogic) {
        var images  = [];
        var flashAssets = [];
        var numOfFlash = randomGenerator().randInteger(1, 10);
        for (var i = 0; i < numOfFlash; i++) {
            flashAssets.push(creativeModels().flashAsset);
        }
        var ads = massCreateLogic.createAdsFromFlashAssets(images, flashAssets, 'XXXY', creativeTestHelper().adFormatTypes.standardBanner.format);
        expect(ads.length).toBe(numOfFlash);
    }));

  it('should create an ad with banner and the same default image for each flash asset and', inject(function(massCreateLogic) {
        var images  = [creativeModels().imageAsset];
        var flashAssets = [];
        var numOfFlash = randomGenerator().randInteger(1, 10);
        for (var i = 0; i < numOfFlash; i++) {
            flashAssets.push(creativeModels().flashAsset);
        }
        var ads = massCreateLogic.createAdsFromFlashAssets(images, flashAssets, 'XXXY', creativeTestHelper().adFormatTypes.standardBanner.format);
        expect(ads.length).toBe(numOfFlash);
        for (var i = 0; i < ads.length; i++) {
            var ad = ads[i];
            expect(ad.defaultImage.assetId).toBe(images[0].id);
        }
    }));

});