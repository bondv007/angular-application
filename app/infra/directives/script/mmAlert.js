app.directive('mmAlert', [function () {
	return {
		restrict: 'E',
		templateUrl: 'infra/directives/views/mmAlert.html',
		controller: ['$scope', '$rootScope', '$timeout', function ($scope, $rootScope, $timeout) {
			$rootScope.alerts = {error: [], info: [], success: [], warning: []};
			$scope.cssSuccessFadeIn = true;
			$scope.cssWarningFadeIn = true;
			$scope.cssErrorFadeIn = true;
			$scope.cssInfoFadeIn = true;
			var timeOutFunc1, timeOutFunc2, timeOutFunc3, timeOutFunc4, timeOutFunc5;
			var timeOut = 150;

			$scope.closeAlert = function (alertType, milliseconds) {
				if (milliseconds == null) {
					milliseconds = 0;
				}
				switch (alertType.toLowerCase()) {
					case "success":
						alertTimeOut(closeAlertSuccess, milliseconds);
						break;
					case "warning":
						alertTimeOut(closeAlertWarning, milliseconds);
						break;
					case "error":
						alertTimeOut(closeAlertError, milliseconds);
						break;
					case "info":
						alertTimeOut(closeAlertInfo, milliseconds);
						break;
				}
			};
			$rootScope.closeAlertWithTimeOut = function (alertType, milliseconds) {
				$scope.closeAlert(alertType, milliseconds);
			};
			function closeAlertSuccess() {
				$scope.cssSuccessFadeIn = false;
				timeOutFunc1 = $timeout(function () {
					$rootScope.alerts.success = [];
					$scope.cssSuccessFadeIn = true;
				}, timeOut);
			}

			function closeAlertWarning() {
				$scope.cssWarningFadeIn = false;
				timeOutFunc2 = $timeout(function () {
					$rootScope.alerts.warning = [];
					$scope.cssWarningFadeIn = true;
				}, timeOut);

			}

			function closeAlertError() {
				$scope.cssErrorFadeIn = false;
				timeOutFunc3 = $timeout(function () {
					$rootScope.alerts.error = [];
					$scope.cssErrorFadeIn = true;
				}, timeOut);
			}

			function closeAlertInfo() {
				$scope.cssInfoFadeIn = false;
				timeOutFunc4 = $timeout(function () {
					$rootScope.alerts.info = [];
					$scope.cssInfoFadeIn = true;
				}, timeOut);
			}

			function alertTimeOut(callBack, milliseconds) {
				if (milliseconds == null) {
					milliseconds = 0;
				}
				timeOutFunc5 = $timeout(function () {
					callBack();
				}, milliseconds);
			}

			$scope.$on('$destroy', function() {
				if (timeOutFunc1){
					$timeout.cancel(timeOutFunc1);
				}
				if (timeOutFunc2){
					$timeout.cancel(timeOutFunc2);
				}
				if (timeOutFunc3){
					$timeout.cancel(timeOutFunc3);
				}
				if (timeOutFunc4){
					$timeout.cancel(timeOutFunc4);
				}
				if (timeOutFunc5){
					$timeout.cancel(timeOutFunc5);
				}
			});
		}]
	}
}]
);