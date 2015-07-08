/**
 * Created by yoav.karpeles on 3/9/14.
 */

'use strict';

app.controller('adminCtrl', ['$scope', '$state','flowToolBar', 'mmPermissions', 'entityMetaData', function ($scope, $state, flowToolBar, mmPermissions, entityMetaData) {

  var hasUsersPermission =  mmPermissions.hasPermissionBySession(entityMetaData['user'].permissions.entity);
  var hasAccountsPermission =  mmPermissions.hasPermissionBySession(entityMetaData['account'].permissions.entity);
  var hasSitesPermission = mmPermissions.hasPermissionBySession(entityMetaData['site'].permissions.entity);

  $scope.type = null;//must be null in order to hide the entityLayoutTitle
  $scope.hideGoTo = true;
  $scope.entityId = null;
  $scope.entityActions = [];

  if(hasAccountsPermission) {
    $scope.entityActions.push(
      {
        name: 'Accounts',
        ref: '.accounts',
        func: changeToAccountView,
        preventOpenMenu: true
      }
    )
  }

  if(hasUsersPermission) {
    $scope.entityActions.push(
      {
        name: 'Users',
        ref: '.users',
        func: changeToUserView,
        preventOpenMenu: true
      }
    )
  }
  if(hasSitesPermission){
    $scope.entityActions.push(
      {
        name: 'Sites',
        ref: '.sites',
        func: changeToSiteView,
        preventOpenMenu: true
      }
    );
  }

  $scope.entityActions.parentMenuItem = 'Admin';
  if($scope.$parent.isActive) $scope.$parent.isActive($scope.entityActions.parentMenuItem);
  flowToolBar.setPrefixToEntityActions('spa.admin',$scope.entityActions);

  function changeToAccountView(){
      changeView('spa.admin.accounts');
  }
  function changeToSiteView(){
      changeView('spa.admin.sites');
  }
  function changeToUserView(){
      changeView('spa.admin.users');
  }
  function changeView(view) {
      $state.go(view);
  }
}]);
