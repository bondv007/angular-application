app.factory( 'targetAudiences', [ '$q', 'csb', 'EC2Restangular', 'restPaths',
	function( $q, csb, EC2Restangular, restPaths ) {

		var pub = {};

		/**
		 * Save the target audiences
		 * @param saveObject
		 * @returns {*}
		 */
		pub.saveTargetAudiences = function( saveObject ) {

			var deferred = $q.defer();

			EC2Restangular.all(restPaths[csb.config.env].strategies).all(restPaths.targetAudiences).post( saveObject ).then(
				function( response ) {
					deferred.resolve({
						tas: response.plain(),
						error: ''
					});
				},
				function( response ) {

					var error = buildTAErrors( response.data );

					if ( response.data.result.length ) {
						deferred.resolve({
							tas: response.data.result,
							error: error
						});
					}
					else{
						deferred.reject( error );
					}

				}
			);

			return deferred.promise;

		};

		/**
		 * Update the target audiences
		 * @param updateObject
		 * @returns {*}
		 */
		pub.updateTargetAudiences = function( updateObject ) {

			var deferred = $q.defer();

			EC2Restangular.all(restPaths[csb.config.env].strategies).all(restPaths.targetAudiences).customPUT( updateObject, null ).then(
				function( response ) {
					deferred.resolve({
						tas: response.plain(),
						error: ''
					});
				},
				function( response ) {

					var error = buildTAErrors( response.data );

					if ( response.data.result.length ) {
						deferred.resolve({
							tas: response.data.result,
							error: error
						});
					}
					else{
						deferred.reject( error );
					}
				}
			);

			return deferred.promise;

		};

		/**
		 * Delete the target audience by CAMPAIGN ID and by TARGET AUDIENCE ID
		 * @param params
		 */
		pub.deleteTargetAudience = function( id ) {

			var deferred = $q.defer();

			EC2Restangular.all(restPaths[csb.config.env].strategies).one(restPaths.targetAudiences, id ).one(restPaths.campaign, csb.params.campaignID ).remove().then(function( response ) {
				deferred.resolve( response.plain() );
			});

			return deferred.promise;

		};

		/**
		 * Helper function to extract error messages out of save/update target audiences and return as a string
		 * @param data
		 * @returns {string}
		 */
		function buildTAErrors( data ) {
			var errorString = '';
			angular.forEach( data.error, function( error ) {
				angular.forEach( error.errors, function( error ) {
					if ( error.innerMessage != undefined ) {
						errorString = errorString + ' ' + error.innerMessage;
					}
				});
			});
			return errorString;
		};

		return pub;

	}
]);