/**
 * Created by Rick.Jones on 2/6/15.
 */
app.factory('versaTagService', [ 'EC2Restangular', '$q',
    function(EC2Restangular, $q) {

        var restPath = 'versaTag';

        function createPayload(data){

            var payLoad = {
             "entities": [{
                "type" : "VersaTag",
                "id" : data.id,
                "advertiserId" : data.advertiserId,
                "name" : data.name,
                "pageURL" : data.pageURL,
                "vtType" : data.vtType,
                "codeGeneration" : data.codeGeneration,
                "loadingMethod" : data.loadingMethod,
                "removeComments" : data.removeComments,
                "forceHTTPS" : data.forceHTTPS,
                "parameters" : data.parameters,
                "advertiserIds" : data.advertiserIds
            }]};

            return payLoad;
        }

        var pub = {};

        pub.create = function(tag){

            var deferred = $q.defer();

            EC2Restangular.all(restPath).post(createPayload(tag)).then(function(response){

                deferred.resolve(response);

            }, function(response){

                deferred.reject(response);

            });

            return deferred.promise;

        };

        pub.update = function(tag){

            var deferred = $q.defer();

            var entity = createPayload(tag);

            EC2Restangular.one(restPath, tag.id).customPUT(entity).then(function(response){

                deferred.resolve(response);

            }, function(response){

                deferred.reject(response);

            });

            return deferred.promise;
        };

        pub.remove = function(tags){

            var payload = {"entities":[]};

            var deferred = $q.defer();

            for (var i = 0; i < tags.length; i++ ) {
                payload.entities.push(tags[i].id);
            }

            EC2Restangular.all(restPath).customPOST(payload, 'delete').then(function (tags) {
                deferred.resolve(tags.plain());
            }, function (response) {
                deferred.reject(response);
            });
            return deferred.promise;

        };

		/**
		 * Service for updating code block
		 * @param tag
		 * @returns {{}}
		 */
		pub.updateCode = function( tag ) {

			var deferred = $q.defer();

			console.log( createPayload( tag ) );

			EC2Restangular.one( restPath + '/generateCode/' + tag.id ).customPOST( createPayload( tag ) ).then(function( response ) {
				deferred.resolve( response );
			});

			return deferred.promise;

		};

        return pub;

    }
]);
