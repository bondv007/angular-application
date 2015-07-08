app.factory( 'categories', [ '$q', 'csb', 'EC2Restangular',
  function( $q, csb, EC2Restangular ) {

    var pub = {};

    pub.getCategories = function( params ) {

      var deferred = $q.defer();

      EC2Restangular
        .all('strategies')
        .all('targetingData')
        .all('contextual')
        .all('categories')
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
        .all('strategies')
        .all('targetingData')
        .all('contextual')
        .all('subCategories')
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
