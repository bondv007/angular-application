/**
 * Created by Ofir.Fridman on 3/25/2015.
 */
'use strict';
app.service('placementRestService', ['mmRest', 'mmPermissions', 'entityMetaData', '$q', 'placementHelperService','placementConstants','mmAlertService',
  function (mmRest, mmPermissions, entityMetaData, $q, placementHelperService,placementConstants,mmAlertService) {

    function getPlacementData(campaignId) {
      var placementData = {};
      var defer = $q.defer();
      var promises = [];
      promises.push(getSites());
      promises.push(mmRest.campaign(campaignId).get());
      promises.push(getCampaignPackages(campaignId));

      $q.all(promises).then(function (responses) {
        placementData.sites = responses[0];
        var campaign = responses[1];
        placementData.packages = responses[2];
        placementData.campaignName = campaign.name;
        placementData.accountId = campaign.relationsBag.parents.account.id;
        placementData.selectedPackages = [];
        placementData.siteContacts = [];
        placementData.sections = [];
        placementData.selectedContacts = [];
        placementData.placementTypes = placementHelperService.getSupportedPlacementTypes();
        placementData.dummyPackage = entityMetaData.placementPackage.defaultJson;
        mmRest.advertiser(campaign.relationsBag.parents.advertiser.id).get().then(function (advertiser) {
          placementData.displayAdvertiserLink = mmPermissions.hasPermissionByEntity(advertiser, entityMetaData.advertiser.permissions.entity);
          defer.resolve(placementData);
        });
      },serverError);
      return defer.promise;
    }

    function getSites() {
      var defer = $q.defer();
      mmRest.sitesGlobal.getList().then(function (sites) {
        defer.resolve(sites);
      },serverError);
      return defer.promise;
    }

    function getSitesAndSiteContacts(selectedSiteId,campaignId){
      var defer = $q.defer();
      var promises = [];
      promises.push(getSiteSections(selectedSiteId));
      promises.push(getSiteContacts(campaignId,selectedSiteId));

      $q.all(promises).then(function (responses) {
       defer.resolve(responses);
      },serverError);

      return defer.promise;
    }

    function getSiteSections(selectedSiteId) {
      var defer = $q.defer();
      mmRest.sitesSectionsGlobal.getList({'siteId': selectedSiteId}).then(function (sections) {
        defer.resolve(sections);
      },serverError);
      return defer.promise;
    }

    function getSiteContacts(campaignId, selectedSiteId) {
      var deferred = $q.defer();
      mmRest.siteGlobal(selectedSiteId).withHttpConfig({cache: false}).get().then(function(site){
        var uiSiteContacts = {
          siteContacts: [],
          selectedContacts: []
        };
        if (site.siteContacts && site.siteContacts.siteContacts) {
          var siteContacts = createUiSiteContacts(site.siteContacts.siteContacts,selectedSiteId);
          siteContacts.forEach(function(siteContact){
            if(!angular.isFunction(siteContact)){
              uiSiteContacts.siteContacts.push(siteContact);
            }
          });
          var selectedContacts = [];

          mmRest.campaign(campaignId).one("siteContacts").one(selectedSiteId).withHttpConfig({cache: false}).get().then(function (campaignContacts) {
            campaignContacts.forEach(function(campaignContact){
              siteContacts.forEach(function(siteContact){
                if (campaignContact.contactId == siteContact.id){
                  selectedContacts.push(siteContact.id);
                }
              });
            });

            uiSiteContacts.selectedContacts = selectedContacts;
            deferred.resolve(uiSiteContacts);
          });
        }
        else{
          deferred.resolve(uiSiteContacts);
        }
      },serverError);
      return deferred.promise;
    }

    function createUiSiteContacts(siteContacts,selectedSiteId){
      var siteContactsList = [];
      siteContacts.forEach(function(siteContact){
        siteContactsList.push({
          id: siteContact.id,
          contactId: siteContact.id,
          name: siteContact.name,
          type: placementConstants.strDefaultSiteContact,
          siteId: selectedSiteId
        },serverError);
      });
      return siteContactsList;
    }

    function restCopy(entity) {
      return mmRest.EC2Restangular.copy(entity);
    }

    function setAdvertiserSiteContacts(placementEdit) {
      if(placementEdit.siteContacts.selectedContacts){
        var serverAdvertisers = mmRest.campaignSiteContacts(placementEdit.campaignId,placementEdit.siteId);
        var advertiserSiteContacts = [];
        var request = {};
        var selectedContacts = placementEdit.siteContacts.selectedContacts;
        selectedContacts.forEach(function(selectedContact){
          var contact = {};
          contact.type = placementConstants.strDefaultSiteContact;
          contact.siteId = placementEdit.siteId;
          contact.contactId = selectedContact;
          advertiserSiteContacts.push(contact);
        });
        request.entities = advertiserSiteContacts;
        serverAdvertisers.customPUT(request,"?updateAdvertiser=true").then(function(){
          mmAlertService.addSuccess("Update advertiser site contacts done successfully.");
        },serverError);
      }
    }

    function getDimensions(placementEdit){
      var defer = $q.defer();
      if(placementHelperService.isInBannerPlacement(placementEdit)){
        mmRest.bannerSizes.getList().then(function(bannerSize){
          var dimensions = [];
          var bannerSizeIndex = {};
          bannerSize.forEach(function(item){
            var name = item['width'] + 'X' + item['height'];
            if(!bannerSizeIndex[name]){
              bannerSizeIndex[name] = name;
              dimensions.push({id: name, name: name});
            }
          });
          defer.resolve(dimensions);
        },serverError);
      }
      return defer.promise;
    }

    function getCampaignPackages(campaignId){
      var defer = $q.defer();
      mmRest.placementPackages.getList({campaignId: campaignId}).then(function(packages){
        var allPackages = [];
        var packageIndex = {};
        var packageBySiteAndCampaignIndex = {};
        var dummyPackage = {id:null,name:"None"};
        allPackages.push(dummyPackage);
        packages.forEach(function(packageItem){
          allPackages.push(packageItem);
          packageIndex[packageItem.id] = packageItem;
          var key = packageItem.siteId + '_' + packageItem.campaignId;
          if(!packageBySiteAndCampaignIndex[key]){
            packageBySiteAndCampaignIndex[key] = [];
          }
          packageBySiteAndCampaignIndex[key].push(packageItem);
        });
        defer.resolve(allPackages);
      },serverError);
      return defer.promise;
    }


    function serverError(response){
      mmAlertService.addError(response);
      //QAAuoSite83f50b52-a773-49eb-88e7-d17c22384e1a
    }

    return {
      getPlacementData: getPlacementData,
      getSiteSections: getSiteSections,
      restCopy: restCopy,
      getSitesAndSiteContacts:getSitesAndSiteContacts,
      setAdvertiserSiteContacts:setAdvertiserSiteContacts,
      getDimensions:getDimensions,
      getCampaignPackages:getCampaignPackages
    };
  }]);
