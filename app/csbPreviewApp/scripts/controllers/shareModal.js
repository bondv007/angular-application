'use strict';
app.controller('shareModalCtrl', ['$rootScope', '$scope', '$modalInstance', '$modal',
	function ($rootScope, $scope, $modalInstance, $modal) {
		$scope.commonObject = {isCopied: false, isHide: true};
		$scope.close = function () {
			$modalInstance.close('hide');
			$rootScope.previewLink = '';
			$rootScope.isLinkGenerated = false;
		};

		$scope.hideCopiedDiv = function () {
			$scope.commonObject.isHide = true;
		};
		$scope.showCopiedDiv = function () {
			$scope.commonObject.isCopied = true;
			$scope.commonObject.isHide = false;
		};
		$scope.getTextToCopy = function () {
			return $rootScope.previewLink;
		}
		$scope.hideCopiedDiv();
	}]);
