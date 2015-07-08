/**
 * Created by liron.tagger on 2/6/14.
 */

app.service('userSettingsService', [function userSettingsService() {
  var userSettings = {
    campaign: [0, 1, 2, 3, 4, 5, 6, 7],
    placement: [0, 1, 2, 3, 4, 5, 6, 7],
    placementAd: [0,1,2,13, 5, 14, 15 ,16, 17],
    campaignsPlacementAd: [0,1,10],
    ad: [0,1,2,3,4,5,6],
    deliveryGroup: [0, 1, 3, 2],
    asset:[0,1,4,5,6,7,8,9],
    creative: [0,1,2,3,4,5,6],
    account: [0, 1, 2, 3, 4, 5],
    advertiser: [0,1,2,3, 4, 5],
    advertiserAA: [0,1,2,3,4],
    placementPackage: [0, 1, 4, 5],
    user: [0, 1, 2, 3, 4],
    brand: [0,1, 2, 3, 4, 5],
    masterAd: [0,1,2,3,4,5,6,7,8,9,10],
    site: [0,1],
    siteAccount: [1,2,3,4],
    sitesection: [0,1],
    siteSitesection: [0,1],
    advertiserAccount: [0,1,2,3,4],
    brandAdvertiserAccount: [0,1,2,3,4],
    advertiserBrand: [0,1],
    targetAudience: [0, 1, 2],
    permission: [0,1,2,3],
    permissionSet: [0,1,2],
    versaTag: [0,1,2,3,4,5,6,7],
    advertiserVtag: [0,1,2,3,4,5,6,7],
    thirdPartyTags: [0,1,2,3],
    firingConditions: [0,1,2,3],
    inStreamTemplate: [0,1,2,3,4,5,6,7,8],
    traffickingAd: [0,1,2,5],
    campaignIo: [0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    mediaIo: [0, 1,2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    strategy:[0,1,2,3,4,5]
  };

  return {
    getUserMetaData: function (type) {
      return userSettings[type] || [0, 1];
    }
  };
}]);
