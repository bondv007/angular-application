app.factory('deliveryGroupsService', [ 'csb', '$q', '$http', 'adsService', 'errorFactory',

    function( csb, $q, $http, adsService, errorFactory) {

        var factory = {},

        baseUrl = csb.config.baseApiUrl + 'DeliveryGroups';

        var _selectedGroup = '';

        // list of all delivery groups by campaign
        factory.listOfAllDeliveryGroups = [];

        factory.addDeliveryGroup = function(dg) {
            if (!factory.allGroups) {
                factory.allGroups = [];
            }

            factory.allGroups.push(dg);

            return factory.allGroups;
        };


        /*
            This method gets all the sizes for all the ads in an array
            of delivery groups, which is different from getting all the ads for just
            one DG.
         */
        factory.getAllSizesForSelectedDGs = function(groups) {

            // result array
            var allSizes = [];

            // validate that there are DGs to extract ad sizes from
            if (groups.length){
                // walk the array of DGs
                groups.forEach(function(currentGroup) {
                    // get the different ad sizes for each one
                    var groupSizes = factory.getAdSizesForDG(currentGroup.DeliveryGroupID);
                    // push those sizes that aren't already in the result array
                    groupSizes.forEach(function(currentSize) {
                        if (allSizes.indexOf(currentSize) == -1) {
                            allSizes.push(currentSize);
                        }
                    });
                });
            }
            // sort the sizes to be displayed on the filter dropdown
            return allSizes.sort(function(s1, s2){ return s1 - s2});

        };


        /**
         * This method returns all the different ad sizes for a specific delivery group
         * @param  {String} deliveryGroupId The delivery group id to extract the ad sizes from
         * @return {Array}                  An array with all the different sizes of the ads in the delivery group. Sorted.
         * @return {false}                  Returns false if there arent any delivery ads available to extract sizes
         */
        factory.getAdSizesForDG = function(deliveryGroupId) {
           if (!factory.listOfAllDeliveryGroups || typeof deliveryGroupId == "undefined") {
                return false;
            }

            i = factory.listOfAllDeliveryGroups.indexOfObjectByKey('DeliveryGroupID', deliveryGroupId);
            dg = [factory.listOfAllDeliveryGroups[i]];


            // this array is going to be returned, contains all the different sizes
            var allSizes = [];


            if (dg && dg[0] && dg[0].ads) {

                // Extracting the sizes for the ads in the delivery group
                    dg[0].ads.forEach(function(currentAd) {              // ads in the current DG
                        if (allSizes.indexOf(currentAd.AdSize) == -1) {
                            allSizes.push(currentAd.AdSize);               // pushing new values to the result
                        }
                   });

                return allSizes.sort(function(s1, s2){ return s1 - s2});
            } else {
                return false;
            }

        };

        /**
         * Mirrors the API call with the same name.
         * @param {[type]} CampaignID [description]
         */
        factory.GetDeliveryGroupsByCampaignID = function(CampaignID, trafficked) {
            onlyNonTrafficked = true;

            if (typeof trafficked != "undefined") {
                // an easier way of think... trafficked or not trafficked.
                onlyNonTrafficked = !trafficked;
            } else {
                onlyNonTrafficked = false;
            }

            var q = $q.defer();

            $http({
                url: baseUrl + '/DeliveryGroups/',
                method: 'GET',
                params: {
                    CampaignID: CampaignID,
                    onlyNonTrafficked: onlyNonTrafficked
                },
                transformResponse: function(response) {
                    return JSON.parse(response.replace(/:NaN/g,":\"NaN\""));
                }
            }).success(function(response){

                //console.log('delivery groups................', response);

                var status = response.ResponseStatus;
                var statusMessage = response.StatusMessage;

                // status 1 means request succeeded
                if (status === 1) {
                    factory.allGroups = false;

                    // this is the array we are after
                    if (response.DeliveryGroupList.length > 0) {

                        if(factory.listOfAllDeliveryGroups.length == 0) {
                            factory.listOfAllDeliveryGroups = response.DeliveryGroupList;
                        }

                        factory.allGroups = response.DeliveryGroupList;
                        // adding the corresponding ads to the delivery group
                        factory.allGroups.forEach(function (group){
                            /**
                             * TODO: remove this when rotation is implemented,
                             * it overwrites all the DGs with "Even Distribution"
                             */
                            group.RotationType = "Even Distribution";
                            adsService
                                .GetAdsUnderDeliveryGroup(group.DeliveryGroupID)
                                .then(function (ads) {
                                     group.ads = ads;
                                     // console.log('group after adding ads' , group);
                                });
                        });
                    }

                    q.resolve(factory.allGroups);//dentro de success
                } else {
                    q.reject('There are not delivery group availables for this campaign right now.');
                    errorFactory.addErrorMessage('info','There are not delivery group availables for this campaign right now.');
                }
            }).error(function() {
                //console.log('there was an error while calling GetDeliveryGroupsByCampaignID('+ CampaignID +').');
                errorFactory.addErrorMessage('danger','There was an error while calling GetDeliveryGroupsByCampaignID('+ CampaignID +').');
                q.reject('there was an error while calling the api.');
            });

            return q.promise;
        };

        factory.AssignDeliveryGroupToTargetAudience = function(DeliveryGroupID, TargetAudienceID) {
            var q = $q.defer();

            $http({
                url: baseUrl + '/AssignDeliveryGroupToTargetAudience/',
                method: 'POST',
                data: {
                    DeliveryGroupID: DeliveryGroupID,
                    TargetAudienceID: TargetAudienceID
                }
            }).success(function(response) {

                //console.log('Assign Delivery Group to Target Audience', response);

                if(response.ResponseStatus == 3){
                    q.reject({type:'error', msg:'You cannot add a target audience to a non-targeted delivery group in a published placement. DELIVERY GROUP ID: ' + response.DeliveryGroupID});
                    errorFactory.addErrorMessage('danger', 'You cannot add a target audience to a non-targeted delivery group in a published placement. DELIVERY GROUP ID: ' + response.DeliveryGroupID);

                }

                if(response.ResponseStatus == 1){
                    q.resolve(response);
                }

            }).error(function(e) {
                q.reject(e);
            });

            return q.promise;
        };

        factory.setSelectedDeliveryGroup = function(groupId) {
            _selectedGroup = groupId;
        };

        factory.getSelectedDeliveryGroup = function() {
            return _selectedGroup;
        };

        /**
         * This method will calculate the rotation values for a DG's ads
         * (currently only working on Even distribution)
         * @param  {[type]} groups [description]
         * @return {[type]}                 [description]
         */
        factory.calculateAdsRotationValueForDGs = function(groups) {

            if (typeof groups[0] == "undefined") {
                return false;
            }

            for (var i = 0; i < groups.length; i++) {
                var dg = groups[i];

                if (dg.ads) {
                    if (dg.RotationType === "Even Distribution") {

                        for (var j = 0; j < dg.ads.length; j++) {
                            var ad = dg.ads[j];
                            ad.rotationValue = Math.floor(100 / dg.NumberOfAds);
                        }

                    }
                }
            }

            return groups;

        };

        /*
         * UnAttachDeliveryGroup
         */
        factory.removeTargetAudience = function(DeliveryGroupID) {
            var q = $q.defer(),
                ID = +DeliveryGroupID;

            if (ID <= 0) {
                q.reject("In order to remove a Target Audience, we need a Delivery Group.");
                errorFactory.addErrorMessage('info','In order to remove a Target Audience, we need a Delivery Group.');
            } else {
                $http({
                    url: baseUrl + '/UnAttachDeliveryGroup/',
                    method: 'PUT',
                    data: {
                        DeliveryGroupID: DeliveryGroupID
                    }
                }).success(function(response) {

//                    console.log( response );

                    if ( response.ResponseStatus == 1 ) {
                        q.resolve(response);
                    }
                    else if ( response.ResponseStatus == 3 ) {
                        errorFactory.addErrorMessage('danger', response.StatusMessage );
                        q.resolve( response );
                    }


                }).error(function(response) {
                    errorFactory.addErrorMessage('danger', response.StatusMessage );
                });
            }

            return q.promise;
        };

        /**
         * This method gets the list of delivery groups that are assigned to a target audience within a campaign
         *
         * @param campaignID
         * @param targetAudienceID
         *
         * Response:
         * {
         *    "DeliveryGroupList" : [
         *                             {
         *                                "DeliveryGroupID" : INT,
         *                                "Name" : STRING,
         *                                "NumberOfAds" : INT,
         *                                "RotationType" : STRING,
         *                                "Dimension" : String
         *                              }
         *                          ]
         * }
         */
        factory.getDeliveryGroupsByCampaignIDAndTargetAudienceID = function(campaignID, targetAudienceID){

            var q = $q.defer();

            $http({
                url: baseUrl + '/DeliveryGroupsByCampaignAndTA/',
                method: 'GET',
                params: {
                    campaignID: campaignID,
                    targetAudienceID: targetAudienceID
                }
            }).then(function(response){

                var groups = [];

                if(response.data.ResponseStatus == 1){
                    groups = response.data.DeliveryGroupList;
                    factory.setAdsToDeliveryGroups(groups);
                }

                if(response.data.ResponseStatus == 3){
                    //q.resolve('No delivery groups were found');
                    // No delivery groups were found
                    //errorFactory.addErrorMessage('info','No delivery groups were found');
                }

                q.resolve(groups);

            }, function(error){
                q.reject(error);
            });

            return q.promise;

        };

        factory.setAdsToDeliveryGroups = function(deliveryGroups){

            if(deliveryGroups.length > 0) {
                // adding the corresponding ads to the delivery group
                deliveryGroups.forEach(function (group) {
                    /**
                     * TODO: remove this when rotation is implemented,
                     * it overwrites all the DGs with "Even Distribution"
                     */
                    group.RotationType = "Even Distribution";

                    adsService
                        .GetAdsUnderDeliveryGroup(group.DeliveryGroupID)
                        .then(function (ads) {

                            group.ads = ads;
                            group.NumberOfAds = ads.length;
                            // console.log('group after adding ads' , group);
                        });
                });
            }
        };

        return factory;
    }
]);