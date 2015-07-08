/**
 * Created by xicom on 7/3/2014.
 */
'use strict';
app.controller('assetPreviewCtrl', ['$scope', '$rootScope', '$stateParams', 'EC2Restangular', '$filter', '$state', '$timeout',
	'mmModal', 'adService', 'configuration', 'enums', 'mmMessages', '$compile',
	function ($scope, $rootScope, $stateParams, EC2Restangular, $filter, $state, $timeout, mmModal, adService, configuration, enums, mmMessages, $compile) {
		var serverAds = EC2Restangular.all('ads');
		var serverAssets = EC2Restangular.all('assetMgmt');
		$scope.adId = "17I1B8FBY21";
		$scope.additionalAssets = [];
		$scope.items=[];
		$scope.screenTypes = {
			adUnit: 1,
			assets: 2,
			sideBySide: 3
		};

		if ($scope.adId !== undefined && $scope.adId !== "") {
			console.log("adid", $scope.adId);
			serverAds.get($scope.adId).then(function (ad) {
				$scope.ad = ad;
				console.log("ad", ad);
				$scope.originalAd = _.clone($scope.ad);
				if (ad.additionalAssets !== undefined && ad.additionalAssets !== null && ad.additionalAssets.length > 0) {
					for (var i = 0; i < ad.additionalAssets.length; i++) {
						serverAssets.get(ad.additionalAssets[i].assetId).then(function (item) {
							item.partType = 'Additional Asset';
							$scope.additionalAssets.push(item);
						});
					}
					console.log("additionalAssets", $scope.additionalAssets);
				}
			}, processError);
		}

//		serverAds.getList().then(function (ads) {
//			var adverts = _.filter(ads, function (ad) {
//			return	ad.additionalAssets != null;
//			})
//			console.log("ads", adverts);
//		});

//		serverAssets.getList().then(function (data) {
//			var assets = data;
//			console.log("assets", assets);
//		});

		function processError(error) {
			console.log("ERROR: " + JSON.stringify(error));
			mmMessages.addError("Message", "Server error. Please try again later.", false);
		}

		$scope.mySlides = [
			'http://flexslider.woothemes.com/images/kitchen_adventurer_cheesecake_brownie.jpg',
			'http://flexslider.woothemes.com/images/kitchen_adventurer_lemon.jpg',
			'http://flexslider.woothemes.com/images/kitchen_adventurer_donut.jpg',
			'http://flexslider.woothemes.com/images/kitchen_adventurer_caramel.jpg'
		];

//		$scope.items = [
//			'images/picture1.jpg',
//			'images/picture1.jpg',
//			'images/picture1.jpg',
//			'images/picture1.jpg',
//			'images/picture1.jpg',
//			'images/picture1.jpg'
//		];

		$scope.carousel = "carousel";
		$scope.slider = "slider";

		$scope.jquerySlides = [
			'images/picture1.jpg',
			'images/picture1.jpg',
			'images/picture1.jpg',
			'images/picture1.jpg'
		];

		$scope.hideAssetDetailSlider = false;

		$scope.hideDetailSlider = function () {
			$scope.hideAssetDetailSlider = true;
		};

		$scope.changeScreen = function (screenType) {
			switch (screenType) {
				case $scope.screenTypes.adUnit :
					$state.go("spa.adPreviewLayout.adPreview", {adId: $scope.entityId});
					break;
				case $scope.screenTypes.assets :
					$state.go("spa.adPreviewLayout.assetPreview", {adId: $scope.entityId});
					break;
				case $scope.screenTypes.sideBySide :
					$state.go("spa.adPreviewLayout.sideBySide", {adId: $scope.entityId});
					break;
			}
		};

	}]);