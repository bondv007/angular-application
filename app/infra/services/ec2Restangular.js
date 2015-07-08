'use strict';

app.factory('EC2Restangular', ['Restangular', 'configuration', '$filter', 'mmAlertService', 'mmUtils', 'mmSession','$rootScope', '$state',
	function (Restangular, conf, $filter, mmAlertService, mmUtils, mmSession, $rootScope, $state) {
		var ec2Rest  = Restangular.withConfig(function (RestangularConfigurer) {
			var lastAuthorization = mmSession.get('Authorization', false);
			if(lastAuthorization) {
				RestangularConfigurer.setDefaultHeaders({'Authorization': lastAuthorization });
			}

			var defaultHttpFields = {};
			//$rootScope.abortRequest = $q.defer();
			//defaultHttpFields.timeout: $rootScope.abortRequest.promise
			console.log('Application Cahce: ' + conf.cache);
			if(conf.cache){
				defaultHttpFields.cache = mmUtils.cacheManager.getCacheObject('http');
				mmUtils.utilities.scheduleFunc(mmUtils.cacheManager.clearCache, conf.cacheInterval);
			}

			RestangularConfigurer.setBaseUrl(conf.ec2);
			RestangularConfigurer.setDefaultHttpFields(defaultHttpFields);

			// Handle metadata
			RestangularConfigurer.addResponseInterceptor(function(response, operation, what, url, httpConfig) {
				if(operation === 'put' || operation === 'post'){
					$rootScope.isDirtyEntity = false;
				}

				var newResponse;
				if (response.result === undefined) {
					newResponse = response;
				} else if (response.result == null) {
					newResponse = [];
				} else {
					newResponse = response.result;
				}

				// This operation supports paging
				if(operation === 'getList' && !angular.isUndefined(response.metadata) && response.metadata !== null && response.metadata.total !== null){
					addPagingDataToResponse(httpConfig, response, newResponse);
				}

				return newResponse;
			});

			RestangularConfigurer.addFullRequestInterceptor(function(element, operation, route, url, headers, params, httpConfig) {
        // Default page support
        if (operation === 'getList' && angular.isUndefined(params.from)) {
          params.from = 0;
          params.max = params.max || ec2Rest.pageSize;
          params.sort = params.sort || 'id';
        }

				//set content-type to json type on delete/remove operation to avoid the using of default header
				if(operation == 'delete' || operation == 'remove'){
					headers['Content-Type'] = 'application/json;charset=utf-8';
				}
				if(conf.cache){
					if (operation === 'put' || operation === 'post' || operation === 'delete' || operation === 'remove') {
						mmUtils.cacheManager.clearResourceFromCache(url, element, operation);
					} else {
						mmUtils.cacheManager.cacheRequest(route, url, params, element, operation)
					}
				}

				if (element !== null && element.entities === undefined) {
					if (url.indexOf('rest/mdx2') > 0) return element;
					else if (element.push === undefined) {
						return {element: {entities: [element]}};
					} else {
						return {element: {entities: element}};
					}
				}
				return {}
			});

			RestangularConfigurer.setErrorInterceptor(function (response) {
				setErrorFromStatus(response);
				setErrorFromInnerCodes(response);
				return response;
			});

			function addPagingDataToResponse(httpConfig, response, newResponse){
				newResponse.serverLength = response.metadata.total;

				// Get original request
				var request = httpConfig.config;
				newResponse.lastRequestParams = request.params;
				newResponse.isReading = false;

				/**
				 * Reads the next page, in case concat flag is provided append the new items to the original collection
				 * @param concat
				 * @param manipulateFunc
				 */
				newResponse.readNext = function(concat, manipulateFunc) {
					var that = this;

					// Start reading the next response
					that.isReading = true;

					// Copy the last request and modify the paging parameters
					var params = angular.copy(that.lastRequestParams);
					params.from += params.max;
//						params.from += ec2Rest.readNextPageSize;
					params.max = ec2Rest.readNextPageSize;

					// Execute the request and fetch the next page
					return that.getList(params).then(function(response) {
						if (manipulateFunc) {
							manipulateFunc(response);
						}
						if (concat) {
							response.forEach(function(e, i) {
								that.push(e)
							});

							that.lastRequestParams = params;
						}

						// Stop reading
						that.isReading = false;

						// Return the promise chain
						return response;
					});
				};

				/**
				 * Checks if there are any more rows to fetch.
				 */
				newResponse.hasNext = function() {
					return request.params && request.params.max && (request.params.from + request.params.max) < newResponse.serverLength;
				}
			}

			function setErrorFromStatus(response){
				if (response.status == '666') {
					var error;
					if (response.error != null){
						error = response.error;
					}
					else if (response.data != null && response.data.error != null){
						error = response.data.error;
					}

					mmAlertService.addError(error);
				}
			}
			function setErrorFromInnerCodes(response){
				if (response.data && response.data.error){
					if(response.data.error instanceof Array) {
						for (var i = 0; i < response.data.error.length; i++) {
							printErrors(response.data.error[i].errors);
						}
					}
					else if (response.data.error.errors){
						printErrors(response.data.error.errors);
					}
				}
			}
			function printErrors(errors){
				if(errors instanceof Array) {
					for (var i = 0; i < errors.length; i++) {
						printError(errors[i]);
					}
				}
				else{
					printError(errors);
				}
			}
			function printError(error){
				var errorCode = error.code;
				if (errorCode){
					if($rootScope.isMMNext == undefined){
						var errorMessage = $filter('T')(errorCode.toString());
						if(error.params && error.params.length > 0){
							errorMessage = mmUtils.utilities.replaceParams(errorMessage,error.params);
						}
						mmAlertService.addError(errorMessage);
					}
					else{
						if(error && error.innerMessage && error.code == 250000){
							mmAlertService.addError(error.innerMessage);
						}
					}
				}
			}
		});

    function addPagingFunctionality(newArr, oldArr){
      newArr.readNext = oldArr.readNext;
      newArr.hasNext = oldArr.hasNext;
      newArr.getList = oldArr.getList;
      newArr.lastRequestParams = oldArr.lastRequestParams;
    }

    ec2Rest.pageSize = 250;
		ec2Rest.readNextPageSize = 25;
		ec2Rest.maxBlockSize = 10000000;
		ec2Rest.maxRequestSize = 10000000;
    ec2Rest.addPagingFunctionality = addPagingFunctionality;
		return ec2Rest;
	}]);
