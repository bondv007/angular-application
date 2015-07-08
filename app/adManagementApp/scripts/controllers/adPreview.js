/**
 * Created by atdg on 6/30/2014.
 */
'use strict';
app.controller('adPreviewCtrlOld', ['$scope', '$rootScope', '$stateParams', 'EC2Restangular', '$filter', '$state', '$timeout',
	'mmModal', 'adService', 'configuration', 'enums', 'mmAlertService', '$compile',
	function ($scope, $rootScope, $stateParams, EC2Restangular, $filter, $state, $timeout, mmModal, adService, configuration, enums, mmAlertService, $compile) {
		var elementContainer = ".elementContainer";
		var serverAds = EC2Restangular.all('ads');
		var serverAssets = EC2Restangular.all('assetMgmt');
		var serverAccounts = EC2Restangular.all('accounts');
		var serverAdvertisers = EC2Restangular.all('advertisers');
		$scope.backgroundUrl = "";
		$scope.adId = "145K5GO1VY8";

		$scope.lookups ={adFormats: enums.adFormats,
										adStatuses: enums.adStatuses,
										thirdpartyUrlTypes : enums.thirdpartyURLsTypes,
										clickthroughTypes : enums.clickthroughURLsTypes,
										targetWindowTypes : enums.targetWindowTypes
		};
		$scope.hideMetaDataContainer = false;
		$scope.hideAdDisplayContainer = false;
		$scope.hideInteractionMonitorContainer = false;
		$scope.hideBackgroundUrlBox = false;
		$scope.hideAdUnit = false;
		$scope.hideAssets = true;
		$scope.hideSideBySide = true;
		$scope.selectedScreenClass = "selectedScreen";
		$scope.enableDrag = false;
		$scope.ad = {};
		$scope.assets = [];
		$scope.entityLayoutButtons.push(
			{name: 'Ad Info', func: showHideAdMetadataModel, ref: null},
			{name: 'Interaction Monitor', func: showHideInteractionMonitor},
			{name: 'Background', func: showHideAdBackgroundUrlBox, ref: null},
			{name: 'Position Ad', func: moveUnmoveAdModel, ref: null});

		$scope.containerTypes = {
			metaDataContainer: 1,
			adDisplayContainer: 2,
			interactionMonitorContainer: 3
		};

		function showHideAdMetadataModel() {
			$scope.hideMetaDataContainer = !$scope.hideMetaDataContainer;
		}

		function showHideInteractionMonitor() {
			$scope.hideInteractionMonitorContainer = !$scope.hideInteractionMonitorContainer;
		}

		function showHideAdBackgroundUrlBox() {
			$scope.hideBackgroundUrlBox = !$scope.hideBackgroundUrlBox;
		}

		function moveUnmoveAdModel() {
			$scope.enableDrag = !$scope.enableDrag;
      if ($scope.enableDrag) $scope.frameStyle = {border: '4px dotted gray'};
      else $scope.frameStyle = {'border-left': '0px', 'border-top': '0px', 'border-right': '0px', 'border-bottom': '0px'};
		}


		$scope.screenTypes = {
			adUnit: 1,
			assets: 2,
			sideBySide: 3
		};

    $scope.monitorEvents = [];

		$scope.DownloadBackgorundUrlContent = function () {
			if (!$scope.backgroundUrl.match(/^http([s]?):\/\/.*/)) {
				$scope.backgroundUrl = "http://" + $scope.backgroundUrl;
			}
			$(elementContainer).backstretch([
				$scope.backgroundUrl
			], {
				isImage: false
			});
		};

		if ($scope.adId !== undefined && $scope.adId !== "") {
			console.log("adid", $scope.adId);
			serverAds.get($scope.adId).then(function (ad) {
				$scope.ad = ad;
        console.log("ad", ad);
				$scope.originalAd = _.clone($scope.ad);
        $scope.formattedAdSize = Number(ad.overallSize/1024/1024).toFixed(2) + " MB";
        fillAssetsOnPage(ad);
			}, processError);
		}

		function processError(error) {
			console.log("ERROR: " + JSON.stringify(error));
			mmAlertService.addError("Server error. Please try again later.");
		}

		function fillAssetsOnPage(ad) {
			$scope.adParts = [];
      $scope.additionalAssets = [];

      if (ad.defaultImage !== undefined && ad.defaultImage !== null){
        serverAssets.get(ad.defaultImage.assetId).then(function (item) {
          item.partType = 'Default Image'
          $scope.adParts.push(item);
        });
      }
      if (ad.banner !== undefined && ad.banner !== null){
        serverAssets.get(ad.banner.assetId).then(function (item) {
          item.partType = 'Banner'
          $scope.adParts.push(item);
        });
      }
      if (ad.panels !== undefined && ad.panels !== null && ad.panels.length > 0){
        for (i = 0; i < ad.panels.length; i++){
          serverAssets.get(ad.panels[i].assetId).then(function (item) {
            item.partType = 'Panel';
            $scope.adParts.push(item);
          });
        }
      }
      if (ad.additionalAssets !== undefined && ad.additionalAssets !== null && ad.additionalAssets.length > 0){
        for (i = 0; i < ad.additionalAssets.length; i++){
          serverAssets.get(ad.additionalAssets[i].assetId).then(function (item) {
            item.partType = 'Additional Asset';
            $scope.additionalAssets.push(item);
          });
        }
      }
		}

		$scope.closeContainer = function (containerType) {
			switch (containerType) {
				case $scope.containerTypes.metaDataContainer :
					$scope.hideMetaDataContainer = true;
					break;
				case $scope.containerTypes.adDisplayContainer :
					$scope.hideAdDisplayContainer = true;
					break;
				case $scope.containerTypes.interactionMonitorContainer :
					$scope.hideInteractionMonitorContainer = true;
					break;
			}
		};

		$scope.changeScreen = function (screenType) {
			switch (screenType) {
				case $scope.screenTypes.adUnit :
					$scope.hideAdUnit = false;
					$scope.hideAssets = true;
					$scope.hideSideBySide = true;
					break;
				case $scope.screenTypes.assets :
					$scope.hideAdUnit = true;
					$scope.hideAssets = false;
					$scope.hideSideBySide = true;
					break;
				case $scope.screenTypes.sideBySide :
					$scope.hideAdUnit = true;
					$scope.hideAssets = true;
					$scope.hideSideBySide = false;
					break;
			}
		};

		$scope.clearUrlField = function () {
			$scope.backgroundUrl = "";
      $scope.DownloadBackgorundUrlContent();
		};

	}]);
