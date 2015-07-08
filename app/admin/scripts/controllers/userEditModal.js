/**
 * Created by liad.ron on 11/21/2014.
 */

'use strict';

app.controller('userEditModalCtrl', ['$scope', '$stateParams', 'EC2Restangular', 'mmAlertService', '$state', 'enums', '$modalInstance', 'mmUtils', 'user',
    function ($scope, $stateParams, EC2Restangular, mmAlertService, $state, enums, $modalInstance, mmUtils, user) {
        var serverUsers = EC2Restangular.all('users');

        if(!_.isEmpty(user))
            $scope.$parent.mainEntity = user;

        $scope.isModal = true;
        $scope.userId = $stateParams.userId;
        $scope.pageReady = false;
        $scope.width = 150;
        //$scope.accounts = entity.accounts;
        $scope.$watch('$scope.accounts', updateState);
        $scope.error = {name: ""};
        $scope.isEditMode = true;
        $scope.$root.mmIsPageDirty = 0;
        $scope.isDisplayControl = false;
        $scope.userStatuses = enums.userStatuses;

        $scope.accountNameError - {text: ''};
        $scope.accountStatusError = {text: ''};
        $scope.userNameError = {text: ''};
        $scope.systemNameError = {text: ''};
        $scope.passwordError = {text: ''};
        $scope.emailError = {text: ''};

        $scope.$watch('$parent.mainEntity', function (newValue, oldValue) {
            if (newValue != oldValue) {
                updateState();
            }
        });

        function updateState() {
            if ($scope.$parent.mainEntity != null) {
                if($scope.userId === undefined){
                    $scope.userId = $scope.$parent.mainEntity.id;
                }
                $scope.isEditMode = true;
                $scope.user = $scope.$parent.mainEntity;
                $scope.userEdit = EC2Restangular.copy($scope.$parent.mainEntity);
                $scope.pageReady = $scope.userEdit != null && $scope.accounts != null;
            } else {
                $scope.isEditMode = false;
                $scope.user = {};
                $scope.userEdit = {
                    type: "User",
                    id: null,
                    clientRefId: mmUtils.clientIdGenerator.next(),
                    name: null,
                    accountId: null,
                    salesManager: false,
                    clientServiceManager: false,
                    creativeServiceSpecialist: false,
                    username: null,
                    password: null,
                    address: null,
                    timeZone: null,
                    language: null,
                    regional: null,
                    enableForIntegration: false,
                    status: enums.userStatuses.getId("Enabled"),
                    platformUser: false,
                    email: null,
                    phone: null
                };
                if(!!$scope.parentSelectedItem){
                    $scope.userEdit.accountId = $scope.parentSelectedItem.id;
                }
            }
            $scope.pageReady = true;
        }

        //validation using mm-error directive
        function saveValidation() {
            var valid = true;
            if (!statusValidation())
                valid = false;
            if (!userNameValidation())
                valid = false;
            if (!systemNameValidation())
                valid = false;
            if (!passwordValidation())
                valid = false;
            if (!emailValidation())
                valid = false;
            return valid;
        }

        function statusValidation() {
            var valid = true;
            $scope.accountStatusError = {text: ''};
            if ($scope.userEdit.status === null || $scope.userEdit.status === "") {
                $scope.accountStatusError = {text: 'Status is required'};
                valid = false;
            }
            return valid;
        }

        function userNameValidation() {
            var valid = true;
            $scope.userNameError = {text: ''};
            if ($scope.userEdit.name === null || $scope.userEdit.name === "") {
                //$scope.essentialArea.userName.open = true;
                $scope.userNameError = {text: 'User name is required'};
                valid = false;
            }
            return valid;
        }

        function systemNameValidation() {
            var valid = true;
            $scope.systemNameError = {text: ''};
            if ($scope.userEdit.username === null || $scope.userEdit.username === "") {
                //$scope.essentialArea.systemName.open = true;
                $scope.systemNameError = {text: 'System name is required'};
                valid = false;
            } else {
                var whitespace = /\s/g;
                var invalidName = whitespace.test($scope.userEdit.username);
                if (invalidName) {
                    //$scope.essentialArea.systemName.open = true;
                    $scope.systemNameError = {text: 'Remove spaces from System Username.'};
                    valid = false;
                }
            }
            return valid;
        }

        function passwordValidation() {
            var valid = true;
            $scope.passwordError = {text: ''};
            if ($scope.userEdit.password === null || $scope.userEdit.password === "") {
                //$scope.essentialArea.password.open = true;
                $scope.passwordError = {text: 'Password is required'};
                valid = false;
            }
            return valid;
        }

        function emailValidation() {
            var valid = true;
            $scope.emailError = {text: ''};
            if ($scope.userEdit.email === null || $scope.userEdit.email === "") {
                //$scope.essentialArea.password.open = true;
                $scope.emailError = {text: 'Email is required'};
                valid = false;
            } else {
                var validEmail = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
                if (!validEmail.test($scope.userEdit.email)) {
                    //$scope.essentialArea.password.open = true;
                    $scope.emailError = {text: 'Invalid email format.'};
                    valid = false;
                }
            }
            return valid;
        }

        function save() {
            if (saveValidation()) {
                if ($scope.isEditMode) {
                    return $scope.userEdit.put().then(
                        function (data) {
                            $scope.$root.mmIsPageDirty = 0;
                            $scope.$parent.mainEntity = data;
                            $scope.showSPinner = false;
                            mmAlertService.addSuccess('Save', 'You successfully updated the user.');
                            return data;
                        },
                        function (error) {
                            mmAlertService.addError('Save', 'Updating the user has failed');
                            processError(error);
                        });
                } else {
                    //check if system username is already being used
                    return EC2Restangular.one('users/ValidateUserName',$scope.userEdit.username).get().then(function (data) {
                        if (data != true) {
                            $scope.systemNameError = {text: 'This username is already in use. Please select another and retry.'};
                        } else {
                            return serverUsers.post($scope.userEdit).then(
                                function (data) {
                                    $scope.$root.mmIsPageDirty = 0;
                                    mmAlertService.addSuccess('Save', 'You successfully created the user.');
                                    if(_.isUndefined($scope.$parent.isEntral)){
                                        $modalInstance.close($scope.userEdit);
                                    }
                                    else if ($scope.$parent.isEntral) {
                                        $scope.$parent.mainEntity = data;
                                        return data;
                                    } else {
                                        $state.go("spa.user.userEdit", {userId: data.id});
                                    }
                                },
                                function (error) {
                                    mmAlertService.addError('Save', 'Creating the user has failed');
                                    processError(error);
                                });
                        }
                    }, processError);
                }
            }
        }

        function processError(error) {
            console.log('ohh no!');
            console.log(error);
            if (error.data.error === undefined) {
                mmAlertService.addError("Message", "Server error. Please try again later.", false);
            } else {
                mmAlertService.addError("Message", error.data.error, false);
            }
        }

        $scope.onAccountNameSelected = function(){
            $scope.accountNameError.text = '';
        }

        $scope.onAccountStatusSelected = function(){
            $scope.accountStatusError.text = '';
        }

        $scope.onUserNameChanged = function(){
            $scope.userNameError.text = '';
        }
        $scope.onSystemNameChanged = function(){
            $scope.systemNameError.text = '';
        }

        $scope.onPasswordChanged = function(){
            $scope.passwordError.text = '';
        }

        $scope.onEmailChanged = function(){
            $scope.emailError.text = '';
        }

        $scope.onNewEntitySave = function(){
            //save();
            if (saveValidation()) {
                //$scope.userEdit.id = $scope.userEdit.clientRefId;
                $modalInstance.close($scope.userEdit);
            }
        }

        $scope.onNewEntityCancel = function(){
            $modalInstance.dismiss('cancel');
        }
    }]);