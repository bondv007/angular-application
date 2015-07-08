/**
 * Created by liad.ron on 11/21/2014.
 */

'use strict';

app.service('contactsService', ['enums', 'EC2Restangular', function (enums, EC2Restangular) {

	var serverUsers = EC2Restangular.all('users');
	var serverAccount = EC2Restangular.all('accounts');

	function getUserObj() {
		return {
			name: "",
			type: "User",
			username: "",
			password: "",
			accountId: null,
			email: "",
			address: "",
			phone: "",
			timeZone: "",
			language: "",
			regional: "",
			enableForIntegration: false,
			status: "Enabled"//TODO: remove status when server side is done
		}
	}

//	//validation using mm-error directive
//	function saveValidation() {
//		var valid = true;
//		if (!accountValidation().isValid)
//			valid = false;
//		if (!statusValidation())
//			valid = false;
//		if (!userNameValidation())
//			valid = false;
//		if (!systemNameValidation())
//			valid = false;
//		if (!passwordValidation())
//			valid = false;
//		if (!emailValidation())
//			valid = false;
//		return valid;
//	}
//
//	function accountValidation(userEdit) {
//		var validObj = {isValid : true, prop : {text: ''}};
//		if (userEdit.accountId === null || userEdit.accountId === "") {
//			validObj.prop.text = 'Account is required';
//			validObj.isValid = false;
//		}
//		return validObj;
//	}
//
//	function statusValidation() {
//		var valid = true;
//		$scope.accountStatusError = {text: ''};
//		if ($scope.userEdit.status === null || $scope.userEdit.status === "") {
//			$scope.accountStatusError = {text: 'Status is required'};
//			valid = false;
//		}
//		return valid;
//	}
//
//	function userNameValidation() {
//		var valid = true;
//		$scope.userNameError = {text: ''};
//		if ($scope.userEdit.name === null || $scope.userEdit.name === "") {
//			//$scope.essentialArea.userName.open = true;
//			$scope.userNameError = {text: 'User name is required'};
//			valid = false;
//		}
//		return valid;
//	}
//
//	function systemNameValidation() {
//		var valid = true;
//		$scope.systemNameError = {text: ''};
//		if ($scope.userEdit.username === null || $scope.userEdit.username === "") {
//			//$scope.essentialArea.systemName.open = true;
//			$scope.systemNameError = {text: 'System name is required'};
//			valid = false;
//		} else {
//			var whitespace = /\s/g;
//			var invalidName = whitespace.test($scope.userEdit.username);
//			if (invalidName) {
//				//$scope.essentialArea.systemName.open = true;
//				$scope.systemNameError = {text: 'Remove spaces from System Username.'};
//				valid = false;
//			}
//		}
//		return valid;
//	}
//
//	function passwordValidation() {
//		var valid = true;
//		$scope.passwordError = {text: ''};
//		if ($scope.userEdit.password === null || $scope.userEdit.password === "") {
//			//$scope.essentialArea.password.open = true;
//			$scope.passwordError = {text: 'Password is required'};
//			valid = false;
//		}
//		return valid;
//	}
//
//	function emailValidation() {
//		var valid = true;
//		$scope.emailError = {text: ''};
//		if ($scope.userEdit.email === null || $scope.userEdit.email === "") {
//			//$scope.essentialArea.password.open = true;
//			$scope.emailError = {text: 'Email is required'};
//			valid = false;
//		} else {
//			var validEmail = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
//			if (!validEmail.test($scope.userEdit.email)) {
//				//$scope.essentialArea.password.open = true;
//				$scope.emailError = {text: 'Invalid email format.'};
//				valid = false;
//			}
//		}
//		return valid;
//	}

	return {
		getUserObj : getUserObj
	};
}]);
