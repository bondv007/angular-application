'use strict';

app.controller('createCloudAccountCtrl', ['$scope', 'Restangular', function ($scope, Restangular) {
	Restangular.setBaseUrl('http://ec2-54-200-7-100.us-west-2.compute.amazonaws.com:8080/DG.Account.Orchestration/V1/AccountService/');
	$scope.accountName = null;
	$scope.newAccount = null;
	$scope.accounts = [];

	$scope.showNewAccount = false;

	$scope.createAccount = function () {
		var rst = Restangular.all('GetNewAccount/' + $scope.accountName);

		rst.getList().then(function (account) {
			$scope.newAccount = account;
			$scope.showNewAccount = true;
		});
	};
}]);
