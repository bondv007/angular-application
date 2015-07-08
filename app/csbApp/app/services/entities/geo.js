app.factory( 'geo', [ '$q', 'EC2Restangular', 'restPaths', 'csb',
	function( $q, EC2Restangular, restPaths, csb ) {

		var pub = {}

		var geo = EC2Restangular.all(restPaths[csb.config.env].strategies).all(restPaths.targetingData);

		/**
		 * single function to handle all geo requests
		 * @param type: string of the type (path name for api)
		 * @param params: object any parameters that need to be passed in based on: https://sizmek.atlassian.net/wiki/display/MM30/Targeting+Data
		 * @returns {*}
		 */
		pub.getGeo = function( type, params ) {

			var deferred = $q.defer();

			geo.all( type ).getList( params ).then(function( response ) {
				deferred.resolve( response );
			});

			return deferred.promise;

		}


		return pub;

	}
]);