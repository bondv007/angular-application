/**
 * Created by Rick.Jones on 12/8/14.
 */
app.controller('vtAdvertisersCtrl', [ '$scope', '$state', 'conversionTagService', 'mmModal', 'mmAlertService', 'mmFeatureFlagService', 'mmPermissions', 'infraEnums', 'entityMetaData',
    function($scope, $state, conversionTagService, mmModal, mmAlertService, mmFeatureFlagService, mmPermissions, infraEnums, entityMetaData ){


		function deleteRow(list, selectedItems){

			var modalInstance = mmModal.openAlertModal("DeleteAlertTitle", "DeleteAlertMessage");

			modalInstance.result.then(function() {
				conversionTagService.remove(selectedItems).then(function(deletedTags){

					for( var i = 0; i < deletedTags.length; i++ ) {
						_.remove( list, function( listItem ) {
							return listItem.id === deletedTags[ i ].id;
						});
					}

					mmAlertService.addSuccess("Advertiser tags successfully deleted");

				});
			});
		};

        function dataFormat(data){

            angular.forEach(data, function(item){

                item.name = item.reportingName;

            });
        }

		/**
		 * Initialization function to get permissions, feature flags, and load up the central directive
		 */
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

					$scope.centralDataObject = [
						{
							type: 'advertiserVtag',
							centralActions: [
                                {
                                    name: 'New Advertiser Tag',
                                    func: null,
                                    items:[
                                        {
                                            name:'New Conversion Tag',
                                            func:addNewConversionTag
                                        },
                                        {
                                            name:'New Third Party Tag',
                                            func:addNewThirdPartyTag
                                        }
                                    ]
                                },
                                // Set the button relationType to 'any'. This will disable the if the selected item count is 0.
                                { name: 'Edit', func: function(){ $scope.centralDataObject[0].openEntral(true);}, relationType: infraEnums.buttonRelationToRowType.any},
                                // Set the button relationType to 'any'. This will disable the if the selected item count is 0.
								{ name: 'Delete', func: deleteRow, relationType: infraEnums.buttonRelationToRowType.any},
								{ name: 'Archive', func: function(){ console.log('Archive row') } },
								//{ name: 'Excel', func: function(){ console.log('Click Excel button') } },
							],

                            // hide 'Add New' button
                            hideAddButton: true,

                            // hide 'Edit' button
                            isEditable: false,

                            // Turn off editing multiple rows
                            isEditMultiple: false,
							dataManipulator: dataFormat,
							useMock: false,
							mockList: null,
							visibleColumns: [0,1,2,3,4,5,6,7]
						},
                        {
                            type: 'thirdPartyTags',
                            centralActions: [
                                {
                                    name: 'New Third Party Tag',
                                    func: null,
                                    items:[]
                                },
                                // Set the button relationType to 'any'. This will disable the if the selected item count is 0.
                                { name: 'Edit', func: function(){ $scope.centralDataObject[0].openEntral(true);}, relationType: infraEnums.buttonRelationToRowType.any},
                                // Set the button relationType to 'any'. This will disable the if the selected item count is 0.
                                { name: 'Delete', func: deleteRow, relationType: infraEnums.buttonRelationToRowType.any},
                                { name: 'Archive', func: function(){ console.log('Archive row') } },
                                //{ name: 'Excel', func: function(){ console.log('Click Excel button') } },
                            ],

                            // hide 'Add New' button
                            hideAddButton: true,

                            // hide 'Edit' button
                            isEditable: false,

                            // Turn off editing multiple rows
                            isEditMultiple: false,
                            dataManipulator: dataFormat,
                            useMock: false,
                            mockList: null,
                            hideSettings: true,
                            visibleColumns: [0,1,2,3]
                        }
					];

                    // If the user has permissions to edit this entity..
                    if($scope.permission.edit){

                        // Create a watcher to watch when the selected item count is greater than 0..
                        var watchData = $scope.$watchCollection('centralDataObject[0].selectedItems', function(selectedItems){

                            // If the count is greater than 1, disable the 'Edit Button' in the UI
                            if(selectedItems && selectedItems.length > 1){
                                $scope.centralDataObject[0].centralActions[1].disable = true;
                            }

                            // If the count is greater than 0, then enable the 'Delete Button' in the UI
                            if(selectedItems && selectedItems.length > 0){
                                $scope.centralDataObject[0].centralActions[2].disable = false;
                            }
                        });

                    } else {
                        // If the user DOES NOT have permissions to edit, disable the edit button
                        $scope.centralDataObject[0].centralActions[1].disable = $scope.permission.edit;
                    }
				}

			});

		};

        function _addNewEntity(stateName){
            var params = $state.params || {};
            $state.go(stateName, params);
        }

        /**
         * This method will take the user to the Conversion Tag UI page.
         *
         */
        function addNewConversionTag(){

            var dataObj = $scope.centralDataObject[0]

            if (dataObj != null){
                _addNewEntity(dataObj.newPageURL);
            }
        }

        function addNewThirdPartyTag(){

            _addNewEntity(entityMetaData.thirdPartyTags.newPageURL);

        }



		// initialize the data
		initialize();

	}
]);
