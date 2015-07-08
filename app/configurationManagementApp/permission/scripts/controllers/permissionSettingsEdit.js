'use strict';

app.controller('permissionSettingsEditCtrl', ['$scope', '$rootScope', '$state', 'enums', '$stateParams', 'EC2Restangular', 'mmAlertService',
  function ($scope, $rootScope, $state, enums, $stateParams, EC2Restangular, mmAlertService) {
    $scope.validation = {};
    $scope.pageReady = false;
    $scope.isEditMode = true;
    $scope.isRequired = false;
    $scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: updateState, ref: null, nodes: []};
    $scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: save, ref: null, nodes: [],isPrimary:true};
    $scope.permissionTypes = enums.permissionType;
    $scope.validation = {};
    $scope.labelWidth = 150;
    $scope.miniSection = false;
    //$scope.showSPinner = true;
    $scope.userId = $stateParams.userId;

    var serverPermissionSettings = EC2Restangular.all('permissionSettings');
    serverPermissionSettings.get($scope.userId).then(
      function(data) {
        $scope.$parent.mainEntity = data;
        $scope.showSPinner = false;
        initPermissions(data);
      },
      processError);


    $scope.permissionsIndex = {};

    function initPermissions(permissionSettings){
      EC2Restangular.all('permissions').getList().then(function(data){
        $scope.permissions = data;

        for (var i = 0; i < enums.roleType.length; i++) {
          $scope.permissionsIndex[enums.roleType[i].id] = []
          var rolePermissions = permissionSettings.permissionSets[enums.roleType[i].id];
          for (var m = 0; m < $scope.permissions.length; m++) {
            $scope.permissionsIndex[enums.roleType[i].id][$scope.permissions[m].id] = {}
            $scope.permissionsIndex[enums.roleType[i].id][$scope.permissions[m].id].id = $scope.permissions[m].id;
            $scope.permissionsIndex[enums.roleType[i].id][$scope.permissions[m].id].obj = $scope.permissions[m];
            $scope.permissionsIndex[enums.roleType[i].id][$scope.permissions[m].id].isChecked = false;

            for (var j = 0; j < rolePermissions.permissions.length; j++) {
              if($scope.permissionsIndex[enums.roleType[i].id][$scope.permissions[m].id].id == rolePermissions.permissions[j].id){
                $scope.permissionsIndex[enums.roleType[i].id][$scope.permissions[m].id].isChecked = true;
                break;
              }
            }
          }
        };
      }, processError);
    }



    $scope.$watch('$parent.mainEntity', function (newValue, oldValue) {
      if (newValue != oldValue || oldValue == null) {
        updateState();
      }
    });

    function updateState() {
      if ($scope.$parent.mainEntity != null) {
        $scope.permissionSettings = $scope.$parent.mainEntity;
        $scope.permissionSettingsEdit = EC2Restangular.copy($scope.$parent.mainEntity);
      }
      $scope.pageReady = $scope.permissionSettingsEdit != null;
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

    function cancel() {
      updateState();
    }

    function save() {
      for (var i = 0; i < enums.roleType.length; i++) {
        var roleId = enums.roleType[i].id;
        $scope.$parent.mainEntity.permissionSets[roleId].permissions = [];
        var indexItem = $scope.permissionsIndex[roleId];
        for (var m = 0; m < $scope.permissions.length; m++) {
          if(indexItem[$scope.permissions[m].id].isChecked){
            $scope.$parent.mainEntity.permissionSets[roleId].permissions.push(indexItem[$scope.permissions[m].id].obj);
          }
        }
      }

      return $scope.$parent.mainEntity.put().then(
        function(data){
          $scope.$parent.mainEntity = data;
          $scope.showSPinner = false;
          mmAlertService.addSuccess('Save', 'You successfully updated the permission');
          return data;
        },
        function(error){
          mmAlertService.addError('Save', 'Updating the permission has failed');
          processError(error);
        });
    }
  }]);

