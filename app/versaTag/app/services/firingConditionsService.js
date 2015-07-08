/**
 * Created by Rick.Jones on 1/12/15.
 */

app.factory('firingConditionsService', [ 'EC2Restangular', '$q',
    function(EC2Restangular, $q){

        var firingConditionsAPI = EC2Restangular.all('versaTag');

        var pub = {};
        var restPath = "versaTag/firingCondition";


        pub.getAll = function(){

            var deferred = $q.defer();

            firingConditionsAPI.getList().then(function(response){
                deferred.resolve(response[0]);
            });

            return deferred.promise;

        };



        // Get firing condition by id
        pub.getFiringConditionById = function(id){

            var deferred = $q.defer();

            firingConditionsAPI.one('firingCondition', id).get().then(function( response ){

				var obj = response;

				if ( obj.condition.landedOn ) {
					obj.condition.landedOn.includeUrls = obj.condition.landedOn.includeUrls ? obj.condition.landedOn.includeUrls.join('/n') : null;
					obj.condition.landedOn.excludeUrls = obj.condition.landedOn.excludeUrls ? obj.condition.landedOn.excludeUrls.join('/n') : null;
				}

				if ( obj.condition.referredFrom ) {
					obj.condition.referredFrom.includeUrls = obj.condition.referredFrom.excludeUrls ? obj.condition.referredFrom.includeUrls.join('/n') : null;
				}

                deferred.resolve( obj );

            });

            return deferred.promise;
        };



        // Create Firing condition
        pub.create = function( obj ){

			var deferred = $q.defer();

			if ( obj.condition.landedOn ) {
				obj.condition.landedOn.includeUrls = obj.condition.landedOn.includeUrls ? obj.condition.landedOn.includeUrls.split('/n') : null;
				obj.condition.landedOn.excludeUrls = obj.condition.landedOn.excludeUrls ? obj.condition.landedOn.excludeUrls.split('/n') : null;
			}

			if ( obj.condition.referredFrom ) {
				obj.condition.referredFrom.includeUrls = obj.condition.referredFrom.includeUrls ? obj.condition.referredFrom.includeUrls.split('/n') : null;
			}

            firingConditionsAPI.all('firingCondition').post( obj ).then(function(response){
                deferred.resolve(response);
            });

            return deferred.promise;
        };



        // update Firing condition
        pub.update = function( obj ){

            var deferred = $q.defer();

			if ( obj.condition.landedOn ) {
				obj.condition.landedOn.includeUrls = obj.condition.landedOn.includeUrls ? obj.condition.landedOn.includeUrls.split('/n') : null;
				obj.condition.landedOn.excludeUrls = obj.condition.landedOn.excludeUrls ? obj.condition.landedOn.excludeUrls.split('/n') : null;
			}

			if ( obj.condition.referredFrom ) {
				obj.condition.referredFrom.includeUrls = obj.condition.referredFrom.includeUrls ? obj.condition.referredFrom.includeUrls.split('/n') : null;
			}

            firingConditionsAPI.one( 'firingCondition', obj.id ).customPUT( obj ).then(function(response){
                deferred.resolve(response.plain());
            }, function(response){
                deferred.reject(response);
            });

            return deferred.promise;

        };




        pub.remove = function(tags) {

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




        pub.getAdvertiserTags = function(advertiserId){

            var deferred = $q.defer();

            EC2Restangular.all('tags/conversion').one('advertiserid', advertiserId).get().then(function(advertisers){

                deferred.resolve(advertisers);

            }, function(response){
                deferred.reject(response);
            });

            return deferred.promise;
        };





        pub.getFiringConditionInfo = function(versaTagId) {
            var deferred = $q.defer();
            var metaDataFc = {};
            metaDataFc.advertisersIndex = {};
            var versaTag = EC2Restangular.all('versaTag');
            var advertiserCall = EC2Restangular.all('tags/conversion');
            versaTag.get(versaTagId).then(function(data){
              metaDataFc.advertiserId = data.advertiserIds.join();
              advertiserCall.one('advertiserid', metaDataFc.advertiserId).get().then(function(advertisers){
                  metaDataFc.advertisersTags =  _.map(advertisers, function (tag, index) {
                        return { name: tag.reportingName, id: tag.id};
                    });
                  advertisers.forEach(function(adv){
                    metaDataFc.advertisersIndex[adv.id] = {
                          reportingName: adv.reportingName,
                          id: adv.id,
                          tagType: adv.tagType
                        };
                  });
                deferred.resolve(metaDataFc);
              });

            });


            return deferred.promise;

        };





        return pub;
    }
]);
