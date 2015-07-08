/**
 * Created by Ofir.Fridman on 3/23/2015.
 */
'use strict';

app.service('mvFunnelTaRestService', ['EC2Restangular',
  function (EC2Restangular) {

    function getMvTaListView(campaignId,targetAudienceId,decisionIds) {

    }

    function getMvTaFlatView(campaignId,targetAudienceId) {

    }

    return {
      getMvTaListView: getMvTaListView,
      getMvTaFlatView:getMvTaFlatView
    };
  }]);
