app.factory( 'categories', [ '$q', 'csb', 'EC2Restangular', 'restPaths',
  function( $q, csb, EC2Restangular, restPaths) {

    var pub = {};

    pub.getCategories = function( params ) {

      var deferred = $q.defer();

      EC2Restangular
        .all(restPaths[csb.config.env].strategies)
        .all(restPaths.targetingData)
        .all(restPaths.contextual)
        .all(restPaths.categories)
        .getList(params)
        .then(function (response) {

          deferred.resolve( response.plain() );

        }, function (error) {
              deferred.reject(error);
          });

      return deferred.promise;

    };

    pub.getSubCategories = function( params ) {

      var deferred = $q.defer();

      EC2Restangular
          .all(restPaths[csb.config.env].strategies)
          .all(restPaths.targetingData)
          .all(restPaths.contextual)
          .all(restPaths.subCategories)
        .getList(params)
        .then(function (response) {

          deferred.resolve( response.plain() );

        }, function (error) {
              deferred.reject(error);
          });

        return deferred.promise;

    };

    return pub;
  }
]);
