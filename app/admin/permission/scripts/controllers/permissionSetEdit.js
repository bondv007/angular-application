'use strict';

app.controller('permissionSetEditCtrl', ['$scope', '$rootScope', '$state', 'enums', '$stateParams', 'EC2Restangular', 'mmAlertService',
    function ($scope, $rootScope, $state, enums, $stateParams, EC2Restangular, mmAlertService) {

        $scope.isEditMode = !!$stateParams.permissionSetId || !!$scope.isEntral;
        $scope.validation = {};
        $scope.permissionSetId = $stateParams.permissionSetId;
        $scope.pageReady = false;
        $scope.isRequired = false;
        $scope.isDisable = true;

        $scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: rollback, ref: null, nodes: []};
        $scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: save, ref: null, nodes: [],isPrimary:true};
        $scope.adminZones = enums.adminZones;
        $scope.permissionIdsArray = [];
        $scope.permissionSetIdsArray = [];
        $scope.permissionAdminZones = [];

        $scope.labelWidth = 230;
        $scope.miniSection = false;

        $scope.showSPinner = true;
        var serverPermissionSets = EC2Restangular.all('permissions/sets');
        EC2Restangular.all('permissions').getList().then(function(data){
            $scope.permissions = data;
            $scope.permissionIndex = {}
            angular.forEach(data, function(permission){
                $scope.permissionIndex[permission.id] = permission.adminZones;
            })
        }, processError);

        var watcher = $scope.$watch('$parent.mainEntity', function (newValue, oldValue) {
            getSingleLevelPermissionsSets();
            updateState();
        });

        function getSingleLevelPermissionsSets(){
            EC2Restangular.all('permissions/sets/singleLevelPermissionsSets').withHttpConfig({cache: false}).getList()
                .then(function(data){
                    var validList = [];
                    angular.forEach(data, function(item){
                        if(($scope.permissionSetEdit && $scope.permissionSetEdit.id != item.id)){
                            validList.push(item);
                        }
                    })
                    $scope.permissionSets = validList;
                }, processError);
        }

        function updateState() {
            if ($scope.$parent.mainEntity != null && $scope.isEditMode) {
                $scope.permissionSetEdit = EC2Restangular.copy($scope.$parent.mainEntity);
                if(!$scope.permissionSetEdit.permissionIds) $scope.permissionSetEdit.permissionIds = [];
                if(!$scope.permissionSetEdit.permissionSetIds) $scope.permissionSetEdit.permissionSetIds = [];

                setPermissionsSelectedLists();
            } else {
                $scope.permissionSetEdit = {
                    type: 'PermissionSet',
                    name: "",
                    description: "",
                    adminZones: [],
                    permissionIds: [],
                    permissionSetIds: []
                };
            }
            $scope.originalCopy = EC2Restangular.copy( $scope.permissionSetEdit);
            $scope.pageReady = $scope.permissionSetEdit != null;
        }

        function processError(error) {
            console.log('ohh no!');
            console.log(error);
            $scope.showSPinner = false;
            if (error.data.error === undefined) {
                mmAlertService.addError("Message", "Server error. Please try again later.", false);
            } else {
                mmAlertService.addError("Message", error.data.error, false);
            }
        }

        function save() {
            if (saveValidation()) {
                setPermissionArrays();
                $scope.permissionSetEdit.adminZones = null;
                if ($scope.isEditMode) {
                    return $scope.permissionSetEdit.put().then(
                        function (data) {
                            $scope.$parent.mainEntity = data;
                            $scope.showSPinner = false;
                            mmAlertService.addSuccess('Save', 'You successfully updated the permission');
                            return data;
                        },
                        function (error) {
                            mmAlertService.addError('Save', 'Updating the permission has failed');
                            processError(error);
                        });
                } else {
                    return serverPermissionSets.post($scope.permissionSetEdit).then(
                        function (data) {
                            $scope.$parent.mainEntity = data;
                            $scope.showSPinner = false;
                            mmAlertService.addSuccess('Save', 'You successfully created the permission set');
                            if ($scope.isEntral == false) {
                                //replace is needed here to replace the last history record
                                $state.go("spa.permissionSet.permissionSetEdit", {permissionSetId: data.id}, {location: "replace"});
                            } else {
                                return data;
                            }
                        },
                        function (error) {
                            mmAlertService.addError('Save', 'Updating the permission has failed');
                            processError(error);
                        });
                }
            }
        }

        function setPermissionArrays(){
            $scope.permissionSetEdit.permissionIds = [];
            $scope.permissionSetEdit.permissionSetIds = [];
            if($scope.permissionIdsArray.length > 0){
                angular.forEach($scope.permissionIdsArray, function(item){
                    angular.forEach($scope.permissions, function(permission){
                        if(permission.id === item){
                            $scope.permissionSetEdit.permissionIds.push(permission.id);
                        }
                    });
                });
            }
            if($scope.permissionSetIdsArray.length > 0){
                angular.forEach($scope.permissionSetIdsArray, function(item){
                    angular.forEach($scope.permissionSets, function(permissionSet){
                        if(permissionSet.id === item){
                            $scope.permissionSetEdit.permissionSetIds.push(permissionSet.id);
                        }
                    });
                });
            }
        }

        function saveValidation() {
            var isValid = true;
            $scope.validation = {};

            if(!$scope.permissionSetEdit.name || $scope.permissionSetEdit.name.length <= 2){
                $scope.validation.name = "Please enter a name longer than 2 characters";
                isValid = false;
            }

          if(!$scope.permissionSetEdit.description || $scope.permissionSetEdit.description.length <= 10){
            $scope.validation.description = "Please enter a description longer than 10 characters";
            isValid = false;
          }

            if(isValid){
                $scope.validation = {};
            }
            return isValid;
        }

        $scope.permissionChange = function(){
            $scope.permissionAdminZones.length = 0;
            angular.forEach($scope.permissionIdsArray, function(permission){
                console.log($scope.permissionIndex[permission]);
                angular.forEach($scope.permissionIndex[permission], function(adminZone){
                    if($scope.permissionAdminZones.indexOf(adminZone) === -1) $scope.permissionAdminZones.push(adminZone);
                })
            })
        }

        function rollback(){
          $scope.permissionSetEdit = EC2Restangular.copy($scope.originalCopy);
          setPermissionsSelectedLists();
          $scope.validation = {};
        }

      function setPermissionsSelectedLists(){
        $scope.permissionIdsArray = [];
        $scope.permissionSetIdsArray = [];

        angular.forEach($scope.permissionSetEdit.permissionIds, function(per){
          $scope.permissionIdsArray.push(per);
        });
        angular.forEach($scope.permissionSetEdit.permissionSetIds, function(per){
          $scope.permissionSetIdsArray.push(per);
        });
      }

        $scope.$on('$destroy', function(){
            $scope.permissionSetEdit = null;
            serverPermissionSets = null;

            if(watcher) watcher();

            if($scope.permissionIdsArray) $scope.permissionIdsArray.length = 0;
            if($scope.permissionSetIdsArray) $scope.permissionSetIdsArray.length = 0;
            if($scope.permissionIds) $scope.permissionIds.length = 0;
            if($scope.permissionSetIds) $scope.permissionSetIds.length = 0;
        });
    }]);
