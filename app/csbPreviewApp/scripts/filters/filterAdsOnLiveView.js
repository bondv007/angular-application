/**
 * Created by atd on 9/16/2014.
 */
app.filter('filterAdsOnLiveView', function () {
	return function (allAds, scope) {
		var adsToReturn = [];
		var ads = _.filter(allAds, function (ad) {
			return ad.isChecked;
		});
		if (typeof ads != 'undefined' && ads.length > 0)
			adsToReturn = ads;
		else
			adsToReturn = allAds;
		return adsToReturn;
	};
});
