/**
 * Created by roi.levy on 11/25/14.
 */
'use strict';
describe('Service: matchingAlgorithm', function () {

  // load the controller's module
  beforeEach(module('MediaMindApp'));

  describe('matchByName', function () {

    it('should match 1 flash asset "TestTestName.swf" to the image "TestTestName.jpg" by name', inject(function (matchingAlgorithm) {
      var image = creativeModels().imageAsset;
      var flashAssets = [];
      var numOfFlashAssets = randomGenerator().randInteger(1, 5);
      for (var i = 0; i < numOfFlashAssets; i++) {
        flashAssets.push(creativeModels().flashAsset);
      }
      image.title = "TestTestName.jpg";
      var randomIndex = randomGenerator().randInteger(1, flashAssets.length);
      flashAssets[randomIndex - 1].title = "TestTestName.swf";
      var matchingFlashAsset = matchingAlgorithm.matchAssetsByName(image, flashAssets);
      expect(matchingFlashAsset.length).toBe(1);
    }));

    it('should  match the image asset to one flash asset', inject(function (matchingAlgorithm) {

      var image = creativeModels().imageAsset;
      image.title = "corona_boxeo_300x250_1_en.jpg";
      var flashAssets = [];
      var numOfFlashAssets = randomGenerator().randInteger(2, 5);
      for (var i = 1; i < numOfFlashAssets; i++) {
        var flashAsset = creativeModels().flashAsset;
        flashAsset.title = "corona_boxeo_300x250_" + i + "_en.swf";
        flashAssets.push(flashAsset);
      }
      var matchingFlashAsset = matchingAlgorithm.matchAssetsByName(image, flashAssets);
      expect(matchingFlashAsset.length).toBe(1);
    }));

    it('should not match the image asset to any flash asset', inject(function (matchingAlgorithm) {

      var image = creativeModels().imageAsset;
      image.title = "corona_boxeo_300x250_1_en.jpg";
      var flashAssets = [];
      var numOfFlashAssets = randomGenerator().randInteger(2, 5);
      for (var i = 1; i < numOfFlashAssets; i++) {
        var flashAsset = creativeModels().flashAsset;
        flashAsset.title = "corona_boxeo_728x90_" + i + "_en.swf";
        flashAssets.push(flashAsset);
      }
      var matchingFlashAsset = matchingAlgorithm.matchAssetsByName(image, flashAssets);
      expect(matchingFlashAsset.length).toBe(0);
    }));

  });

  describe('matchBySize', function () {
    it('should  match the image asset to one flash asset', inject(function (matchingAlgorithm, assetsLibraryService) {

      var image = creativeModels().imageAsset;
      image.height = 100;
      image.width = 100;
      image.dimension = assetsLibraryService.getAssetDimension(image);
      var flashAssets = [];
      var numOfFlashAssets = randomGenerator().randInteger(2, 5);
      for (var i = 1; i < numOfFlashAssets; i++) {
        var flashAsset = creativeModels().flashAsset;
        flashAsset.height = i * 100;
        flashAsset.width = i * 100;
        flashAsset.dimension = assetsLibraryService.getAssetDimension(flashAsset);
        flashAssets.push(flashAsset);
      }
      var matchingFlashAsset = matchingAlgorithm.matchAssetsByDimensions(image, flashAssets);
      expect(matchingFlashAsset.length).toBe(1);
    }));

    it('should not match the image asset to any flash asset', inject(function (matchingAlgorithm, assetsLibraryService) {

      var image = creativeModels().imageAsset;
      image.height = 100;
      image.width = 100;
      image.dimension = assetsLibraryService.getAssetDimension(image);
      var flashAssets = [];
      var numOfFlashAssets = randomGenerator().randInteger(2, 5);
      for (var i = 1; i < numOfFlashAssets; i++) {
        var flashAsset = creativeModels().flashAsset;
        flashAsset.title = "corona_boxeo_728x90_" + i + "_en.swf";
        flashAssets.push(flashAsset);
      }
      var matchingFlashAsset = matchingAlgorithm.matchAssetsByDimensions(image, flashAssets);
      expect(matchingFlashAsset.length).toBe(0);
    }));
  });

});