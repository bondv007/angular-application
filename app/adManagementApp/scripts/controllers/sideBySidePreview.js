/**
 * Created by xicom on 7/3/2014.
 */
app.controller('sideBySideCtrl', ['$scope', '$rootScope', '$stateParams', 'EC2Restangular', '$filter', '$state', '$timeout',
	'mmModal', 'adService', 'configuration', 'enums', 'mmMessages', '$compile',
	function ($scope, $rootScope, $stateParams, EC2Restangular, $filter, $state, $timeout, mmModal, adService, configuration, enums, mmMessages, $compile) {

		$scope.screenTypes = {
			adUnit: 1,
			assets: 2,
			sideBySide: 3
		};
		$scope.adId = "17I1B8FBY21";
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