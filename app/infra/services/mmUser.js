/**
 * Created by liron.tagger on 12/19/13.
 */
app.service('mmUserService',
  ['$rootScope', 'EC2Restangular', 'EC2AMSRestangular', 'configuration', 'authService', '$http', 'mmSession', '$q', '$state', 'mmUtils', 'mmPermissions',
	function ($rootScope, Restangular, AMSRestangular, conf, authService, $http, session, $q, $state, mmUtils, mmPermissions) {
	var guest = { 'name': 'Guest' };

	//init
	var lastAuthorization = session.get('Authorization', false);
	if(lastAuthorization) {
		Restangular.setDefaultHeaders({'Authorization': lastAuthorization });
		AMSRestangular.setDefaultHeaders({'Authorization': lastAuthorization });
	}
	session.set('user', session.get('user', guest), session.storage.session);

  function getLogInSuccessFunction(deferred) {
    function logInSuccess(data, status, headers, config) {
      console.log("login return: ", data, status, headers('Authorization'), config);
      if (headers('Authorization') === null) {
        deferred.reject(data.error);
      } else {
        Restangular.setDefaultHeaders({'Authorization': headers('Authorization') });
        AMSRestangular.setDefaultHeaders({'Authorization': headers('Authorization') });
        session.set('permissions', data.result.userUIPermissionSet, session.storage.disk);
        mmPermissions.permissionsUpdated();
        mmUtils.cacheManager.clearCache();
        session.set('user', data.result.user, session.storage.disk);
        session.set('Authorization', headers('Authorization'), session.storage.disk);
        authService.loginConfirmed(data.result, function(auth) {
          return function(config) {
            config.headers.Authorization = auth;
            return config;
          }

        }(headers('Authorization')));
        deferred.resolve(data.result);
      }
    }

    return logInSuccess;
  }


  function clearSessionData() {
    session.set('user', guest, session.storage.disk);
    session.set('Authorization', "logout", session.storage.disk);
    session.set('permissions', null, session.storage.disk);
    Restangular.setDefaultHeaders({'Authorization': 'logout' });
    AMSRestangular.setDefaultHeaders({'Authorization': 'logout' });
    mmUtils.cacheManager.clearCache();
  }

	return {
		login: function (userName, password) {
			var deferred = $q.defer();
			$http(
				{
					ignoreAuthModule: true,
					method: "POST",
					url: conf.loginPath + "Login/",
					data:{
						'username': userName,
						'password': password
					}
				})
				.success(getLogInSuccessFunction(deferred)).
        error(function(data, status, headers) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.

          if ((headers('WWW-Authenticate-Error') === "Credentials Expired: First login"))
            status = 1001;
          if ((headers('WWW-Authenticate-Error') === "Credentials Expired"))
            status = 1002;
          deferred.reject(status);
        });
			return deferred.promise;
		},

    changePassword: function (userName, password, newPassword, tempKey) {
      var deferred = $q.defer();
      $http(
        {
          ignoreAuthModule: true,
          method: "PUT",
          url: conf.loginPath + "credentials/",
          data:{
            'username': userName,
            'password': password,
            'tempKey': tempKey,
            'newPassword' : newPassword
          }
        })
        .success(getLogInSuccessFunction(deferred)).
        error(function(data, status) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          if (data.error.errors != undefined && data.error.errors[0].innerMessage.indexOf("validation") > -1)
            status = 1003;
          deferred.reject(status);
        });
      return deferred.promise;
    },

    forgotPassword: function (userName) {
      var deferred = $q.defer();
      $http(
        {
          ignoreAuthModule: true,
          method: "DELETE",
          url: conf.loginPath + "credentials/",
          data:{
            'username': userName
          }
        })
        .success(function(data, status, config) {
          console.log("login return: ", data, status, config);
          deferred.resolve(data.result);
        }).
        error(function(data, status) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          if (status === 422)
            status = 1004;
          deferred.reject(status);
        });
      return deferred.promise;
    },

		logout: function () {
      lastAuthorization = session.get('Authorization', false);
      clearSessionData();
      $http(
        {
          ignoreAuthModule: true,
          method: "POST",
          url: conf.loginPath + "logout/",
          headers: {
            'Authorization': lastAuthorization
          }
        })
        .success(function() {
          console.log("logout success");
        }).
        error(function() {
          console.log("logout error");
        });
    }
	}
}]);
