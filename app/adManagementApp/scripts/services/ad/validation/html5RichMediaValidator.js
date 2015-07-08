/**
 * Created by roi.levy on 10/2/14.
 */
'use strict';
app.factory('html5RichMediaValidator', ['creativeConsts', 'adValidator', function(creativeConsts, adValidator) {

  var html5RichValidator = Object.create(adValidator);

  html5RichValidator.validateMaxManifestItemSize = function(asset){

    if(!asset.archiveManifest){
      return false;
    }

    if(asset.archiveManifest.length === 0){
      return false;
    }

    var overSizedFile = _.find(asset.archiveManifest, function(manifestFile){
      return manifestFile.size > creativeConsts.MAX_ASSET_SIZE_RICH;
    });

    return !overSizedFile;
  }

  return html5RichValidator;

}]);