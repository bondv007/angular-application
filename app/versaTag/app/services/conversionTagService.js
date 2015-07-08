/**
 * Created by Rick.Jones on 1/12/15.
 */

app.factory('conversionTagService', [ 'EC2Restangular', '$q',
    function(EC2Restangular, $q){

        var conversionAPI = EC2Restangular.all('tags');
        var restPath = "tags/conversion";

        var pub = {};

        function setHeaders(){
            EC2Restangular.setDefaultHeaders({"Authorization" : "MDMD admin:admin:123456"});
        }

        function createConversionEntity(obj){

            var entity = {
                "entities" : [{
                    "id" : obj.id,
                    "type": obj.type == null || obj.type == "APIEnrichedConversionTag" ? 'ConversionTag' : obj.type,
                    "reportingName" : obj.reportingName,
                    "name" : obj.name,
                    "advertiserId" : obj.advertiserId,
                    "pageURL" : obj.pageURL,
                    "conversionType" : obj.conversionType,
                    "conversionValue" : obj.conversionValue,
                    "conversionCurrency" : obj.conversionCurrency,
                    "protocol" : obj.protocol,
                    "codeType" : obj.codeType,
                    "removeComments" : obj.removeComments,
                    "xhtmlCompatible" : obj.xhtmlCompatible,
                    "parameters" : obj.parameters,
                    "account": 1,
                    "brand": "TEST"
                }]
            };

            //console.log(JSON.stringify(entity));

            return entity;
        }

        pub.setHeaders = function(){
            setHeaders();
        };

        pub.getConversionTag = function(id){
            var deferred = $q.defer();

            conversionAPI.one('conversion', id).get().then(function(response){

                deferred.resolve(response[0]);

            });

            return deferred.promise;
        };

        pub.create = function(obj){
            var deferred = $q.defer();

            var entity = createConversionEntity(obj);

            //console.log(JSON.stringify(entity));

            conversionAPI.all('conversion').post(entity).then(function(response){
                console.log('create response', response);
                deferred.resolve(response);
            });

            return deferred.promise;
        };

        pub.update = function(obj){

            var deferred = $q.defer();


            var entity = createConversionEntity(obj);

            //console.log(JSON.stringify(entity));

            // rest/tags/conversion/<id>
            conversionAPI.one('conversion', obj.id).customPUT(entity).then(function(response){

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


        pub.getAdvertisers = function(){

            var deferred = $q.defer();

            EC2Restangular.setDefaultHeaders({'Authorization': 'MDMD admin:admin:123456'});
            // Get list of advertisers
            var advertisers = EC2Restangular.all('advertisers');

            var allAdvertisers = [];

            advertisers.getList().then(function(data){

                    deferred.resolve(data.plain());
            });

            return deferred.promise;


        };

        return pub;
    }
]);
