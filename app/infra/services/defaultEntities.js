/**
 * Created by Lior.Bachar on 6/1/14.
 */

app.service('defaultEntitiesService', [function () {
	var defaultEntities = {
		package: {
			"type": "PlacementPackage",
			"id": null,
			"name": null,
			"campaignId": null,
			"siteId": null,
			"mediaServingData": {
				type: "ServingCost",
				"units": 0, // Booked Impressions
				"hardStopMethod": "KEEP_SERVING_AS_USUAL"
			},
			"mediaCostData": {
				"type": "MediaCost",
				"rate": 0,
				"orderedUnits": 0,
				"ignoreOverDelivery": false
			}
		},
		placement: 	{
			"type": "Placement",
			"id": "",
			"status": "IN_PLANNING",
			"name": "",
			"accountId": null,
			"campaignId": null,
			"siteId": "",
			"sectionId": "",
			"placementType": "",
			"packageId": null,
			"servingAndCostData": {
				"mediaServingData": {
					"units": 1234, // Booked impressions
					"hardStopMethod": "KEEP_SERVING_AS_USUAL",
					"startDate": null,
					"endDate": null
				},
				"mediaCostData": {
					"type": "MediaCost",
					"rate": null,
					"orderedUnits": 0,
					"customInteraction": null,
					"conversionId": null,
					"interactionId": null,
					"ignoreOverDelivery": false
				}
			},
			"ads": null,
			"tagBuilderParams": null,
			"bannerSize": null
		}
	}

	return {
		getDefaultEntity: function(type) {
			return defaultEntities[type];
		},
		defaultsDeep: _.partialRight(_.merge, function deep(value, other) {
			return _.merge(value, other, deep);
		})
	};
}]);
