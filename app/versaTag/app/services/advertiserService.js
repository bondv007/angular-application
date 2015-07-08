/**
 * Created by Rick.Jones on 2/26/15.
 */
app.factory('vtAdvertiserService', [ '$q', 'EC2Restangular',
    function($q, EC2Restangular){

        var pub = {};

        pub.getAdvertisers = function(filter){

            var deferred = $q.defer();

            var advertisers = EC2Restangular.all('advertisers').getList();

            advertisers.then(function(data){

                //console.log('data', data);

                var listOfAdvertisers = [];

                angular.forEach(data, function(value, key){

                    var advertiser = value;
                    listOfAdvertisers.push({name: advertiser.name, id: advertiser.id});

                });

                deferred.resolve(listOfAdvertisers);

            }, function(response){

                deferred.reject(response);

            });

            return deferred.promise;

        };

        pub.getAdvertisersByAccountId = function(accountId){

            var deferred = $q.defer();

            EC2Restangular.all('advertisers').get(accountId).then(function(response){

                deferred.resolve(response);

            }, function(response){
                deferred.reject(response);
            })

            return deferred.promise;

        };

        pub.getAdvertisersByVersaTagId = function(versaTagId){

            var deferred = $q.defer();

            EC2Restangular.all('versaTag').one('enriched', versaTagId).get().then(function(response){


                if(response.advertiserData){
                    deferred.resolve(response.advertiserData);
                }

            }, function(response) {
                deferred.reject(response);
            });

            return deferred.promise;

        };


        return pub;

    }
]);