/**
 * Created by Rick.Jones on 12/9/14.
 */
app.controller('vtVersaTagsCtrl', [ '$scope', '$state', 'versaTagService', 'EC2Restangular', 'mmModal', 'mmAlertService', 'mmFeatureFlagService', 'mmPermissions', '$rootScope',
    function($scope, $state, versaTagService, EC2Restangular, mmModal, mmAlertService, mmFeatureFlagService, mmPermissions, $rootScope ){


		/**
		 * Deletes any selected items
		 * @param list
		 * @param selectedItems
		 */
		function deleteRow( list, selectedItems ){

			var modalInstance = mmModal.openAlertModal("DeleteAlertTitle", "DeleteAlertMessage");

			modalInstance.result.then(function() {
				versaTagService.remove( selectedItems ).then(function( deletedTags ) {

					for( var i = 0; i < deletedTags.length; i++ ) {
						_.remove( list, function( listItem ) {
							return listItem.id === deletedTags[ i ].id;
						});
					}

					mmAlertService.addSuccess("Versatag successfully deleted");

				});
			});

		};


		/**
		 * Takes the selected item ID and goes to its spreadsheet page
		 */
		function goToExcel() {

			// only go if there is a selected item
			if ( $scope.centralDataObject[0].selectedItem && $scope.centralDataObject[0].selectedItem.id ) {
				$state.go( 'spa.versaTag.versaTagSpreadsheet', { versaTagId: $scope.centralDataObject[0].selectedItem.id } );
			}

		};


		/**
		 * Initilializes the central component (or not depending on permissions and feature flag)
		 */
		function initialize(){

			// get the feature flags before doing anything
			mmFeatureFlagService.GetFlagsAsync().then( function(){

				// get the specific feature
				$scope.feature = {
					versaTag: mmFeatureFlagService.IsFeatureOn('VersaTagUI')
				};

				// create the permissions
				$scope.permission = {
					view: mmPermissions.hasPermissionBySession('VersaTag - View VersaTags'),
					edit: mmPermissions.hasPermissionBySession('VersaTag - Create/Full Edit'),
					delete: mmPermissions.hasPermissionBySession('VersaTag - Delete/Archive VersaTag'),
					archive: mmPermissions.hasPermissionBySession('VersaTag - Delete/Archive VersaTag')
				};

				// only load central if we have the permission to view it and the feature flag is turned on
				if ( $scope.feature.versaTag && $scope.permission.view ) {

					$scope.centralDataObject = [
						{
							type: 'versaTag',
							centralActions: [
								{ name: 'Delete', disabledByPermission: !$scope.permission.delete, func: deleteRow },
								{ name: 'Archive', disabledByPermission: !$scope.permission.archive ,func: function(){ console.log('Archive row') } },
								{ name: 'Excel', disabledByPermission: !$scope.permission.edit, func: goToExcel },
							],
							isEditable: $scope.permission.edit
						}
					];

				}

			});

		};

		// initialize the page
		initialize();

}]);
