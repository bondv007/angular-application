'use strict';

app.controller('mmLoginCtrl', ['$scope', '$state', 'mmUserService', '$rootScope', 'mmModal', 'mmAlertService', 'userName', '$modalInstance', '$translate',
  function ($scope, $state, mmUserService, $rootScope, mmModal, mmAlertService, userName, $modalInstance, $translate) {
    $scope.userCredentials = {
      userName: {value: '', errorText: '', missingError: "error_usernameIsRequired"},
      password: {value: '', errorText: '', missingError: "error_passwordIsRequired"},
      tempPassword: {value: '', errorText: '', missingError: "error_tempPasswordIsRequired"},
      newPassword: {value: '', errorText: '', missingError: "error_newPasswordIsRequired"},
      newPasswordConfirmation: {value: '', errorText: '', missingError: "error_newPasswordConfirmationIsRequired"}
    };

    $scope.isFormChecked = false;

    function trySubmit() {
      $scope.isFormChecked = true;
    }

    if (userName === undefined || userName === null) {
      userName = $rootScope.userName;
      $rootScope.userName = null;
    }
    $scope.userName = userName;


    $scope.changePasswordTitle = "Change Password";
    if ($state.params.isNewUser === "true") {
      $scope.changePasswordTitle = "First Login";
    }
    if ($state.params.tempKey !== undefined && $state.params.userName !== undefined){
      $scope.tempKey = $state.params.tempKey;
      $scope.userName = $state.params.userName;
    }

    $scope.forgotPasswordLink = $state.href('forgotpassword', {}, {absolute: true});

    $scope.supportLink="mailto:support@sizmek.com";
    $scope.contacts = [
      {region:'US', phone:'1.646.202.1320'},
      {region:'Europe', phone:'+44.(0)207.831.9410'},
      {region:'Australia', phone:'+61.2.8243.0000'},
      {region:'China', phone:'+86.20.8300.1902'},
      {region:'Global', phone:'(24/7) +1.866.438.5552'}
    ];

    $scope.loginUrl = $state.href('login', {}, {absolute: true});

    $scope.myString =  'error_loginInvalidUsernameOrPassword';
    $scope.passwordRules = {
      title: "Password Requirements:",
      rules: ["login_passwordRules_1", "login_passwordRules_2", "login_passwordRules_3"]
    };

    $scope.cleanErrors = function(){
      if (!$scope.isFormChecked)
        return;
      $scope.userCredentials.userName.errorText='';
      $scope.userCredentials.password.errorText='';
      $scope.userCredentials.tempPassword.errorText='';
      validateAndNotify($scope.userCredentials.userName);
      validateAndNotify($scope.userCredentials.password);
      validateAndNotify($scope.userCredentials.tempPassword);
    };
    $scope.cleanNewPasswordErrors = function(){
      if (!$scope.isFormChecked)
        return;
      $scope.userCredentials.newPassword.errorText='';
      $scope.userCredentials.newPasswordConfirmation.errorText='';
      validateAndNotify($scope.userCredentials.newPassword);
      validateAndNotify($scope.userCredentials.newPasswordConfirmation);
    };

    function redirectOnSuccessfulLogIn() {
      $rootScope.isDirtyEntity = false;
      if ($rootScope.$previousState == undefined || $rootScope.$previousState == null || $rootScope.$previousState.name === $state.current.name)
        $state.go("spa.media.campaigns");
      else
        $state.go($rootScope.$previousState.name, $rootScope.$previousStateParams);
      $rootScope.$previousState = null;
    }

    function isStringValueMissing(val) {
      return (val === null || val === "");
    }

    function validateAndNotify(input) {
      if (isStringValueMissing(input.value)) {
        input.errorText = input.missingError;
        return false;
      }
      return true;
    }

    function getErrorHandleFunction(primaryCredential, newPasswordPrimaryCredential, isLogin) {
      function onError(errorCode) {
        switch (errorCode) {
          case 401:
            primaryCredential.errorText = 'error_loginInvalidUsernameOrPassword';
            break;
          case 1001://password expired
            if (isLogin) {
              $rootScope.userName = $scope.userCredentials.userName.value;
              $state.go("changepassword");
            }
            break;
          case 1003: //passwordNotValid (HTTP 422 - change-password)
            newPasswordPrimaryCredential.errorText = 'error_changePasswordPasswordRulesValidation';
            break;
          case 1004: //user not found (HTTP 422 - forgot-password)
            primaryCredential.errorText= 'error_forgotPasswordUserDoesNotExist';
            break;
          default:
            primaryCredential.errorText = 'error_loginServerGeneral';
        }
      }

      return onError;
    }

    $scope.login = function () {
      trySubmit();

      var isUserNameValid = validateAndNotify($scope.userCredentials.userName);
      var isPasswordValid = validateAndNotify($scope.userCredentials.password);
      if (!isUserNameValid || !isPasswordValid) {
        return true;
      }

      mmUserService.login($scope.userCredentials.userName.value, $scope.userCredentials.password.value).
        then(redirectOnSuccessfulLogIn, getErrorHandleFunction($scope.userCredentials.userName, false, true));
    };

    $scope.changePassword = function () {
      trySubmit();
      $scope.myString = 'error_loginInvalidUsernameOrPassword';
      if (!validateChangePasswordInput())
        return;

      mmUserService.changePassword($scope.userName, $scope.userCredentials.tempPassword.value, $scope.userCredentials.newPassword.value, $scope.tempKey).
        then(redirectOnSuccessfulLogIn, getErrorHandleFunction($scope.userCredentials.tempPassword, $scope.userCredentials.newPassword, false));
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.changePasswordDialog = function() {
      trySubmit();
      if (!validateChangePasswordInput())
        return;

      mmUserService.changePassword($scope.userName, $scope.userCredentials.tempPassword.value, $scope.userCredentials.newPassword.value).
        then(function () {
          mmAlertService.addSuccess("Password changed");
          $modalInstance.close();
        }, getErrorHandleFunction($scope.userCredentials.tempPassword, $scope.userCredentials.newPassword, false));
    };

    function validateChangePasswordInput() {
      var isTempPassValid = validateAndNotify($scope.userCredentials.tempPassword);
      var isNewPassValid = validateAndNotify($scope.userCredentials.newPassword);
      var isNewPassConfirmValid = validateAndNotify($scope.userCredentials.newPasswordConfirmation);
      if ((isStringValueMissing($scope.tempKey)  && !isTempPassValid) || !isNewPassValid || !isNewPassConfirmValid) {
        return;
      }

      if ($scope.userCredentials.newPassword.value !==  $scope.userCredentials.newPasswordConfirmation.value) {
        $scope.userCredentials.newPassword.errorText = 'error_changePasswordPasswordsDoNotMatch';
        return false;
      }

      if ($scope.userName == undefined || $scope.userName == null) {
        $translate("error_changePassMissingUserName", $scope).then(function (errorText) {
          $scope.userCredentials.tempPassword.errorText = errorText;
        });
        return false;
      }

      return true;
    }

    $scope.forgotPassword = function () {
      trySubmit();
      if (!validateAndNotify($scope.userCredentials.userName))
        return;

      mmUserService.forgotPassword($scope.userCredentials.userName.value).
        then(function () {
          $state.go("checkyourmailbox");
        }, getErrorHandleFunction($scope.userCredentials.userName, null, false));
    };
  }]);
