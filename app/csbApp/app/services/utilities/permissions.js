'use strict';

app.factory('csbPermissions', [ 'EC2Restangular', 'csb', '$q', 'restPaths',
  function (EC2Restangular, csb, $q, restPaths) {

    var pub = {};

    // Patch: at this point we do not yet know if we're in mdx2 or mdx3 so we copy the init logic
    var adminPath = (window.self !== window.top) ? restPaths.mdx2.admin : restPaths.mdx3.admin;
    var admin = EC2Restangular.all(adminPath);

    pub.getPermissions = function () {

      var deferred = $q.defer();

      var requestData = {
        "entities": [
          {
            "type": "userPermissionsRequest",
            "clientRefId": "100000",
            "userId": csb.params.userID,
            "permissionsNamesList": [
              "AccountCSBEditMode",
              "AccountCSBViewOnly"
            ]
          }
        ]
      };

      admin.all('permissions/').post(requestData).then(
          function (response) {
            deferred.resolve(response[0]);
          }
      );

      return deferred.promise;

    };

    return pub;

  }
]);
