/**
 * Created by Rick.Jones on 1/20/15.
 */
app.controller('thirdPartyCtrl', [ '$scope', 'EC2Restangular', '$state', '$stateParams', 'thirdPartyTagService', 'mmModal', 'mmAlertService',
    function($scope, EC2Restangular, $state, $stateParams, thirdPartyTagService, mmModal, mmAlertService){

        function initialize(){

            //console.log($stateParams);

            EC2Restangular.setDefaultHeaders({"Authorization" : "MDMD admin:admin:123456"});

            $scope.centralDataObject = [
                {
                    type: 'thirdPartyTags',
                    centralActions: [
                        { name: 'Delete', func: deleteRow },
                        { name: 'Archive', func: archiveRow },
                    ],
                    dataManipulator: null,
                    isEditable: true,
                    useMock: false,
                    mockList: null,
                    visibleColumns: [0,1,2,3],
                    filters: [
                        {"key" : "advertiserTagId", "value" : $stateParams.advertiserVtag},
                        {"key" : "advertiserTagType", "value" : "Conversion"}
                    ]
                }
            ];
        }

        function getSelectedItem(){

            var selectedItem = null;

            if($scope.centralDataObject[0] && $scope.centralDataObject[0].selectedItem)
            {
                selectedItem = $scope.centralDataObject[0].selectedItem;
            }
            return selectedItem;
        }

        function deleteRow(list, selectedItems){


            var modalInstance = mmModal.openAlertModal("DeleteAlertTitle", "DeleteAlertMessage");

            modalInstance.result.then(function() {
                thirdPartyTagService.remove(selectedItems).then(function(deletedTags){

					for( var i = 0; i < deletedTags.length; i++ ) {
						_.remove( list, function( listItem ) {
							return listItem.id === deletedTags[ i ].id;
						});
					}

					if ( deletedTags.length > 1 ) {
						mmAlertService.addSuccess("Third Party Tags successfully deleted");
					}
					else{
						mmAlertService.addSuccess("Third Party Tag successfully deleted");
					}

                });
            });
        }

        function archiveRow(){
            console.log('Archive row');
        }

        initialize();

        $scope.entityId = 1;

    }
]);