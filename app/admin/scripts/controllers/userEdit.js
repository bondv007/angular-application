'use strict';

app.controller('userEditCtrl', ['$scope', '$stateParams', 'mmUserService', 'mmRest', 'mmAlertService', '$state', 'enums', 'entityMetaData', '$q','mmUtils', '$timeout', 'adminUtils', 'mmPermissions', 'entity', '$modalInstance', 'mmContextService', 'mmModal',
  function ($scope, $stateParams, mmUserService, mmRest, mmAlertService, $state, enums, entityMetaData, $q, mmUtils, $timeout, adminUtils, mmPermissions, entity, $modalInstance, mmContextService, mmModal) {

    var needToClearCache = false,
      isAccountRequested = false;

    $scope.originalCopy = {};
    $scope.disableScreen = false;
    $scope.isModal = false;
    $scope.isEditMode = !!$stateParams.userId || !!$scope.isEntral;
    $scope.isInContext = false;
    $scope.pageReady = false;
    $scope.width = 150;
    $scope.editObject = {name:""};
    $scope.accounts = [];
    $scope.accounts.list = {};
    $scope.$watch('$scope.accounts', updateState); //TODO ask liad what is this
    $scope.error = {name: ""};
    $scope.$root.mmIsPageDirty = 0;
    $scope.superUserName = "Super" + $scope.editObject.name.split(" ");
    $scope.loggedInUser = mmUtils.session.getLoggedInUser();
    $scope.permissions = {entity:{createEditBasic: true, createEditAdvanced: true}};
    $scope.lazyTypeParams = 'accounts?permissionNames=' + entityMetaData['user'].permissions.entity.createEditBasic +
    ',' + entityMetaData['user'].permissions.entity.createEditAdvanced;

    if(!_.isUndefined($scope.entityLayoutInfraButtons)){
      $scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: rollback, ref: null, nodes: []};
      $scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: save, ref: null, nodes: [], isPrimary : true};
    }

    initialize();

    function initialize(){
      if(!_.isNull(entity)){
        $scope.isModal = true;
        $scope.width = 100;
        if(!_.isEmpty(entity) && entity.type == "User"){
          $scope.$parent.mainEntity = entity;
          $scope.isEditMode = true;
        }

        if(entity.type == "Account")
          $scope.accountId = entity.id;

        $scope.isInContext = $scope.accountId ? true : false;
      }
      else{//not modal
        $scope.accountId = $scope.contextData.key == 'accountId' ? $scope.contextData.contextEntityId : undefined;
        $scope.isInContext = $scope.contextData.isInContext;
      }
      initializeErrorMessages();
      updateState();
    }

    var watcher = $scope.$watch('$parent.mainEntity', function (newValue, oldValue) {
      if (newValue !== oldValue) {//TODO is necessary
        updateState();
      }
    });

    var watcher1 = $scope.$watch('accounts.list', function () {
      if ($scope.accounts.list.length && $scope.accounts.list.length != 0) {
        $scope.pageReady = true;
        watcher1();
      }
    });

    function updateState() {
      if ($scope.$parent.mainEntity != null && $scope.isEditMode) {
        $scope.user = $scope.$parent.mainEntity;
        $scope.editObject = mmRest.EC2Restangular.copy($scope.$parent.mainEntity);
        $scope.pageReady = $scope.editObject != null && $scope.accounts != null; //TODO ask liad what is this
        $scope.superUserName = 'Super_' + $scope.editObject.name.split(' ')[0];
        adminUtils.permissions.checkOnEditMode($scope.editObject, $scope.permissions);
        $scope.originalCopy = mmRest.EC2Restangular.copy($scope.editObject);
      } else if(!$scope.isEditMode){
        $scope.user = {};
        $scope.editObject = mmRest.EC2Restangular.copy(entityMetaData["user"].defaultJson);
        $scope.editObject.accountId = $scope.accountId || null;
        //account context - get account name
        if($scope.isInContext && !$scope.isModal && !isAccountRequested){
          isAccountRequested = true;
          setAccountName($scope.accountId);
        }
        $scope.superUserName = 'Super_';
        adminUtils.permissions.checkOnNewModeEntity(entityMetaData["user"].type, $scope.permissions.entity);
        $scope.originalCopy = mmRest.EC2Restangular.copy($scope.editObject);
      }
      $scope.pageReady = true;
    }

    function setAccountName(accountId){
      mmRest.account(accountId).get().then(function(data){
        $scope.editObject.accountName/*relationsBag.parents.account.name*/ = data.name;
      },function(error){
        isAccountRequested = false;
        processError(error);
      });
    }

    function initializeErrorMessages(){
      $scope.accountNameError = {text: ''};
      $scope.nameError = {text: ''};
      $scope.userNameError = {text: ''};
      $scope.passwordError = {text: ''};
      $scope.emailError = {text: ''};
    }

    function rollback(){
      $scope.editObject = mmRest.EC2Restangular.copy($scope.originalCopy);
      $scope.superUserName  = 'Super_' + $scope.editObject.name.split(' ')[0];
      initializeErrorMessages();
    }

    function saveValidation() {
      var deferred = $q.defer();
      var valid = true;
      serverValidation().then(function(data){
        //if (!data)
        //  $scope.userNameError = {text: 'This username is already in use. Please select another and retry.'};
        valid = clientValidation(!data);
        deferred.resolve(valid && data);
      },function(error){
        deferred.reject(error);
      });
      return deferred.promise;
    }

    function serverValidation() {
      var deferred = $q.defer();
      if(_.isEmpty($scope.editObject.username)){
        clientValidation();
        deferred.resolve(false);
      }
      //check if username is already being used
      else{
        mmRest.validateUserName.post($scope.editObject.username).then(function (data) {
          if(!data){
            $scope.userNameError = {text: 'This username is already in use. Please select another and retry.'};
          }
          //mmRest.EC2Restangular.one('users/ValidateUserName',$scope.editObject.username).get().then(function (data) {
          $scope.$root.isDirtyEntity = true; //because validate user name is POST - make page not dirty
          deferred.resolve(!!data);
        },function(error){
          clientValidation();
          deferred.reject(error);
        });
      }
      return deferred.promise;
    }

    function clientValidation(preventCheck){
      var valid = true;
      if (!$scope.isModal && !accountValidation())
        valid = false;
      if (!nameValidation())
        valid = false;
      if (!preventCheck && !userNameValidation())
        valid = false;
      if (!passwordValidation())
        valid = false;
      if (!emailValidation())
        valid = false;
      return valid;
    }

    function accountValidation() {
      var valid = true;
      $scope.accountNameError = {text: ''};
      if ($scope.editObject.accountId === null || $scope.editObject.accountId === "") {
        //$scope.essentialArea.accountName.open = true;
        $scope.accountNameError = {text: 'Account is required'};
        valid = false;
      }
      return valid;
    }

    function nameValidation() {
      var valid = true;
      $scope.nameErrorameError = {text: ''};
      if ($scope.editObject.name === null || $scope.editObject.name === "") {
        //$scope.essentialArea.userName.open = true;
        $scope.nameError = {text: 'Name is required'};
        valid = false;
      }
      else if($scope.editObject.name.length <= 1){
        $scope.nameError = {text: 'Please enter a name longer than 1 characters'};
        valid = false;
      }
      return valid;
    }

    function userNameValidation() {
      var valid = true;
      $scope.userNameError = {text: ''};
      if ($scope.editObject.username === null || $scope.editObject.username === "") {
        //$scope.essentialArea.systemName.open = true;
        $scope.userNameError = {text: 'User name is required'};
        valid = false;
      }
      else if($scope.editObject.username.length <= 1){
        $scope.userNameError = {text: 'Please enter a user name longer than 1 characters'};
        valid = false;
      }
      else {
        var whitespace = /\s/g;
        var invalidName = whitespace.test($scope.editObject.username);
        if (invalidName) {
          //$scope.essentialArea.systemName.open = true;
          $scope.userNameError = {text: 'Remove spaces from Username.'};
          valid = false;
        }
      }
      return valid;
    }

    function passwordValidation() {
      var valid = true;
      $scope.passwordError = {text: ''};
      if ($scope.editObject.password === null || $scope.editObject.password === "") {
        //$scope.essentialArea.password.open = true;
        $scope.passwordError = {text: 'Password is required'};
        valid = false;
      }
      return valid;
    }

    function emailValidation() {
      var valid = true;
      $scope.emailError = {text: ''};
      if ($scope.editObject.email === null || $scope.editObject.email === "") {
        $scope.emailError = {text: 'Email is required'};
        valid = false;
      } else {
        var validEmail = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        if (!validEmail.test($scope.editObject.email)) {
          //$scope.essentialArea.password.open = true;
          $scope.emailError = {text: 'Invalid email format'};
          valid = false;
        }
      }
      return valid;
    }

    function save() {
      if ($scope.isEditMode) {
        if(clientValidation()){
          return $scope.editObject.put().then(
            function (data) {
              $scope.$root.mmIsPageDirty = false;
              //$scope.$parent.mainEntity = data;
              $scope.showSPinner = false;
              if(!needToClearCache) mmAlertService.addSuccess('User ' + data.name + ' was successfully updated.');
              if(needToClearCache) {
                $scope.disableScreen = true;
                $scope.permissions.entity.createEditAdvanced = false;
                mmAlertService.addSuccess('User ' + data.name + ' was successfully updated. Due to a changed in the isSuperUser role, you will redirect to the login page to a re login');
                $timeout(function (){
                  mmUtils.cacheManager.clearCache();
                  mmUserService.logout();
                  $state.go("login");
                }, 4000);

              }
              return data;
            },
            function (error) {
              mmAlertService.addError('Updating the user has failed');
              processError(error);
            });
        }
      }else{
        if(!!$scope.isModal){
          postUser();
        }else {
          saveValidation().then(function (isValid){
            if (isValid) {
              postUser();
            }
          }, function (error){
            processError(error);
          } );
        }}
    }

    function postUser() {
      return mmRest.users.post($scope.editObject).then(
        function (data) {
          $scope.$root.mmIsPageDirty = 0;
          var sref = "spa.user.userNew({userId:'" + "'})";
          mmAlertService.addSuccess('User ' + data.name + ' was successfully created.', sref, 'Create another user');
          if(needToClearCache) mmUtils.cacheManager.clearCache();
          if (!!$scope.isEntral) {
            $scope.$parent.mainEntity = data;
            return data;
          } else if (!!$scope.isModal){
            $modalInstance.close(data);
          }else{
            //replace is needed here to replace the last history record
            $state.go("spa.user.userEdit", {userId: data.id}, {location: "replace"});
          }
        },
        function (error) {
          mmAlertService.addError('Creating the user has failed');
          processError(error);
        });
    }

    function processError(error) {
      console.log('ohh no!');
      console.log(error);
      $scope.showSPinner = false;
      if (error && error.data){
        if(!error.data.error) {
          mmAlertService.addError("Server error. Please try again later.");
        } else {
          mmAlertService.addError(error.data.error);
        }
      }else{
        mmAlertService.addError("Server error. Please try again later.");
      }
    }

    $scope.onAccountNameSelected = function(){
      $scope.accountNameError.text = '';
    };

    $scope.onNameChanged = function(){
      if($scope.editObject.name.length > 1) $scope.nameError.text = '';
      else $scope.nameError.text = 'Please enter a name longer than 1 characters';
      $scope.superUserName = "Super_" + $scope.editObject.name.split(' ')[0];
    };

    $scope.onUserNameChanged = function(){
      if($scope.editObject.username.length > 1) $scope.userNameError.text = '';
      else $scope.userNameError.text = 'Please enter a user name longer than 1 characters';
    };

    $scope.onPasswordChanged = function(){
      $scope.passwordError.text = '';
    };

    $scope.onEmailChanged = function(){
      $scope.emailError.text = '';
    };

    $scope.onNewEntitySave = function() {
      saveValidation().then(function(isValid){
        if(isValid) {
          //Account Edit - needs to save new user
          if ($scope.editObject.accountId !== null) {
            $scope.editObject.accountId = $scope.accountId;
            save();
          } else {//Account New - user will be save with the account creation
            $modalInstance.close($scope.editObject);
          }
        }
      },function(error){
        processError(error);
      });
    };

    $scope.onNewEntityCancel = function(){
      $modalInstance.dismiss('cancel');
    };

    $scope.onPlatformUserChanged = function(){
      if($scope.loggedInUser.username != 'admin'){
        needToClearCache = true;
      }
    };

    $scope.$on('$destroy', function() {
      if (watcher) watcher();
    });

    $scope.openChangePasswordDialog = function() {
      var modalInstance = mmModal.open({
        templateUrl: './infra/views/mmChangePasswordDialog.html',
        controller: 'mmLoginCtrl',
        title: "ChangePassword",
        bodyHeight: 401,
        modalWidth: 600,
        confirmButton: { name: "Change Password", funcName: "changePasswordDialog", hide: false, isPrimary: true},
        discardButton: { name: "Cancel", funcName: "cancel"},
        resolve: {
          userName: function() {
            return $scope.editObject.username;
          }
        }
      });
    }
  }]);
