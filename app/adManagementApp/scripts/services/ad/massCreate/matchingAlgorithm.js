/**
 * Created by roi.levy on 11/24/14.
 */
'use strict';
app.service('matchingAlgorithm',[function(){

    var matchAssetsByName = function(assetToMatch, assetPool){
      var assetName = assetToMatch.title.substring(0, assetToMatch.title.indexOf('.'));
      return _.filter(assetPool, function(asset)
      {
        var currentName = asset.title.substring(0, asset.title.indexOf('.'));
        return currentName === assetName;
      });
    }

    var matchAssetsByDimensions = function matchAssetsByDimensions(assetToMatch, assetPool){
        var matchingAssets = [];
        if(!assetToMatch.width || !assetToMatch.height){
            return  matchingAssets;
        }
        matchingAssets =  _.filter(assetPool, function(asset){
            return (asset.width === assetToMatch.width && asset.height === assetToMatch.height);
        });
        return matchingAssets;
    }

    var matchFlashAssetToImageAsset = function(imageAsset, flashAssets){
      var matchingBanners = matchAssetsByName(imageAsset, flashAssets);
      if(matchingBanners.length === 0){
          matchingBanners = matchAssetsByDimensions(imageAsset, flashAssets);
      }
      return matchingBanners;
    }

    var matchImageAssetToFlash = function(flashAsset, imageAssets){
      var matchingImages = matchAssetsByName(flashAsset, imageAssets);
      if(matchingImages.length === 0){
          matchingImages = matchAssetsByDimensions(flashAsset, imageAssets);
      }
      return matchingImages;
    }

    return {
      matchAssetsByName: matchAssetsByName,
      matchAssetsByDimensions: matchAssetsByDimensions,
      matchFlashAssetToImageAsset: matchFlashAssetToImageAsset,
      matchImageAssetToFlash: matchImageAssetToFlash
    }

  }]);
