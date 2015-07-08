/**
 * Created by Ofir.Fridman on 1/19/2015.
 */
'use strict';
app.factory( 'deliveryGroups', [ 'csb', 'EC2Restangular', '$q','mmAlertService','serverErrorMapper', 'restPaths',
  function( csb, EC2Restangular, $q, mmAlertService, serverErrorMapper, restPaths ) {
    var pub = {};
    var deliveryGroups = EC2Restangular.all(restPaths[csb.config.env].deliveryGroups);

    pub.getCampaignDeliveryGroups = function () {
      var deferred = $q.defer();
      deliveryGroups.withHttpConfig({cache: false}).getList({"campaignId": csb.params.campaignID}).then(function (dgs) {
        deferred.resolve(dgs);
      }, function () {
        mmAlertService.addError("Server error. Please try again later");
        deferred.reject();
      });
      return deferred.promise;
    };

    pub.getTargetAudienceDeliveryGroups = function (targetAudienceId) {
      var deferred = $q.defer();
      deliveryGroups.withHttpConfig({cache: false}).getList({"campaignId": csb.params.campaignID, targetAudienceId: targetAudienceId}).then(function (dgs) {
        deferred.resolve(dgs);
      }, function () {
        mmAlertService.addError("Server error. Please try again later");
        deferred.reject();
      });
      return deferred.promise;
    };

    pub.saveDeliveryGroups = function saveDeliveryGroups(putDgs, postDgs) {
      var deferred = $q.defer();
      var promises = [];
      if (putDgs.length > 0) {
        promises.push(deliveryGroups.customPUT({entities:putDgs}));
      }
      if (postDgs.length > 0) {
        promises.push(deliveryGroups.customPOST({entities:postDgs}));
      }
      $q.all(promises).then(function (responses) {
        mmAlertService.addSuccess("dgSaveSuccess");
        var dgs;
        if (responses.length == 2) {
          dgs = responses[0].concat(responses[1]);
        }
        else {
          dgs = responses[0];
        }
        deferred.resolve(dgs);
      }, function (err) {
        var displayServerError = true;
        var error = err.data.error;
        if (error) {
          for (var i = 0; i < error.length; i++) {
            for (var j = 0; j < error[i].errors.length; j++) {
              var errText = error[i].errors[j]["innerMessage"];
              for (var key in serverErrorMapper) {
                if (errText.indexOf(key) > -1) {
                  if(serverErrorMapper.hasOwnProperty(key)){
                    errText = serverErrorMapper[key];
                  }
                }
              }
              mmAlertService.addError(errText);
              displayServerError = false;
            }
          }
        }

        if (displayServerError) {
          mmAlertService.addError("Server error. Please try again later");
        }
      });

      return deferred.promise;
    };

    return pub;
  }
]);
