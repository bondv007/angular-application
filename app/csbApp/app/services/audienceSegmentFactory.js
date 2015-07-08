/**
 * Created by Axel.Martinez on 8/28/14.
 */

app.factory('segmentsFactory', [ '$q', '$http', 'csb',
    function( $q, $http, csb ) {

       /**
         * This is the reference to the factory instance
         *
         * @type {{}}
         */
        var factory = {};

        // holds the current state of the data in this session for the segments.
        var _saved = false;

        factory.allSegments = [];

        /**
         * This is going to hold the audience segment id
         * that has been selected on the funnel view
         * to work on the rules and to attach a delivery group to.
         * @type {Number}
         */
        var _selectedSegmentID = '';

        /**
         * This method will populate the array which is used in the Funnel view
         * to display the target audiences created on the decision diagram view.
         * @param  {array} TargetAudiences The TAs that were created using the Decision Diagram
         */
        factory.fillAllSegments = function (TargetAudiences) {
            factory.allSegments =  TargetAudiences;
        }


        /**
         *  This method modifies the segment id to work on.
         * @param {Number} segmentId The ID for the audience segment.
         */
        factory.setSelectedAudienceSegment = function (segmentId) {
            _selectedSegmentID = segmentId;
        };

        /**
         * This method returns the current selected audience segment to work on.
         * @return {Number} The current selected audience segment.
         */
        factory.getSelectedAudienceSegment = function () {
            var audienceSegment = {};
            angular.forEach(factory.allSegments, function(currentSegment){
                if (currentSegment.TargetAudienceID === _selectedSegmentID) {
                    audienceSegment = currentSegment;
                }
            });
            return audienceSegment;
        };

        /**
         * This method returns the array that contains all the Target Audiences
         * that feed the funnel view.
         * @return {array} The array that contains all the Target Audiences shown in the funnel view.
         */
        factory.getAllSegments = function () {
            return factory.allSegments;
        };

        /**
         * This method returns the ID of the selected Target Audience.
         * @return {Number} The selected Target Audience's ID
         */
		/** TODO DEPRECATED check for instances **/
        factory.getSelectedAudienceSegmentId = function () {
            return _selectedSegmentID;
        }

        /**
         * This method populates the array that contains the tags used in a
         * target audience so they can be displayed on trafficking view.
         * @param {[type]} tags [description]
         */
		/** TODO DEPRECATED check for instances **/
        factory.setTags = function (tags) {
            _tags = tags;
        }

        /**
         * This method searches into the _tags array to find the tag that has the
         * same ID as the one passed in. So that the UI can show the name of the tag
         * instead of the ID only.
         * @param  {Number} ID Tag ID that is being searched
         * @return {String}    The corresponding Name of the tag.
         */
		/** TODO DEPRECATED check for instances **/
        factory.searchTag = function(ID) {
            for (i in _tags) {
                if (_tags[i].ID == ID) {
                    return _tags[i].Name;
                }
            }
            return "not found"; // The ID was never found, no name is going to be returned.
        };

        /**
         * This method populates the array that contains the countries used in a
         * target audience so they can be displayed on the trafficking view.
         * @param {[type]} countries [description]
         */
		/** TODO DEPRECATED check for instances **/
        factory.setCountries = function (countries) {
            _countries = countries;
        }

         /**
         * This method searches into the _tags array to find the tag that has the
         * same ID as the one passed in. So that the UI can show the name of the tag
         * instead of the ID only.
         * @param  {Number} ID Tag ID that is being searched
         * @return {String}    The corresponding Name of the tag.
         */
		 /** TODO DEPRECATED check for instances **/
        factory.searchCountry = function (id) {
            for (var i = 0; i < _countries.length; i++) {
                if (_countries[i].GeoItemID == id) {
                    return _countries[i].GeoItemName;
                }
            }
            return "not found";
        };

		/** TODO DEPRECATED check for instances **/
        factory.isPersisted = function() {
            return _saved;
        };

		/** TODO DEPRECATED check for instances **/
        factory.setPersitenceStatus = function(value) {
            _saved = value;
        }

        // just a default error we can use.. I was tired of retyping it
        var defaultServerError = 'There seems to be a problem with the service.';


        factory.setTargetAudiencePriorities = function( tasWithPriorities, campaignID ) {

            var deferred = $q.defer();

            var object = {
                "CampaignID" : csb.params.campaignID || campaignID,
                "TargetAudiencePriorities" : tasWithPriorities
            };

            factory.SetPriorities( object ).then(function( response ) {

                if ( response.data.ResponseStatus == 1 ) {
                    deferred.resolve( response.data.PrioritiesStatusList );
                } else {
                    // TODO not sure what error object looks like.. add to reject when I know
                    deferred.reject()
                }
            }, function( error) {
                deferred.reject( defaultServerError );
            });

            return deferred.promise;
        }

        factory.SetPriorities = function( data ) {

            var deferred = $q.defer();

            $http.post( csb.config.baseApiUrl + 'TargetAudience/SetPriorities/', data )
                .then(function( response ) {
                    deferred.resolve(response);
                },
                function( error ) {
                    deferred.reject( error );
                }
            );

            return deferred.promise;
        }

        return factory;
    }
]);