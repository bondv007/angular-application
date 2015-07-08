/**
 * Created by Ofir.Fridman on 11/17/14.
 */
'use strict';

app.service('dgTraffickingService', ['EC2Restangular', '$q', 'dgHelper', 'mmAlertService', 'deliveryGroupJsonObjects', 'dgValidation', 'dgConstants',
	'calculateAdGroupRotation', 'mmModal', '$rootScope', 'secConversion',
	function (EC2Restangular, $q, dgHelper, mmAlertService, deliveryGroupJsonObjects, dgValidation, dgConstants, calculateAdGroupRotation, mmModal, $rootScope, secConversion) {
		var serverDgs = EC2Restangular.all('deliveryGroups');
		var serverAds = EC2Restangular.all('ads');

		function getCampaignDgsAndAds(campaignId) {
			var deferred = $q.defer();
			var dgsPromise = getDgsByCampId(campaignId);
			var adsPromise = getMasterAdsByCampId(campaignId);
			$q.all([dgsPromise, adsPromise]).then(function (results) {
				var dgs = results[0];
				var ads = results[1];
				createDgsUi(dgs,ads);
				deferred.resolve(dgs);
			}, function (errors) {
				processError(errors);
				deferred.reject();
			});
			return deferred.promise;
		}

		function getMasterAdsByCampId(campaignId) {
			var deferred = $q.defer();
			serverAds.getList({"campaignId": campaignId, "adType": dgConstants.strMasterAd_Rest_API_Filter}).then(function(ads){
				deferred.resolve(ads);
			}, processError);
			return deferred.promise;
		}

		function getDgsByCampId(campaignId) {
			var deferred = $q.defer();
			serverDgs.getList({"campaignId": campaignId}).then(function(dgs){
				deferred.resolve(dgs);
			}, processError);
			return deferred.promise;
		}

		function createDgsUi(dgs,ads) {
			var dg;
			for (var i = 0; i < dgs.length; i++) {
				dg = dgs[i];
				calculateAdGroupRotation.setSonsRotationOptions(dg.rootContainer);
				dg.dimension = dgHelper.getDgUiDimension(dg).dimension;
				dg.errors = {errorDgName: {text: ''}, errorMinimumTimeBetweenAds: {text: ''}};
				convertServerAdsToDgRotationAds(dg.rootContainer.subContainers,ads);
				convertServerAdsToDgDefaultAds(dg.defaultAds,ads);
			}
		}

		function processError(error) {
			if (error.data.error === undefined) {
				mmAlertService.addError("Server error. Please try again later");
			} else {
				mmAlertService.addError(error.data.error);
			}
			$q.reject();
		}

		function convertServerAdsToDgRotationAds(subContainers,ads) {
			for (var j = 0; j < subContainers.length; j++) {
				var ad = subContainers[j];
				if(dgHelper.isAdContainer(ad)){
                    convertServerAdsToDgRotationAds(ad.subContainers,ads);
				}
				else{
					ad.name = getAdName(ads,ad.masterAdId);
					ad.showRotation = ad.rotationSetting.enabled;
					ad.from = dgConstants.strFromRotation;
					ad.isSelected = false;
				}
			}
		}

        function convertServerAdsToDgDefaultAds(defaultAds,ads) {
            for (var j = 0; j < defaultAds.length; j++) {
                var ad = angular.copy(defaultAds[j]);
                var uiAd = {};
                uiAd.rotationSetting = {enabled: true};
                uiAd.masterAdId = ad;
                uiAd.showRotation = false;
                uiAd.from = dgConstants.strFromDefault;
                uiAd.name = getAdName(ads, uiAd.masterAdId);
                uiAd.isSelected = false;
                defaultAds[j] = uiAd;
            }
        }

		function getAdName(ads, adId) {
			var name = "";
			if(adId){
				name = _.find(ads, {id: adId}).name;
			}
			return  name;
		}

		function save(dgs) {
			var deferred = $q.defer();
			if (dgValidation.saveValidation(dgs)) {
				var cloneDg;
				var promises = [];
				angular.forEach(dgs, function (dg) {
					cloneDg = EC2Restangular.copy(dg);
					cloneDg.defaultAds = _.pluck(cloneDg.defaultAds, dgConstants.strMasterAdId);
					dgHelper.updateImpressionsPerUserBeforeSave(cloneDg);
					calcTimeBetweenAds(cloneDg);
					if (dg.id) {
						promises.push(cloneDg.put().then());
					}else{
						promises.push(serverDgs.post(cloneDg).then());
					}
				});
				$q.all(promises).then(function(){
					mmAlertService.addSuccess("Save Delivery Groups Success.");
					deferred.resolve();
				},processError);
			}
			else{
				deferred.reject();
			}
			return deferred.promise;
		}

		function calcTimeBetweenAds(dg) {
			var valToSec = {timeUnit: dg.timeBetweenAds.selectedTimeUnit.id, time: dg.servingSetting.timeBetweenAds};
			dg.servingSetting.timeBetweenAds = secConversion.toSec(valToSec);
		}

		function createNewDg(dgs, campaignId) {
			var newDg = deliveryGroupJsonObjects.newDeliveryGroup(campaignId);
			dgs.unshift(newDg);
		}

		function isDisableEnable(dgsEnableDisableState) {
			var disableEnable = false;
			var states = _.flatten(_.values(dgsEnableDisableState), "text");
			if (Object.keys(dgsEnableDisableState).length == 0) {
				disableEnable = true;
			} else if (_.contains(states, dgConstants.disableEnableButtonOptions.disableEnable)) {
				disableEnable = true;
			} else if (_.contains(states, dgConstants.disableEnableButtonOptions.disable) && _.contains(states, dgConstants.disableEnableButtonOptions.enable)) {
				disableEnable = true;
			} else {
				disableEnable = false;
			}
			return disableEnable;
		}

		function displayExistingDgs() {
			mmAlertService.closeAll();
			var modalInstance = mmModal.open({
				templateUrl: "campaignManagementApp/views/dgTrafficking/traffickingExistingDg.html",
				controller: "traffickingExistingDgCtrl",
				title: "Select Existing Delivery Group",
				modalWidth: 800,
				bodyHeight: 500,
				discardButton: { name: "Close", funcName: "cancel" },
				additionalButtons: [
					{ name: "Select", funcName: "onSelect", isPrimary:true}
				],
				resolve: {
//					dgs: function () {
//						return dgs;
//					}
				}
			});

			modalInstance.result.then(function () {
				$rootScope.isDirtyEntity = true;
			},function () {

			}).then(function () {
				mmAlertService.closeError();
			});
		}

		return {
			getDgsByCampId: getDgsByCampId,
			getMasterAdsByCampId: getMasterAdsByCampId,
			getCampaignDgsAndAds: getCampaignDgsAndAds,
			save: save,
			createNewDg: createNewDg,
			isDisableEnable: isDisableEnable,
			displayExistingDgs: displayExistingDgs,
            unitTests: {calcTimeBetweenAds: calcTimeBetweenAds, createDgsUi: createDgsUi}
        };
	}]);