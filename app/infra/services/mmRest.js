/**
 * Created by rotem.perets on 11/16/14.
 */
app.factory('mmRest', ['EC2Restangular', 'entityMetaData',
    function mmRestFactory(EC2Restangular, entityMetaData) {
      var accounts = EC2Restangular.all(entityMetaData.account.restPath);
      var account = function(id){return EC2Restangular.one(entityMetaData.account.restPath, id)};
      var accountsGlobal = EC2Restangular.all(entityMetaData.account.restPath + '/global');
      var accountGlobal = function(id){return EC2Restangular.one(entityMetaData.account.restPath + '/global', id);};
			var deleteAccounts = EC2Restangular.all(entityMetaData.account.restPath + '/delete');
      var users = EC2Restangular.all(entityMetaData.user.restPath);
      var user = function(id){return EC2Restangular.one(entityMetaData.user.restPath, id)};
			var deleteUsers = EC2Restangular.all(entityMetaData.user.restPath + '/delete');
      var globalContacts = EC2Restangular.all('users').all('globalContacts');
      var globalSizmekContacts = EC2Restangular.all('users').all('globalSizmekContacts');
			var validateUserName = EC2Restangular.all(entityMetaData.user.restPath + '/validateUserName');
      var advertisers = EC2Restangular.all(entityMetaData.advertiser.restPath);
			var advertiser = function(id){return EC2Restangular.one(entityMetaData.advertiser.restPath, id)};
			var advertisersGlobal = EC2Restangular.all(entityMetaData.advertiser.restPath + '/global');
			var deleteAdvertisers = EC2Restangular.all(entityMetaData.advertiser.restPath + '/delete');
			var brands = EC2Restangular.all(entityMetaData.brand.restPath);
      var brand = function(id){return EC2Restangular.one(entityMetaData.brand.restPath, id)};
			var deleteBrands = EC2Restangular.all(entityMetaData.brand.restPath + '/delete');
      var campaigns = EC2Restangular.all(entityMetaData.campaign.restPath);
      var campaign = function(id){return EC2Restangular.one(entityMetaData.campaign.restPath, id)};
			var deleteCampaigns = EC2Restangular.all(entityMetaData.campaign.restPath + '/delete');
      var sites = EC2Restangular.all(entityMetaData.site.restPath);
      var site = function(id){return EC2Restangular.one(entityMetaData.site.restPath, id)};
      var siteRelations = EC2Restangular.one(entityMetaData.siteRelations.restPath);
			var siteSections = EC2Restangular.all(entityMetaData.sitesection.restPath);
			var siteSection = function(id){return EC2Restangular.one(entityMetaData.sitesection.restPath, id)};
      var sitesGlobal = EC2Restangular.all(entityMetaData.site.restPath + '/global');
			var siteGlobal = function(id){return EC2Restangular.one(entityMetaData.site.restPath + '/global', id)};
      var sitesSectionsGlobal = EC2Restangular.all(entityMetaData.sitesection.restPath + '/global');
			var validationURL = EC2Restangular.all(entityMetaData.site.restPath + '/validateURL');
			var deleteSites = EC2Restangular.all(entityMetaData.site.restPath + '/delete');
			var userPermissions = EC2Restangular.one(entityMetaData.userPermissions.restPath);
      var userAdminZones = EC2Restangular.one(entityMetaData.userAdminZones.restPath);
      var searchGeo = EC2Restangular.one('search/geo');
      var placements = EC2Restangular.all(entityMetaData.placement.restPath);
      var placement = function(id){return EC2Restangular.one(entityMetaData.placement.restPath, id)};
      var placementAd = EC2Restangular.all(entityMetaData.placementAd.restPath);
      var placementPackages = EC2Restangular.all(entityMetaData.placementPackage.restPath);
      var io = function(id, userName) {return EC2Restangular.all(entityMetaData.campaignIo.restPath).customGET(id, {userName: userName})};
      var bannerSizes = EC2Restangular.all(entityMetaData.bannerSize.restPath);
      var tags = EC2Restangular.all(entityMetaData.tag.restPath);
      var campaignSiteContacts = function(campaignId,siteId){return campaign(campaignId).all('siteContacts').one(siteId);};

      return {
        MetaData: entityMetaData,
        EC2Restangular: EC2Restangular,
        account: account,
        accounts: accounts,
        accountGlobal : accountGlobal,
        accountsGlobal: accountsGlobal,
				deleteAccounts : deleteAccounts,
        user: user,
        users: users,
				deleteUsers : deleteUsers,
				globalContacts: globalContacts,
        globalSizmekContacts: globalSizmekContacts,
				validateUserName : validateUserName,
        advertiser: advertiser,
        advertisers: advertisers,
				advertisersGlobal: advertisersGlobal,
				deleteAdvertisers : deleteAdvertisers,
        brand: brand,
        brands: brands,
				deleteBrands : deleteBrands,
				campaign: campaign,
        campaigns: campaigns,
				deleteCampaigns : deleteCampaigns,
				site: site,
        sites: sites,
        siteRelations: siteRelations,
				siteSection : siteSection,
        siteSections: siteSections,
        sitesGlobal: sitesGlobal,
				siteGlobal:siteGlobal,
        sitesSectionsGlobal: sitesSectionsGlobal,
				validationURL : validationURL,
				deleteSites : deleteSites,
				userPermissions: userPermissions,
        userAdminZones: userAdminZones,
        searchGeo: searchGeo,
        placements: placements,
        placement: placement,
        placementPackages: placementPackages,
        placementAd: placementAd,
        io: io,
        bannerSizes: bannerSizes,
        tags: tags,
        campaignSiteContacts:campaignSiteContacts
      };
    }
]);
