'use strict';

app.controller('usersListCtrl', ['$scope', 'EC2Restangular', function ($scope, EC2Restangular) {
	var serverUsers = EC2Restangular.all('users');
	var serverAccounts = EC2Restangular.all('accounts');

	$scope.showSPinner = true;
	$scope.users = [];
	$scope.accounts = [];
	$scope.accountId2accountIndex = {};
	$scope.orderObj = 'name';
	$scope.reversed = false;

	serverUsers.getList().then(function (all) {
		$scope.users = all;
		$scope.showSPinner = false;
	}, function (response) {
		console.log('ohh no!');
		console.log(response);
	});

	serverAccounts.getList().then(function (all) {
		$scope.accounts = all;
		$scope.accountId2accountIndex = {};
		_.each(all, function (item, index) {
			$scope.accountId2accountIndex[item.id] = index;
		});
	}, function (response) {
		console.log('ohh no!');
		console.log(response);
	});

	$scope.getAccountById = function (id) {
		var index = $scope.accountId2accountIndex[id];
		if (index === undefined) {
			return {name: "---"};
		}
		return $scope.accounts[index];
	};

	$scope.deleteUser = function(user) {
		user.remove().then(function() {
			$scope.users = _.without($scope.users, user);
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

	$scope.usersOrderBy = function (user) {
		if ($scope.orderObj === 'accountName') {
			return $scope.getAccountById(user.accountId).name;
		}
		return user[$scope.orderObj];
	};

	$scope.checkAccount = function (data, id) {
		if ($scope.accountId2accountIndex[data] === undefined) {
			return "Please select existing account";
		}
		var camp = _.findWhere($scope.users, {'id': id});
		camp.accountId = data;
		camp.put();
		//TODO: handle server errors
		return true;
	};

	$scope.checkName = function (data, id) {
		if (data.length < 3 || data.length > 20) {
			return "name must be between 3 to 20 characters";
		}
		var user = _.findWhere($scope.users, {'id': id});
		user.name = data;
		user.put();
		//TODO: handle server errors
		return true;
	};
}]);
