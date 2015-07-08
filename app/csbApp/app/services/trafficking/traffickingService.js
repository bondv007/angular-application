/**
 * Created by Ofir.Fridman on 2/8/2015.
 */
'use strict';

app.service('traffickingService', ['$rootScope', 'mmAlertService', 'deliveryGroups', '$q', 'findReplaceAdsInDGsService', '$filter', 'traffickingConst', 'adsService', 'mmModal',
  function ($rootScope, mmAlertService, deliveryGroups, $q, findReplaceAdsInDGsService, $filter, traffickingConst, adsService, mmModal) {
    var buttonsCacheByName = {};
    function isMMNext() {
      return $rootScope.isMMNext == undefined;
    }

    function isMM2() {
      return !isMMNext();
    }

    function getCampaignAdsAndDgs() {
      var promises = [];
      var defer = $q.defer();
      promises.push(deliveryGroups.getCampaignDeliveryGroups());
      promises.push(adsService.getMasterAdsByCampId());

      $q.all(promises).then(function (responses) {
        defer.resolve(responses);
      }, function (err) {
        mmAlertService.addError("Server error. Please try again later");
        var error = err.data.error;
        for (var i = 0; i < error.length; i++) {
          for (var j = 0; j < error[i].errors.length; j++) {
            mmAlertService.addError(error[i].errors[j]["innerMessage"]);
          }
        }
      });
      return defer.promise;
    }

    function replaceAdsInDG() {
      getCampaignAdsAndDgs().then(function (results) {
        var deliveryGroups = results[0];
        var ads = results[1];
        if (isAtListTowAdsAndDgWithOneAd(ads, deliveryGroups)) {
          mmAlertService.closeAll();
          var modalInstance = mmModal.open({
            templateUrl: 'infra/directives/views/template/wizard/modalWizard.html',
            controller: 'findReplaceAdsInDGCtrl',
            title: $filter("translate")('Replace Master Ads in Delivery Groups'),
            modalWidth: 1032,
            bodyHeight: 700,
            resolve: {
              ads: function () {
                return ads;
              },
              dgs: function () {
                return deliveryGroups;
              }
            },
            discardButton: {name: "Close", funcName: "cancel"}
          });
          modalInstance.result.then(function () {
            afterReplaceAdInDGClose();
          }, function () {
            afterReplaceAdInDGClose();
          });
        }
      });
    }

    function afterReplaceAdInDGClose(){
      mmAlertService.closeError();
      $rootScope.isDirtyEntity = false;
    }

    function isAtListTowAdsAndDgWithOneAd(ads,deliveryGroups) {
      var valid = true;
      if (!isAtListOneDgExist(deliveryGroups)) {
        mmAlertService.addWarning("To replace master ads, at least one delivery group with one master ad must be available.");
        valid = false;
      }
      if (!isAtListTwoAdsExist(ads)) {
        mmAlertService.addWarning("To replace master ads, at least two master ads must be available. ");
        valid = false;
      }
      var assignAdsToDGs = findReplaceAdsInDGsService.filterAttachedAds(ads, deliveryGroups);
      if (assignAdsToDGs.attachedAds.length == 0) {
        mmAlertService.addWarning("To replace master ads, at least one delivery group with one master ad must be available.");
        valid = false;
      }
      return valid
    }

    function isAtListOneDgExist(deliveryGroups) {
      return deliveryGroups && deliveryGroups.length > 0;
    }

    function isAtListTwoAdsExist(ads) {
      return ads && ads.length > 1;
    }

    function disableEnableAssignButton(funnelButtons, newSelectedAds, dgs) {
      var selectedDgs = $filter('filter')(dgs, {selected: true});
      var assignButton = getButtonByName(funnelButtons, traffickingConst.strAssign);
      assignButton.disable = !((newSelectedAds > 1 && selectedDgs.length > 0) || (newSelectedAds > 0 && selectedDgs.length > 1));
    }

    function getButtonByName(funnelButtons, name) {
      var button;
      if (buttonsCacheByName[name]) {
        button = buttonsCacheByName[name];
      }
      else {
        button = _.find(funnelButtons, function (button) {
          return button.name == name;
        });
        buttonsCacheByName[name] = button;
      }
      return button;
    }

    function disableButton(funnelButtons, name){
      var button = getButtonByName(funnelButtons, name);
      if(button){
        button.disable = true;
      }
    }

    return {
      isMM2: isMM2,
      replaceAdsInDG: replaceAdsInDG,
      disableEnableAssignButton: disableEnableAssignButton,
      disableButton: disableButton
    }
  }]);
