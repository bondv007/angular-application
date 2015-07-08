/**
 * Created by Ofir.Fridman on 11/30/14.
 */
'use strict';

app.service('placementRest', ['EC2Restangular', '$q', 'mmAlertService','mmModal', function (EC2Restangular, $q, mmAlertService, mmModal) {

  function getSiteContacts(campaignId, siteId) {
    var deferred = $q.defer();
    var serverSites = EC2Restangular.all('sites/global');
    serverSites.withHttpConfig({cache: false}).get(siteId).then(function (site) {
      var contacts_service = EC2Restangular.all('campaigns');
      var selectedContacts = [];
      var contacts = [];
      var availableSiteContacts = [];

      if (site.siteContacts && site.siteContacts.siteContacts) {

        availableSiteContacts = site.siteContacts.siteContacts;

        for (var i = 0; i < availableSiteContacts.length; i++) {
          contacts.push({
            id: availableSiteContacts[i].id,
            contactId: availableSiteContacts[i].id,
            name: availableSiteContacts[i].name,
            type: "DefaultSiteContact",
            siteId: siteId
          });
        }
      }

      contacts_service.one(campaignId).one("siteContacts").one(siteId).withHttpConfig({cache: false}).get().then(function (campaignContacts) {
        for (var i = 0; i < campaignContacts.length; i++) {
          for (var j = 0; j < availableSiteContacts.length; j++){
            if (campaignContacts[i].contactId == availableSiteContacts[j].id){
              selectedContacts.push(availableSiteContacts[j].id);
            }
          }
        }

        var siteContacts = {
          "siteContacts": contacts,
          "selectedContacts": selectedContacts
        };

        deferred.resolve(siteContacts);
      });

    }, function (error) {
      if (error.data.error === undefined) {
        mmAlertService.addError("Server error. Please try again later");
      } else {
        mmAlertService.addError(error.data.error);
      }
      deferred.reject();
    });
    return deferred.promise;
  }

  function updateAdvertiserSiteContacts(placement) {

    var serverAdvertisers = EC2Restangular.all('campaigns').one(placement.campaignId).all('siteContacts').one(placement.siteId);
    var advertiserSiteContacts = [];
    var request = {};
    for(var i = 0;i < placement.siteContacts.selectedContacts.length;i++){
      var contact = {};
      contact.type = "DefaultSiteContact";
      contact.siteId = placement.siteId;
      contact.contactId = placement.siteContacts.selectedContacts[i];
      advertiserSiteContacts.push(contact);
    }
    request.entities = advertiserSiteContacts;
    serverAdvertisers.customPUT(request,"?updateAdvertiser=true").then(function(){
      mmAlertService.addSuccess("Update advertiser site contacts done successfully.");
    }, function (error) {
      if (error.data.error === undefined) {
        mmAlertService.addError("Server error. Please try again later");
      } else {
        mmAlertService.addError(error.data.error);
      }
    });
  }

  function deletePlacements(selectedPlacements, centralDataObject) {
    for (var i = 0; i < selectedPlacements.length; i++) {
      var p = selectedPlacements[i];
      p.remove().then(function () {
        centralDataObject.refreshCentral();
      });
    }
  }

  // ********** Enable Serving ***********
  var placements = null;

  function enableServing(selectedPlacements) {

    var enableServingMessage = selectedPlacements.length == 1 ? "Are you sure you'd like to bypass the IO and enable serving for the selected placement?" : "Are you sure you'd like to bypass the IO and enable serving for the selected placements?";
    var enableServingTitle = selectedPlacements.length == 1 ? "Placement Bypass IO" : "Placements Bypass IO";
    placements = selectedPlacements;

    var modalInstance = mmModal.openAlertModal(enableServingTitle,enableServingMessage);
    return modalInstance.result.then(processEnableServing, processEnableServingError);
  }

  function processEnableServing(){
    var serverPlacements = EC2Restangular.all('placements').one('enableServing');
    var placementIds = [];
    for (var i = 0; i < placements.length; i++) {
      var _placement = placements[i];
      placementIds.push(_placement.id);
    }
    return serverPlacements.customPUT(placementIds).then(function(){
      mmAlertService.addSuccess("The IO was successfully bypassed");
    });
  }

  function processEnableServingError(error){
    mmAlertService.addError(error.data.error);
  }
  // ********** Enable Serving ***********

  return {
    getSiteContacts: getSiteContacts,
    updateAdvertiserSiteContacts: updateAdvertiserSiteContacts,
    deletePlacements:deletePlacements,
    enableServing:enableServing
  };
}]);
