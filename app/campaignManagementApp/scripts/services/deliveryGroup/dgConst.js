'use strict';

app.service('dgConst', [function () {
	var strFrom = 'from';
	var strMasterAdId = 'masterAdId';
	var strFromRotation = 'rotation';
	var strFromDefault = 'default';
	var strFromDraft = 'draft';
	var strAdContainer = 'AdContainer';
	var strDeliveryGroupAd = 'DeliveryGroupAd';
	var strSubGroup = "Sub Group";
	var strEvenDistribution = "EvenDistribution";
	var strWeighted = "Weighted";
	var strTimeBased = "TimeBased";
	var strScheduledSwap = "ScheduledSwap";

	return {
		strFrom: strFrom,
		strMasterAdId: strMasterAdId,
		strFromRotation: strFromRotation,
		strFromDefault: strFromDefault,
		strFromDraft: strFromDraft,
		strAdContainer: strAdContainer,
		strDeliveryGroupAd: strDeliveryGroupAd,
		strSubGroup: strSubGroup,
		strEvenDistribution: strEvenDistribution,
		strWeighted: strWeighted,
		strTimeBased: strTimeBased,
		strScheduledSwap: strScheduledSwap
	};
}]);

