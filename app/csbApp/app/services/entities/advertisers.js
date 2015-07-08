app.factory( 'advertisers', [ '$q', 'csb', 'EC2Restangular', 'restPaths',
	function( $q, csb, EC2Restangular, restPaths) {

		var pub = {};

		pub.getAdvertisers = function( params ) {

			var deferred = $q.defer();

			EC2Restangular.all(restPaths[csb.config.env].advertisers).getList( params ).then(
				function( response ) {

					deferred.resolve( response.plain() );

				}
			);

			return deferred.promise;

		};

		pub.getRetargetingTags = function( params ) {

			var deferred = $q.defer();

			EC2Restangular.all(restPaths[csb.config.env].advertisers).all(restPaths.tags).getList( params ).then(
				function( response ) {
					deferred.resolve( response.plain() );
				},
				function( error ) {
					deferred.reject( error );
				}
			)

			return deferred.promise;

		};

		return pub;

	}
])