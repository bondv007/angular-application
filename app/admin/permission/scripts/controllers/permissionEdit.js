'use strict';

app.controller('permissionEditCtrl', ['$scope', '$rootScope', '$state', 'enums', '$stateParams', 'EC2Restangular', 'mmAlertService',
  function ($scope, $rootScope, $state, enums, $stateParams, EC2Restangular, mmAlertService) {

    $scope.isEditMode = !!$stateParams.permissionId || !!$scope.isEntral;
    $scope.validation = {};
    $scope.permissionId = $stateParams.permissionId;
    $scope.pageReady = false;
    $scope.isRequired = false;
    $scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: rollback, ref: null, nodes: []};
    $scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: save, ref: null, nodes: [],isPrimary:true};
    $scope.permissionGenres = enums.permissionGenres;
    $scope.permissionTypes = enums.permissionTypes;
    $scope.permissionToGrantPermission = "PermissionToGrantPermission";
    $scope.adminZones = enums.adminZones;
    $scope.roleTypes = enums.roleTypes;
    $scope.permissionCategories = enums.permissionCategories;
    $scope.validation = {};
    $scope.labelWidth = 230;
    $scope.miniSection = false;
    $scope.showSPinner = true;
    $scope.assignedToPermissionSetsOrig = null;
    $scope.permissionSetsIndex = {};

    var watcher = $scope.$watch('$parent.mainEntity', function (newValue, oldValue) {
      if (newValue != oldValue || oldValue == null || $scope.isEntral) {
        updateState();
        indexPermissionSets($scope.permissionSets);
      }
    });

    EC2Restangular.all('permissions/sets').withHttpConfig({cache: false}).getList().then(function(data){
      $scope.permissionSets = data;
      $scope.assignedToPermissionSets = [];
      indexPermissionSets(data);
    }, processError);
    var serverPermissions = EC2Restangular.all('permissions');
    if($scope.permissionId !== undefined && $scope.permissionId !== null && $scope.permissionId.length > 0){
      serverPermissions.get($scope.permissionId).then(
        function(data) {
          $scope.$parent.mainEntity = data;
          $scope.showSPinner = false;
        },
        processError);
    } else {
      updateState();
    }

    function indexPermissionSets(data){
      $scope.assignedToPermissionSets = [];
      if($scope.permissionEdit){
        angular.forEach(data, function(item){
          $scope.permissionSetsIndex[item.id] = item;

          angular.forEach(item.permissionIds, function(permissionId){
            if(permissionId === $scope.permissionEdit.id){
              if($scope.assignedToPermissionSets.indexOf(item.id) == -1){
                $scope.assignedToPermissionSets.push(item.id);
                return;
              }
            }
          });
        });
      } else {
        $scope.assignedToPermissionSets = [];
      }

      $scope.assignedToPermissionSetsOrig = $scope.assignedToPermissionSets.slice(0);
    }

    function updateState() {
      if ($scope.$parent.mainEntity != null && $scope.isEditMode) {
        // $scope.permission = $scope.$parent.mainEntity;
        $scope.permissionEdit = EC2Restangular.copy($scope.$parent.mainEntity);
        if($scope.permissionEdit.dataOwnershipContext == null){
          $scope.permissionEdit.dataOwnershipContext = [];
        }
      } else {
        // $scope.permission = null;
        $scope.permissionEdit = {
          type: 'Permission',
          name: "",
          description: "",
          categories: [],
          canGrantOnUserLevel: false,
          canGrantOnAccountLevel: false,
          dataOwnershipContext: [enums.roleTypes.getName("Any")],
          permissionType: "PlatformPermission",
          //permissionGenre: enums.permissionGenres.getName("Operation"),
          adminZones: [],
          grantPermissionOnAdminZone: null
        };
      }
      $scope.originalCopy = EC2Restangular.copy($scope.permissionEdit);
      $scope.pageReady = $scope.permissionEdit != null;
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

    function rollback() {
      $scope.permissionEdit = EC2Restangular.copy($scope.originalCopy);
      $scope.assignedToPermissionSets = $scope.assignedToPermissionSetsOrig;
      $scope.validation = {};
    }

    function save() {
      if (saveValidation()) {
        if($scope.isEditMode){
          return $scope.permissionEdit.put().then(
            function(data){
              $scope.$parent.mainEntity = data;
              $scope.showSPinner = false;
              mmAlertService.addSuccess('Save', 'You successfully updated the permission');
              savePermissionSets(data);
              return data;
            },
            function(error){
              mmAlertService.addError('Save', 'Updating the permission has failed');
              processError(error);
            });
        }else{
          return serverPermissions.post($scope.permissionEdit).then(
            function(data){
              $scope.$parent.mainEntity = data;
              $scope.showSPinner = false;
              mmAlertService.addSuccess('Save', 'You successfully created the permission');
              savePermissionSets(data);
              if($scope.isEntral == false){
                //replace is needed here to replace the last history record
                $state.go("spa.permission.permissionEdit", {permissionId: data.id}, {location : "replace"});
              } else {
                return data;
              }
            },
            function(error){
              mmAlertService.addError('Save', 'Creating the permission has failed');
              processError(error);
            });
        }
      }
    }

    function savePermissionSets(permission){
      console.log($scope.permissionSets);
      var itemsToAdd = _.difference($scope.assignedToPermissionSets, $scope.assignedToPermissionSetsOrig);
      var itemsToRemove = _.difference($scope.assignedToPermissionSetsOrig, $scope.assignedToPermissionSets);

      angular.forEach(itemsToAdd, function(permissionSetToAdd){
        var shouldAddPermissionToSet = true;
        angular.forEach($scope.permissionSetsIndex[permissionSetToAdd].permissionIds, function(permissionIdToCheck){
          if(permissionIdToCheck === permission.id){
            shouldAddPermissionToSet = false;
          }
        });
        if(shouldAddPermissionToSet){
          $scope.permissionSetsIndex[permissionSetToAdd].permissionIds.push(permission.id);
          $scope.permissionSetsIndex[permissionSetToAdd].put().then(function(){},function(error){processError(error);});
        }
      });

      angular.forEach(itemsToRemove, function(permissionSetToRemove){
        angular.forEach($scope.permissionSetsIndex[permissionSetToRemove].permissionIds, function(permissionIdToCheck){
          if(permissionIdToCheck === permission.id){
            $scope.permissionSetsIndex[permissionSetToRemove].permissionIds.splice($scope.permissionSetsIndex[permissionSetToRemove].permissionIds.indexOf(permission), 1);
            $scope.permissionSetsIndex[permissionSetToRemove].put().then(function(){},function(error){processError(error);});
          }
        });
      });
    }

    function saveValidation() {
      var isValid = true;
      $scope.validation = {};

      if(!$scope.permissionEdit.name || $scope.permissionEdit.name.length <= 2){
        $scope.validation.name = "Please enter a name longer than 2 characters";
        isValid = false;
      }

      if(!$scope.permissionEdit.description ||  $scope.permissionEdit.description.length <= 10) {
        $scope.validation.description = "Please enter a description longer than 10 characters";
        isValid = false;
      }

      if($scope.permissionEdit.permissionType !== $scope.permissionToGrantPermission){
        if(!$scope.permissionEdit.adminZones || $scope.permissionEdit.adminZones.length === 0){
          $scope.validation.adminZones = "Please select at least one admin zone";
          isValid = false;
        }
        if(!$scope.permissionEdit.dataOwnershipContext || $scope.permissionEdit.dataOwnershipContext.length === 0){
          $scope.validation.dataOwnershipContext = "Please select at least one account context";
          isValid = false;
        }
        if(!$scope.permissionEdit.categories || $scope.permissionEdit.categories.length === 0){
          $scope.validation.categories = "Please select at least one category";
          isValid = false;
        }
      } else {
        if(!$scope.permissionEdit.grantPermissionOnAdminZone){
          $scope.validation.grantPermissionOnAdminZone = "Please select admin zone";
          isValid = false;
        }
      }

      if(isValid){
        $scope.validation = {};
      }
      return isValid;
    }

    $scope.$on('$destroy', function(){
      $scope.permissionEdit = null;
      $scope.permissionSetsIndex = null;
      serverPermissions = null;

      if(watcher) watcher();

      if($scope.permissionSets) $scope.permissionSets.length = 0;
    });
  }]);
