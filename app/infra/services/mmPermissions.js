'use strict';
// mm-has-permission="ShowCreativeMenu"
// permission: 'ShowCreativeMenu'
app.factory('mmPermissions',['$rootScope', 'mmSession', 'mmRest', function ($rootScope, session, mmRest) {
    return {
      permissionsUpdated: function() {
        $rootScope.$broadcast('permissionsChanged')
      },
      hasPermissionBySession: function (permissionsToCheck) {
        var sessionPermissions = session.get('permissions', null);
        if(sessionPermissions && sessionPermissions.permissions){
          return hasPermission(sessionPermissions.permissions, permissionsToCheck);
        }
        return false;
      },
      hasPermissionByEntity :  function(entity, permissionsToCheck){
        if(entity && entity.uiPermissions) {
          return hasPermission(entity.uiPermissions, permissionsToCheck);
        }
        return false;
      }
    };

  //Support: Object, String, Array of Strings, Array of Objects
  function hasPermission(permissions, permissionsToCheck){
    //if(!(session.get('user').name.toLowerCase().indexOf("secret") > -1)){
    //  return true;
    //}
    if(_.isArray(permissionsToCheck)){
      var permissionsArray = [];
      if(_.isObject(permissionsToCheck[0])){
        permissionsArray = buildPermissionsArray(permissionsToCheck);
      }
      else{
        permissionsArray = permissionsToCheck;
      }
      return checkTwoArraysPermissions(permissions, permissionsArray)
    }
    else if(_.isString(permissionsToCheck)){
      for(var i = 0; i < permissions.length; i++){
          if(permissionsToCheck.trim().toLowerCase() === permissions[i].name.trim().toLowerCase())
            return true;
        }
    }
    else if(_.isObject(permissionsToCheck)){
      var permissionsArray = [];
      var keys = Object.keys(permissionsToCheck);
      for(var i = 0; i < keys.length; i++){
        permissionsArray.push(permissionsToCheck[keys[i]]);
      }
      return checkTwoArraysPermissions(permissions, permissionsArray)
    }
    return false;
  };

  function checkTwoArraysPermissions(permissions, permissionsToCheck){
    for(var i = 0; i < permissions.length; i++){
      for(var j = 0; j < permissionsToCheck.length; j++){
        if(permissionsToCheck[j].trim().toLowerCase() === permissions[i].name.trim().toLowerCase())
          return true;
      }
    }
    return false;
  }

  function buildPermissionsArray (permissions){
    var permissionsArray = [];

    for(var i = 0; i < permissions.length; i++){
      var keys = Object.keys(permissions[i]);
      for(var j = 0; j < keys.length; j++){
        permissionsArray.push(permissions[i][keys[j]]);
      }
    }
    return permissionsArray;
  };
  }]);
