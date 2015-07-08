'use strict';

app.service('campaignService', ['EC2Restangular', function (EC2Restangular) {
    var serverCampaigns = EC2Restangular.all('campaigns');

    return {
      getCampaigns: function () {
        return serverCampaigns.getList();
      }
    };
}]);

