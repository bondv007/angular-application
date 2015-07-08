'use strict';

app.controller('navBarCtrl', ['$scope', '$modal', 'mmSession', 'configuration', 'mmUserService', '$translate', 'toaster',
	function ($scope, $modal, session, config, mmUserService, $translate, toaster) {
	$scope.appTitle = 'MediaMind 3.0';
	$scope.isModalOpen = false;
	$scope.env = config.env;
	$scope.userName = session.get('user').name;
	$scope.mmSubscribe('user', function (scope, newUser, oldUser) {
		$scope.userName = newUser.name;
	});

	$scope.$on('event:auth-loginRequired', function () {
		$scope.openLogInModal();
	});

	$scope.openLogInModal = function () {
		if ($scope.isModalOpen) {
			return;
		}
		$scope.isModalOpen = true;
		var modalInstance = $modal.open({
			templateUrl: './infra/views/mmLogin.html',
			controller: 'mmLoginCtrl'
		});
		modalInstance.result.then(function () {
			$scope.isModalOpen = false;
		}, function () {
			$scope.isModalOpen = false;
		});
	};

	$scope.logOut = function() {
		mmUserService.logout();
	};

	$scope.changeLanguage = function (langKey) {
		$translate.use(langKey).then(function () {
			$scope.currentLanguage = $translate.use();
		});

	};

	$scope.currentLanguage = $translate.use();

	$scope.message = function(errorLevel, title, body, bodyOutputType) {
		toaster.pop(errorLevel, title, body, 3000, bodyOutputType);
	}
}]);

