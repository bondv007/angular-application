/**
 * Created by yoav.karpeles on 3/9/14.
 */
'use strict';

app.controller('userPermissionsCtrl', ['$scope', 'mmRest', 'mmUtils', 'mmAlertService', '$stateParams', '$q',
    function ($scope, mmRest, mmUtils, mmAlertService, $stateParams, $q) {

        $scope.allPermissionsIndex = {}
        $scope.allPermissionSetPermissionsIndex = {}
        $scope.permissionIndex = {permission: {}, permissionSet: []}

        var loggedInUserDeferred = $q.defer();
        var userDeferred = $q.defer();
        var permissionsDeferred = $q.defer();
        var permissionSetsDeferred = $q.defer();
        var userAdminZonesDeferred = $q.defer();

        $q.all([
                loggedInUserDeferred.promise,
                userDeferred.promise,
                permissionsDeferred.promise,
                permissionSetsDeferred.promise,
                userAdminZonesDeferred.promise
            ]).then(
            function (results) {
                $scope.loggedInUserPermissions = results[0];
                $scope.userPermissions = results[1];
                $scope.userAdminZones = results[4];

                indexUserPermissions();
                setPermissionGrantOrRevoke();
                setPermissionSetGrantOrRevoke();
            }, function (errors) {
                processError(errors);
            });

        mmRest.userPermissions.one(mmUtils.session.getLoggedInUser().id).get().then(
            function (data) {
                loggedInUserDeferred.resolve(initPermissionArrays(data));
            },
            function (error) {
                loggedInUserDeferred.reject(error);
            }
        );

        mmRest.userPermissions.one($stateParams.userId).get().then(
            function (data) {
                userDeferred.resolve(initPermissionArrays(data));
            },
            function (error) {
                userDeferred.reject(error);
            }
        );
        mmRest.userAdminZones.one(mmUtils.session.getLoggedInUser().id).get().then(
            function (data) {
                userAdminZonesDeferred.resolve(data);
            },
            function (error) {
                userDeferred.reject(error);
            }
        );


        function permissionManipulator(permissions) {
            $scope.permissionCentralRef = permissions;
            linkPermissionsToSets();
            permissionsDeferred.resolve(null);
        }
        function permissionSetManipulator(permissionSets) {
            $scope.permissionSetCentralRef = permissionSets;
            linkPermissionsToSets();
            angular.forEach(permissionSets, function(set){set.granted = "";});
            permissionSetsDeferred.resolve(null);
        }

        var areListsReady = false;
        function linkPermissionsToSets(){
            if(!areListsReady){
                areListsReady = true;
            } else {
                angular.forEach($scope.permissionCentralRef, function(permission){
                    permission.permissionSetIds = [];
                    angular.forEach($scope.permissionSetCentralRef, function(set){
                        angular.forEach(set.permissionIds, function(setPermissionId){
                            if(setPermissionId === permission.id){
                                if(permission.permissionSetIds.indexOf(set.id) === -1) permission.permissionSetIds.push(set.id);
                            }
                        });
                    });
                });
            }
        }

        var newPermission = function (id, rootId) {
            return {
                "type": "SimplePermission",
                "id": id,
                "rootPermissionSetId": rootId
            }
        }
        var newPermissionSet = function (id) {
            return {
                "id": id,
                "type": "SimplePermissionSet"
            }
        }
        var grantPermissionSet = function (all, selected) {
            angular.forEach(selected, function (selectedPermissionSet) {
                if ($scope.permissionIndex.permissionSet.indexOf(selectedPermissionSet.id) === -1) {
                    $scope.userPermissions.permissionSets.push(new newPermissionSet(selectedPermissionSet.id));
                    $scope.permissionIndex.permissionSet.push(selectedPermissionSet.id);
                }
                angular.forEach(selectedPermissionSet.permissions, function (permission) {
                    addPermission(permission, selectedPermissionSet.id);
                });
            });
            saveUserPermissions();
        };
        var revokePermissionSet = function (all, selected) {
            angular.forEach(selected, function (selectedPermissionSet) {
                if ($scope.permissionIndex.permissionSet.indexOf(selectedPermissionSet.id) > -1) {
                    removePermissionSet(selectedPermissionSet);
                    angular.forEach(selectedPermissionSet.permissions, function (permission) {
                        removePermissionSetPermission(permission, selectedPermissionSet.id);
                    });
                }
            });
            saveUserPermissions();
        };
        var grantPermission = function (all, selected) {
            angular.forEach(selected, function (selectedPermission) {
                addPermission(selectedPermission, null);
                selectedPermission.granted = 'Granted';
            });
            saveUserPermissions();
        };
        var revokePermission = function (all, selected) {
            angular.forEach(selected, function (selectedPermission) {
                removeDirectPermission(selectedPermission);
                selectedPermission.granted = 'Revoked';
            });
            saveUserPermissions();
        };

        function addPermission(permissionToAdd, parentId) {
            var addPermission = true;
            angular.forEach($scope.userPermissions.permissions, function (permissionToCheck) {
                if (permissionToCheck.id === permissionToAdd.id && permissionToCheck.rootPermissionSetId === parentId) {
                    addPermission = false;
                }
            });
            if (addPermission) {
                $scope.userPermissions.permissions.push(new newPermission(permissionToAdd.id, parentId));
            }
        }
        function removeDirectPermission(permissionToRemove) {
            var newUserPermissions = [];
            angular.forEach($scope.userPermissions.permissions, function (permissionToCheck) {
                if (permissionToCheck.id !== permissionToRemove.id) {
                    newUserPermissions.push(permissionToCheck);
                }
            });
            $scope.userPermissions.permissions.length = 0;
            $scope.userPermissions.permissions = newUserPermissions;
        }
        function removePermissionSetPermission(permissionToRemove, rootPermissionSetId) {
            var newUserPermissions = [];
            angular.forEach($scope.userPermissions.permissions, function (permissionToCheck) {
                if (permissionToCheck.id !== permissionToRemove.id ||
                    (permissionToCheck.id === permissionToRemove.id && permissionToCheck.rootPermissionSetId !== rootPermissionSetId)) {
                    newUserPermissions.push(permissionToCheck);
                }
            });
            $scope.userPermissions.permissions.length = 0;
            $scope.userPermissions.permissions = newUserPermissions;
        }
        function removePermissionSet(permissionSetToRemove) {
            var newUserPermissionSets = [];
            angular.forEach($scope.userPermissions.permissionSets, function (permissionSetToCheck) {
                if (permissionSetToCheck.id !== permissionSetToRemove.id) {
                    newUserPermissionSets.push(permissionSetToCheck);
                }
            });
            $scope.userPermissions.permissionSets.length = 0;
            $scope.userPermissions.permissionSets = newUserPermissionSets;
        }

        function saveUserPermissions() {
            indexUserPermissions();
            return mmRest.EC2Restangular.one(mmRest.MetaData.userPermissions.restPath,
                    $scope.userPermissions.id).customPUT({entities: [$scope.userPermissions]}).then(
                function (data) {
                    mmAlertService.addSuccess('Save', 'You successfully updated the entity');
                    refreshCentral();
                    return data;
                }, function (error) {
                    processError(error);
                });
        }
        function indexUserPermissions() {
            $scope.permissionIndex.permission = {};
            $scope.permissionIndex.permissionSet.length = 0;

            angular.forEach($scope.userPermissions.permissions, function (item) {
                if (!$scope.permissionIndex.permission[item.id]) $scope.permissionIndex.permission[item.id] = { isGranted: false}
                if (item.rootPermissionSetId === null) $scope.permissionIndex.permission[item.id].isGranted = true;
            });
            angular.forEach($scope.userPermissions.permissionSets, function (item) {
                if ($scope.permissionIndex.permissionSet.indexOf(item.id) === -1) $scope.permissionIndex.permissionSet.push(item.id);
            });
        }

        function setPermissionGrantOrRevoke() {
            if (!$scope.permissionCentralRef) return;
            angular.forEach($scope.permissionCentralRef, function (permission) {
                permission.granted = ($scope.permissionIndex.permission[permission.id]) ? 'Granted' : 'Revoked';
            });
        }
        function setPermissionSetGrantOrRevoke() {
            if (!$scope.permissionSetCentralRef) return;
            angular.forEach($scope.permissionSetCentralRef, function (permissionSet) {
                if ($scope.permissionIndex.permissionSet.indexOf(permissionSet.id) === -1) {
                    var includedPermissions = checkIfPermissionGranted(permissionSet);
                    permissionSet.granted = (includedPermissions > 0) ? 'Revoked (except ' + includedPermissions + ' permissions)' : 'Revoked';
                } else {
                    permissionSet.granted = 'Granted'
                }
            });
        }
        function checkIfPermissionGranted(permissionSetObj) {
            var includedPermissions = 0;
            angular.forEach(permissionSetObj.permissionIds, function (permissionId) {
                if ($scope.permissionIndex.permission[permissionId]) includedPermissions++;
            });
            return includedPermissions;
        }

        function processError(error) {
            console.log('ohh no!');
            console.log(error);
            $scope.showSPinner = false;
            if (_.isUndefined(error.data.error)) {
                mmAlertService.addError("Server error. Please try again later.");
            } else {
                mmAlertService.addError(error.data.error);
            }
        }
        function initPermissionArrays(data) {
            data.permissions = data.permissions || [];
            data.permissionSets = data.permissionSets || [];
            return data;
        }
        function refreshCentral() {
            setPermissionGrantOrRevoke();
            setPermissionSetGrantOrRevoke();
        }

        var centralPermissionSetActions = [
            { name: 'Grant', func: grantPermissionSet},
            { name: 'Revoke', func: revokePermissionSet }
        ];
        var centralPermissionActions = [
            { name: 'Grant', func: grantPermission},
            { name: 'Revoke', func: revokePermission }
        ];
        $scope.centralDataObject = [
            {type: 'permissionSet', centralActions: centralPermissionSetActions, dataManipulator: permissionSetManipulator, isEditable: false, hideAddButton: true, editButtons: []},
            {type: 'permission', centralActions: centralPermissionActions, dataManipulator: permissionManipulator, isEditable: false, hideAddButton: true, editButtons: []}
        ];
    }]);