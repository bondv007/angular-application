app.controller('defaultEditCtrl', ['$scope', '$stateParams', 'EC2Restangular', '$q', 'editConfig', function ($scope, $stateParams, EC2Restangular, $q, editConfig) {
	var serverRest = EC2Restangular.all(editConfig.serviceName);

	$scope.alerts = [];
	$scope.showSPinner = false;
	$scope.itemId = $stateParams.itemId;
	$scope.item = {};

	if ($scope.itemId != null && $scope.itemId > 0) {
		$scope.showSPinner = true;
		serverRest.get($scope.itemId).then(getData, processError);
	}

	$scope.isDirty = function (param) {
		if ($scope.orig === undefined) {
			return true;
		}
		if (param === undefined) {
			return !_.isEqual($scope.item, $scope.orig);
		} else {
			return !_.isEqual($scope.item[param], $scope.orig[param]);
		}
	};

	function getData(data) {
		$scope.item = data;
		$scope.orig = _.clone($scope.item);
		$scope.showSPinner = false;
	}

	function processData(data) {
		getData(data);
		$scope.alerts.push({ type: 'success', msg: 'OK - The server was able to save your data this time'});
	}

	function processError(error) {
		console.log('ohh no!');
		console.log(error);
		$scope.showSPinner = false;
		if (error.data.error === undefined) {
			$scope.alerts.push({ type: 'danger', msg: 'WTF??? server is down again! Ma kore chevre?'});
		} else {
			$scope.alerts.push({ type: 'danger', msg: error.data.error});
		}
	}

	$scope.save = function () {
		$scope.alerts.length = 0;
		if ($scope.item.id === undefined) {
			serverRest.post($scope.item).then(processData, processError);
		} else {
			$scope.item.put().then(processData, processError);
		}
	};
}]);

'use strict';
