/**
 * Created by roi.levy on 12/31/14.
 */
app.controller('configurationCtrl', ['$scope', 'flowToolBar', '$state', 'mmPermissions', 'entityMetaData',
    function($scope, flowToolBar, $state, mmPermissions, entityMetaData) {
      var hasFeatureFlagsPermission = mmPermissions.hasPermissionBySession("ViewFeatureFlags");
      var hasPermissionForPermissions = mmPermissions.hasPermissionBySession(entityMetaData["permission"].permissions.entity);
      var hasPermissionForPermissionsSet = mmPermissions.hasPermissionBySession(entityMetaData["permissionSet"].permissions.entity);
      $scope.type = null; //must be null in order to hide the entityLayoutTitle
      $scope.hideGoTo = true;
      $scope.entityId = null;
      $scope.entityActions = [
        {
          name: 'In-Stream Templates',
          ref: '.inStreamTemplates',
          func: ChangeToInStreamTemplatesView,
          preventOpenMenu: true
        }];

      if(hasPermissionForPermissions || hasPermissionForPermissionsSet){
        $scope.entityActions.push(
          {
            name: 'Permissions',
            views: [{
              name: 'Permissions',
              ref: '.permissions',
              nodes: []
            }, {
              name: 'Permission Sets',
              ref: '.permissionSets',
              nodes: []
            }],
            actions: [{
              name: 'New Permission',
              func: createNewPermission,
              nodes: []
            }, {
              name: 'New Permission Set',
              func: createNewPermissionSet,
              nodes: []
            }]
          }
        )
      }

      if (hasFeatureFlagsPermission) {
          $scope.entityActions.push({
              name: 'Feature Management',
              func: GoToFeatureFlags
          });
      }

        $scope.entityActions.parentMenuItem = 'Configuration';
        if ($scope.$parent.isActive) $scope.$parent.isActive($scope.entityActions.parentMenuItem);
        flowToolBar.setPrefixToEntityActions('spa.configuration', $scope.entityActions);

        function GoToFeatureFlags() {
            $state.go('spa.configuration.fflags');
        }

        function ChangeToInStreamTemplatesView() {
            $state.go('spa.configuration.inStreamTemplates');
        }

        function createNewPermission() {
            $state.go('spa.permission.permissionNew');
        }

        function createNewPermissionSet() {
                $state.go('spa.permissionSet.permissionSetNew');
            }
            //        function createTemplate(){
            //            alert("to do");
            //        }
    }
]);
