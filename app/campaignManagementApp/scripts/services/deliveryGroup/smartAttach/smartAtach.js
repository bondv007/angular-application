/**
 * Created by Ofir.Fridman on 9/7/14.
 */
'use strict';

app.service('smartAttachAdsToDgs', ['enums', 'EC2Restangular', 'deliveryGroupJsonObjects', 'dgAdCalculateDecision', 'mmAlertService',
	'$q', 'dgValidation', 'dgConstants', '$filter', 'dgHelper',
	function (enums, EC2Restangular, deliveryGroupJsonObjects, dgAdCalculateDecision, mmAlertService, $q, dgValidation, dgConstants, $filter, dgHelper) {
		var serverAssets = EC2Restangular.all('assetMgmt');
		var serverAds = EC2Restangular.all('ads');
		var actionOptions = dgAdCalculateDecision.actionOptions();

		function isAdFormatValid(selected) {
			var isValid = true;
			var stopAd = selected.ads.length;
			var stopDg = selected.deliveryGroups.length;
			var mapAdsFormats = mapAdFormats();
			var firstAdType = enums.mapOfAdFormatToPlacementType[mapAdsFormats[selected.ads[0].adFormat]];
			var adType;

			for (var i = 0; i < stopDg; i++) {
				var dgPlacementType = selected.deliveryGroups[i].placementType;
				for (var j = 0; j < stopAd; j++) {
					adType = enums.mapOfAdFormatToPlacementType[mapAdsFormats[selected.ads[j].adFormat]];
					if (dgPlacementType && dgPlacementType != enums.mapOfAdFormatToPlacementType[mapAdsFormats[selected.ads[j].adFormat]] || firstAdType != adType) {
						isValid = false;
						mmAlertService.addError('The ad that you are trying to assign to the delivery group does not match the ad type that was defined for the delivery group.');
						break;
					}
				}
			}
			return isValid;
		}

		function getAssetDimension(subContainers) {
			var stop = subContainers.length;
			var assetId;
			var f = [];
			for (var i = 0; i < stop; i++) {
				if (subContainers[i].defaultImage) {
					f[i] = function (k) {
						assetId = subContainers[k].defaultImage.assetId;
						var ad = subContainers[k];
						serverAssets.get(assetId).then(function (asset) {
							ad.dimensions = createUiAssetDimension(asset);
							ad.thumbnail = asset.publishHostName + asset.publishPath;
						});
					}(i);
				}
			}
		}

		function createUiAssetDimension(asset) {
			var dim = "";
			if (asset && asset.formatContext && asset.formatContext.format && asset.imageContext) {
				dim = asset.imageContext.width + 'X' + asset.imageContext.height;
			}
			return dim;
		}

		function mapAdFormats() {
			var adFormats = enums.adFormats;
			var mapAdFormats = {};
			var stop = adFormats.length;
			for (var i = 0; i < stop; i++) {
				mapAdFormats[adFormats[i].id] = adFormats[i].name;
			}
			return mapAdFormats;
		}

		function fillSubContainersWithAds(subContainers, ads, rotationType) {
			var stop = ads.length;
			for (var i = 0; i < stop; i++) {
				subContainers.push(_createDgAd(ads[i], rotationType));
			}
			var container = {subContainers: subContainers};
            dgAdCalculateDecision.calculate(container, actionOptions.add);
			return container.subContainers;
		}

		function addAdsToDgs(deliveryGroups, subGroup, isSubGroup) {
			var dgStop = deliveryGroups.length;
			var cloneDg;
			if (isSubGroup) {
				for (var z = 0; z < dgStop; z++) {
					cloneDg = EC2Restangular.copy(deliveryGroups[z]);
					var cloneSbGroup = EC2Restangular.copy(subGroup);
					cloneDg.rootContainer.subContainers.push(cloneSbGroup);
                    dgAdCalculateDecision.calculate(cloneDg.rootContainer, actionOptions.add);
					deliveryGroups[z] = cloneDg;
				}
			}
			else {
				for (var i = 0; i < dgStop; i++) {
					var ads = subGroup.subContainers;
					var adStop = ads.length;
					for (var j = 0; j < adStop; j++) {
						ads[j].rotationSetting = deliveryGroupJsonObjects.getRotationSetting(deliveryGroups[i].rootContainer.childRotationType);
						deliveryGroups[i].rootContainer.subContainers.push(ads[j]);
					}
					cloneDg =  EC2Restangular.copy(deliveryGroups[i]);
                    dgAdCalculateDecision.calculate(cloneDg.rootContainer, actionOptions.add);
					deliveryGroups[i] = cloneDg;
				}
			}
			return deliveryGroups;
		}

		function convertDgsToScheduledSwap(deliveryGroups,subGroup) {
			var dgStop = deliveryGroups.length;
			for (var i = 0; i < dgStop; i++) {
				var cloneSbGroup = EC2Restangular.copy(subGroup);
				deliveryGroups[i].oldUIRotationType = enums.rotationSettingType.getName(deliveryGroups[i].rootContainer.childRotationType);
				deliveryGroups[i].oldRotationType = deliveryGroups[i].rootContainer.childRotationType;
				deliveryGroups[i].rootContainer.childRotationType = dgConstants.strTimeBased;
				deliveryGroups[i] = _arrangeDataByCaseForAttachOfScheduledSwap(deliveryGroups[i], cloneSbGroup);
			}
			return deliveryGroups;
		}

		function _arrangeDataByCaseForAttachOfScheduledSwap(deliveryGroup, cloneSbGroup) {
			var isDgNoAds = deliveryGroup.rootContainer.subContainers.length == 0;
			var endDate = cloneSbGroup.timeBased.endDate;
			if (isDgNoAds) { // No dg ads
				_updateDgWithoutAds(deliveryGroup, cloneSbGroup);
			} else if (!isDgNoAds && !endDate) { // dg contains ads + Not selected end date for Scheduled Swap
				_updateDgWithAdsAndWithoutEndDate(deliveryGroup, cloneSbGroup);
			} else { // dg contains ads +  selected Start and End date for Scheduled Swap
				_updateDgWithAdsAndWithEndDate(deliveryGroup, cloneSbGroup);
			}
			return deliveryGroup;
		}

		function _updateDgWithoutAds(deliveryGroup, cloneSbGroup) {
			cloneSbGroup.rotationSetting = _fillTimeBasedRotationWithData(cloneSbGroup.timeBased);
			deliveryGroup.rootContainer.subContainers.push(cloneSbGroup);
		}

		function _updateDgWithAdsAndWithoutEndDate(deliveryGroup, cloneSbGroup) {
			var cloneDGRotSubContainer = EC2Restangular.copy(deliveryGroup.rootContainer.subContainers);
			var cloneOldRotationType = EC2Restangular.copy(deliveryGroup.oldRotationType);
			deliveryGroup.rootContainer.subContainers = [];

			var newSubContainer = deliveryGroupJsonObjects.getDefaultSubGroupContainer(cloneOldRotationType, dgConstants.strTimeBased);

			var dateRange = _getStartAndEndForUpdateDgWithAdsAndWithoutEndDate(deliveryGroup,cloneDGRotSubContainer, cloneSbGroup);

			newSubContainer.subContainers = cloneDGRotSubContainer;
			newSubContainer.rotationSetting.startDate = dateRange.startDate;
			newSubContainer.rotationSetting.endDate = dateRange.endDate;
			newSubContainer.rotationSetting.datesAccordingToPlacements = false;
			deliveryGroup.rootContainer.subContainers.push(newSubContainer);
			cloneSbGroup.rotationSetting = _fillTimeBasedRotationWithData(cloneSbGroup.timeBased);
			deliveryGroup.rootContainer.subContainers.push(cloneSbGroup);
		}

		function _getStartAndEndForUpdateDgWithAdsAndWithoutEndDate(deliveryGroup,cloneDGRotSubContainer, cloneSbGroup) {
			var dateRange = {};
			dateRange.endDate = cloneSbGroup.timeBased.startDate;
			if (_isOldRotationTypeIsTimeBased(deliveryGroup)) {
				cloneDGRotSubContainer = dgHelper.sortTimeBasedDateByStartDate(cloneDGRotSubContainer);
				dateRange.startDate = new Date(cloneDGRotSubContainer[0].rotationSetting.startDate);
			} else {
				dateRange.startDate = dgHelper.getNowDateWithoutHours();
			}
			return dateRange;
		}

		function _updateDgWithAdsAndWithEndDate(deliveryGroup, cloneSbGroup) {
			var cloneDGRotSubContainer = EC2Restangular.copy(deliveryGroup.rootContainer.subContainers);
			var secondCloneDGRotSubContainer = EC2Restangular.copy(deliveryGroup.rootContainer.subContainers);
			var cloneOldRotationType = EC2Restangular.copy(deliveryGroup.oldRotationType);
			var secondCloneOldRotationType = EC2Restangular.copy(deliveryGroup.oldRotationType);
			deliveryGroup.rootContainer.subContainers = [];

			var dateRange = _getStartAndEndForUpdateDgWithAdsAndWithEndDate(deliveryGroup, cloneDGRotSubContainer);

			var newSubContainer = _fillTimeBaseWeight(cloneDGRotSubContainer, cloneOldRotationType, dateRange.startDate, cloneSbGroup.timeBased.startDate);
			var secondNewSubContainer = _fillTimeBaseWeight(secondCloneDGRotSubContainer, secondCloneOldRotationType, cloneSbGroup.timeBased.endDate, dateRange.endDate);

			cloneSbGroup.rotationSetting = _fillTimeBasedRotationWithData(cloneSbGroup.timeBased);
			deliveryGroup.rootContainer.subContainers.push(newSubContainer);
			deliveryGroup.rootContainer.subContainers.push(cloneSbGroup);
			deliveryGroup.rootContainer.subContainers.push(secondNewSubContainer);
		}

		function _getStartAndEndForUpdateDgWithAdsAndWithEndDate(deliveryGroup, cloneDGRotSubContainer) {
			var dateRange = {};
			if (_isOldRotationTypeIsTimeBased(deliveryGroup)) {
				cloneDGRotSubContainer = dgHelper.sortTimeBasedDateByStartDate(cloneDGRotSubContainer);
				dateRange.startDate = new Date(cloneDGRotSubContainer[0].rotationSetting.startDate);
				dateRange.endDate = new Date(cloneDGRotSubContainer[cloneDGRotSubContainer.length - 1].rotationSetting.endDate);
			} else {
				dateRange.startDate = dgHelper.getNowDateWithoutHours();
				dateRange.endDate = _getCampaignEndDate();
			}

			return dateRange;
		}

		function _isOldRotationTypeIsTimeBased(dg) {
			return dg.oldRotationType == dgConstants.strTimeBased;
		}

		function _fillTimeBaseWeight(cloneDGRotSubContainer, parentRotationType, startDate, endDate) {
			var subContainer = deliveryGroupJsonObjects.getDefaultSubGroupContainer(parentRotationType, dgConstants.strTimeBased);
			subContainer.subContainers = cloneDGRotSubContainer;
			subContainer.rotationSetting.startDate = startDate;
			subContainer.rotationSetting.uiStartDate = startDate;
			subContainer.rotationSetting.endDate = endDate;
			subContainer.rotationSetting.datesAccordingToPlacements = false;
			return subContainer;
		}


		function attachAction(deliveryGroups, modalInstance) {
			var serverDelivery = EC2Restangular.all('deliveryGroups').all('attachAdsToDeliveryGroups');
			return serverDelivery.customPUT(deliveryGroups).then(function () {
				mmAlertService.addSuccess("Attach ads to delivery groups success.");
				modalInstance.close();
			}, function (processError) {
				mmAlertService.addError("Attach ads to delivery groups fail. " + processError);
			});
		}

		function _createDgAd(ad, rotationType) {
			var dgAd = deliveryGroupJsonObjects.getDgAd(rotationType);
			dgAd.masterAdId = ad.id;
			dgAd.name = ad.name;
			dgAd.defaultImage = ad.defaultImage;
			dgAd.adType = ad.adFormat;
			dgAd.isNew = true;
			return dgAd;
		}

		function getDefaultSubGroupContainer(rotationType) {
			var subGroup = deliveryGroupJsonObjects.getDefaultSubGroupContainer(null, rotationType);
			subGroup.isNew = true;
			return subGroup;
		}

		function setSubDgRotationSettingToEvenDistribution(subGroup) {
			subGroup.rotationSetting = deliveryGroupJsonObjects.getRotationSetting(dgConstants.strEvenDistribution);
			subGroup.timeBased = undefined;
			subGroup.name = dgConstants.strSubGroup;
			return subGroup;
		}

		function setSubDgRotationSettingToTimeBase(subGroup, modalSubGroup) {
			subGroup.name = modalSubGroup.name;
			subGroup.timeBased = modalSubGroup;
			return subGroup;
		}

		function _fillTimeBasedRotationWithData(timeBase) {
			var rotationSetting = deliveryGroupJsonObjects.getRotationSetting(dgConstants.strTimeBased);
			rotationSetting.startDate = timeBase.startDate;
			rotationSetting.endDate = (timeBase.endDate) ? timeBase.endDate : _getCampaignEndDate();
			rotationSetting.datesAccordingToPlacements = false;
			return rotationSetting;
		}

		function _getCampaignEndDate(){
			return new Date("01-01-2099");
		}

		function getColumnNames() {
			return [
				{name: 'Delivery Group'},
				{name: 'Delivery Group ID'},
				{name: 'Dimension'},
				{name: 'Type'},
				{name: 'Delivery Group Rotation'},
				{name: 'Sub Group Name'},
				{name: 'Master Ad ID'},
				{name: 'Master Ad Name'},
				{name: 'Sub Group Rotation'},
				{name: 'Rotation Value'}
			];
		}

		function getScheduledSwapColumnNames() {
			return [
				{name: 'Delivery Group'},
				{name: 'Delivery Group ID'},
				{name: 'Dimensions'},
				{name: 'Type'},
				{name: 'Delivery Group Rotation'},
				{name: 'Sub Group Name',subGroup:true}
			];
		}

		function getCampaignAds(campaignId) {
			var deferred = $q.defer();
			serverAds.getList({"campaignId": campaignId}).then(function (ads) {
				deferred.resolve(ads);
			}, function (response) {
				deferred.reject(response);
			});
			return deferred.promise;
		}

		function mapIdToNameForAds(ads) {
			var stop = ads.length;
			var mapIdToName = {};
			for (var i = 0; i < stop; i++) {
				mapIdToName[ads[i].id] = ads[i].name;
			}
			return mapIdToName;
		}

		function attachValidation(deliveryGroups) {
			var valid = true;
			var dgStop = deliveryGroups.length;
			for (var i = 0; i < dgStop; i++) {
				if (deliveryGroups[i].rootContainer.childRotationType == dgConstants.strTimeBased) {
					valid = dgValidation.timeBasedSequenceValidation(deliveryGroups[i].rootContainer, true);
				}
				else if(deliveryGroups[i].rootContainer.childRotationType == dgConstants.strWeighted) {
					var rootContainer = deliveryGroups[i].rootContainer;
                    dgAdCalculateDecision.calculate(rootContainer, actionOptions.setTotalWeightForAllContainer);
					valid = dgValidation.weightValidation(undefined, rootContainer.childRotationType, rootContainer, undefined);
				}
				if (!valid)
					break;
			}
			return valid;
		}

		function mapPlacementFormat() {
			var placementFormat = {};
			var stop = enums.placementTypes.length;
			for (var i = 0; i < stop; i++) {
				placementFormat[enums.placementTypes[i].placementType] = enums.placementTypes[i].name;
			}
			return placementFormat;
		}

		function isScheduledSwap(val) {
			return dgConstants.strScheduledSwap == val;
		}

		function _formatDate(date) {
			return $filter('date')(date, "MMM dd,yyyy");
		}

		function createSgDateText(subGroup) {
			return (subGroup.endDate) ? _formatDate(subGroup.startDate) + " - " + _formatDate(subGroup.endDate) : _formatDate(subGroup.startDate);
		}

		return {
			isAdFormatValid: isAdFormatValid,
			mapAdFormats: mapAdFormats,
			getAssetDimension: getAssetDimension,
			fillSubContainersWithAds: fillSubContainersWithAds,
			addAdsToDgs: addAdsToDgs,
			attachAction: attachAction,
			getColumnNames: getColumnNames,
			getScheduledSwapColumnNames: getScheduledSwapColumnNames,
			getCampaignAds: getCampaignAds,
			mapIdToNameForAds: mapIdToNameForAds,
			getDefaultSubGroupContainer: getDefaultSubGroupContainer,
			setSubDgRotationSettingToEvenDistribution: setSubDgRotationSettingToEvenDistribution,
			setSubDgRotationSettingToTimeBase: setSubDgRotationSettingToTimeBase,
			attachValidation: attachValidation,
			mapPlacementFormat: mapPlacementFormat,
			isScheduledSwap: isScheduledSwap,
			createSgDateText: createSgDateText,
			convertDgsToScheduledSwap: convertDgsToScheduledSwap
		};
	}]);