app.factory('geoService', [ 'csb', '$http', '$q',

    function( csb, $http, $q ) {

        var baseUrl = csb.config.baseApiUrl + 'Geo';

        /**
         * This is a function that will parse the data coming from the server and return the Array that contains
         * the data to be shown in the UI
         * @param  {Object} data Response from the server, an object that contains information like status and status message,
         *                       along with the arrays of data for the lists that will populate the UI.
         * @return {Array}      An array extracted from the Object input, containing the data that will populate the UI.
         */
        var transformResponseHelper = function(data) {
            if (!data) {
                return [];
            }
            else {
                //var response = JSON.parse(data);    // parsing the response object
                //var status = response.ResponseStatus;
                //var statusMessage = response.StatusMessage;

                // status 1 means request succeeded
                //if (status === 1) {
                    // this is the array we are after
                    return data.GeoDataList;
                //}
                //else { // TODO: Determine what to send to the UI when request didn't succeed
                    //console.log(data);
                    //console.log("Status: " + status + " StatusMessage: " + statusMessage);
                //}
            }
        };

        var errorHandler = function(e) {

        }

        var factory = {};

        factory.GetGeoCountries = function(geoType) {

            if (geoType == undefined) {
                geoType = 1;
            }

            var q = $q.defer();

            $http({
                url: baseUrl + '/GeoCountries/',
                method: 'GET',
                params: {
                    geoType: geoType
                }
            })
            .success(function(result){
                var output = transformResponseHelper(result);
                q.resolve(output);
            }) 
            .error(errorHandler);

            return q.promise;
        }

        factory.GeoStates = function(countryID) {
            var q = $q.defer();

            $http({
                url: baseUrl + '/GeoStates/',
                method: 'GET',
                params: {
                    countryID: countryID
                }
            })
            .success(function(result){
                var output = transformResponseHelper(result);
                q.resolve(output);
            }) 
            .error(errorHandler);

            return q.promise;
        }

        factory.GeoCitiesByState = function(stateID) {
            var q = $q.defer();

            $http({
                url: baseUrl + '/GeoCitiesByState/',
                method: 'GET',
                params: {
                    stateID: stateID
                }
            })
            .success(function(result){
                var output = transformResponseHelper(result);
                q.resolve(output);
            }) 
            .error(errorHandler);

            return q.promise;
        }

        factory.GeoCitiesByCountry = function(countryID) {
            var q = $q.defer();

            $http({
                url: baseUrl + '/GeoCitiesByCountry/',
                method: 'GET',
                params: {
                    countryID: countryID
                }
            })
            .success(function(result){
                var output = transformResponseHelper(result);
                q.resolve(output);
            }) 
            .error(errorHandler);

            return q.promise;
        }

        factory.GeoISPsByCountry = function(countryID) {
            var q = $q.defer();

            $http({
                url: baseUrl + '/GeoISPsByCountry/',
                method: 'GET',
                params: {
                    countryID: countryID
                }
            })
            .success(function(result){
                var output = transformResponseHelper(result);
                q.resolve(output);
            }) 
            .error(errorHandler);

            return q.promise;
        }

        factory.GeoDMAByCountry = function(countryID) {
            var q = $q.defer();

            $http({
                url: baseUrl + '/GeoDMAByCountry/',
                method: 'GET',
                params: {
                    countryID: countryID
                }
            })
            .success(function(result){
                var output = transformResponseHelper(result);
                q.resolve(output);
            }) 
            .error(errorHandler);

            return q.promise;
        }

        factory.GeoDMAByState = function(stateID) {
            var q = $q.defer();

            $http({
                url: baseUrl + '/GeoDMAByState/',
                method: 'GET',
                params: {
                    stateID: stateID
                }
            })
            .success(function(result){
                var output = transformResponseHelper(result);
                q.resolve(output);
            }) 
            .error(errorHandler);

            return q.promise;
        }

        factory.GeoAreaCodeByCountry = function(countryID) {
            var q = $q.defer();

            $http({
                url: baseUrl + '/GeoAreaCodesByCountry/',
                method: 'GET',
                params: {
                    countryID: countryID
                }
            })
            .success(function(result){
                var output = transformResponseHelper(result);
                q.resolve(output);
            }) 
            .error(errorHandler);

            return q.promise;
        }

        factory.GeoAreaCodeByState = function(stateID) {
            var q = $q.defer();

            $http({
                url: baseUrl + '/GeoAreaCodesByState/',
                method: 'GET',
                params: {
                    stateID: stateID
                }
            })
            .success(function(result){
                var output = transformResponseHelper(result);
                q.resolve(output);
            }) 
            .error(errorHandler);

            return q.promise;
        }

        return factory;
    }]
);