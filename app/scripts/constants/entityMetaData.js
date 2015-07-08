/**
 * Created by liron.tagger on 2/6/14.
 */
'use strict';

/* Object data:

 type: 'placement',																						// the entity type (equals to its index)
 title: 'Placement',																					// entity display title
 name: 'Placement',																						// entity display name
 restPath: 'placements',																			// a path to be sent to server
 contextKey: 'campaignId',																		// a context to be added to the rest path as a variable
 foreignKey: 'placementId',																		// key to inner childes or lists
 editPageURL: 'spa.placement.placementEdit',									// edit page path to be called from central
 searchPlaceHolderText: 'Search...',													// text to be added to the central search box
 metaData: [																									// all the entity members
 {key: 'id', text: 'ID', 																	// in form of key, text, type is for central sort and display
 type: 'number', 																					// available types: number, date, enum (with enumName), link (with entityLink and may be isList and linkKeyParams)
 isInner: true },																					// isInner can get inner objects values
 ],																													//
 innerLists:[																								// members that foreign keys
 {name: 'packageId', type: 'placementPackage'}							// in form of member name and member type
 ],																													//
 availableGroupedBy: ['type', 'status', 'siteId'],						// all relevant grouped possible options
 defaultJson: { }																						// default json to be called in new modes
 */

app.constant('entityMetaData', {
  account: {
    type: 'account',
    name: 'Account',
    restPath: 'accounts',
    contextKey: '',
    innerLists: [],
    foreignKey: 'accountId',
    metaData: [
			{key: 'id', text: 'ID'},
      {key: 'name', text: 'Name'},
			{key: 'accountType', text: 'Type'},
      {
        key: 'relationsBag.children.users.countLink',
        text: 'Users',
        isInner: true,
        entityLink: 'user',
        type: 'link',
        isList: true,
        linkKeyParams: 'id'
      },
      {
        key: 'relationsBag.children.advertisers.countLink',
        text: 'Advertisers',
        isInner: true,
        type: 'link',
        entityLink: 'advertiser',
        isList: true,
        linkKeyParams: 'id'
      },
      {
        key: 'relationsBag.children.campaigns.countLink',
        text: 'Campaigns',
        isInner: true,
        entityLink: 'campaign',
        type: 'link',
        isList: true,
        linkKeyParams: 'id'
      },
			{key: 'adminSettings.regionalSettings.market.name', text: 'Market', isInner: true},
			{key: 'office.name', text: 'Office', isInner: true},
			{key: 'createdOn', text: 'Created On', isInner: false, type: 'date'},
			{key: 'createdByName', text: 'Created By', isInner: false},
			{key: 'lastUpdateOn', text: 'Update On', isInner: false, type: 'date'},
			{key: 'lastUpdatedByName', text: 'Updated By', isInner: false},
			{key: 'clientServices', text: 'Client Services', isInner: false},
			{key: 'salesManager', text: 'Sales Manager', isInner: false}
		],
    newEntity: {
      url: "./admin/views/account/accountEdit.html",
      controller: "accountEditCtrl",
      title: "Create New Account"
    },
    availableGroupedBy: ['accountType', 'market', 'office', 'clientServices', 'salesManager'],
    listPageURL: 'spa.admin.accounts',
    editPageURL: 'spa.account.accountEdit',
    newPageURL: 'spa.account.accountNew',
    searchPlaceHolderText: 'Search...',
    editPage: {
      templateUrl: 'admin/views/account/accountEdit.html',
      controller: 'accountEditCtrl'
    },
    permissions: {
      entity: {
        view: "ViewAccount",
        create: "CreateAccount",
        editBasic: "EditAccountBasic",
        editAdvanced: "EditAccountAdvanced"
      },
      common : {
        externalId: {view: "ViewExternalId", edit: "EditExternalId"},
        sizmekContacts: {createEdit: "EditSizmekContact"}
      }
    },
    defaultJson: {
      type: "AccountCreationRequest",
      account: {
        type: "Account",
        clientRefId: null,
        accountTypes: {
          type: "AccountTypes",
          campaignManager: false,
          creativeManager: false,
          payingAccount: false
        },
        externalId: null,
        name: null,
        version: null,
        status: "Enabled", //TODO: remove status when server side is done
        office: {
          type: "Office",
          id: null,
          name: null,
          marketId: null,
          externalId: {
            type: "ExternalId",
            entityType: "Office",
            id: null
          }
        },
        relationsBag: {
          creativeAccountContact: false,
          parents : null,
          children: {"account": null,
            advertisers: {"count": 0},
            brands: {"count": 0},
            campaigns: {"count": 0}
          }
        },
        billingSettings: {
          type: "BillingSettings",
          city: null,
          zipCode: null,
          billingAddress: null,
          billingAccountName: null,
          vat_tin: null,
          billingUserId: null
        },
        adminSettings: {
          type: "AdminSettings",
          video: {
            type: "Video",
            autoTranscode: true
          },
          regionalSettings: {
            type: "RegionalSettings",
            defaultTimeZone: "GMT_Minus_05",
            dateFormat: "DD_MM_YYYY",
            market: {
              type: "Market",
              id: null,
              name: null,
              externalId: {
                type: "ExternalId",
                entityType: "Market",
                id: null
              }
            }
          },
          defaultContacts: {
            type: "DefaultContacts",
            clientRefId: null,
            version: null,
            sizmekContacts: [],
            campaignManagerContacts: [],
            creativeManagerContacts: [],
            siteContacts: [],
            creativeAccounts: []
          },
          thirdPartyTracking: null,
          servingSettings: {
            type: "ServingSettings",
            collectBelowTheFold: false,
            dfCollectionID: null,
            pathLength: null,
            visibilityMinimumSurface: 0,
            visibilityMinimumDuration: 0,
            agencyVisibilityMinimumDuration: 0,
            agencyVisibilityMinimumSurface: 0,
            adChoicesCertificationProgramID: 0,
            adChoicesClickthroughURL: "",
            disableCookie: false,
            saveAdCookie: true,
            retargetingCookieWindow: 0,
            deviceIntelligenceTypeId: 0
          },
          campaignSettings: {
            type: "CampaignSettings",
            hardStopMethod: "KEEP_SERVING_AS_USUAL",
            creativeManagerAccess: true,
            traffickingMode: "AdvancedMode"
          },
          privacy: {
            type: "Privacy",
            adMarker: {
              includeInAllAds: null,
              regulationProgram: "IAB_EU",
              markerClickthroughURL: null
            },
            disableCookies: null
          }
        },
        analyticsSettings: {
          "type": "AnalyticsSettings",
          "ignoreCostCalculation": true,
          "viewabilityMode": "NO_COLLECTION",
          "viewabilityThreshold": {
            "type": "ViewabilityThreshold",
            "minimumSurface": 50,
            "minimumDuration": 1
          }
        }
      }
    }//end of Account default Json
  },
  advertiser: {
    type: 'advertiser',
    name: 'Advertiser',
    restPath: 'advertisers',
    contextKey: '',
    innerLists: [
      {name: 'accountId', type: 'account'}
    ],
    foreignKey: 'advertiserId',
    title: 'name',
    metaData: [
      {key: 'id', text: 'ID'},
      {key: 'name', text: 'Name'},
      {key: 'vertical', text: 'Vertical'},
      {
        key: 'relationsBag.parents.account.name',
        text: 'Account',
        isInner: true,
        entityLink: 'account',
        type: 'link',
        isList: false,
        linkKeyParams: 'relationsBag.parents.account.id'
      },
      {
        key: 'relationsBag.children.brands.countLink',
        text: 'Brands',
        isInner: true,
        entityLink: 'brand',
        type: 'link',
        isList: true,
        linkKeyParams: 'id'
      },
      {
        key: 'relationsBag.children.campaigns.countLink',
        text: 'Campaigns',
        isInner: true,
        entityLink: 'campaign',
        type: 'link',
        isList: true,
        linkKeyParams: 'id'
      }
    ],
    availableGroupedBy: [/*'relationsBag.parents.account.name'*/],//TODO should be account = [3] (for e.g.)
    listPageURL: 'spa.media.advertisers',
    editPageURL: 'spa.advertiser.advertiserEdit',
    newPageURL: 'spa.advertiser.advertiserNew',
    editPage: {
      templateUrl: 'media/views/advertiserEdit.html',
      controller: 'advertiserEditCtrl',
      resolve: {entity: null, $modalInstance: null}
    },
    searchPlaceHolderText: 'Search...',
    newEntity: {
      url: "./media/views/advertiserEdit.html",
      controller: "advertiserEditCtrl",
      title: "Create New Advertiser",
      modalWidth: 530,
      modalHeight: 375
    },
    contextEntities: {
      account: {
        key: 'accountId',
        newPageURL: 'spa.advertiser.advertiserNew',
        editPageUrl: 'spa.advertiser.advertiserEdit',
        closePageUrl: 'spa.account.advertisers',
        listPageURL: 'spa.account.advertisers'
      }
    },
    permissions: {
      entity: {
        createEdit: "CreateAndEditAdvertiserAndBrand"
      },
      common : {
        externalId: {view: "ViewExternalId", edit: "EditExternalId"},
        sizmekContacts: {createEdit: "EditSizmekContact"}
      }
    },
    defaultJson: {
      type: "Advertiser",
      name: null,
      vertical: null,
      status: "Enabled",
      accountId: null,
      clientRefId: null,
      relationsBag: {
        creativeAccountContact: false,
        parents : {
          account: {id: null, name: null}
        },
        children:{
          brands: {count : 0},
          campaigns: {count : 0}
        }
      },
      adminSettings: {
        type: "AdminSettings",
        regionalSettings: {
          type: "RegionalSettings",
          defaultTimeZone: "GMT_Plus_02"
        },
        defaultContacts: {
          type: "DefaultContacts",
          clientRefId: null,
          sizmekContacts: [],
          campaignManagerContacts: [],
          creativeManagerContacts: [],
          siteContacts: [],
          creativeAccounts: []
        },
        thirdPartyTracking: null,
        servingSettings: {
          type: "ServingSettings",
          collectBelowTheFold: null,
          dfCollectionID: null,
          pathLength: null,
          visibilityMinimumSurface: 0,
          visibilityMinimumDuration: 0,
          agencyVisibilityMinimumDuration: 0,
          agencyVisibilityMinimumSurface: 0,
          adChoicesCertificationProgramID: 0,
          adChoicesClickthroughURL: null,
          disableCookie: null,
          saveAdCookie: null,
          retargetingCookieWindow: 0,
          deviceIntelligenceTypeId: 0
        },
        campaignSettings: {
          type: "CampaignSettings",
          hardStopMethod: "KEEP_SERVING_AS_USUAL",
          creativeManagerAccess: true,
          traffickingMode: "AdvancedMode"
        },
        privacy: {
          type: "Privacy",
          adMarker: {
            includeInAllAds: true,
            regulationProgram: "IAB_EU",
            markerClickthroughURL: null
          },
          disableCookies: null
        }
      },
      analyticsSettings: {
        "type": "AnalyticsSettings",
        "ignoreCostCalculation": true,
        "viewabilityMode": "NO_COLLECTION",
        "viewabilityThreshold": {
          "type": "ViewabilityThreshold",
          "minimumSurface": 50,
          "minimumDuration": 1
        }
      },
      accountAnalyticsSettings: {
        "type": "AnalyticsSettings",
        "ignoreCostCalculation": true,
        "viewabilityMode": "NO_COLLECTION",
        "viewabilityThreshold": {
          "type": "ViewabilityThreshold",
          "minimumSurface": null,
          "minimumDuration": null
        }
      }
    }//end of Advertiser default json
  },
  brand: {
    type: 'brand',
    name: 'Brand',
    restPath: 'brands',
    contextKey: '',
    innerLists: [],
    foreignKey: 'brandId',
    title: 'name',
    metaData: [
      {key: 'id', text: 'Brand ID'},
      {key: 'name', text: 'Name'},
      {key: 'vertical', text: 'Vertical'},
			{
				key: 'relationsBag.parents.account.name',
				text: 'Account',
				isInner: true,
				entityLink: 'account',
				type: 'link',
				isList: false,
				linkKeyParams: 'relationsBag.parents.account.id'
			},
      {
        key: 'relationsBag.parents.advertiser.name',
        text: 'Advertiser',
        isInner: true,
        entityLink: 'advertiser',
        type: 'link',
        isList: false,
        linkKeyParams: 'relationsBag.parents.advertiser.id'
      },
			{
				key: 'relationsBag.children.campaigns.countLink',
				text: 'Campaigns',
				isInner: true,
				entityLink: 'campaign',
				type: 'link',
				isList: true,
				linkKeyParams: 'id'
			},
			{key: 'createdOn', text: 'Created On', type: 'date'},
			{key: 'createdByName', text: 'Created By'},
			{key: 'lastUpdateOn', text: 'Updated On', type: 'date'},
			{key: 'lastUpdatedByName', text: 'Updated By'}
    ],
    listPageURL: 'spa.advertiser.brands',
    editPageURL: 'spa.brand.brandEdit',
    newPageURL: 'spa.brand.brandNew',
    editPage: {
      templateUrl: 'media/views/brandEdit.html',
      controller: 'brandEditCtrl',
      resolve: {entity: null, $modalInstance: null}
    },
		availableGroupedBy: [/*'relationsBag.parents.advertiser.name'*/],
    searchPlaceHolderText: 'Search...',
    newEntity: {
      url: "./media/views/brandEdit.html",
      controller: "brandEditCtrl",
      title: "Create New Brand",
      modalWidth: 530,
      modalHeight: 375
    },
    contextEntities: {
      advertiser: {
        key: 'advertiserId',
        newPageURL: 'spa.brand.brandNew',
        editPageURL: 'spa.brand.brandEdit',
        closePageUrl: 'spa.advertiser.brands',
        listPageURL: 'spa.advertiser.brands'
      }
    },
    permissions: {
      entity: {
        createEdit: "CreateAndEditAdvertiserAndBrand"
      },
      common : {
        externalId: {view: "ViewExternalId", edit: "EditExternalId"},
        sizmekContacts: {createEdit: "EditSizmekContact"}
      }
    },
    defaultJson: {
      type: "Brand",
      name: null,
      vertical: null,
      status: "Enabled",
      advertiserId: null,
      clientRefId: null,
      relationsBag: {
        creativeAccountContact : false,
        parents: {
          account: {id: null, name: null},
          advertiser: {id: null, name: null}
        },
        children:{
          campaigns: {count : 0}
        }
      },
      adminSettings: {
        type: "AdminSettings",
        regionalSettings: {
          type: "RegionalSettings",
          defaultTimeZone: "GMT_Plus_02"
        },
        defaultContacts: {
          type: "DefaultContacts",
          clientRefId: null,
          sizmekContacts: [],
          campaignManagerContacts: [],
          creativeManagerContacts: [],
          siteContacts: [],
          creativeAccounts: []
        },
        thirdPartyTracking: null,
        servingSettings: {
          type: "ServingSettings",
          collectBelowTheFold: null,
          dfCollectionID: null,
          pathLength: null,
          visibilityMinimumSurface: 0,
          visibilityMinimumDuration: 0,
          agencyVisibilityMinimumDuration: 0,
          agencyVisibilityMinimumSurface: 0,
          adChoicesCertificationProgramID: 0,
          adChoicesClickthroughURL: null,
          disableCookie: null,
          saveAdCookie: null,
          retargetingCookieWindow: 0,
          deviceIntelligenceTypeId: 0
        },
        "campaignSettings": {
          "type": "CampaignSettings",
          "hardStopMethod": "KEEP_SERVING_AS_USUAL",
          "creativeManagerAccess": true,
          "traffickingMode": "AdvancedMode"
        },
        privacy: {
          type: "Privacy",
          adMarker: {
            includeInAllAds: true,
            regulationProgram: "IAB_EU",
            markerClickthroughURL: null
          },
          disableCookies: null
        }
      }
    }//end of Brand default Json
  },
  campaign: {
    type: 'campaign',
    name: 'Campaign',
    restPath: 'campaigns',
    contextKey: '',
    innerLists: [],
    foreignKey: 'campaignId',
    metaData: [
      {key: 'id', text: 'ID'},
      {key: 'name', text: 'Name'},
      {
        key: 'relationsBag.parents.account.name',
        text: 'Account',
        isInner: true,
        type: 'link',
        entityLink: 'account',
        linkKeyParams: 'relationsBag.parents.account.id',
        isList: false
      },
      {
        key: 'relationsBag.parents.advertiser.name',
        text: 'Advertiser',
        isInner: true,
        type: 'link',
        entityLink: 'advertiser',
        linkKeyParams: 'relationsBag.parents.advertiser.id',
        isList: false
      },
      {
        key: 'relationsBag.parents.brand.name',
        text: 'Brand',
        isInner: true,
        type: 'link',
        entityLink: 'brand',
        isList: false,
        linkKeyParams: 'relationsBag.parents.brand.id'
      },
      {
        key: 'placementsCountLink',
        text: 'Placements',
        type: 'link',
        entityLink: 'placement',
        isList: true,
        linkKeyParams: 'id'
      },
      {
        key: 'placementAdsCountLink',
        text: 'Placement Ads',
        type: 'link',
        entityLink: 'campaignsPlacementAd',
        isList: true,
        linkKeyParams: 'id'
      },
			{key: 'totalImpressions', text: 'Total Impressions'},
			{key: 'totalClicks', text: 'Total Clicks'},
			{key: 'ctr', text: 'CTR'},
			{key: 'status', text: 'Status'},
			{key: 'createdOn', text: 'Created On', type: 'date'},
			{key: 'createdByName', text: 'Created By'},
			{key: 'lastUpdateOn', text: 'Updated On', type: 'date'},
			{key: 'lastUpdatedByName', text: 'Updated By'}
    ],
    availableGroupedBy: [/*'relationsBag.parents.account.name', 'relationsBag.parents.advertiser.name', 'relationsBag.parents.brand.name',*/ 'status'],
    listPageURL: 'spa.media.campaigns',
    allowEditInEntral: false,
    editPageURL: 'spa.campaign.campaignEdit',
    newPageURL: 'spa.campaign.campaignNew',
    editPage: {
      templateUrl: 'media/views/campaignEdit.html',
      controller: 'campaignEditCtrl'
    },
    contextEntities: {
      account: {
        key: 'accountId',
        newPageURL: 'spa.campaign.campaignNew',
        editPageURL: 'spa.campaign.campaignEdit',
        closePageUrl: 'spa.account.campaigns',
        listPageURL: 'spa.account.campaigns'
      },
      advertiser: {
        key: 'advertiserId',
        newPageURL: 'spa.campaign.campaignNew',
        editPageURL: 'spa.campaign.campaignEdit',
        closePageUrl: 'spa.advertiser.campaigns',
        listPageURL: 'spa.advertiser.campaigns'
      },
      brand: {
        key: 'brandId',
        newPageURL: 'spa.campaign.campaignNew',
        editPageURL: 'spa.campaign.campaignEdit',
        closePageUrl: 'spa.brand.campaigns',
        listPageURL: 'spa.brand.campaigns'
      },
      site: {
        key: 'siteId',
        newPageURL: 'spa.campaign.campaignNew',
        editPageURL: 'spa.campaign.campaignEdit',
        closePageUrl: 'spa.site.campaigns',
        listPageURL: 'spa.site.campaigns'
      }
    },
    permissions: {
      entity: {
        viewAdvanced: "CampaignsViewFull",
					createEdit: "CampaignsCreateEdit"
      },
      common : {
        sizmekContacts: {createEdit: "EditSizmekContact"}
      }
    },
    searchPlaceHolderText: 'Search: Id, Name, Site or Size',
    defaultJson: {
      type: "Campaign",
      id: null,
      name: null,
      clientRefId: null,
      status: null,
      brandId: null,
      brand: null,
      relationsBag: {
        creativeAccountContact : false,
        parents: {
          account: {id: null, name: null},
          advertiser: {id: null, name: null},
          brand: {id: null, name: null}
        },
        children : null
      },
      totalImpressions: 0,
      totalClicks: 0,
      ctr: 0,
      lastServedImpression: null,
      startDate: null,
      endDate: null,
      lastUpdated: null,
      adminSettings: {
        type: "AdminSettings",
        regionalSettings: {
          type: "RegionalSettings",
          defaultTimeZone: "GMT_Plus_02"
        },
        defaultContacts: {
          type: "DefaultContacts",
          clientRefId: null,
          sizmekContacts: [],
          campaignManagerContacts: [],
          creativeManagerContacts: [],
          siteContacts: [],
          creativeAccounts: []
        },
        thirdPartyTracking: null,
        servingSettings: {
          type: "ServingSettings",
          collectBelowTheFold: null,
          dfCollectionID: null,
          pathLength: null,
          visibilityMinimumSurface: 0,
          visibilityMinimumDuration: 0,
          agencyVisibilityMinimumDuration: 0,
          agencyVisibilityMinimumSurface: 0,
          adChoicesCertificationProgramID: 0,
          adChoicesClickthroughURL: null,
          disableCookie: null,
          saveAdCookie: null,
          retargetingCookieWindow: 0,
          deviceIntelligenceTypeId: 0
        },
        campaignSettings: {
          type: "CampaignSettings",
          hardStopMethod: "KEEP_SERVING_AS_USUAL",
          creativeManagerAccess: true,
          traffickingMode: "AdvancedMode"
        },
        privacy: {
          type: "Privacy",
          adMarker: {
            includeInAllAds: true,
            regulationProgram: "IAB_EU",
            markerClickthroughURL: null
          },
          disableCookies: null
        }
      },
      collectDataFeed: null,
      collectPublisherKeywordsData: null,
      visibilityCollectBasicData: null,
      visibilityCollectEnhancedData: null,
      selectedAdBlockingCategories: "",
      yahooPCPBTList: "",
      verificationEnabled: null,
      collectMobileInfo: null,
      traffickingMode: "AdvancedMode",
      analyticsSettings: {
        "type": "AnalyticsSettings",
        "ignoreCostCalculation": true,
        "viewabilityMode": "NO_COLLECTION",
        "viewabilityThreshold": {
          "type": "ViewabilityThreshold",
          "minimumSurface": null,
          "minimumDuration": null
        }
      },
      advertiserAnalyticsSettings: {
        "type": "AnalyticsSettings",
        "ignoreCostCalculation": true,
        "viewabilityMode": "NO_COLLECTION",
        "viewabilityThreshold": {
          "type": "ViewabilityThreshold",
          "minimumSurface": null,
          "minimumDuration": null
        }
      },
      accountAnalyticsSettings: {
        "type": "AnalyticsSettings",
        "ignoreCostCalculation": true,
        "viewabilityMode": "NO_COLLECTION",
        "viewabilityThreshold": {
          "type": "ViewabilityThreshold",
          "minimumSurface": null,
          "minimumDuration": null
        }
      }
    }//end of Campaign default Json
  },
	user: {
		type: 'user',
		name: 'User',
		restPath: 'users',
		innerLists: [
			{name: 'accountId', type: 'account'}
		],
		foreignKey: 'userId',
		metaData: [
			{key: 'id', text: 'ID'},
			{key: 'name', text: 'Name'},
			{key: 'username', text: 'Username'},
			{key: 'email', text: 'Email'},
			{
				key: 'accountName',
				text: 'Account',
				isInner: false,
				type: 'link',
				entityLink: 'account',
				isList: false,
				linkKeyParams: 'id'
			},
			{key: 'lastLogin', text: 'Last Log In', type: 'date'},
			{key: 'createdOn', text: 'Created On', type: 'date'},
			{key: 'createdByName', text: 'Created By'},
			{key: 'lastUpdateOn', text: 'Updated On', type: 'date'},
			{key: 'lastUpdatedByName', text: 'Updated By'}
		],
		newEntity: {
			url: "./admin/views/userEdit.html",
			controller: "userEditCtrl",
			title: "Create New User",
			modalWidth: 520,
			modalHeight: 335//do not changes height! [liad.ron]
		},
		searchPlaceHolderText: 'Search...',
		listPageURL: 'spa.admin.users',
		editPageURL: 'spa.user.userEdit',
		newPageURL: 'spa.user.userNew',
		editPage: {
			templateUrl: 'admin/views/userEdit.html',
			controller: 'userEditCtrl',
			resolve: {entity: null, $modalInstance: null}
		},
		availableGroupedBy: [/*'accountName'*/],
		contextEntities: {
			account: {
				key: 'accountId',
				newPageURL: 'spa.user.userNew',
				editPageUrl: 'spa.user.userEdit',
				closePageUrl: 'spa.account.users',
				listPageURL: 'spa.account.users'
			}
		},
    permissions: {
      entity: {
        createEditBasic: "UsersCreateEditBasic",
        createEditAdvanced: "UsersCreateEditAdvanced"
      }
    },
		defaultJson: {
			type: "User",
			id: null,
			clientRefId: null,
			uiPermissions: [],
			name: null,
			accountId: null,
			salesManager: false,
			clientServices: false,
			username: null,
			password: null,
			address: null,
			timeZone: null,
			language: null,
			regional: null,
			enableForIntegration: false,
			status: "Enabled", //TODO: remove status when server side is done
			platformUser: null,
			email: null,
			phone: null
		}//end of User default json
	},
	permission: {
		type: 'permission',
		name: 'Permission',
		restPath: 'permissions',
		contextKey: '',
		innerLists: [
			{name: 'permissionSetIds', type: 'permissionSet'}
		],
		foreignKey: 'permissionId',
		metaData: [
			{key: 'id', text: 'ID'},
			{key: 'name', text: 'Name'},
			{key: 'permissionType', text: 'Permission Type'},
			{key: 'granted', text: 'Granted'}
		],
		availableGroupedBy: [],
		listPageURL: 'spa.configuration.permissions',
		editPageURL: 'spa.permission.permissionEdit',
		newPageURL: 'spa.permission.permissionNew',
		searchPlaceHolderText: 'Search...',
		editPage: {
			templateUrl: 'configurationManagementApp/permission/views/permissionEdit.html',
			controller: 'permissionEditCtrl'
		},
		contextEntities: {
			user: {
				key: 'userId'
			}
		},
    permissions: {
      entity: {
        view: "ViewPermissionsAndSets",
        createEdit: "CreateEditPermissions"
      }
    }
	},
	permissionSet: {
		type: 'permissionSet',
		name: 'Permission Set',
		restPath: 'permissions/sets',
		contextKey: '',
		innerLists: [
			{name: 'permissionSetIds', type: 'permissionSet'}
		],
		foreignKey: 'permissionSetId',
		metaData: [
			{key: 'id', text: 'ID'},
			{key: 'name', text: 'Name'},
			{key: 'granted', text: 'Granted'}
		],
		availableGroupedBy: [],
		listPageURL: 'spa.configuration.permissionSets',
		editPageURL: 'spa.permissionSet.permissionSetEdit',
		newPageURL: 'spa.permissionSet.permissionSetNew',
		searchPlaceHolderText: 'Search...',
		editPage: {
			templateUrl: 'configurationManagementApp/permission/views/permissionSetEdit.html',
			controller: 'permissionSetEditCtrl'
		},
		contextEntities: {
			user: {
				key: 'userId'
			}
		},
    permissions: {
      entity: {
        view: "ViewPermissionsAndSets",
        createEdit: "CreateEditPermissionSets"
      }
    }
	},
	userAdminZones: {
		restPath: "permissions/adminzones"
	},
	site: {
		type: 'site',
		name: 'Site',
		restPath: 'sites',
		contextKey: '',
		innerLists: [],
		foreignKey: 'siteId',
		metaData: [
			{key: 'id', text: 'ID'},
			{key: 'name', text: 'Name'},
			{key: 'createdOn', text: 'Created On', type: 'date'},
			{key: 'createdByName', text: 'Created By'},
			{key: 'lastUpdateOn', text: 'Updated On', type: 'date'},
			{key: 'lastUpdatedByName', text: 'Updated By'}
		],
		listPageURL: 'spa.admin.sites',
		editPageURL: 'spa.site.siteEdit',
		newPageURL: 'spa.site.siteNew',
		searchPlaceHolderText: 'Search...',
		editPage: {
			templateUrl: 'admin/views/site/siteEdit.html',
			controller: 'siteEditCtrl'
		},
		contextEntities: {
			account: {
				key: 'accountId',
				newPageURL: 'spa.site.siteNew',
				editPageURL: 'spa.site.siteEdit',
				closePageUrl: 'spa.account.sites',
				listPageURL: 'spa.account.sites'
			},
			campaign: {
				key: 'campaignId',
				newPageURL: 'spa.site.siteNew',
				editPageURL: 'spa.site.siteEdit',
				closePageUrl: 'spa.campaign.sites',
				listPageURL: 'spa.campaign.sites'
			}
		},
    permissions: {
      entity: {
        create: "CreateSite",
        edit: "EditSite"
      },
      common : {
        externalId: {view: "ViewExternalId", edit: "EditExternalId"}
      }
    },
		defaultJson: {
			name: "",
			type: 'Site',
			sizmekInternal: false,
			defaultTimeZone: "GMT_Minus_05",
			externalId: null,
			siteAccounts: [],
			siteContacts: {
				type: "SiteContacts",
				clientRefId: null,
				relationsBag: null,
				siteContacts: [],
				uiPermissions: null,
				version: null
			},
			siteTagSettings: {
				"type": "SiteTagSettings",
				protocol: 'HTTP',
				createIFrameSupported: false,
				tagTypes: ['AutoDetect'],
				clearEscapingOfNoscriptTag: false,
				referringURLToken: null,
				trackingTagType: 'Script',
				impressionTrackerResponse: false
			},
			siteTrackingAndTargeting: {
				type: "SiteTrackingAndTargeting",
				customPublisherParameter: '',
				collectKeywordsData: false,
				delimiterSiteKeywords: '',
				lineId: '',
				cacheBustingToken: {
					type: "CacheBustingToken",
					adServer: 'RandomNumber',
					tokenString: '[timestamp]'
				},
				impressionTrackingToken: '',
				clickTrackingToken: ''
			},
			siteAdDelivery: {
				type: "SiteAdDelivery",
				avoidDocumentWrite: false,
				minZIndex: '0',
				addinEyeFileLocation: '',
				disableAdsAutoExpand: false,
				enableCORSResponseHeaders: true,
				filterUnknownUserAgentCalls: true,
				//adClientVersions: [],
				playerSupportsVPAID: false,
				inAppSDK: 'None'
			},
			sitePrivacy: {
				type: "SitePrivacy",
				coppaCompliantSite: false,
				disableCookies: false
			},
			siteTemplateData: []
		}
	},
	siteRelations: {
		restPath: 'siterelations'
	},
  userPermissions: {
    restPath: 'permissions/settings',
    permissions: {
      entity: {
        view: "ViewUserPermissions",
        edit: "EditUserPermissions"
      }
    }
  },
  ad: {
    type: 'ad',
    name: 'Ad',
    restPath: 'ads',
    contextKey: 'campaignId',
    innerLists: [
      {name: 'placementsId', type: 'placement'},
      {name: 'assetsId', type: 'asset'}
    ],
    foreignKey: 'adId',
    metaData: [
      {key: 'id', text: 'ID'},
      {key: 'name', text: 'Name'},
      {key: 'adFormat', text: 'Format', type: 'enum', enumName: 'adFormats'},
      {key: 'accountId', text: 'accountID'},
      {key: 'adStatus', text: 'Status', type: 'enum', enumName: 'adStatuses'},
      {key: 'campaignId', text: 'Campaign ID'},
      {key: 'placementId', text: 'Placement ID'},
      {key: 'assetsId', text: 'Asset ID'}
    ],
    editPageURL: 'spa.ad.adEdit',
    listPageURL: 'spa.creativeCentralMain.adList',
    searchPlaceHolderText: 'Search...'
  },
  traffickingAd: {
    type: 'traffickingAd',
    name: 'Master Ad',
    restPath: 'ads/',
    contextKey: 'campaignId',
    innerLists: [
      {name: 'placementsId', type: 'placement'},
      {name: 'assetsId', type: 'asset'}
    ],
    foreignKey: 'adId',
    metaData: [
      {key: 'id', text: 'ID'},
      {key: 'name', text: 'Name'},
      {key: 'adFormat', text: 'Format', type: 'enum', enumName: 'traffickingAdFormat'},
      {key: 'accountId', text: 'accountID'},
      {key: 'adStatus', text: 'Status', type: 'enum', enumName: 'adStatuses'},
      {key: 'campaignId', text: 'Campaign ID'},
      {key: 'placementId', text: 'Placement ID'},
      {key: 'assetsId', text: 'Asset ID'}
    ],
    editPageURL: 'spa.ad.adEdit',
    searchPlaceHolderText: 'Search...'
  },
  campaignRelations: {
    restPath: 'campaignrelations'
  },
  deliveryGroup: {
    type: 'deliveryGroup',
    name: 'Delivery Group',
    restPath: 'deliveryGroups',
    contextKey: 'campaignId',
    innerLists: [
      {name: 'adsIds', type: 'ad'},
      {name: 'placements', type: 'placement'}
    ],
    foreignKey: 'deliveryGroupId',
    metaData: [
      {key: 'id', text: 'ID'},
      {key: 'name', text: 'Name'},
      {key: 'adsIds', text: 'Ad IDs'},
      {key: 'placementsIds', text: 'Placements IDs'}
    ],
    editPageURL: 'spa.deliveryGroup',
    searchPlaceHolderText: 'Search...',
    allowNewInEntral: true,
    listPageURL: 'spa.campaign.campaignEdit',
    editPage: {
      templateUrl: 'campaignManagementApp/views/deliveryGroup/dgEdit/dgEdit.html',
      controller: 'deliveryGroupEditCtrl'
    },
    contextEntities: {
      campaign: {
        key: 'campaignId',
        newPageURL: 'spa.campaign.deliveryGroupNew'
      }
    }
  },
  placement: {
    type: 'placement',
    name: 'Placement',
    restPath: 'placements',
    contextKey: 'campaignId',
    innerLists: [
      {name: 'packageId', type: 'placementPackage'}
    ],
    foreignKey: 'placementId',
    metaData: [
      {key: 'id', text: 'ID'},
      {key: 'name', text: 'Name'},
      {key: 'status', text: 'Status', type: 'enum', enumName: 'placementStatuses'},
      {key: 'placementType', text: 'Type', type: 'enum', enumName: 'placementTypes'},
      {key: 'siteName', text: 'Site'},
      {key: 'dimension', text: 'Dimensions'},
      {key: 'startDate', text: 'Start Date', type: 'date'},
      {key: 'endDate', text: 'End Date', type: 'date'},
      {key: 'costModel', text: 'Cost Model', enumName: 'packageCostModels'},
      {key: 'servingAndCostData.mediaServingData.units', text: 'units', isInner: true},
      {
        key: 'relationsBag.parents.campaign.name',
        text: 'Campaign',
        isInner: true,
        type: 'link',
        entityLink: 'campaign',
        linkKeyParams: 'relationsBag.parents.campaign.id',
        isList: false
      },
      {
        key: 'relationsBag.parents.account.name',
        text: 'Account',
        isInner: true,
        type: 'link',
        entityLink: 'account',
        linkKeyParams: 'relationsBag.parents.account.id',
        isList: false
      },
      {key: 'hardStopMethod', text: 'Stop Service Method', enumName: 'hardStop'},
      {key: 'servingAndCostData.mediaCostData.rate', text: 'Rate'},
      {key: 'createdOn', text: 'Created On', type: 'date'},
      {key: 'createdByName', text: 'Created By'},
      {key: 'lastUpdateOn', text: 'Update On', type: 'date'},
      {key: 'lastUpdatedByName', text: 'Update By'},
      {
        key: 'relationsBag.parents.advertiser.name',
        text: 'Advertiser',
        isInner: true,
        type: 'link',
        entityLink: 'advertiser',
        linkKeyParams: 'relationsBag.parents.advertiser.id',
        isList: false
      },
      {
        key: 'relationsBag.parents.brand.name',
        text: 'Brand',
        isInner: true,
        type: 'link',
        entityLink: 'brand',
        isList: false,
        linkKeyParams: 'relationsBag.parents.brand.id'
      }
    ],
    listPageURL: 'spa.campaign.campaignsCentral',
    editPageURL: 'spa.placement.placementEdit',
    newPageURL: 'spa.placement.placementNew',
    closePageUrl: 'spa.campaign.campaignsCentral',
    availableGroupedBy: [9, 4],
    searchPlaceHolderText: 'Search...',
    contextEntities: {
      campaign: {
        key: 'campaignId',
        newPageURL: 'spa.placement.placementNew',
        editPageURL: 'spa.placement.placementEdit',
        closePageUrl: 'spa.campaign.campaignsCentral',
        listPageURL: 'spa.campaign.campaignsCentral'
      }
    },
    editPage: {
      templateUrl: 'media/views/placement/placementEdit.html',
      controller: 'placementEditController'
      //templateUrl: 'campaignManagementApp/views/placement/placementEdit.html',
      //controller: 'placementEditCtrl'
    },
    defaultJson: { // Default entity json
      "type": "Placement",
      "id": null,
      "status": "New",
      "name": "",
      "accountId": null,
      "campaignId": null,
      "siteId": null,
      "sectionId": null,
      "placementType": null,
      "packageId": null,
      "servingAndCostData": {
        "mediaServingData": {
          "units": null, // Booked impressions
          "hardStopMethod": 'KEEP_SERVING_AS_USUAL',
          "startDate": null,
          "endDate": null
        },
        "mediaCostData": {
          "type": "MediaCost",
          "costModel": "CPM",
          "rate": null,
          "orderedUnits": null,
          "customInteraction": null,
          "conversionId": null,
          "interactionId": null,
          "ignoreOverDelivery": false
        },
        placementLevel: true
      },
      "ads": null,
      "tagBuilderParams":{
        "type": "TagBuilderParams",
        "id": null,
        "clientRefId": null,
        "uiPermissions": null,
        "version": null,
        "placementId": null,
        "builderTagTypes": null,
        "siteServing": {
          "secureServingProtocol": "HTTP",
          "lineIdToken": null,
          "customToken": null,
          "serverDomainName": "",
          "cacheBustingToken": null,
          "publisherCustomParam": null,
          "minZIndex": null,
          "impTracking": null,
          "clickTracking": null,
          "escapeNoScript": false,
          "generateMultipleTags": true,
          "generateIMGTag": false,
          "firstPartyAdIdToken": null
        }
      },
      "bannerSize": {height: null, width: null, type: "APIBannerSize"},
      "trackingAds": []
    } // end defaultJson
  },
  bannerSize: {
    restPath: 'placements/bannerSizes',
    newEntity: {
      url: "./campaignManagementApp/views/newBannerSize.html",
      controller: "bannerSizeCTRL",
      title: "Add New Banner Size",
      resolve: {entity: null, $modalInstance: null},
      modalWidth: 500,
      modalHeight: 100
    }
  },
  placementPackage: {
    type: 'placementPackage',
    name: 'Package',
    restPath: 'placements/packages',
    contextKey: 'campaignId',
    innerLists: [],
    foreignKey: 'packageId',
    metaData: [
      {key: 'id', text: 'ID'},
      {key: 'name', text: 'Name'},
      {key: 'campaignId', text: 'Campaign ID'},
      {key: 'siteId', text: 'Site ID'},
      {key: 'startDate', text: 'Start Date', type: 'date'},
      {key: 'endDate', text: 'End Date', type: 'date'}
    ],
    editPageURL: 'spa.package.packageEdit',
    listPageURL: 'spa.campaign.packages',
    searchPlaceHolderText: 'Search...',
    contextEntities: {
      campaign: {
        key: 'campaignId',
        newPageURL: 'spa.package.packageEdit',
        editPageURL: 'spa.package.packageEdit',
        closePageUrl: 'spa.campaign.packages',
        listPageURL: 'spa.campaign.packages'
      }
    },
    editPage: {
      templateUrl: 'campaignManagementApp/views/placementPackageEdit.html',
      controller: 'placementPackageEditCtrl',
      resolve: {entity: null, $modalInstance: null}
    },
    newEntity: {
      url: "./campaignManagementApp/views/placementPackageEdit.html",
      controller: "placementPackageEditCtrl",
      title: "Add New Package",
      modalWidth: 1200,
      modalHeight: 500,
      resolve: {entity: null, $modalInstance: null}
    },
    defaultJson: {
      "type": "PlacementPackage",
      "id": null,
      "name": null,
      "campaignId": null,
      "siteId": null,
      "mediaServingData": {
        "units": null, // Booked Impressions
        "hardStopMethod": "KEEP_SERVING_AS_USUAL",
        "startDate": null,
        "endDate": null
      },
      "mediaCostData": {
        "type": "MediaCost",
        "costModel": "CPM",
        "rate": null,
        "orderedUnits": null,
        "ignoreOverDelivery": false
      }
    } // end defaultJson
  },
  asset: {
    type: 'asset',
    name: 'Asset',
    restPath: 'assetMgmt',          //update to new endpoint
    contextKey: '',
    innerLists: [],
    foreignKey: 'assetId',
    metaData: [
      {key: 'id', text: 'ID'},
      {key: 'title', text: 'Name'},
      {key: 'status', text: 'Status'},
      {key: 'thumbnail', text: 'Thumbnail'},
      {key: 'mediaType', text: 'Type'},
      {key: 'dimensions', text: 'Dimensions'},
      {key: 'displayFileSize', text: 'Size'},
      {key: 'duration', text: 'Duration'},
      {key: 'frameRate', text: 'Frame Rate'},
      {key: 'createDateTime', text: 'Created on', type: 'date'}
    ],
    editPageURL: 'spa.asset.assetEdit',
    listPageURL: 'spa.creativeCentralMain.assetsLibrary.default',
    searchPlaceHolderText: 'Search...',
    editPage: {
      templateUrl: 'adManagementApp/views/assetEdit.html',
      controller: 'assetEditCtrl'
    }
  },
  masterAd: {
    type: 'masterAd',
    name: 'Master Ad',
    restPath: 'ads',
    innerLists: [
      {name: 'assetsIds', type: 'asset'},
      {name: 'adsIds', type: 'placementAd'}
    ],
    foreignKey: 'adId',
    metaData: [
      {key: 'id', text: 'ID'},
      {key: 'name', text: 'Name'},
      {key: 'adStatus', text: 'Status', type: 'enum', enumName: 'adStatuses'},
      {key: 'adFormat', text: 'Format', type: 'enum', enumName: 'adFormats'},
      {key: 'dimensions', text: 'Dimensions'},
      {key: 'overallSizeParsed', text: 'Size', type: 'number'},
      {key: 'adAssignmentData.accountName', text: 'Campaign Manager', isInner: true},
      {key: 'adAssignmentData.campaignName', text: 'Campaign', isInner: true},
      {key: 'numberOfPlacementAds', text: 'Placements Ads', isInner: false, entityLink: 'campaignsPlacementAd', type: 'link',isList: true, linkKeyParams: 'adAssignmentData.campaignId'},
      {key: 'createdByName', text: 'Created by'}	,
      {key: 'createdOn', text: 'Created on', type: 'date'}
    ],
    editPageURL: 'spa.ad.adEdit',
    listPageURL: 'spa.creativeCentralMain.adList',
		availableGroupedBy: [3, 7, 6, 9, 2],
    searchPlaceHolderText: 'Search...',
    editPage: {
      templateUrl: 'adManagementApp/views/adEdit.html',
      controller: 'adEditCtrl'
    },
    contextEntities: {
      campaign: {
        key: 'campaignId',
        newPageURL: 'spa.ad.adEdit',
        editPageURL: 'spa.ad.adEdit',
        closePageUrl: 'spa.campaign.adList',
        listPageURL: 'spa.campaign.adList'
      }
    }
  },
  campaignsPlacementAd: {
    type: 'placementAd',
    name: 'Placement Ad',
    restPath: 'ads',
    contextKey: 'campaignId',
    innerLists: [
      {name: 'adsIds', type: 'creative'},
      {name: 'assetsIds', type: 'asset'},
      {name: 'placementId', type: 'placement'},
      {name: 'adsIds', type: 'masterAd'}
    ],
    foreignKey: 'adId',
    metaData: [
      {key: 'id', text: 'ID'},
      {key: 'name', text: 'Name'},
      {key: 'adStatus', text: 'Status'},
      {key: 'adFormat', text: 'Ad Format'},
      {key: 'dimensions', text: 'Dimensions'},
      {key: 'overallSizeParsed', text: 'Size', type: 'number'},
      {key: 'accountId', text: 'Campaign Manager'},
      {key: 'campaignId', text: 'Campaign'},
      {key: 'createdByName', text: 'Created by'},
      {key: 'lastUpdateOn', text: 'Updated on'}
    ],
    listPageURL: 'spa.campaign.placementAdList',
    editPageURL: 'spa.placementAd.adEdit',
    searchPlaceHolderText: 'Search: Id, Name or Size',
    contextEntities: {
      campaign: {
        key: 'campaignId',
        newPageURL: 'spa.placementAd.adEdit',
        editPageURL: 'spa.placementAd.adEdit',
        closePageUrl: 'spa.campaign.placementAdList',
        listPageURL: 'spa.campaign.placementAdList'
      }
    }
  },
  placementAd: {
    type: 'placementAd',
    name: 'Placement Ad',
    restPath: 'ads',
    contextKey: '',
    innerLists: [
      {name: 'adsIds', type: 'creative'},
      {name: 'assetsIds', type: 'asset'},
      {name: 'placementId', type: 'placement'},
      {name: 'adsIds', type: 'masterAd'}
    ],
    foreignKey: 'adId',
    metaData: [
      {key: 'id', text: 'ID'},
      {key: 'name', text: 'Master Ad'},
      {key: 'adStatus', text: 'Status', type: 'enum', enumName: 'adStatuses'},
      {key: 'adFormat', text: 'Format'},
      {key: 'dimensions', text: 'Dimensions'},
      {key: 'overallSizeParsed', text: 'Size', type: 'number'},
      {key: 'accountName', text: 'Campaign Manager'},
      {key: 'campaignName', text: 'Campaign'},
      {key: 'placementId', text: 'Placement'},
      {key: 'masterAdId', text: 'Master Ad ID'},
      {key: 'createdByName', text: 'Created by'},
      {key: 'createdOn', text: 'Created on'},
      {key: 'site', text: 'Site'},
      {key: 'differentFromMaster', text: '≠'},
      {key: 'analyticsData.impressions', text: 'Impressions', isInner: true},
      {key: 'analyticsData.clicks', text: 'Clicks', isInner: true},
      {key: 'analyticsData.ctr', text: 'CTR', isInner: true}

    ],
    editPageURL: 'spa.placementAd.adEdit',
    listPageURL: 'spa.creativeCentralMain.placementAdList',
		availableGroupedBy: [13, 14],
    searchPlaceHolderText: 'Search...',
    editPage: {
      templateUrl: "adManagementApp/views/adEdit.html",
      controller: 'adEditCtrl'
    },
    contextEntities: {
      campaign: {
        key: 'campaignId',
        newPageURL: 'spa.placementAd.adEdit',
        editPageURL: 'spa.placementAd.adEdit',
        closePageUrl: 'spa.creativeCentralMain.placementAdList',
        listPageURL: 'spa.creativeCentralMain.placementAdList'
      }
    }
  },
  sitesection: {
    type: 'sitesection',
    name: 'Site Section',
    restPath: 'sitesection',
    contextKey: 'siteId',
    innerLists: [],
    foreignKey: 'sitesectionId',
    metaData: [
      {key: 'id', text: 'ID'},
      {key: 'name', text: 'Name'},
			{key: 'createdOn', text: 'Created On', type: 'date'},
			{key: 'createdByName', text: 'Created By'},
			{key: 'lastUpdateOn', text: 'Updated On', type: 'date'},
			{key: 'lastUpdatedByName', text: 'Updated By'}
    ],
    newEntity: {
      url: "./admin/views/sitesectionEdit.html",
      controller: "sitesectionEditCtrl",
      title: "Create New Site Section"
    },
    editPageURL: 'spa.sitesection.sitesectionEdit',
    newPageURL: 'spa.sitesection.sitesectionNew',
    listPageURL: 'spa.site.sitesections',
		availableGroupedBy: [/*'siteId'*/],
		editPage: {
      templateUrl: 'admin/views/sitesectionEdit.html',
      controller: 'sitesectionEditCtrl',
      resolve: {entity: null, $modalInstance: null}
    },
    searchPlaceHolderText: 'Search...',
    contextEntities: {
      site: {
        key: 'siteId',
        newPageURL: 'spa.sitesection.sitesectionNew',
        editPageURL: 'spa.sitesection.sitesectionEdit',
        closePageUrl: 'spa.site.sitesections'
      }
    }
  },
  siteSitesection: {
    type: 'sitesection',
    name: 'Site Section',
    restPath: 'sites/sitesection',
    contextKey: 'siteId',
    innerLists: [
      {name: 'siteId', type: 'site'}
    ],
    foreignKey: 'sitesectionId',
    metaData: [
      {key: 'id', text: 'ID'},
      {key: 'name', text: 'Name'}
    ],
    editPageURL: 'spa.sitesection.siteSitesectionEdit',
    searchPlaceHolderText: 'Search...'
  },
  targetAudience: {
    type: 'targetAudience',
    name: 'Target Audience',
    restPath: 'targetAudiences',
    contextKey: 'accountId',
    innerLists: [{name: 'campaignIds', type: 'strategy'}],
    foreignKey: 'targetAudienceId',
    metaData: [
      {key: 'id', text: 'ID'},
      {key: 'name', text: 'Name'},
      {key: 'type', text: 'Type'},
      {key: 'campaignId', text: 'Campaign ID'}
    ],
    editPageURL: 'spa.account.targetAudience.targetAudienceEdit',
    searchPlaceHolderText: 'Search...'
  },
  strategy: {
    type: 'strategy',
    name: 'Strategy',
    restPath: 'strategies',
    contextKey: 'accountId',
    innerLists: [],
    foreignKey: 'campaignId',
    metaData: [
      {key: 'id', text: 'ID'},
      {key: 'decisionDiagramName', text: 'Name'},
      {key: 'strategyType', text: 'Type'},
      {key: 'advertiserId', text: 'Advertiser ID'},
      {key: 'campaignId', text: 'Campaign ID'},
      {key: 'accountId', text: 'Account ID'}
    ],
    contextEntities: {
      account: {
        key: 'accountId',
        newPageURL: 'spa.strategy.strategyNew',
        editPageURL: 'spa.strategy.strategyEdit',
        closePageUrl: 'spa.account.strategies',
        listPageURL: 'spa.account.strategies'
      }
    },
    editPageURL: 'spa.strategy.strategyEdit',
    newPageURL: 'spa.strategy.strategyNew',
    editPage: {
      templateUrl: 'csb/diagram/:diagramID?SessionID&DecisionDiagramID&AccountID&UserID&EnvID',
      controller: 'decisionDiagram'
    },
    searchPlaceHolderText: 'Search...'
  },
  campaignIo: {
    type: 'campaignIo',
    name: 'Insertion Order',
    restPath: 'io',
    contextKey: 'campaignId',
    innerLists: [],
    foreignKey: 'ioId',
       availableGroupedBy: [1, 3, 7, 8],

    metaData: [
      {key: 'id', text: 'IO Number'},
      {key: 'IOStatus', text: 'IO Status'},
      {key: 'CampaignName', text: 'Campaign Name'},
      {key: 'AdvertiserName', text: 'Advertiser'},
      {key: 'StartDate', text: 'Start Date'},
      {key: 'EndDate', text: 'End Date'},
      {key: 'StatusChangeDate', text: 'Status Change Date'},
      {key: 'PayingAccount', text: 'Paying Account'},
      {key: 'AccountLegalStatus', text: 'Legal Status'},
      {key: 'AccountSalesRep', text: 'Sales Manager'},
      {key: 'AgencyName', text: 'Campaign Manager'},
      {key: 'AgencyID', text: 'Account ID'},
      {key: 'CreationDate', text: 'Created On'}
    ],
    editPageURL: 'spa.campaign.ioEdit',
    searchPlaceHolderText: 'Search...',
    permissions: {
      entity: {
        view: "ViewIO",
        edit: "EditIO",
        sign: "SignIO",
        enableDisable: "EnableDisableIO"
      }
    }
  },
  mediaIo: {
    type: 'mediaIo',
    name: 'Insertion Order',
    restPath: 'io',
    contextKey: 'accountId',
    innerLists: [],
    foreignKey: 'ioId',
    metaData: [
      {key: 'id', text: 'IO Number'},
      {key: 'IOStatus', text: 'IO Status'},
      {key: 'CampaignName', text: 'Campaign Name'},
      {key: 'AdvertiserName', text: 'Advertiser'},
      {key: 'StartDate', text: 'Start Date'},
      {key: 'EndDate', text: 'End Date'},
      {key: 'StatusChangeDate', text: 'Status Change Date'},
      {key: 'PayingAccount', text: 'Paying Account'},
      {key: 'AccountLegalStatus', text: 'Legal Status'},
      {key: 'AccountSalesRep', text: 'Sales Manager'},
      {key: 'AgencyName', text: 'Campaign Manager'},
      {key: 'AgencyID', text: 'Account ID'},
      {key: 'CreationDate', text: 'Created On'}
    ],
    editPageURL: 'spa.media.ioEdit',
    searchPlaceHolderText: 'Search...',
    permissions: {
      entity: {
        view: "ViewIO",
        edit: "EditIO",
        sign: "SignIO",
        enableDisable: "EnableDisableIO"
      }
    }
  },
  versaTag: {
    type: 'versaTag',
    name: 'VersaTag',
    restPath: 'versaTag/enriched',
    contextKey: 'versaTag',
    innerLists: [
      {name: 'Firing Conditions', type: 'firingConditions'}
    ],
    foreignKey: 'versaTagId',
    metaData: [
      { key: 'id', text: 'Id' },
      {key: 'name', text: 'Name'},

      //{key: 'mappedTags', text: 'Mapped Tags'},
      {
		  key: 'numberOfFiringCondtions',
		  text: 'Firing Conditions',
		  //type: 'link',
		  //entityLink: 'firingConditions',
		  //linkKeyParams: 'id',
		  //isList: true,
		  //isInner: true
	  }
      //{key: 'totalPageViews', text: 'Total Page Views'},
      //{key: 'rulesPageView', text: 'Rules Page View'},
      //{key: 'lastRuleMatch', text: 'Last Rule Match'}
    ],

    listPageURL: 'spa.media.versaTags',

    editPageURL: 'spa.versaTag.versaTagEdit',

    searchPlaceHolderText: 'Search...',
    newEntity: {
      url: "./versaTag/app/views/versaTagEdit.html",
      controller: "vtVersaTagEditCtrl",
      title: "Create New Versa Tag"
    },
    editPage: {
      templateUrl: 'versaTag/app/views/versaTagEdit.html',
      controller: 'vtVersaTagEditCtrl'
    },
	  permissions: {
		  entity: {
			  view:'VersaTag - View VersaTags',
			  edit:'VersaTag - Create/Full Edit'
		  }
	  }

  },
  advertiserVtag: {
    type: 'advertiserVtag',
    name: 'Advertiser Tag',
    restPath: 'tags/conversion/enriched',
    contextKey: 'advertiserVtag',
    innerLists: [
      {name: 'Third Party Tags', type: 'thirdPartyTags'}
    ],
    foreignKey: 'advertiserVtag',
    metaData: [
      {key: 'id', text: 'Id'},
        //{key: 'name', text: 'Name'},
        {
            key: 'name',
            text: 'Name',
            isInner: true,
            type: 'link',
            entityLink: 'advertiserVtag', // this is the entity key name
            linkKeyParams: 'id',
            isList: false
        },
      //{key: 'reportingName', text: 'Name'},
      //{key: 'type', text: 'Type'},
      {key: 'tagType', text: 'Tag Type'},
      //{key: 'firingConditions', text: 'Firing Conditions'},
      {key: 'numberOfThirdPartyTags', text: '3rd Party Tags'},
      {key: 'status', text: 'Status'},
      {key: 'isLive', text: 'Is Live'},
      {key: 'isAssignedToCampaigns', text: 'Assigned To Campaigns'}
    ],
      allowEditInEntral: false,
    permissions: {

	},

    listPageURL: 'spa.media.advertiserTags',

    editPageURL: 'spa.advertiserTag.advertiserTagEdit',
    searchPlaceHolderText: 'Search...',
    newEntity: {
      url: "./versaTag/app/views/avertiserTagEdit.html",
      controller: "vtAdvertiserTagEditCtrl",
      title: "Create New Advertiser Tag"
    },
    editPage: {
      templateUrl: 'versaTag/app/views/advertiserTagEdit.html',
      controller: 'vtAdvertiserTagEditCtrl'
    },
    defaultJson: {
      "type": "ConversionTag",
      "reportingName": null,
      "advertiserId": 1,
      "pageURL": null,
      "conversionType": "Counter",
      "conversionValue": null,
      "conversionCurrency": "USD",
      "protocol": "Http",
      "codeType": "HtmlScript",
      "removeComments": "true",
      "xhtmlCompatible": "false",
      "parameters": [
        {
          "name": "testone",
          "section": "ActivityParam",
          "comments": "testcomments"
        }
      ]
    }
  },
  firingConditions: {
    type: 'firingConditions',
    name: 'Firing Condition',
    restPath: 'versaTag/firingCondition',
    contextKey: 'versaTagId',
    innerLists: [],
    foreignKey: 'firingCondition',
    metaData: [
      {key: 'id', text: 'Id'},
      {key: 'name', text: 'Name'},
      //{key: 'advertiserId', text: 'Advertiser'},
      {
        key: 'advertiserId',
        text: 'Advertiser',
        isInner: true,
        type: 'link',
        entityLink: 'advertiser',
        linkKeyParams: 'advertiserId',
        isList: false
      },
      //{key: 'conditions', text: 'conditions (if a user)'},
      {key: 'formattedConditions', text: 'conditions (if a user)'},
      {key: 'actions', text: 'Actions (Then)'}
    ],
    allowEditInEntral: false,
    defaultJson: {
      "type": "FiringCondition",
      "advertiserId": null,
      "versaTagId": null,
      "name": null,
      "status": true,
      "expirationDate": 1421100387000,
      "occurs": null,
      "conditions": [
        {
          "ifUser": "LandedOn",
          "urlThat": "Any",
          "urlList": ['*']
        }
      ],
      "actions": [
        {
          "actionType": "Fire",
          "tags": []
        }
      ]
    },
    listPageURL: 'spa.versaTag.firingConditions',

    editPageURL: 'spa.firingConditions.firingConditionsEdit',
    searchPlaceHolderText: 'Search...',
    newEntity: {
      url: "./versaTag/app/views/vtFiringConditionsFull.html",
      controller: "vtFiringConditionsEditCtrl",
      title: "Create Firing Condition"
    },
    editPage: {
      templateUrl: "versaTag/app/views/firingConditionsFull.html",
      controller: 'vtFiringConditionsEditCtrl'
    },
    contextEntities: {
      versaTag: {
        key: 'versaTagId',
        newPageURL: 'spa.firingConditions.firingConditionsNew',
        closePageUrl: 'spa.versaTag.firingConditions'
      }
    }
  },
  tag: {restPath: 'placements/tag'},
  inStreamTemplate: {
    type: 'inStreamTemplate',
    name: 'In-Stream Template',
    restPath: 'inStreamTemplates',
    contextKey: '',
    innerLists: [],
    foreignKey: 'inStreamTemplateId',
    metaData: [
      {key: 'id', text: 'Template ID'},
      {key: 'name', text: 'Template Name'},
      {key: 'associatedAdFormatsStr', text: 'Applicable Ad Formats'},
      {key: 'status', text: 'Template Status'},
      {key: 'description', text: 'Description'},
      {key: 'isBase', text: 'Base Template'},
      {key: 'numberOfPlacementAds', text: 'Placements Ads', isInner: false, entityLink: 'campaignsPlacementAd', type: 'link',isList: true, linkKeyParams: 'adAssignmentData.campaignId'},
      {key: 'lastUpdated', text: 'Last updated'},
      {key: 'updatedBy', text: 'Updated by'}
    ],
    listPageURL: 'spa.configuration.inStreamTemplates',
    editPageURL: 'spa.inStreamTemplate.inStreamTemplateEdit',
    newPageURL: 'spa.inStreamTemplate.inStreamTemplateNew',
    editPage: {
      templateUrl: 'configurationManagementApp/views/inStreamTemplates/inStreamTemplateEdit.html',
      controller: 'inStreamTemplateEditCtrl'
    },
    searchPlaceHolderText: 'Search...',
    defaultJson: {
      "type": "InStreamTemplate",
      "xslt": null,
      "clientRefId": null,
      "uiPermissions": [],
      "name": null,
      "accountId": null,
      "vastVariables": [],
      "baseTemplateId": null,
      "baseTemplateName": "",
      "customXsltFileName": null,
      "customXsltFileId": null,
      "description": null,
      "applicableAdFormats": [],
      "enabled": true,
      "lastUpdated": null,
      "updatedBy": null
    }
  },
  thirdPartyTags: {
    type: 'thirdPartyTags',
    name: 'Third Party Tag',
    restPath: 'tags/thirdpartytag',
    contextKey: '',
    innerLists: [],
    foreignKey: 'thirdPartyTagId',
    metaData: [
      {key: 'id', text: 'Id'},
      {key: 'reportingName', text: 'Name'},
      {key: 'deduplicationType', text: 'Deduplication Type'},
      {key: 'site', text: 'Site'}
    ],
    searchPlaceHolderText: 'Search Id, Name, or Type',
    listPageURL: 'spa.advertiserTag.thirdpartytags',      // List view
    editPageURL: 'spa.thirdpartytag.edit',                // Full page view when editing an entity
    newPageURL: 'spa.thirdpartytag.new',                  // Full page view when creating a new entity
    newPage: {
      url: "./versaTag/app/views/thirdPartyTagEdit.html",
      controller: "thirdPartyTagEditCtrl",
      title: "Create New Third Party Tag"
    },
    editPage: {
      templateUrl: 'versaTag/app/views/thirdPartyTagEdit.html',
      controller: 'thirdPartyTagEditCtrl'
    },
    defaultJson: {
      "name": "",
      "noScriptMode": false,
      "deduplicationType": "None",
      "status": "Enabled",
      "tagCode": null,
      "cookieWindowImpressions": 30,
      "cookieWindowClicks": 30,
      "conversionAttributionModel": "LastEvent"
    },
    contextEntities: {
      advertiserVtag: {
        key: 'advertiserVtag',
        newPageURL: 'spa.thirdpartytag.new',
        closePageUrl: 'spa.advertiserTag.thirdpartytags'
      }
    }
  }
});
