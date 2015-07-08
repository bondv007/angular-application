/**
 * Created by yoav.karpeles on 1/21/14.
 */
app.controller('configurationEditCtrl', ['$scope', 'EC2Restangular', '$q', '$timeout', function ($scope, EC2Restangular, $q, $timeout) {
	var serverConfig = EC2Restangular.all('configuration/configurations');

	$scope.alerts = [];
	$scope.showSPinner = true;
	serverConfig.getList().then(getData, processError);
	//mockData().then(getData, processError);

	function mockData() {
		var q = $q.defer();
		q.resolve([
			{
				"name": "test",
				"value": [
					{
						"name": "prop1",
						"value": "2"
					},
					{
						"name": "prop2",
						"value": [
							{
								"name": "prop21",
								"value": "5"
							},
							{
								"name": "prop22",
								"value": "5"
							}
						]
					}
				]
			},
			{
				"name": "sgfg",
				"value": "345"
			},
			{
				"name": "rtdrtwe",
				"value": [
					{
						"name": "sdfg",
						"value": "34"
					}
				]
			}
		]);
		return q.promise;
	}

	$scope.addAlert = function(msg, type, timeout) {
		var alert = {'msg': msg, 'type': type};
		$scope.alerts.push(alert);
		if (timeout) {
			$timeout(function(){
				$scope.closeAlert($scope.alerts.indexOf(alert));
			}, timeout);
		}
	};

	$scope.closeAlert = function(index) {
		$scope.alerts.splice(index, 1);
	};

	function getData(data) {
		$scope.config = {'name': 'Configuration', 'value': data};
		$scope.showSPinner = false;
	}

	function processData(data) {
		getData(data);
		$scope.addAlert('OK - The server was able to save your data this time', 'success', 1000);
	}

	function processError(error) {
		console.log('ohh no!');
		console.log(error);
		$scope.showSPinner = false;
		var msg = error.data.error;
		if (msg === undefined) {
			msg = 'WTF??? server is down again! Ma kore itchem?';
		}
		$scope.addAlert(msg, 'danger', 2000);
	}

	$scope.checkName = function(oldName, name, parent) {
		if (oldName === name) {
			return true;
		}
		if (/^[a-zA-Z0-9_]+$/.test(name)) {
			var arr = parent;
			for (var i = 0; i < arr.length; i++) {
				if (arr[i].name === name) {
					return "Name must be unique";
				}
			}
		} else {
			return "Please use only alphanumeric name";
		}
		return true;
	};

	$scope.edited = function(data) {
		if (data.value === '[]') {
			data.value = [];
			$scope.newItem(data);
		}
		data.edited = true;
	};

	$scope.newItem = function(data) {
		if (!angular.isArray(data)) {
			data = data.value;
		}
		data.push({'name': null, 'value': null, 'new': true, 'edited': true});
	};

	$scope.save = function () {
		$scope.addAlert('save', 'danger', 1000);
		serverConfig.post($scope.config.value).then(processData, processError);
	};
}]);

'use strict';
