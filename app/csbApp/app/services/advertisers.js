app.factory( 'advertisers', [ '$q', 'csb', 'EC2Restangular',
	function( $q, csb, EC2Restangular ) {

		var pub = {};

		pub.getAdvertisers = function( params ) {

			var deferred = $q.defer();

			EC2Restangular.all( 'advertisers/' ).getList( params ).then(
				function( response ) {

					deferred.resolve( response.plain() );

				}
			);

			return deferred.promise;

		};

		pub.getRetargetingTags = function( params ) {

			var deferred = $q.defer();

			EC2Restangular.all( 'advertisers' ).all( 'tags' ).getList( params ).then(
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