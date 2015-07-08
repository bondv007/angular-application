'use strict';

app.controller('accountsListCtrl', ['$scope', 'EC2Restangular', function ($scope, EC2Restangular) {
	var serverAccounts = EC2Restangular.all('accounts');

	$scope.showSPinner = true;
	$scope.accounts = [];
	$scope.orderObj = 'name';
	$scope.reversed = false;

	serverAccounts.getList().then(function (all) {
		$scope.accounts = all;
		$scope.showSPinner = false;
	}, function (response) {
		console.log('ohh no!');
		console.log(response);
	});

	$scope.deleteAccount = function (account) {
		account.remove().then(function () {
			$scope.accounts = _.without($scope.accounts, account);
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

	$scope.accountsOrderBy = function (account) {
		return account[$scope.orderObj];
	};

	$scope.checkName = function (data, id) {
		if (data.length < 3 || data.length > 20) {
			return "name must be between 3 to 20 characters";
		}
		var account = _.findWhere($scope.accounts, {'id': id});
		account.name = data;
		account.put();
		//TODO: handle server errors
		return true;
	};
}]);
