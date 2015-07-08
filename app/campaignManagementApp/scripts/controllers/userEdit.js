'use strict';

app.controller('userEditCtrl', ['$scope', '$stateParams', 'EC2Restangular', '$q', 'configuration', 'mmAlertService',
	function ($scope, $stateParams, EC2Restangular, $q, config, mmAlertService) {
		$scope.userId = $stateParams.userId;
		$scope.pageReady = false;
		$scope.debug = config.debug;
		$scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: updateState, ref: null, nodes: []};
		$scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: save, ref: null, nodes: []};

		var serverAccount = EC2Restangular.all('accounts');
		serverAccount.getList().then(getAccount, processError);
		var validate = EC2Restangular.one('users/ValidateUserName');

		function getAccount(data) {
			$scope.accounts = data;
			$scope.pageReady = $scope.userEdit != null && $scope.accounts != null;
		}

		$scope.$watch('$parent.mainEntity', updateState);

		function updateState() {
			if ($scope.$parent.mainEntity != null) {
				$scope.user = $scope.$parent.mainEntity;
				$scope.userEdit = EC2Restangular.copy($scope.$parent.mainEntity);
			} else {
				$scope.user = null;
				$scope.userEdit = {
					name: "",
					type: "User"
				};
			}
			$scope.pageReady = $scope.userEdit != null && $scope.accounts != null;
		}

		$scope.checkName = function (data) {
			var d = $q.defer();
			validate.one(data).get().then(function (res) {
				if (res === 'true') {
					d.resolve();
				} else {
					d.resolve('Username already exists');
				}
			}, function (e) {
				console.log(e);
				d.reject('WTF??? server is down again! Ma kore chevre?');
			});
			return d.promise;
		};

		function processError(error) {
			console.log('ohh no!');
			console.log(error);
			if (error.data.error === undefined) {
        mmAlertService.addError("Server error. Please try again later.");
			} else {
        mmAlertService.addError(error.data.error);
			}
		}

		function cancel() {
			updateState();
		}

		function save() {
			$scope.userEdit.put().then(updateData, processError);
		}

	}]);
