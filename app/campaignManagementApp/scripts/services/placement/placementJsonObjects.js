/**
 * Created by roi.levy on 1/20/15.
 */
app.service('placementJsonObjects', ['mmUtils', function(mmUtils){

	function createNewTrackingAd(){
		var trackingAd = {
			"type": "TrackingPixelAd",
			"trackingType": "ImpressionsAndClicks",
			"clickthrough": {
				"type": "Clickthrough",
				"url": null
			},
			"thirdPartyImpressionTracker": {
				"type": "Clickthrough",
				"url": null
			},
			"thirdPartyClickTracker": {
				"type": "Clickthrough",
				"url": null
			},
			"firstPartyAdId": '',
			"firstPartyAdName": null
		}
		mmUtils.clientIdGenerator.populateEntity(trackingAd);
		return trackingAd;
	}

	return{
		createNewTrackingAd: createNewTrackingAd
	}

}])
