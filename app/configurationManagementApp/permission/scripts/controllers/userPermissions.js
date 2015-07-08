/**
 * Created by yoav.karpeles on 3/9/14.
 */
'use strict';

app.controller('userPermissionsCtrl', ['$scope', 'mmRest', 'mmUtils', 'mmAlertService', '$stateParams', '$q', 'mmSession', 'mmPermissions', 'entityMetaData',
	function ($scope, mmRest, mmUtils, mmAlertService, $stateParams, $q, session, mmPermissions, entityMetaData) {

		$scope.allPermissionsIndex = {};
		$scope.allPermissionSetPermissionsIndex = {};
		$scope.permissionIndex = {permission: {}, permissionSet: []};

		var loggedInUserDeferred = $q.defer();
		var userDeferred = $q.defer();
		var permissionsDeferred = $q.defer();
		var permissionSetsDeferred = $q.defer();
		var userAdminZonesDeferred = $q.defer();
    var inValidPermissionsIds = [];
    var inValidPermissionSetIds = [];
    var fromPermissionSet = false;
    var permissionSetIndex = {};

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

		if(mmUtils.session.getLoggedInUser().id){
			mmRest.userPermissions.one(mmUtils.session.getLoggedInUser().id).get().then(
				function (data) {
					loggedInUserDeferred.resolve(initPermissionArrays(data));
				},
				function (error) {
					loggedInUserDeferred.reject(error);
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
		}
		mmRest.userPermissions.one($stateParams.userId).get().then(
			function (data) {
				userDeferred.resolve(initPermissionArrays(data));
			},
			function (error) {
				userDeferred.reject(error);
			}
		);

		var firstPermissionManipulation = true;
		function permissionManipulator(permissions) {
      $scope.permissionCentralRef = permissions;
			if(firstPermissionManipulation){
				firstPermissionManipulation = false;
				permissionsDeferred.resolve(null);
			}else{
				indexUserPermissions();
				setPermissionGrantOrRevoke();
				setPermissionSetGrantOrRevoke();
        if(fromPermissionSet){
          setPermissionSetIndex(permissions);
        }
			}
		}

    function setPermissionSetIndex(permissions){

      var newSet = _.find(permissionSetIndex, {permissions : undefined});
     //only if row selected - if was unselected, no need to check its permissions
      if(newSet) {
        newSet.permissions = permissions;

        //if permission set is not valid
        if (!checkPermissionsSetValid(permissions)) {
          newSet.isValid = false;
        }
      }

      //check all selected permission set - if one is valid, enable grant/revoke buttons
      var disableButtons = true;
      var keys = Object.keys(permissionSetIndex);
      for(var i = 0; i < keys.length; i++){
        if(permissionSetIndex[keys[i]].isValid){
          disableButtons = false;
          break;
        }
      }

      $scope.centralDataObject[0].centralActions[0].disable = disableButtons;
      $scope.centralDataObject[0].centralActions[1].disable = disableButtons;

      fromPermissionSet = false;
    }

		var firstPermissionSetManipulation = true;
		function permissionSetManipulator(permissionSets) {
      $scope.permissionSetCentralRef = permissionSets;
			angular.forEach(permissionSets, function(set){set.granted = "";});
			if(firstPermissionSetManipulation){
				firstPermissionSetManipulation = false;
				permissionSetsDeferred.resolve(null);
			}
			else{
				indexUserPermissions();
				setPermissionGrantOrRevoke();
				setPermissionSetGrantOrRevoke();
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
		};
		var grantPermissionSet = function (all, selected) {
			angular.forEach(selected, function (selectedPermissionSet) {
        if(permissionSetIndex[selectedPermissionSet.id].isValid){
          if ($scope.permissionIndex.permissionSet.indexOf(selectedPermissionSet.id) === -1) {
            $scope.userPermissions.permissionSets.push(new newPermissionSet(selectedPermissionSet.id));
            $scope.permissionIndex.permissionSet.push(selectedPermissionSet.id);
          }
          angular.forEach(selectedPermissionSet.permissionIds, function (permissionId) {
            addPermission(permissionId, selectedPermissionSet.id);
          });
       }
       else{
          inValidPermissionSetIds.push(selectedPermissionSet.id);
       }
			});
			saveUserPermissions(selected, "grunt");
		};
		var revokePermissionSet = function (all, selected) {
			angular.forEach(selected, function (selectedPermissionSet) {
        if(permissionSetIndex[selectedPermissionSet.id].isValid){
          if ($scope.permissionIndex.permissionSet.indexOf(selectedPermissionSet.id) > -1) {
            removePermissionSet(selectedPermissionSet);
            angular.forEach(selectedPermissionSet.permissionIds, function (permissionId) {
              removePermissionSetPermission(permissionId, selectedPermissionSet.id);
            });
          }
        }
        else{
          inValidPermissionSetIds.push(selectedPermissionSet.id);
        }
			});
			saveUserPermissions(selected, "revoke");
		};
		var grantPermission = function (all, selected) {
			angular.forEach(selected, function (selectedPermission) {
        if(!isInValidPermissions(selectedPermission)){
          addPermission(selectedPermission.id, null);
          selectedPermission.granted = 'Granted';
        }
			});
			saveUserPermissions(selected, "grunt");
		};
		var revokePermission = function (all, selected) {
			angular.forEach(selected, function (selectedPermission) {
        if(!isInValidPermissions(selectedPermission)){
          removeDirectPermission(selectedPermission.id);
          selectedPermission.granted = 'Revoked';
        }
			});
			saveUserPermissions(selected, "revoke");
		};

    function isInValidPermissions(selectedPermission){
      var isInActivePermission = true;
      var permissionAdminZones = selectedPermission.adminZones;
      for(var i = 0; i < permissionAdminZones.length; i++){
        if($scope.userAdminZones.indexOf(permissionAdminZones[i]) != -1){
          isInActivePermission = false;
          break;
        }
      }
      if(isInActivePermission){
        inValidPermissionsIds.push(selectedPermission.id);
      }
      return isInActivePermission;
    }
		function addPermission(permissionIdToAdd, parentId) {
			var addPermission = true;
			angular.forEach($scope.userPermissions.permissions, function (permissionToCheck) {
				if (permissionToCheck.id === permissionIdToAdd && permissionToCheck.rootPermissionSetId === parentId) {
					addPermission = false;
				}
			});
			if (addPermission) {
				$scope.userPermissions.permissions.push(new newPermission(permissionIdToAdd, parentId));
			}
		}
		function removeDirectPermission(permissionIdToRemove) {
			var newUserPermissions = [];
			angular.forEach($scope.userPermissions.permissions, function (permissionToCheck) {
				if (permissionToCheck.id !== permissionIdToRemove) {
					newUserPermissions.push(permissionToCheck);
				}
			});
			$scope.userPermissions.permissions.length = 0;
			$scope.userPermissions.permissions = newUserPermissions;
		}
		function removePermissionSetPermission(permissionIdToRemove, rootPermissionSetId) {
			var newUserPermissions = [];
			angular.forEach($scope.userPermissions.permissions, function (permissionToCheck) {
				if (permissionToCheck.id !== permissionIdToRemove ||
					(permissionToCheck.id === permissionIdToRemove && permissionToCheck.rootPermissionSetId !== rootPermissionSetId)) {
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
		function saveUserPermissions(selected, action) {
      indexUserPermissions();
			return mmRest.EC2Restangular.one(mmRest.MetaData.userPermissions.restPath,
				$scope.userPermissions.id).customPUT({entities: [$scope.userPermissions]}).then(
				function (data) {
          var successMessage = setSuccessMessage();
          mmAlertService.addSuccess(successMessage);
					updateLoggedInUserPermissions(selected, action);
					refreshCentral();
					return data;
				}, function (error) {
					processError(error);
				});
		}
    function setSuccessMessage(){
      var successMessage = 'Permissions were updated successfully';
      var ids = '';
      if(inValidPermissionsIds.length != 0) {
        for(var i = 0; i < inValidPermissionsIds.length; i++){
          ids = ids + (inValidPermissionsIds[i] + ' ');
        }
        successMessage = successMessage + ' except the following: ' + ids;
        inValidPermissionsIds.length = 0;
      }
      else if(inValidPermissionSetIds != 0){
        for(var i = 0; i < inValidPermissionSetIds.length; i++){
          ids = ids + (inValidPermissionSetIds[i] + ' ');
        }
        successMessage = successMessage + ' except the following: ' + ids;
        inValidPermissionSetIds.length = 0;
      }

      return successMessage;
    }
		function updateLoggedInUserPermissions(selected, action){
			var loginUser = session.get('user', null);
			if(loginUser.id == data.userId) {
				var loginUserPermissions = session.get('permissions', null);
				for (var i = 0; i < selected.length; i++) {
					if (action == "grunt") {
						var obj = {"id": selected[i].id, "name": selected[i].name};
						loginUserPermissions.permissions.push(obj);
					}
					else if (action == "revoke") {
						var permIndx = _.findIndex(loginUserPermissions.permissions, {id : selected[i].id});
						if (permIndx != -1) {
							loginUserPermissions.permissions.splice(permIndx, 1);
						}
					}
				}
				session.set('permissions', loginUserPermissions, session.storage.disk);
			}
		}
		function indexUserPermissions() {
			$scope.permissionIndex.permission = {};
			$scope.permissionIndex.permissionSet.length = 0;

			angular.forEach($scope.userPermissions.permissions, function (item) {
				if (!$scope.permissionIndex.permission[item.id]) $scope.permissionIndex.permission[item.id] = { isGranted: false};
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

    var centralPermissionSetActions = [];
    var centralPermissionActions = [];
    $scope.centralDataObject = [];

    checkEditPermissions();

    $scope.centralDataObject = [
      {type: 'permissionSet', centralActions: centralPermissionSetActions, dataManipulator: permissionSetManipulator, isEditable: false, hideAddButton: true, editButtons: []},
      {type: 'permission', centralActions: centralPermissionActions, dataManipulator: permissionManipulator, isEditable: false, hideAddButton: true, editButtons: []}
    ];

    function checkEditPermissions(){

      var hasEditPermissionsPermission = mmPermissions.hasPermissionBySession(entityMetaData["userPermissions"].permissions.entity.edit);

      if(hasEditPermissionsPermission){
        centralPermissionSetActions.push(
          { name: 'Grant', func: grantPermissionSet, disableFunc: checkGruntRevokePermissionsSets},
          { name: 'Revoke', func: revokePermissionSet, disableFunc: checkGruntRevokePermissionsSets}
        );
        centralPermissionActions.push(
          { name: 'Grant', func: grantPermission, disableFunc: checkGruntRevokePermissions},
          { name: 'Revoke', func: revokePermission, disableFunc: checkGruntRevokePermissions}
        );
      }
    }

    function checkGruntRevokePermissions(selectedPermissions){
      if(!_.isEmpty(selectedPermissions)){
        for(var i = 0; i < selectedPermissions.length; i++){
          var permissionAdminZones = selectedPermissions[i].adminZones;
          for(var j = 0; j < permissionAdminZones.length; j++){
            if($scope.userAdminZones.indexOf(permissionAdminZones[j]) != -1){
                return false;
            }
          }
        }
      }

      return true;
    }

    function checkGruntRevokePermissionsSets(selectedPermissionsSets){
      //for first loading
      if(_.isEmpty(selectedPermissionsSets)){
        permissionSetIndex = {};
        return true;
      }
      else{
        var setIds = Object.keys(permissionSetIndex);
        //remove unselected rows
        angular.forEach(setIds, function(id){
          if(_.findIndex(selectedPermissionsSets, {id : id}) == -1){
            delete permissionSetIndex[id];
          }
        });

        //add new selected row
        angular.forEach(selectedPermissionsSets, function(permissionSet){
         if(setIds.indexOf(permissionSet.id) == -1){
           permissionSetIndex[permissionSet.id] = {};
           permissionSetIndex[permissionSet.id].isValid = true;
           permissionSetIndex[permissionSet.id].permissions = undefined;
         }
        });

        //disable OR enable buttons will be on data manipulator
        fromPermissionSet = true;
      }
      //because delay when get all permissions from server
      return $scope.centralDataObject[0].centralActions[0].disable;
    }

    function checkPermissionsSetValid(permissions){
      var permissionSetValid = false;
      var validPermissions = 0;
      if(!_.isEmpty(permissions)){
        for(var i = 0; i < permissions.length; i++){
          var permissionAdminZones = permissions[i].adminZones;
          for(var j = 0; j < permissionAdminZones.length; j++){
            if($scope.userAdminZones.indexOf(permissionAdminZones[j]) != -1){
              validPermissions ++;
              break;
            }
          }
        }
        //if all permissions under permission set are valid
        if(permissions.length == validPermissions){
          permissionSetValid = true;
        }
      }

      return permissionSetValid;
    }
	}]);
