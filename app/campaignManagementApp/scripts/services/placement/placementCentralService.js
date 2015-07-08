/**
 * Created by Ofir.Fridman on 3/19/2015.
 */
'use strict';

app.service('placementCentralService', ['enums', '$filter', 'dgPreviewHelperService', function (enums, $filter, dgPreviewHelperService) {
  var urlMap = {
    "placementId": "spa.placement.placementEdit",
    "adId": "spa.ad.adEdit"
  };

  function goToPlacementEdit(state, placementDataObject, campaignId) {
    centralGoTo(state, placementDataObject[0], campaignId, 'placementId');
  }

  function goToAdEdit(state, placementDataObject, campaignId) {
    centralGoTo(state, placementDataObject[1], campaignId, 'adId');
  }

  function centralGoTo(state, centralDataObject, campaignId, keyId) {
    var selected = $filter('filter')(centralDataObject.centralList, {isSelected: true});
    if (selected && selected.length == 1) {
      var id = selected[0].id;
      var params = {campaignId: campaignId};
      params[keyId] = id;
      state.go(urlMap[keyId], params);
    }
  }

  function disableEdit(centralSelectedList) {
    return centralSelectedList.length != 1;
  }

  function disablePreview(centralSelectedList) {
    return centralSelectedList.length < 1;
  }

  function disableDelete(centralSelectedList) {
    return centralSelectedList.length < 1;
  }

  function disablePublish(centralSelectedList) {
    var disable = centralSelectedList.length == 0;
    var placement;
    if (centralSelectedList) {
      for (var i = 0; i < centralSelectedList.length; i++) {
        placement = centralSelectedList[i];
        if (placement.status != enums.placementStatuses.getName("Enabled") && placement.status != enums.placementStatuses.getName("Published")) {
          disable = true;
          break;
        }
        if (placement["attached"]) {
          disable = false;
          break;
        }
      }
    }
    return disable;
  }

  function disableByPassIo(centralSelectedList) {
    var disable = centralSelectedList.length == 0;
    if (centralSelectedList) {
      for (var i = 0; i < centralSelectedList.length; i++) {
        if (centralSelectedList[i].status != enums.placementStatuses.getName("New") && centralSelectedList[i].status != enums.placementStatuses.getName("PendingIO")) {
          disable = true;
          break;
        }
      }
    }
    return disable;
  }

  function disableAttachButton(selectedPlacements, selectedDgs) {
    var disable = true;
    if (!!selectedPlacements && !!selectedDgs) {
      if (angular.isArray(selectedPlacements)) {
        selectedPlacements = selectedPlacements.length;
      }
      if (angular.isArray(selectedDgs)) {
        selectedDgs = selectedDgs.length;
      }
      disable = selectedPlacements < 1 || selectedDgs < 1;
    }
    return disable;
  }

  function previewAds(centralDataObject){
    var adIds = _.pluck($filter('filter')(centralDataObject.centralList, {isSelected: true}),'id');
    dgPreviewHelperService.previewAdsByDgId(adIds, true);
  }

  return {
    goToPlacementEdit: goToPlacementEdit,
    goToAdEdit: goToAdEdit,
    disableEdit: disableEdit,
    disableDelete: disableDelete,
    disablePublish: disablePublish,
    disableByPassIo: disableByPassIo,
    disableAttachButton: disableAttachButton,
    disablePreview: disablePreview,
    previewAds:previewAds
  };
}]);
