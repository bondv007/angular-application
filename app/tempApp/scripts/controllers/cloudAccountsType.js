'use strict';

app.controller('cloudAccountsTypeCtrl', ['$scope', 'Restangular', function ($scope, Restangular) {
	Restangular.setBaseUrl('http://ec2-54-200-7-100.us-west-2.compute.amazonaws.com:8080/DG.Account.Orchestration/V1/AccountService/');

	$scope.accountTypeId = null;
	$scope.accounts = [];

	$scope.showAccounts = false;

	$scope.getAccountsByAccountTypeId = function () {
		var rst = Restangular.all('GetAccountsByType/' + $scope.accountTypeId);

		rst.getList().then(function (allAccount) {
			$scope.accounts = allAccount.account;
			$scope.showAccounts = true;
		});
	};
}]);
