app.factory( 'campaigns', [ 'csb', 'EC2Restangular', '$q',
	function( csb, EC2Restangular, $q ) {

		var pub = {};

		var campaigns = EC2Restangular.all('campaigns');

		pub.getCampaigns = function( path, params ) {

			var deferred = $q.defer();

			campaigns.all( path ).getList( params ).then(
				function( response ) {
					deferred.resolve( response.plain() );
				}
			);

			return deferred.promise;

		}

		return pub;

	}
]);