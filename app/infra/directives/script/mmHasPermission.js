/**
 * Created by rotem.perets on 9/21/14.
 */
app.directive('mmHasPermission',['mmPermissions', function(mmPermissions) {
  return {
    link: function(scope, element, attrs) {
      element.hide();
      var permissionsToCheck = null;

      // observe changes to interpolated attribute
      attrs.$observe('mmHasPermission', function(value) {
        permissionsToCheck = value;
        if(permissionsToCheck){
          toggleVisibilityBasedOnPermission();
        }
      });

      function toggleVisibilityBasedOnPermission() {
        var hasPermission = false;
        validatePermissionsInput();
        if(attrs.mmValidatorEntity){
          var validatorEntity = scope[attrs.mmValidatorEntity];
          if(validatorEntity){
            hasPermission = mmPermissions.hasPermissionByEntity(validatorEntity, permissionsToCheck);
            if (hasPermission)
              showElement();
          }
        }
        else{
          hasPermission = mmPermissions.hasPermissionBySession(permissionsToCheck);
          if (hasPermission)
            showElement();
        }
      }

      function showElement(){
        if(element[0] && element[0].attributes){
          for(var i = 0; i < element[0].attributes.length; i++){
            if(element[0].attributes[i].name == 'mm-has-permission'){
              element[0].attributes.removeNamedItem(element[0].attributes[i].name);
            }
          }
        }
        element.show();
      }

      function validatePermissionsInput(){
        //TODO is needed?
        if(!_.isString(attrs.mmHasPermission))
          throw "hasPermission value must be a string";

        if(_.isNull(permissionsToCheck) || _.isEmpty(permissionsToCheck))
          throw "mmHasPermission must have value";

        if(permissionsToCheck[0] === '!') {
          permissionsToCheck = permissionsToCheck.slice(1).trim();
        }

        var isArray = permissionsToCheck[0] === '[';
        if(isArray)
          permissionsToCheck = angular.fromJson(permissionsToCheck);
      }

      scope.$on('permissionsChanged', toggleVisibilityBasedOnPermission);
    }
  };
}]);
