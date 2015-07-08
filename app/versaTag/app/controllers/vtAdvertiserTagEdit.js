/**
 * Created by Rick.Jones on 12/19/14.
 */
/**
 * Created by Rick.Jones on 12/15/14.
 */

'use strict';
app.controller('vtAdvertiserTagEditCtrl', ['$scope', '$rootScope', '$stateParams', 'mmAlertService', 'mmPermissions', 'mmFeatureFlagService', 'conversionTagService', 'EC2Restangular', 'mmModal', 'enums', '$state', 'contactsService', 'mmSession', '$q','entityMetaData', 'tagGroupService', 'mmUtils',
    function($scope, $rootScope, $stateParams, mmAlertService, mmPerissions, mmFeatureFlagService, conversionTagService, EC2Restangular, mmModal, enums, $state, contactsService, session, $q, entityMetaData, tagGroupService, mmUtils, $modalInstance, entity){

        $scope.isEditMode = false;
        $scope.isRequired = true;
        $scope.validation = {};
        $scope.labelWidth = 150;
        $scope.isModal = false;
        $scope.togglesStatus = { code:false, firingConditions:false, grouping:false };
        $scope.metaData = {};

        // links
        $scope.thirdPartyTagsCentralLink = {link : "spa.advertiserTag.thirdpartytags"};


        // MOCK DATA
        $scope.listOfAdvertisers = [];

        $scope.conversionTypes = [
            {name:'Counter', id:'Counter'},
            {name:'Sales', id:'Sales'},
            {name:'Omniture', id:'Omniture'}
        ];

        $scope.listOfConversionValues = [
           {name:'USD', id:1},
           {name:'NZD', id:2},
           {name:'Brazilian Real', id:3}
        ];

        $scope.columns = [
            {field:'name', displayName: 'Group', isColumnEdit: true}
        ];

        // END

        var watcher = $scope.$watch('$parent.mainEntity', function (newValue, oldValue) {
            if (newValue != oldValue || oldValue == null || !!$scope.isEntral) {
                updateState();
            }
        });



        if(!_.isUndefined($scope.entityLayoutInfraButtons)){
            $scope.entityLayoutInfraButtons.discardButton = {name : 'discard', func : rollback, ref : null, nodes : []};
            $scope.entityLayoutInfraButtons.saveButton = {name : 'save', func : save, ref : null, nodes : [], isPrimary : true};
        }


        function updateState(){
            $rootScope.mmIsPageDirty = 0;
            if ($scope.$parent.mainEntity != null) {
                $scope.isEditMode = true;
                $scope.preSaveStatus = false;
                $scope.editObject = EC2Restangular.copy($scope.$parent.mainEntity);
                $scope.originalData = EC2Restangular.copy($scope.editObject);

                // Edit mode
                //console.log('Edit mode:', $scope.editObject);

            } else {
                $scope.isEditMode = false;
                $scope.preSaveStatus = true;
                $scope.isBrandsExist = false;
                $scope.editObject = $scope.editObject || EC2Restangular.copy($scope.metaData.defaultJson);
                $scope.originalData = EC2Restangular.copy($scope.editObject);

                // New mode
                //console.log('New mode', $scope.editObject);

            }

            initGrid();
        }

        function rollback() {
            $scope.editObject = $scope.originalData;
        }

        function getMetaData(property){
            return entityMetaData['advertiserVtag'][property];
        }

        function save() {

            if($scope.isEditMode == true){

                return conversionTagService.update($scope.editObject).then(function (data) {

                    //console.log('response:', data);

                    $scope.preSaveStatus = false;
                    $rootScope.mmIsPageDirty = 0;
                    $scope.showSPinner = false;
                    mmAlertService.addSuccess('Advertiser Tag ' + data.reportingName + ' was successfully updated.');

                    saveGroups();

                }, function(error){
                    //TODO
                    processError(error);
                });

            } else {

                return conversionTagService.create($scope.editObject).then(function(data){

                    $scope.preSaveStatus = false;
                    $rootScope.mmIsPageDirty = 0;
                    $scope.showSPinner = false;
                    mmAlertService.addSuccess('Advertiser Tag ' + data.reportingName + ' was successfully created.');

                    $scope.editObject = data;

                    saveGroups();

                    if(!$scope.isEntral){
                        // Add current edit page to the browser history along with the id
                        $state.go(getMetaData('editPageURL'), {advertiserVtag: data.id}, {location: "replace"});
                    }

                    return data;
                });
            }

            mmUtils.cacheManager.clearCache();

        }

        function processError(error) {
            console.log('ohh no!');
            console.log(error);
            if (_.isUndefined(error.data.error)){
                mmAlertService.addError("Server error. Please try again later.");
            } else {
                mmAlertService.addError(error.data.error);
            }
        }



        // this is for the Modal whithin     Assigned to all campaings button
         $scope.assignAdToCampaignManager = function () {
                    if ($scope.isModalOpen) {
                        return;
                    }

                    $scope.isModalOpen = true;
                    var modalInstance = mmModal.open({
                        templateUrl: 'infra/directives/views/mmSelectList.html',
                        title: "Assign To Campaign",
        //                      smallTitle: "Master Ad ID: " + $stateParams.adId,
                        modalWidth: 750,
                        bodyHeight: 380,
                        confirmButton: { name: "Assign", funcName: "save", hide: false, isPrimary: true},
                        discardButton: { name: "Cancel", funcName: "cancel" },
                        resolve: {
                            ads: function() {
                                return  [$scope.ad];
                                },
                            campaigns: function() {
                         //       return EC2Restangular.all('campaigns').getList();
                            },

                            accounts : function() {
                           //     return $scope.accounts;
                            },
                            multipleAttach: function(){
                             //   return false;
                            }
                        }
                    });

                    modalInstance.result.then(function (ads) {
                        $scope.isModalOpen = false;
                        if(ads && ads[0]){
                            $scope.ad.campaignId = ads[0].campaignId;
                            serverCampaigns.get($scope.ad.campaignId ).then(function(campaign){
                                //$scope.campaign = campaign;
                                if(campaign){
                                    $scope.ad.campaignName = campaign.name;
                                }

                            })
                        }
                    }, function () {
                        $scope.isModalOpen = false;
                    });
                }




        // Group Grid
        $scope.groups = [];
        $scope.selectedGroups = [];
        $scope.removedGroups = [];



        $scope.onGroupRemoved = function(group){

            $scope.removedGroups.push(group);

        };

        function initGrid(){

			// HEY RICK.. JEFF HERE..  I added this so that if the id isn't there it won't
			// try and get it's groups since it doesn't exist yet.. it was causing errors without it

			if ( $scope.editObject.id ) {

				// Get the list of groups that this tag is associate with..
				tagGroupService.getGroupByAdvertiserTag($scope.editObject).then(function(groupList){

					$scope.groups = groupList;

				});

			}


        }
        
        function saveGroups(){
            tagGroupService.saveGroups($scope.groups, $scope.editObject).then(function(response){

                //console.log('add groups response:', response);
            });    
        }
        
		function initialize(){

			// get the feature flags before doing anything
			mmFeatureFlagService.GetFlagsAsync().then( function() {

				// get the specific feature
				$scope.feature = {
					advertiserTags: mmFeatureFlagService.IsFeatureOn( 'AdvertiserTagsUI' )
				};

				// create the permissions
				$scope.permission = {
					view: true, // mmPermissions.hasPermissionBySession( 'AdvertiserTags - View AdvertiserTags' ),
					edit: true, // mmPermissions.hasPermissionBySession( 'AdvertiserTags - Create/Full Edit' ),
					delete: true, // mmPermissions.hasPermissionBySession( 'AdvertiserTags - Delete/Archive AdvertiserTags' ),
					archive: true // mmPermissions.hasPermissionBySession( 'AdvertiserTags - Delete/Archive AdvertiserTags' )
				};

				if ( $scope.feature.advertiserTags && $scope.permission.view ) {

					conversionTagService.getAdvertisers().then( function ( data ) {
						$scope.listOfAdvertisers = data;
					});

					updateState();

				}

			});

			$scope.metaData = entityMetaData[ 'advertiserVtag' ];

		};

		initialize();



    }
]);
