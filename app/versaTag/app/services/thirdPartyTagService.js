/**
 * Created by Rick.Jones on 1/22/15.
 */
app.factory('thirdPartyTagService', [ 'EC2Restangular', '$q',
    function(EC2Restangular, $q){

        var thirdPartyTagAPI = EC2Restangular.all('tags');

        var pub = {};
        var restPath = "tags/thirdpartytag";
        var headers = {"Authorization" : "MDMD admin:admin:123456", "Content-Type" : "application/json"};

        function createEntity(obj, conversionId){

            var entity = {
                "entities" : [{
                    "id" : obj.id == null ? null : obj.id,
                    "type": 'ThirdPartyTag',
                    "advertiserTagRef" : {
                        "id" : conversionId,
                        "tagType" : "Conversion"
                    },
                    "reportingName" : obj.reportingName,
                    "enabled" : obj.enabled == null ? false : obj.enabled,
                    "tagURL" : obj.tagURL,
                    "deduplicationType" : obj.deduplicationType,
                    "market" : obj.market == null ? "10" : obj.market,
                    "fireThisTag": null,
                    //"conversionFireSettings": {
                    //    "conversionTagId": conversionId,
                    //    "triggeredFrom": obj.triggeredFrom,
                    //    "site": obj.site,
                    //    "accordingTo":obj.
                    //},
                    "noScriptMode" : obj.noScriptMode,
                    "deriveTagAttributionSettings" : obj.deriveTagAttributionSettings,
                    "cookieWindowImpressions" : obj.cookieWindowImpressions,
                    "cookieWindowClicks" : obj.cookieWindowClicks,
                    "conversionAttributionModel" : obj.conversionAttributionModel
                }]
            };

            return entity;
        }

        pub.create = function(obj, conversionId){
            var deferred = $q.defer();

            var entity = createEntity(obj.plain(), conversionId);



            thirdPartyTagAPI.all('thirdpartytag').post(entity).then(function(response){

                console.log("CREATE - Third Party Tag,  RESPONSE:",response);
                deferred.resolve(response);

            });

            return deferred.promise;
        };

        pub.update = function(obj, conversionId){
            var deferred = $q.defer();
            var entity = createEntity(obj.plain(), conversionId);
            thirdPartyTagAPI.one('thirdpartytag', obj.id).customPUT(entity).then(function(response){
                console.log('UPDATE - Third Party Tag, RESPONSE:', response);
                deferred.resolve(response.plain());
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

        // Sites services
        pub.getAllSites = function(){

            var deferred = $q.defer();

            EC2Restangular.all('sites').getList().then(function(response){

                var sites = [];

                for(var i = 0; i < response.length; i++){

                    var site = {id: response[i].name, name: response[i].name};
                    sites.push(site);

                }

                deferred.resolve(sites);
            }, function (response){
                deferred.reject(response);
            });

            return deferred.promise;
        };


        // Market services
        pub.getAllMarkets = function(){
            // TODO need an API Endpoint for this call
        };

        return pub;
    }
]);
