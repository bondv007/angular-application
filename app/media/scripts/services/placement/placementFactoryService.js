/**
 * Created by Ofir.Fridman on 3/25/2015.
 */
'use strict';

app.service('placementFactoryService', ['enums', 'placementConstants', function (enums, placementConstants) {

  function create(type) {
    var placement = {};
    switch (type) {
      case placementConstants.strInBanner:
        placement = {};
        break;
      case placementConstants.strTrackingOnly:
        placement = {};
        break;

      case placementConstants.strOutOfBanner:
        placement = {};
        break;
      case placementConstants.strInStreamVideo:
        placement = {};
        break;
      case placementConstants.strInStreamVideoTracking:
        placement = {};
        break;
      default:
        placement = {};
    }
    return placement;
  }

  function initPlacementObject(campaignId) {
    return {
      type: placementConstants.strInBannerPlacement,
      id: null,
      name:"",
      placementType: placementConstants.strInBanner,
      campaignId: campaignId,
      bannerSize: {type: "APIBannerSize",width: null, height: null},
      status:placementConstants.placementStatuses.new,
      packageId: null,
      accountId: null,
      siteId: null,
      sectionId: null,
      servingAndCostData: {
        mediaServingData: {
          units: null,
          hardStopMethod: 'KEEP_SERVING_AS_USUAL',
          startDate: null,
          endDate: null
        },
        mediaCostData: {
          type: "MediaCost",
          costModel: "CPM",
          rate: null,
          orderedUnits: null,
          customInteraction: null,
          conversionId: null,
          interactionId: null,
          ignoreOverDelivery: false
        },
        placementLevel: true
      },
      ads: null,
      tagBuilderParams:{
        type: "TagBuilderParams",
        id: null,
        clientRefId: null,
        uiPermissions: null,
        version: null,
        placementId: null,
        builderTagTypes: null,
        siteServing: {
          secureServingProtocol: "HTTP",
          lineIdToken: null,
          customToken: null,
          serverDomainName: "",
          cacheBustingToken: null,
          publisherCustomParam: null,
          minZIndex: null,
          impTracking: null,
          clickTracking: null,
          escapeNoScript: false,
          generateMultipleTags: true,
          generateIMGTag: false,
          firstPartyAdIdToken: null
        }
      },
      trackingAds: []
    };
  }

  return {
    create: create,
    initPlacementObject: initPlacementObject
  };
}]);
