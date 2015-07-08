'use strict';

app.controller('cloudAccountCtrl', ['$scope', 'Restangular', function ($scope, Restangular) {
//	Restangular.setBaseUrl('http://ec2-54-200-7-100.us-west-2.compute.amazonaws.com:8080/DG.Account.Orchestration/V1/AccountService/');
	Restangular.setBaseUrl('http://rperets-pc:8080/mm3.platform.fe.userservice/V1/UserService/');

	$scope.accountId = null;
	$scope.account = null;

	$scope.showAccount = false;

	$scope.getAccountById = function () {
		var rst = Restangular.all('Login/1/1');
//		var rst = Restangular.all('GetAccount/' + $scope.accountId);

		rst.getList().then(function (account) {
			$scope.account = account;
			$scope.showAccount = true;
		});
	};
}]);
