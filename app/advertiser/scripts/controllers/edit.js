/**
 * Created by yoav.karpeles on 24/3/2014.
 */

'use strict';

app.controller('advertiserEditCtrl', ['$scope', '$rootScope', '$stateParams', 'EC2Restangular', 'mmMessages', '$state', 'configuration',
	function ($scope, $rootScope, $stateParams, EC2Restangular, mmMessages, $state, conf) {
		$scope.advertiserId = $stateParams.advertiserId;
		var twoids = $scope.advertiserId.split('.');
		if (twoids.length === 2) {
			$state.transitionTo('spa.advertiser.edit', {advertiserId: twoids[0], accountId: twoids[1]}, {location: true});
			return;
		}
		$scope.pageReady = false;
		$scope.debug = conf.debug;
		$scope.accountId = $stateParams.accountId;
    $scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: cancel, ref: null, nodes: []}
    $scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: save, ref: null, nodes: []}
		$scope.validation = {};

		/*
		$rootScope.$on('$stateChangeStart',
			function(event, toState, toParams, fromState, fromParams){
				event.preventDefault();
			});
		*/

		var serverAccount = EC2Restangular.all('accounts');
		serverAccount.getList().then(getAccount, processError);

		function getAccount(data) {
			$scope.accounts = data;
			$scope.pageReady = $scope.advertiserModel != null && $scope.accounts != null;
		}

		$scope.advertiser = null;
		$scope.advertiserEdit = null;
		$scope.$watch('$parent.mainEntity', updateState);
		$scope.$watch('accountId', updateState);
		$scope.$watch('advertiserModel.name', function(newValue) {
			if (newValue == null || newValue.length == 0) {
				$scope.validation.name = "Please Enter Valid Name";
			} else {
				$scope.validation.name = null;
			}
		});

		function updateState() {
			if ($scope.$parent.mainEntity != null) {
				if ($scope.$parent.mainEntity._name !== undefined) {
					$scope.$parent.mainEntity.name = $scope.$parent.mainEntity._name;
					delete $scope.$parent.mainEntity._name;
				}
				$scope.advertiser = $scope.$parent.mainEntity;
				$scope.advertiserEdit = EC2Restangular.copy($scope.$parent.mainEntity);
			} else {
				$scope.advertiser = null;
				$scope.advertiserEdit = null;
			}
			$scope.advRoot = $scope.accountId == null;
			if ($scope.advRoot) {
				$scope.advertiserModel = $scope.advertiserEdit;
			} else {
				if ($scope.advertiserEdit != null) {
					$scope.advertiserModel = $scope.advertiserEdit.advertiserAccounts.getByProperty('accountId', $scope.accountId);
					$scope.$parent.mainEntity._name = $scope.$parent.mainEntity.name;
					$scope.$parent.mainEntity.name = $scope.advertiserModel.name;
				} else {
					$scope.advertiserModel = null;
				}
			}
			$scope.pageReady = $scope.advertiserModel != null && $scope.accounts != null;
		}

		// we can't use the result from the put (server bug) we get the main entity again
		function updateData(data) {
			$scope.$parent.mainEntity.get().then(refreshMainEntity, processError);
		}

		function refreshMainEntity(data) {
			$scope.$parent.mainEntity = data;
		}

		function processError(error) {
			console.log('ohh no!');
			console.log(error);
			if (error.data.error === undefined) {
				mmMessages.addError("Message", "Server error. Please try again later.", false);
			} else {
				mmMessages.addError("Message", error.data.error, false);
			}
		}

		function cancel() {
			updateState();
		}

		function save() {
			$scope.advertiserEdit.put().then(updateData, processError);
		}

	}]);