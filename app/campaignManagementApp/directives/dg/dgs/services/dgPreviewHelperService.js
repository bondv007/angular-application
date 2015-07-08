/**
 * Created by Ofir.Fridman on 12/17/14.
 */
'use strict';
app.service('dgPreviewHelperService', ['csb', 'dgHelper', '$state', function (csb, dgHelper, $state) {
  function previewAdsByDgId(entityIds, isAds) {
    var entityIdsArr = [];
    if (angular.isArray(entityIds)) {
      entityIdsArr = entityIds;
    }
    else {
      entityIdsArr.push(entityIds);
    }
    var previewAdsUrl;
    if (dgHelper.isMM2()) {
      var entityIdsKey = isAds ? "&adids=" : "&dgids=";
      previewAdsUrl = csb.config.basePreviewUrl + entityIdsKey + entityIdsArr.join("|");
    }
    else {
      var params = isAds ? {adIds: entityIdsArr.join("|")} : {dgids: entityIdsArr.join("|")};
      previewAdsUrl = $state.href("csbAdPreview", params);
    }
    window.open(previewAdsUrl, "_blank");
  }

  return {
    previewAdsByDgId: previewAdsByDgId
  }
}]);
