app.factory('adsService', ['$q', '$http', 'csb', 'dgConstants','mmAlertService','EC2Restangular',
  function ($q, $http, csb, dgConstants, mmAlertService, EC2Restangular) {
    var serverAds = EC2Restangular.all('ads');
    var factory = {},
      baseUrl = csb.config.baseApiUrl + 'Ad';

    var use_hardcoded_data = false;

    /***
     **** TEST DATA: DONT FORGET TO REMOVE THIS ARRAY ONCE THE WEBSERVICE STARTED TO RETURN DATA PROPERLY.
     ***/
    var TEST = {};
    TEST.allAds = [{
      AdFormatType: "Standard Banner",
      AdID: 1404450,
      AdName: "Ad1_CSB",
      AdSize: 1621
    }];

    /**
     * Mirrors the API call that gets the ads for a given
     * delivery group
     * @param {[type]} DeliveryGroupID [description]
     */
    factory.GetAdsUnderDeliveryGroup = function (DeliveryGroupID) {
      var d = $q.defer();

      $http({
        url: baseUrl + '/Ads/',
        method: 'GET',
        params: {
          DeliveryGroupID: DeliveryGroupID
        }
      }).success(function (response) {
        var status = response.ResponseStatus;
        var statusMessage = response.StatusMessage;

        // status 1 means request succeeded
        // if (status === 1) {
        // this is the array we are after
        factory.allAds = response.AdsInfoList;
        d.resolve(factory.allAds);
        // }
      }).error(function () {
        d.reject('there was an error while calling the api to get the Ads for this DG.');
      });

      return d.promise;
    }

    factory.MasterAdsByCampaign = function (CampaignID) {
      var d = $q.defer();

      $http({
        url: baseUrl + '/MasterAdsByCampaign/',
        method: 'GET',
        params: {
          campaignID: CampaignID
        }
      }).success(function (response) {

        // console.log('masterAds response: ', response);

        factory.MasterAds = response.MasterAdsList;

        d.resolve(factory.MasterAds);
      }).error(function (error) {

        d.reject('there was an error while calling the api to get the Ads for this DG.');
        console.log('there was an error while calling the api to get the Ads for this DG.');

      });

      return d.promise;
    };

    factory.getMasterAdsByCampId = function () {
      var deferred = $q.defer();
      serverAds.withHttpConfig({cache: false}).getList({
        "campaignId": csb.params.campaignID,
        "adType": dgConstants.strMasterAd_Rest_API_Filter
      }).then(function (ads) {
        deferred.resolve(ads);
      }, function () {
        mmAlertService.addError("Server error. Please try again later");
        deferred.reject();
      });
      return deferred.promise;
    }

    return factory;
  }
]);
