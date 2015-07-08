/**
 * Created by rotem.perets on 10/21/14.
 */
app.constant('cacheMap', {
    replaceAds:[
      'ads',
      'placements'
    ],
    attachAdsToPlacements: [
        'deliveryGroups',
        'ads'
    ],
    attachPlacementsToDeliveryGroups: [
        'deliveryGroups'
    ],
    attachAdsToDeliveryGroups:[
        'deliveryGroups'
    ],
    unassignMasterAdFromCampaign:[
        'ads'
    ],
    unassignMasterAd:[
        'ads'
    ],
    placementIds:[
      'placements'
    ],
    attachMasterAdToPlacement:[
        'ads'
    ],
    detachMasterAdFromPlacement:[
        'ads'
    ],
    duplicate:[
        'ads'
    ],
    Campaign:[
        'ads'
    ],
    enableServing:[
      'placements'
    ],
    tag:[
      'placements'
    ],
    Account:[
        'ads'
    ],
    Advertiser:[
        'ads'
    ],
    campaigns:[
        'campaigns'
    ],
    accounts:[
        'accounts',
        'advertisers',
        'campaigns'
    ],
    advertisers:[
        'advertisers',
        'campaigns'
    ],
		delete:[
				'ads'
		],
    temp: [],
	conversion: [
		'enriched',
		'conversion',
		'tags'
	],
	versaTag: [
		'enriched'
	],
	excel: [
		'enriched',
		'firingCondition',
		'thirdpartytag'
	],
	firingCondition: [
		'conversion',
		'enriched'
	]
});
