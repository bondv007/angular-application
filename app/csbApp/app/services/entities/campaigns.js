app.factory( 'campaigns', [ 'csb', 'EC2Restangular', '$q', 'restPaths',
	function( csb, EC2Restangular, $q, restPaths) {
		var pub = {};
		var campaigns = EC2Restangular.all(restPaths[csb.config.env].campaigns);
    var unAssignedCampaigns = EC2Restangular.all(restPaths[csb.config.env].unAssignedCampaigns);

		pub.getCampaigns = function(params) {
			var deferred = $q.defer();
			campaigns.getList( params ).then(
				function( response ) {
					deferred.resolve( response.plain() );
				}
			);
			return deferred.promise;
		}

    pub.getUnAssignedCampaigns = function(params) {
      var deferred = $q.defer();
      unAssignedCampaigns.withHttpConfig({cache: false}).getList( params ).then(
          function( response ) {
            deferred.resolve( response.plain() );
          }
      );
      return deferred.promise;
    }

    pub.getCampaignById = function(id){
      var deferred = $q.defer();
      EC2Restangular.one(restPaths[csb.config.env].campaign, id ).get().then(
          function( response ) {
            deferred.resolve( response.plain() );
          }
      );
      return deferred.promise;
    }

		return pub;
	}
]);