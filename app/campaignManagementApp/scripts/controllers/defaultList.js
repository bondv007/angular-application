'use strict';

app.controller('defaultListCtrl', ['$scope', 'EC2Restangular', 'listConfig', function ($scope, EC2Restangular, listConfig) {
	var serverRest = EC2Restangular.all(listConfig.serviceName);

	$scope.showSPinner = true;
	$scope.items = [];
	$scope.orderObj = listConfig.initOrder;
	$scope.reversed = false;

	serverRest.getList().then(function (all) {
		$scope.items = all;
		$scope.showSPinner = false;
	}, function (response) {
		console.log('ohh no!');
		console.log(response);
	});

	$scope.deleteItem = function(item) {
		item.remove().then(function() {
			$scope.items = _.without($scope.items, item);
		}, function (response) {
			console.log('ohh no!');
			console.log(response);
		});
	};

	$scope.orderBy = function (orderBy) {
		if ($scope.orderObj === orderBy) {
			$scope.reversed = !$scope.reversed;
		}
		else {
			$scope.orderObj = orderBy;
			$scope.reversed = false;
		}
	};
}]);
