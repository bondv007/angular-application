'use strict';

app.factory('EC2AMSRestangular', ['Restangular', 'configuration', 'mmUtils', 'mmSession', function (Restangular, conf, mmUtils, mmSession) {
	return Restangular.withConfig(function (RestangularConfigurer) {
    var lastAuthorization = mmSession.get('Authorization', false);
    if(lastAuthorization) {
      RestangularConfigurer.setDefaultHeaders({'Authorization': lastAuthorization });
    }

    var defaultHttpFields = {};
    //$rootScope.abortRequest = $q.defer();
    //defaultHttpFields.timeout: $rootScope.abortRequest.promise
    console.log('Application Cache AMS: ' + conf.cache);
    if(conf.cache){
      defaultHttpFields.cache = mmUtils.cacheManager.getCacheObject('http');
      mmUtils.utilities.scheduleFunc(mmUtils.cacheManager.clearCache, conf.cacheInterval);
    }

    //RestangularConfigurer.setBaseUrl(conf.ec2ams);
    RestangularConfigurer.setBaseUrl(conf.ec2);
    RestangularConfigurer.setDefaultHttpFields(defaultHttpFields);      //added 3/12/2015

		RestangularConfigurer.addResponseInterceptor(function(response, operation, what, url) {
			var newResponse;
			if (response.result === undefined) {
				newResponse = response;
			} else {
				newResponse = response.result;
			}
      console.log("cfw restangular ec2ams 1", newResponse);
			return newResponse;
		});
		RestangularConfigurer.addFullRequestInterceptor(function(element, operation, route, url, headers, params, httpConfig) {
        console.log("cfw restangular ec2ams 2", element, operation, route, url, headers, params);
        /*if (element !== null && element.entities === undefined) {
            console.log("cfw restangular ec2ams entities undefined");
				if (element.push === undefined) {
					return {element: {entities: [element]}};
				} else {
					return {element: {entities: element}};
				}
			}*/
			return {}
		});
	});
}]);
