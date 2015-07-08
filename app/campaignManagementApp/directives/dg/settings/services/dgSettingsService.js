/**
 * Created by Ofir.Fridman on 11/16/14.
 */
'use strict';
app.service('dgSettingsService', ['secConversion', function (secConversion) {
	var timeOptions = [
		{id: secConversion.allNumbers[0], name: 'Seconds'},
		{id: secConversion.allNumbers[1], name: 'Minutes'},
		{id: secConversion.allNumbers[2], name: 'Hours'},
		{id: secConversion.allNumbers[3], name: 'Days'},
		{id: secConversion.allNumbers[4], name: 'Weeks'},
		{id: secConversion.allNumbers[5], name: 'Months'}
	];

	function unCheckALlDefaultServeItems(isServeDefaultImageSelected, defaultAds, defaultAdsCb) {
		if (isServeDefaultImageSelected) {
			defaultAdsCb.isSelected = false;
		}
		for (var i = 0; i < defaultAds.length; i++) {
			defaultAds[i].selected = false;
		}
	}

	function decisionFrequencyCappingCbState(frequencyCapping, dg) {
		frequencyCapping.impressionsPerUser = (dg.servingSetting.impressionsPerUser != null && dg.servingSetting.impressionsPerUser != -1);
		frequencyCapping.impressionsPerDay = (dg.servingSetting.impressionsPerDay != null && dg.servingSetting.impressionsPerDay != -1);
		frequencyCapping.minimumTimeBetweenAds = (dg.servingSetting.timeBetweenAds != null && dg.servingSetting.timeBetweenAds != -1);
	}

	function onImpressionsPerUserClick(frequencyCapping, dg) {
		if (frequencyCapping.impressionsPerUser) {
			dg.servingSetting.impressionsPerUser = 1;
		}
		else if (!frequencyCapping.impressionsPerUser) {
			dg.servingSetting.impressionsPerUser = null;
		}
	}

	function onImpressionsPerDayClick(frequencyCapping, dg) {
		if (frequencyCapping.impressionsPerDay) {
			dg.servingSetting.impressionsPerDay = 1;
		}
		else if (!frequencyCapping.impressionsPerDay) {
			dg.servingSetting.impressionsPerDay = null;
		}
	}

	function onTimeBetweenAdsClick(frequencyCapping, dg, selectedTimeUnit) {
		if (!frequencyCapping.minimumTimeBetweenAds) {
			dg.servingSetting.timeBetweenAds = null;
		}
		selectedTimeUnit.id = secConversion.allNumbers[0];
	}

	function fillImpressionDropDown(impressionsPerUserDD, impressionsPerUserPerDayDD) {
		for (var i = 1; i < 61; i++) {
			var val = {id: i, name: i};
			impressionsPerUserDD.push(val);
			impressionsPerUserPerDayDD.push(val);
		}
	}

	function setTimeBetweenAds(dg) {
		dg.servingSetting.timeBetweenAds = (dg.servingSetting.timeBetweenAds == -1) ? null : dg.servingSetting.timeBetweenAds;
		var res = secConversion.fromSec(dg.servingSetting.timeBetweenAds);
		dg.timeBetweenAds.selectedTimeUnit.id = res.timeUnit;
		dg.servingSetting.timeBetweenAds = res.time;
	}

	return {
		unCheckALlDefaultServeItems: unCheckALlDefaultServeItems,
		decisionFrequencyCappingCbState: decisionFrequencyCappingCbState,
		onImpressionsPerUserClick: onImpressionsPerUserClick,
		onImpressionsPerDayClick: onImpressionsPerDayClick,
		onTimeBetweenAdsClick: onTimeBetweenAdsClick,
		fillImpressionDropDown: fillImpressionDropDown,
		timeOptions: timeOptions,
		setTimeBetweenAds: setTimeBetweenAds
	};
}]);
