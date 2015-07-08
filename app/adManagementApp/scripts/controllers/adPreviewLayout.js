/**
 * Created by atdg on 6/30/2014.
 */

'use strict';
app.controller('adPreviewLayoutCtrl', ['$scope', '$rootScope', '$stateParams', 'EC2Restangular', '$filter', '$state', '$timeout',
	'mmModal', 'adService', 'configuration', 'enums', 'mmAlertService',
	function ($scope, $rootScope, $stateParams, EC2Restangular, $filter, $state, $timeout, mmModal, adService, configuration, enums, mmAlertService) {
		var serverCampaigns = EC2Restangular.all('campaigns');
		var serverAccounts = EC2Restangular.all('accounts');
		var errorMessage = "";

		$scope.entityId = $stateParams.adId;
		$scope.type = typeof $scope.entityId == "undefined" ? 'masterAd' : 'masterAd : ' + $scope.entityId;
		$scope.entityActions = [];
        $scope.entityActions.parentMenuItem = 'Creative';
        if($scope.$parent.isActive) $scope.$parent.isActive($scope.entityActions.parentMenuItem);

		function deleteAd() {
			$scope.ad.remove();
			$state.go("spa.adList");
		}

		$scope.cancel = function () {
			$state.go("spa.adList");
		};
	}]);

