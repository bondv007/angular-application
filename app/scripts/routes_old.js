/**
 * Created by liron.tagger on 10/31/13.
 */

'use strict';

app.config(['$stateProvider', '$urlRouterProvider', 'entityMetaData', function ($stateProvider, $urlRouterProvider, entityMetaData) {

  $urlRouterProvider.otherwise("/spa/media/campaigns");

  $stateProvider
    .state('spa', {
      url: "/spa",
      title: "spa",
      templateUrl: "./index/views/spa.html",
      controller: "navBarCtrl"
    })
    .state('spa.campaign', {
      url: "/campaign/:campaignId",
      title: "New Campaign",
      templateUrl: 'infra/entityLayout/views/entityLayout.html',
      controller: "campaignCtrl"
    })
    .state('spa.campaign.campaignNew', {
      url: "/campaignNew",
      title: "New Campaign",
      templateUrl: "media/views/campaignEdit.html",
      controller: 'campaignEditCtrl'
    })
    .state('spa.campaign.campaignEdit', {
      url: "/campaignEdit",
      type: 'campaign',
      title: "Edit Campaign",
      templateUrl: "media/views/campaignEdit.html",
      controller: 'campaignEditCtrl'
    })
    .state('spa.campaign.placementSpreadsheet', {
      url: "/placementSpreadsheet",
      title: "Edit Placements",
      templateUrl: "media/views/placementSpreadsheet.html",
      controller: 'placementSpreadsheetCtrl'
    })
    .state('spa.campaign.placementAdList', {
      url: '/placementAdList?adId',
      templateUrl: 'adManagementApp/views/placementAdList.html',
      controller: 'placementAdListCtrl'
    })
    .state('spa.campaign.campaignsCentral', {
      url: "/campaignsCentral",
      type: "placement",
      templateUrl: "campaignManagementApp/views/campaignsCentral.html",
      controller: 'campaignsCentralCtrl'
    })
    .state('spa.campaign.campaignCentral.placementEdit', {
      url: "/placementEdit",
      templateUrl: 'campaignManagementApp/views/placement/placementEdit.html',
      controller: 'placementEditCtrl'
    })
    .state('spa.campaign.test', {
      templateUrl: "campaignManagementApp/views/test.html",
      controller: 'testCtrl'
    })
    .state('spa.campaign.placementDeliveryGroup', {
      url: "/placementDeliveryGroup",
      templateUrl: "campaignManagementApp/views/placementDeliveryGroup.html",
      controller: 'placementDeliveryGroupCtrl'
    })
    .state('spa.campaign.attachmentCentral', {
      url: "/attachmentCentral",
      type: 'placementAd',
      templateUrl: "campaignManagementApp/views/attachmentCentral.html",
      controller: 'attachmentCentralCtrl'
    })
    .state('spa.campaign.attachmentCentral.adEdit', {
      url: '/masterAdEdit',
      templateUrl: "adManagementApp/views/adEdit.html",
      controller: 'adEditCtrl'
    })
    .state('spa.campaign.servingStrategies', {
      url: '/servingStrategies',
      title: 'View Serving Strategies',
      templateUrl: "csbApp/app/routes/views/trafficking.html",
      controller: 'trafficking',
      resolve: {
        // Resolving params and permissions
        init: ['csbInit', '$stateParams', function (csbInit, $stateParams) {
          return csbInit.init($stateParams);
        }]
      }
    })
    .state('spa.campaign.deliveryGroups', {
      url: '/deliveryGroups',
      title: 'View delivery Groups',
      templateUrl: "campaignManagementApp/views/deliveryGroups.html",
      controller: 'deliveryGroupsCtrl'
    })
    .state('spa.campaign.deliveryGroups.deliveryGroupNew', {
      url: '/deliveryGroupNew',
      title: 'View delivery Groups',
      templateUrl: "campaignManagementApp/views/deliveryGroups.html",
      controller: 'deliveryGroupsCtrl'
    })
    .state('spa.campaign.packages', {
      url: "/packages",
      title: 'View packages',
      templateUrl: 'infra/central/views/centralLayout.html',
      controller: 'packagesCentralCtrl'
    })
    .state('spa.campaign.packageNew', {
      url: "/packageNew",
      templateUrl: "campaignManagementApp/views/placementPackageEdit.html",
      controller: 'placementPackageEditCtrl',
      resolve: {
        entity: function () {
          return null;
        }
      }
    })

    .state('spa.campaign.packageEdit', {
      url: "/packageEdit",
      templateUrl: 'campaignManagementApp/views/placementPackageEdit.html',
      controller: 'placementPackageEditCtrl'
    })
    .state('spa.campaign.packages.placementPackageEdit', {
      url: "/placementPackageEdit",
      templateUrl: 'campaignManagementApp/views/placementPackageEdit.html',
      controller: 'placementPackageEditCtrl',
      parent: 'spa.campaign.packages'
    })
    .state('spa.campaign.packages.placementEdit', {
      url: "/placementEdit",
      templateUrl: 'campaignManagementApp/views/placement/placementEdit.html',
      controller: 'placementEditCtrl',
      parent: 'spa.campaign.packages'
    })
    .state('spa.campaign.publishPlacements', {
      url: '/publishPlacements',
      title: 'Publish Placements',
      templateUrl: 'infra/central/views/centralLayout.html',
      controller: 'publishPlacementsCtrl'
    })
    .state('spa.campaign.adList', {
      url: '/adList',
      templateUrl: 'adManagementApp/views/adList.html',
      controller: 'adListCtrl'
    })
    .state('spa.campaign.masterAdEdit', {
      url: "/masterAdNew",
      templateUrl: "adManagementApp/views/adEdit.html",
      controller: "adEditCtrl"
    })
    .state('spa.campaign.ioList', {
      url: "/ioList",
      title: "Insertion Order List",
      templateUrl: "infra/central/views/centralLayout.html",
      controller: "insertionOrderCtrl"
    })
    .state('spa.campaign.ioList.ioEdit', {
      url: "/ioEdit",
      title: "Insertion Order Edit",
      templateUrl: "billingApp/insertionOrder/views/ioEdit.html",
      controller: "insertionOrderEditCtrl"
    })
    .state('spa.campaign.ioEdit', {
      url: "/ioEdit/:ioId",
      title: "Insertion Order Edit",
      templateUrl: "billingApp/insertionOrder/views/ioEdit.html",
      controller: "insertionOrderEditCtrl"
    })
    .state('spa.main', {
      url: "/main",
      title: "Main",
      templateUrl: "infra/views/main.html",
      controller: "MainCtrl"
    })
    .state('spa.fflags', {
      url: "/fflags",
      title: "Feature Flags Management",
      templateUrl: "internalApp/views/featureFlagsManagement.html",
      controller: "featureFlagsManagementCtrl"
    })

    //---------------------MEDIA - START-------------------------
    .state('spa.media', {
      url: "/media",
      title: "Media Central",
      templateUrl: "media/views/main.html",
      controller: "mediaCtrl"
    })
    // Media Flat Lists - Start
    //Campaigns Central
    .state('spa.media.campaigns', {
      url: "/campaigns",
      type: "campaign",
      title: "Campaigns",
      templateUrl: "infra/central/views/centralLayout.html",
      controller: "campaignsCtrl"
    })
    //Advertisers Central
    .state('spa.media.advertisers', {
      url: "/advertisers",
      type: 'advertiser',
      title: "Advertiser",
      templateUrl: "infra/central/views/centralLayout.html",
      controller: "advertisersCtrl"
    })
    .state('spa.advertiser', {
      url: "/advertiser/:advertiserId",
      title: "New Advertiser",
      templateUrl: "infra/entityLayout/views/entityLayout.html",
      controller: "advertiserCtrl"
    })
    //Brands Central (in Advertiser context)
    .state('spa.advertiser.brands', {
      url: '/brands',
      type: 'brand',
      title: "View Brands",
      templateUrl: 'infra/central/views/centralLayout.html',
      controller: 'brandsCtrl'
    })
    //Campaigns Central (in Advertiser context)
    .state('spa.advertiser.campaigns', {
      url: '/campaigns',
      type: "campaign",
      title: "View Campaigns",
      templateUrl: 'infra/central/views/centralLayout.html',
      controller: 'campaignsCtrl'
    })
    //Brand Central
    .state('spa.brand', {
      url: '/brand/:brandId',
      title: "New Brand",
      templateUrl: 'infra/entityLayout/views/entityLayout.html',
      controller: 'brandCtrl'
    })
    //Campaigns Central (in Brand context)
    .state('spa.brand.campaigns', {
      url: '/campaigns',
      type: "campaign",
      title: "View Campaigns",
      templateUrl: 'infra/central/views/centralLayout.html',
      controller: 'campaignsCtrl'
    })
//    //Placements Central (in Campaign context)
//    .state('spa.campaign.placements', {
//      url: '/placements',
//      title: "View Placements",
//      templateUrl: 'infra/central/views/centralLayout.html',
//      controller: 'placementsCtrl'
//    })

    // Media Flat Lists - End

    // Media Entity Pages - Start

    //Advertiser New - Full Page
    .state('spa.advertiser.advertiserNew', {
      url: "/advertiserNew",
      title: "New Advertiser",
      templateUrl: "media/views/advertiserEdit.html",
      controller: "advertiserEditCtrl",
      resolve: {
        entity: function () {
          return null;
        }, $modalInstance: function () {
          return null;
        }
      }
    })
    //Advertiser Edit - Full Page
    .state('spa.advertiser.advertiserEdit', {
      url: "/advertiserEdit",
      type: 'advertiser',
      title: "Edit Advertiser",
      templateUrl: "media/views/advertiserEdit.html",
      controller: "advertiserEditCtrl",
      resolve: {
        entity: function () {
          return null;
        }, $modalInstance: function () {
          return null;
        }
      }
    })
    //Brand New - Full Page
    .state('spa.brand.brandNew', {
      url: "/brandNew",
      title: "New Brand",
      templateUrl: "media/views/brandEdit.html",
      controller: "brandEditCtrl",
      resolve: {
        entity: function () {
          return null;
        }, $modalInstance: function () {
          return null;
        }
      }
    })
    //Brand Edit - Full Page
    .state('spa.brand.brandEdit', {
      url: "/brandEdit",
      type: 'brand',
      title: "Edit Brand",
      templateUrl: "media/views/brandEdit.html",
      controller: "brandEditCtrl",
      resolve: {
        entity: function () {
          return null;
        }, $modalInstance: function () {
          return null;
        }
      }
    })

    // Media Entity Pages - End
    //---------------------MEDIA - END-------------------------

    //---------------------ADMIN - START-------------------------
    .state('spa.admin', {
      url: "/admin",
      title: "Admin Central",
      templateUrl: "admin/views/main.html",
      controller: "adminCtrl",
      permissions: [entityMetaData['account'].permissions.entity, entityMetaData['user'].permissions.entity]
    })
    // Admin Flat Lists - Start
    //Accounts Central
    .state('spa.admin.accounts', {
      url: "/accounts",
      type: 'account',
      title: "Accounts",
      templateUrl: "infra/central/views/centralLayout.html",
      controller: "accountsCtrl",
      permissions: entityMetaData['account'].permissions.entity
    })
    //Account Entral
    .state('spa.account', {
      url: '/account/:accountId',
      title: "New Account",
      templateUrl: 'infra/entityLayout/views/entityLayout.html',
      controller: 'accountCtrl'
    })
    //Users Central
    .state('spa.admin.users', {
      url: "/users",
      title: "Users",
      templateUrl: "infra/central/views/centralLayout.html",
      controller: "usersCtrl"
      //permissions: [entityMetaData['user'].permissions.entity]
    })
    //User Entral
    .state('spa.user', {
      url: "/user/:userId",
      templateUrl: 'infra/entityLayout/views/entityLayout.html',
      controller: "userCtrl"
    })
    //Sites Central
    .state('spa.admin.sites', {
      url: "/sites",
      title: "Sites",
      templateUrl: "infra/central/views/centralLayout.html",
      controller: "sitesCtrl"
    })
    //Site Entral
    .state('spa.site', {
      url: "/site/:siteId",
      templateUrl: 'infra/entityLayout/views/entityLayout.html',
      controller: "siteCtrl"
    })
    //Site Section Entral
    .state('spa.sitesection', {
      url: "/sitesection/:sitesectionId",
      templateUrl: 'infra/entityLayout/views/entityLayout.html',
      controller: "sitesectionCtrl"
    })
    //Users Central (in Account context)
    .state('spa.account.users', {
      url: '/users',
      type: 'user',
      title: "View users",
      templateUrl: 'infra/central/views/centralLayout.html',
      controller: 'usersCtrl'
      //permissions: [entityMetaData['user'].permissions.entity]
    })
    //Sites Central (in Account context)
    .state('spa.account.sites', {
      url: '/sites',
      type: 'site',
      title: "View Sites",
      templateUrl: 'infra/central/views/centralLayout.html',
      controller: 'sitesCtrl'
    })
    //Advertisers Central (in Account context)
    .state('spa.account.advertisers', {
      url: '/advertisers',
      type: 'advertiser',
      title: "View Advertisers",
      templateUrl: 'infra/central/views/centralLayout.html',
      controller: 'advertisersCtrl'
    })
    //Campaigns Central (in Account context)
    .state('spa.account.campaigns', {
      url: '/campaigns',
      type: "campaign",
      title: "View Campaigns",
      templateUrl: 'infra/central/views/centralLayout.html',
      controller: 'campaignsCtrl'
    })
    //Strategies Central (in Account context)
    .state('spa.account.strategies', {
      url: '/strategies',
      title: "View Strategies",
      templateUrl: 'infra/central/views/centralLayout.html',
      controller: 'strategiesCtrl'
    })
    .state('spa.strategy', {
      url: '/strategy/:strategyId',
      title: "New Strategy",
      templateUrl: 'infra/entityLayout/views/entityLayout.html',
      controller: 'strategyCtrl'
    })
    .state('spa.strategy.strategyNew', {
      url: "/strategyNew",
      title: "New Strategy",
      templateUrl: "csbApp/app/routes/views/decision-diagram.html",
      controller: "decisionDiagram",
      resolve: {
        // Resolving params and permissions
        init: ['csbInit', '$stateParams', function (csbInit, $stateParams) {
          return csbInit.init($stateParams);
        }]
      }
    })

    //Site Sections Central (in site context)
    .state('spa.site.sitesections', {
      url: '/sitesections',
      type: 'sitesections',
      title: "View Site Sections",
      templateUrl: 'infra/central/views/centralLayout.html',
      controller: 'sitesectionsCtrl'
    })
    //Admin Flat List - End


    // Admin Entity Pages - Start

    //Account New - Full Page
    .state('spa.account.accountNew', {
      url: '/accountNew',
      title: "New Account",
      templateUrl: 'admin/views/account/accountEdit.html',
      controller: 'accountEditCtrl',
      permissions: entityMetaData['account'].permissions.entity.create
    })
    //Account Edit - Full Page
    .state('spa.account.accountEdit', {
      url: '/accountEdit',
      type: 'account',
      title: "Edit Account",
      templateUrl: 'admin/views/account/accountEdit.html',
      controller: 'accountEditCtrl'
    })
    //User New - Full Page
    .state('spa.user.userNew', {
      url: "/userNew",
      title: "New User",
      templateUrl: "admin/views/userEdit.html",
      controller: 'userEditCtrl',
      resolve: {
        entity: function () {
          return null;
        }, $modalInstance: function () {
          return null;
        }
      }
      //permissions: [entityMetaData['user'].permissions.entity]
    })
    //User Edit - Full Page
    .state('spa.user.userEdit', {
      url: "/userEdit",
      type: 'user',
      title: "Edit User",
      templateUrl: "admin/views/userEdit.html",
      controller: 'userEditCtrl',
      resolve: {
        entity: function () {
          return null;
        }, $modalInstance: function () {
          return null;
        }
      }
    })
    //Target Audience New - Full Page (in Account context)
    .state('spa.account.targetAudienceNew', {
      url: '/targetAudienceNew',
      title: "New Strategies",
      templateUrl: 'admin/views/targetAudienceEdit.html',
      controller: 'targetAudienceEditCtrl'
    })
    //Site New - Full Page
    .state('spa.site.siteNew', {
      url: "/siteNew",
      templateUrl: "admin/views/siteEdit.html",
      controller: 'siteEditCtrl'
    })
    //Site Edit - Full Page
    .state('spa.site.siteEdit', {
      url: "/siteEdit",
      type: 'site',
      templateUrl: "admin/views/siteEdit.html",
      controller: 'siteEditCtrl'
    })
    //Site Section New - Full Page
    .state('spa.sitesection.sitesectionNew', {
      url: "/sitesectionNew",
      title: "New Site Section",
      templateUrl: "admin/views/sitesectionEdit.html",
      controller: 'sitesectionEditCtrl',
      resolve: {
        entity: function () {
          return null;
        }, $modalInstance: function () {
          return null;
        }
      }
    })
    //Site Section Edit - Full Page
    .state('spa.sitesection.sitesectionEdit', {
      url: "/sitesectionEdit",
      type: 'sitesection',
      title: "Edit Site Section",
      templateUrl: "admin/views/sitesectionEdit.html",
      controller: 'sitesectionEditCtrl',
      resolve: {
        entity: function () {
          return null;
        }, $modalInstance: function () {
          return null;
        }
      }
    })
    // Admin Entity Pages - End
    //---------------------ADMIN - END-------------------------
    .state('spa.placementPackage', {
      url: "/placementPackage/:campaignId/:packageId",
      templateUrl: 'infra/entityLayout/views/entityLayout.html',
      controller: "placementPackageCtrl",
      resolve: {
        entity: function () {
          return null;
        }, $modalInstance: function () {
          return null;
        }
      }
    })
    .state('spa.placementPackage.placementPackageEdit', {
      url: '/placementPackageEdit',
      templateUrl: 'campaignManagementApp/views/placementPackageEdit.html',
      controller: 'placementPackageEditCtrl'
    })

    .state('spa.deliveryGroup', {
      url: "/deliveryGroup/:campaignId/:deliveryGroupId",
      templateUrl: 'infra/entityLayout/views/entityLayout.html',
      controller: "deliveryGroupCtrl"
    })
    .state('spa.deliveryGroup.deliveryGroupEdit', {
      url: "/deliveryGroupEdit",
      templateUrl: "campaignManagementApp/views/deliveryGroup/dgEdit/dgEdit.html",
      controller: 'deliveryGroupEditCtrl'
    })


    // Package routing
    .state('spa.package', {
      url: "/placementPackage/:campaignId/:packageId",
      templateUrl: 'infra/entityLayout/views/entityLayout.html',
      controller: "placementPackageCtrl"

    })
    .state('spa.package.packageEdit', {
      url: '/packageEdit',
      templateUrl: 'campaignManagementApp/views/placementPackageEdit.html',
      controller: 'placementPackageEditCtrl',
      resolve: {
        entity: function () {
          return null;
        }, $modalInstance: function () {
          return null;
        }
      }
    })


    .state('spa.campaignsList', {
      url: '/campaignsList',
      templateUrl: 'campaignManagementApp/views/campaignsList.html',
      controller: 'campaignsListCtrl'
    })
    .state('spa.placement', {
      url: "/placement/:campaignId/:placementId",
      templateUrl: 'infra/entityLayout/views/entityLayout.html',
      controller: "placementCtrl"
    })
    .state('spa.placement.placementNew', {
      type: 'placement',
      url: '/placementNew',
      title: "New Placement",
      templateUrl: 'campaignManagementApp/views/placement/placementEdit.html',
      controller: 'placementEditCtrl'
    })
    .state('spa.placement.placementEdit', {
      type: 'placement',
      url: '/placementEdit',
      templateUrl: 'campaignManagementApp/views/placement/placementEdit.html',
      controller: 'placementEditCtrl'
    })

    .state('spa.placement.tagGenerationSettings', {
      url: "/tagGenerationSettings",
      templateUrl: "campaignManagementApp/views/tagGenerationSettings.html",
      controller: 'tagGenerationSettingsCtrl'
    })
    .state('spa.essentials', {
      url: "/essentials",
      templateUrl: "internal/demo/views/main.html",
      controller: "mainEssentialCtrl"
    })
    .state('spa.essentials.edit', {
      url: "/edit",
      templateUrl: "internal/demo/views/mmEssential.html",
      controller: "mmEssentialCtrl"
    })
    .state('spa.essentials.tester', {
      url: "/tester",
      templateUrl: "internal/demo/views/mmTester.html",
      controller: "mmTesterCtrl"
    })
    .state('spa.essentials.tester2', {
      url: "/tester2",
      templateUrl: "internal/demo/views/mmTester2.html",
      controller: "mmTesterCtrl"
    })
    .state('spa.campaignList', {
      url: '/campaignList',
      templateUrl: 'campaignManagementApp/views/campaignList.html',
      controller: 'campaignListCtrl'
    })
    .state('spa.creativeCentralMain.adList', {
      url: '/adList',
      templateUrl: 'adManagementApp/views/adList.html',
      controller: 'adListCtrl'
    })
    .state('spa.creativeCentralMain.uploadFromWorkshop', {
      url: '/uploadFromWorkshop?file&name&thumb&size&dimensions&isNew&adFormat',
      templateUrl: 'adManagementApp/views/adList.html',
      controller: 'uploadFromWorkshopCtrl'
    })
    .state('spa.creativeCentralMain.adCentral', {
      url: "/adsCentral",
      templateUrl: "infra/central/views/centralLayout.html",
      controller: 'adsCentralCtrl'
    })
    .state('spa.creativeCentralMain.adCentral.masterAdEdit', {
      url: '/masterAdEdit',
      templateUrl: "adManagementApp/views/adEdit.html",
      controller: 'adEditCtrl'
    })
    .state('spa.creativeCentralMain.adCentral.assetEdit', {
      url: '/assetEdit',
      title: "Assets",
      templateUrl: 'adManagementApp/views/assetEdit.html',
      controller: 'assetEditCtrl'
    })
    .state('spa.ad.adEdit', {
      url: "/adEdit",
      type: 'ad',
      templateUrl: "adManagementApp/views/adEdit.html",
      controller: 'adEditCtrl'
    })
      .state('spa.ad.adNew', {
          type: 'masterAd',
          url: '/masterAdNew',
          title: "New Master ad",
          templateUrl: 'adManagementApp/views/adEdit.html',
          controller: 'adEditCtrl'
      })
    .state('spa.ad', {
      url: '/ad/:adId/:adIds',
      templateUrl: 'infra/entityLayout/views/entityLayout.html',
      controller: 'adCtrl'
    })
    .state('spa.placementAd', {
      url: '/placementAd/:adId/:adIds',
      templateUrl: 'infra/entityLayout/views/entityLayout.html',
      controller: 'placementAdCtrl'
    })
    .state('spa.placementAd.adEdit', {
      url: "/adEdit",
      type: 'placementAd',
      templateUrl: "adManagementApp/views/adEdit.html",
      controller: 'adEditCtrl'
    })
    .state('spa.adPreviewLayout', {
      url: '/adPreview/:adId',
      templateUrl: 'infra/entityLayout/views/entityLayout.html',
      controller: 'adPreviewLayoutCtrl'
    })
    .state('spa.adPreviewLayout.adPreview', {
      url: '/preview',
      templateUrl: 'adManagementApp/views/adPreview.html',
      controller: 'adPreviewCtrlOld'
    })
    .state('spa.creativeCentralMain', {
      url: "/creativeCentralMain",
      templateUrl: "adManagementApp/views/creativeCentralMain.html",
      controller: "creativeCentralMainCtrl"
    })
    .state('spa.essential', {
      url: '/essential',
      title: "Demo Page",
      templateUrl: 'internal/demo/views/mmEssential.html',
      controller: 'mmEssentialCtrl'
    })
    .state('spa.creativeCentralMain.assetList', {
      url: '/assetList',
      title: "Assets",
      templateUrl: 'adManagementApp/views/assetList.html',
      controller: 'assetListCtrl'
    })
    .state('spa.creativeCentralMain.assetList.assetEdit', {
      url: '/assetEdit',
      title: "Assets",
      templateUrl: 'adManagementApp/views/assetEdit.html',
      controller: 'assetEditCtrl'
    })
    .state('spa.creativeCentralMain.assetsLibrary', {
      url: '/assetsLibrary',
      abstract: true,
      title: "Assets Library",
      templateUrl: 'adManagementApp/views/assetLibrary/assetsLibrary.html',
      controller: 'assetsLibraryCtrl'
    })
    .state('spa.creativeCentralMain.assetsLibrary.tile', {
      url: '/:folderId/tile/:search',
      title: "Assets Library",
      templateUrl: 'adManagementApp/views/assetLibrary/assetsLibraryTileView.html',
      controller: 'assetsLibraryCtrl'
    })
    .state('spa.creativeCentralMain.assetsLibrary.grid', {
      url: '/:folderId/grid/:search',
      title: "Assets Library",
      templateUrl: 'adManagementApp/views/assetLibrary/assetsLibraryGridView.html',
      controller: 'assetsLibraryCtrl'
    })
    .state('spa.creativeCentralMain.assetsLibrary.list', {
      url: '/:folderId/list/:search',
      title: "Assets Library",
      templateUrl: 'adManagementApp/views/assetLibrary/assetsLibraryListView.html',
      controller: 'assetsLibraryCtrl'
    })
    .state('spa.asset.assetEdit', {
      url: '/assetEdit',
      title: "Asset Detail",
      templateUrl: 'adManagementApp/views/assetEdit.html',
      controller: 'assetEditCtrl'
    })
    .state('spa.asset', {
      url: '/asset/:assetId',
      title: "Asset Detail",
      templateUrl: 'infra/entityLayout/views/entityLayout.html',
      controller: 'assetCtrl'
    })
    .state('spa.creativeCentralMain.placementAdList', {
      url: '/placementAdList?adId',
      templateUrl: 'adManagementApp/views/placementAdList.html',
      controller: 'placementAdListCtrl'
    })
    .state('spa.creativeCentralMain.placementAdsAssetsCentral', {
      url: '/placementAdsAssetsCentral',
      type: 'masterAd',
      templateUrl: 'adManagementApp/views/placementAdsAssetsCentral.html',
      controller: 'placementAdsAssetsCentralCtrl'
    })
    .state('csbAdPreview', {
      url: '/preview?adIds',
      title: "CSB Preview",
      templateUrl: 'csbPreviewApp/views/csbAdPreview.html',
      controller: 'csbAdPreviewCtrl'
    })
    .state('spa.csb', {
      url: '/csbAd',
      title: "CSB Preview",
      templateUrl: 'infra/entityLayout/views/entityLayout.html',
      controller: 'csbAdCtrl'
    })
    .state('spa.csb.csbAdPreview', {
      url: '/preview',
      title: "CSB Preview",
      templateUrl: 'csbPreviewApp/views/csbAdPreview.html',
      controller: 'csbAdPreviewCtrl'
    })
    .state('adPreview', {
      url: '/adPreview/:adId/:sid/:mdx2',
      title: "Ad Preview",
      templateUrl: 'adPreviewApp/views/adPreview.html',
      controller: 'adPreviewCtrl'
    })
    .state('assetPreview', {
      url: '/assetPreview/:adId/:sid/:mdx2/:assetId',
      title: "Asset Preview",
      templateUrl: 'adPreviewApp/views/singleAssetPreview.html',
      controller: 'singleAssetPreviewCtrl'
    })
    .state('csbAdPreview.tileView', {
      url: '/tileView',
      title: "CSB Preview",
      templateUrl: 'csbPreviewApp/views/csbTileView.html',
      controller: 'csbAdPreviewCtrl'
    })
    .state('csbAdPreview.gridView', {
      url: '/gridView',
      title: "CSB Preview",
      templateUrl: 'csbPreviewApp/views/csbGridView.html',
      controller: 'csbAdPreviewCtrl'
    })
    .state('csbAdPreview.liveView', {
      url: '/liveView',
      title: "CSB Preview",
      templateUrl: 'csbPreviewApp/views/csbLiveView.html',
      controller: 'csbAdPreviewCtrl'
    })
    .state('adDetails', {
      url: '/adDetails/:id/:isAdPreview',
      title: "Ad details",
      templateUrl: 'adPreviewApp/views/interactionMonitor.html',
      controller: 'interactionCtrl'
    })


//for testing ng grid
    .state('spa.essentials.testsimplenggrid', {
      url: "/simplenggrid",
      title: "Grid Directive Demo Page",
      templateUrl: "internal/demo/views/simpleNgGrid.html",
      controller: "simpleNgGridCtrl"
    })
    .state('spa.essentials.testadvancenggrid', {
      url: "/advancenggrid",
      title: "Grid Directive Demo Page",
      templateUrl: "internal/demo/views/advanceNgGrid.html",
      controller: "advanceNgGridCtrl"
    })

    // CSB
    // added query params for mdx2 triggering since we can't access vars to parent frames with different domains
    // not ideal but will work for now
    .state('csb-diagram', {
      url: '/csb/diagram/:diagramID?SessionID&DecisionDiagramID&AccountID&UserID&EnvID',
      title: "CSB - Diagram",
      templateUrl: 'csbApp/app/routes/views/decision-diagram.html',
      controller: 'decisionDiagram',
      resolve: {
        // Resolving params and permissions
        init: ['csbInit', '$stateParams', function (csbInit, $stateParams) {
          return csbInit.init($stateParams);
        }]
      }
    })
    .state('csb-trafficking', {
      url: '/csb/trafficking/:diagramID?SessionID&DecisionDiagramID&AccountID&UserID&EnvID',
      title: "CSB - Trafficking",
      templateUrl: 'csbApp/app/routes/views/trafficking.html',
      controller: 'trafficking',
      resolve: {
        // Resolving params and permissions
        init: ['csbInit', '$stateParams', function (csbInit, $stateParams) {
          return csbInit.init($stateParams);
        }]
      }
    })
    .state('csb-share', {
      url: '/csb/share/:diagramID?DecisionDiagramID&EnvID',
      title: 'CSB - Share',
      templateUrl: 'csbApp/app/routes/views/decision-diagram-share.html',
      controller: 'decisionDiagramShare'
    })
//for billing


    // VERSATAG

    // Advertiser Tags Entity - Start
    .state('spa.media.advertiserTags', {
      url: '/advertisertags',
      title: 'Advertiser Tags',
      templateUrl: 'versaTag/app/views/advertiserTags.html',
      controller: 'vtAdvertisersCtrl'
    })
    .state('spa.advertiserTag', {
      url: '/advertisertag/:advertiserVtag',
      title: "Edit Advertiser Tag",
      templateUrl: 'infra/entityLayout/views/entityLayout.html',
      controller: 'advertiserFullCtrl'
    })
    .state('spa.advertiserTag.advertiserTagEdit', {
      url: '/edit',
      title: "Edit Advertiser Tag",
      templateUrl: "versaTag/app/views/advertiserTagEdit.html",
      controller: 'vtAdvertiserTagEditCtrl'
    })
    // Advertiser Tags Entity - End

    // VersaTag Entity - Start
    .state('spa.media.versaTags', {
      url: '/versatags',
      title: 'VersaTag - VersaTags',
      templateUrl: 'versaTag/app/views/versaTags.html',
      controller: 'vtVersaTagsCtrl'
    })
    .state('spa.versaTag', {
      url: '/versatag/:versaTagId',
      title: "Edit VersaTag",
      templateUrl: 'infra/entityLayout/views/entityLayout.html',
      controller: 'versaFullCtrl'
    })
    .state('spa.versaTag.versaTagEdit', {
      url: '/edit',
      title: "Edit Versa Tag",
      templateUrl: "versaTag/app/views/versaTagEditFull.html",
      controller: 'vtVersaTagEditCtrl'
    })
    // VersaTag Entity - End


    // Firing Conditions Entity - Start
    .state('spa.versaTag.firingConditions', {
      url: '/firingConditions',
      title: "Firing Conditions",
      controller: 'vtFiringConditionsCtrl',
      templateUrl: "infra/central/views/centralLayout.html"

    })
    .state('spa.firingConditions', {
      url: '/versatag/:versaTagId/firingConditions/:firingCondition',
      title: "Edit Firing Conditions",
      controller: 'firingConditionsFullCtrl',
      templateUrl: 'infra/entityLayout/views/entityLayout.html'
    })
    .state('spa.firingConditions.firingConditionsEdit', {
      url: "/firingConditionsEdit",
      title: "Edit Firing Conditions",
      templateUrl: "versaTag/app/views/firingConditionsFull.html",
      controller: 'vtFiringConditionsEditCtrl'
    })
    .state('spa.firingConditions.firingConditionsNew', {
      url: "/firingConditionsNew",
      title: "Edit Firing Conditions",
      templateUrl: "versaTag/app/views/firingConditionsFull.html",
      controller: 'vtFiringConditionsEditCtrl'
    })
    // Firing Conditions Entity - End

    // Third Party Tags Entity - Start
    .state('spa.advertiserTag.thirdpartytags', {
      url: '/thirdpartytags',
      type: 'thirdpartytag',
      title: 'Third Party Tags',
      templateUrl: "infra/central/views/centralLayout.html",
      controller: 'thirdPartyCtrl'
    })
    .state('spa.thirdpartytag', {
      url: '/thirdpartytag/:thirdPartyTagId/conversiontag/:advertiserVtag',
      type: 'thirdpartytag',
      title: "Edit Third Party Tag",
      templateUrl: 'infra/entityLayout/views/entityLayout.html',
      controller: 'thirdPartyTagFullCtrl'
    })
    .state('spa.thirdpartytag.edit', {
      url: '/edit',
      type: 'thirdpartytag',
      title: 'Edit Third Party Tag',
      templateUrl: 'versaTag/app/views/thirdPartyTagEdit.html',
      controller: 'thirdPartyTagEditCtrl'
    })
    .state('spa.thirdpartytag.new', {
      url: '/new',
      type: 'thirdpartytag',
      title: 'New Third Party Tag',
      templateUrl: 'versaTag/app/views/thirdPartyTagEdit.html',
      controller: 'thirdPartyTagEditCtrl'
    })
    // Third Party Entity - End


    // VersaTag Entity Pages - End

    //---------------------Configuration - START-------------------------
    .state('spa.configuration', {
      url: "/configuration",
      title: "Configuration",
      templateUrl: "infra/entityLayout/views/entityLayout.html",
      controller: "configurationCtrl"
    })
    .state('spa.configuration.inStreamTemplates', {
      url: "/inStreamTemplates",
      title: "In Stream Templates",
      templateUrl: "infra/central/views/centralLayout.html",
      controller: "inStreamTemplatesCtrl"
    })
    .state('spa.inStreamTemplate', {
      type: 'inStreamTemplate',
      url: '/inStreamTemplate/:inStreamTemplateId',
      title: "New Template",
      templateUrl: 'infra/entityLayout/views/entityLayout.html',
      controller: 'inStreamTemplateCtrl'
    })
    .state('spa.inStreamTemplate.inStreamTemplateNew', {
      url: '/inStreamTemplateNew',
      title: "New Template",
      templateUrl: 'configurationManagementApp/views/inStreamTemplates/inStreamTemplateEdit.html',
      controller: 'inStreamTemplateEditCtrl'
    })
    .state('spa.inStreamTemplate.inStreamTemplateEdit', {
      type: 'inStreamTemplate',
      url: '/inStreamTemplateEdit',
      title: "Edit Template",
      templateUrl: 'configurationManagementApp/views/inStreamTemplates/inStreamTemplateEdit.html',
      controller: 'inStreamTemplateEditCtrl'
    })

    //---------------------PERMISSION - START-------------------------

    // Permission Flat Lists - Start

    // Permissions Central
    .state('spa.configuration.permissions', {
      url: "/permissions",
      title: "Permissions",
      templateUrl: "infra/central/views/centralLayout.html",
      controller: "permissionsCtrl"
    })
    .state('spa.permission', {
      url: '/permission/:permissionId',
      title: "New Permission",
      templateUrl: 'infra/entityLayout/views/entityLayout.html',
      controller: 'permissionCtrl'
    })
    // Permission Sets Central
    .state('spa.configuration.permissionSets', {
      url: "/permissionSets",
      title: "Permissions Sets",
      templateUrl: "infra/central/views/centralLayout.html",
      controller: "permissionSetsCtrl"
    })
    .state('spa.permissionSet', {
      url: '/permissionSet/:permissionSetId',
      title: "New Permission Set",
      templateUrl: 'infra/entityLayout/views/entityLayout.html',
      controller: 'permissionSetCtrl'
    })
    // User Permissions + Permission Sets central
    .state('spa.user.userPermissions', {
      url: "/userPermissions",
      title: "User Permissions",
      templateUrl: "infra/central/views/centralLayout.html",
      controller: "userPermissionsCtrl"
    })
    .state('spa.user.permissions', {
      url: '/permissions',
      title: "New Permissions",
      templateUrl: 'infra/central/views/centralLayout.html',
      controller: 'permissionCtrl'
    })
    .state('spa.user.permissionSets', {
      url: '/permissionSets',
      title: "New Permission Sets",
      templateUrl: 'infra/central/views/centralLayout.html',
      controller: 'permissionSetCtrl'
    })
    // Permission Flat Lists - End

    // Permission Entity Pages - Start

    //Permission New - Full Screen
    .state('spa.permission.permissionNew', {
      url: '/permissionNew',
      title: "New Permission",
      templateUrl: 'configurationManagementApp/permission/views/permissionEdit.html',
      controller: 'permissionEditCtrl'
    })
    //Permission Edit - Full Screen
    .state('spa.permission.permissionEdit', {
      url: '/permissionEdit',
      type: 'permission',
      title: "Edit Permission",
      templateUrl: 'configurationManagementApp/permission/views/permissionEdit.html',
      controller: 'permissionEditCtrl'
    })
    //Permission Set New - Full Screen
    .state('spa.permissionSet.permissionSetNew', {
      url: '/permissionSetNew',
      title: "New Permission Set",
      templateUrl: 'configurationManagementApp/permission/views/permissionSetEdit.html',
      controller: 'permissionSetEditCtrl'
    })
    //Permission Set Edit - Full Screen
    .state('spa.permissionSet.permissionSetEdit', {
      url: '/permissionSetEdit',
      type: 'permissionSet',
      title: "Edit Permission Set",
      templateUrl: 'configurationManagementApp/permission/views/permissionSetEdit.html',
      controller: 'permissionSetEditCtrl'
    })
    .state('spa.accessDenied', {
      url: '/accessDenied',
      title: "Access Denied",
      templateUrl: 'infra/views/accessDenied.html',
      controller: 'accessDeniedCtrl'
    })
  // Permission Entity Pages - End

  //---------------------PERMISSION - END-------------------------

  //---------------------Configuration - END-------------------------

}]);
