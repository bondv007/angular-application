/**
 * Created by Guni.Yankelovitz on 8/4/14.
 */
'use strict';

app.controller('featureFlagsManagementCtrl', ['$scope', 'enums', 'EC2Restangular', 'mmModal', 'mmAlertService','mmPermissions',
    function($scope, enums, EC2Restangular, mmModal, mmAlertService,mmPermissions) {

        var serverConfig = EC2Restangular.all('configuration/fflags');
        $scope.hasEditPermission = mmPermissions.hasPermissionBySession("EditFeatureFlags");
        refreshData();

        $scope.features = [];

        function refreshData() {
            serverConfig.getList().then(getData, processError);
        }

        function getData(data) {
            $scope.features = data;
        }

        function processError(error) {
            console.log('Server error');
            console.log(error);
            if (error.data.error === undefined) {
                mmAlertService.addError("Server error. Please try again later.");
            } else {
                //        mmAlertService.addError(error.data.error);
            }
        }
        $scope.columnDefs = [{
            field: 'name',
            displayName: 'Feature',
            width: 200,
            isColumnEdit: false,
            isShowToolTip: false,
            enableDragDrop: true
        }, {
            field: 'description',
            displayName: 'Description',
            width: 300,
            gridControlType: enums.gridControlType.getName("TextBox"),
            isShowToolTip: true,
            enableDragDrop: true
        }, {
            field: 'teams',
            displayName: 'Feature Teams',
            width: 200,
            functionOnCellEdit: changeSearchableListValues,
            listDataArray: enums.fflagsTeams,
            gridControlType: enums.gridControlType.getName("SearchableList"),
            enableDragDrop: true
        }, {
            field: 'creationDate',
            displayName: 'Creation date',
            width: 150,
            isColumnEdit: false,
            enableDragDrop: true
        }];

        //These are the items which are selected in grid.Two way binding with grid.
        $scope.selectedItems = [];
        $scope.saveChangesDisabled = true;
        //used to render buttons above grid
        $scope.gridButtonActions =  $scope.hasEditPermission ? [

            {
                name: "New feature",
                func: openAddNewFeatureModal,
                isDisable: false
            }, {
                name: "Edit Rules",
                func: editSelectedFeaturesRules,
                isDisable: true
            }, {
                name: "Delete",
                func: deleteRow,
                isDisable: true
            }
        ] : [];

        $scope.$watchCollection("selectedItems", function() {
            if($scope.gridButtonActions.length > 1)
            {
                 $scope.gridButtonActions[1].isDisable = $scope.gridButtonActions[2].isDisable = $scope.selectedItems.length == 0;
            }
           
        })

        $scope.$watch(getFeatures, function(newVal,oldVal) {
            if(newVal.length && oldVal.length)
             $scope.saveChangesDisabled = false;
        },true)

        function getFeatures(){
          return $scope.features;
        }


        function changeSearchableListValues(col, selectedArray, index, field) {
            var item = $scope.features[index];
            if (item != null) {
                item[field] = selectedArray;
            }
        }

        function editSelectedFeaturesRules() {
            if ($scope.selectedItems.length > 0) {
                if ($scope.selectedItems[0].put == undefined) {
                    mmAlertService.addWarning("Please save the feature (" + $scope.selectedItems[0].name + ") before editing it's rules");
                } else {
                    editFeatureRules($scope.selectedItems[0]);
                }
            }
        }

        function editFeatureRules(feature) {
            var modalInstance = mmModal.open({
                templateUrl: './internalApp/views/editFeatureRules.html',
                controller: 'editFeatureRulesCtrl',
                title: "Feature Flags Rules Management [" + feature.name + "]",
                backdrop: 'static',
                //windowClass: windowClass
                modalWidth: 850,
                confirmButton: {
                    name: "Done",
                    funcName: "done",
                    hide: false,
                    isPrimary: true
                },
                discardButton: {
                    name: "Cancel",
                    funcName: "discard"
                },
                resolve: {
                    feature: function() {
                        return feature;
                    }
                }
            });

            modalInstance.result.then(function() {
                console.log('done');
                $scope.isModalOpen = false;
            }, function() {
                console.log('cancel');
                $scope.isModalOpen = false;
            });
        }

        function openAddNewFeatureModal() {
            var modalInstance = mmModal.open({
                templateUrl: './internalApp/views/addFeature.html',
                controller: 'addFeatureCtrl',
                title: "Add New Feature",
                backdrop: 'static',
                //windowClass: windowClass
                bodyHeight: 190,
                modalWidth: 420,
                confirmButton: {
                    name: "Add",
                    funcName: "save",
                    hide: false,
                    isPrimary: true
                },
                discardButton: {
                    name: "Close",
                    funcName: "cancel"
                },
                resolve: {
                    features: function() {
                        return _.pluck($scope.features, 'name');
                    },
                    teams: function() {
                        return enums.fflagsTeams;
                    }
                }
            });

            modalInstance.result.then(function(newFeature) {
                addNewFeature(newFeature);
            }, function() {
                console.log('cancel');
                $scope.isModalOpen = false;
            });
        }


        function teamsListToString(previousValue, currentValue, index) {
            if (index > 0)
                previousValue += ',';
            previousValue += enums.fflagsTeams.getName(currentValue);
            return previousValue;
        }

        function addNewFeature(newFeature) {
            newFeature.teams = newFeature.teams.reduce(teamsListToString, "");
            newFeature.next = '';
            var savedFailure = getSaveFailureFunction(newFeature.name);
            var savedSuccess = addedSuccess;
            if ($scope.features.length > 0)
                savedSuccess = getUpdateLastFeatureFunction(newFeature.name, savedFailure);

            $scope.features.post(newFeature).then(savedSuccess, savedFailure);
        }

        function getUpdateLastFeatureFunction(newFeatureName, savedFailureFunction) {
            function updateLastFeature() {
                var lastFeature = $scope.features[$scope.features.length - 1];
                lastFeature.next = newFeatureName;
                lastFeature.put().then(addedSuccess, savedFailureFunction);
            }

            return updateLastFeature;
        }

        function addedSuccess() {
            mmAlertService.addSuccess("Added feature");
            refreshData();
            $scope.isModalOpen = false;
        }

        function openDeleteFeatureModal() {
            return mmModal.open({
                templateUrl: './internalApp/views/deleteFeature.html',
                controller: ['$scope','$modalInstance',function($scope, $modalInstance) {
                    $scope.deleteFeature = function() {
                        $modalInstance.close(true);
                    }
                    $scope.cancel = function() {
                        $modalInstance.dismiss('cancel');
                    }
                }],
                title: "Delete Feature Confirmation",
                backdrop: 'static',
                //windowClass: windowClass
                bodyHeight: 90,
                modalWidth: 420,
                confirmButton: {
                    name: "Yes",
                    funcName: "deleteFeature",
                    hide: false,
                    isPrimary: true
                },
                discardButton: {
                    name: "No",
                    funcName: "cancel"
                }
            });


        }


        //Delete feature
        function deleteRow() {
            var modalInstance = openDeleteFeatureModal();
            modalInstance.result.then(function(result) {
                if (result) {
                    var itemToDelete = $scope.selectedItems[0];
                    var previousItem = $scope.features[$scope.features.indexOf(itemToDelete) - 1];

                    if (itemToDelete.next === null)
                        mmAlertService.addSuccess("Deleted feature");
                    else {
                        var previousItemName = '';
                        if (previousItem != undefined) {
                            previousItemName = previousItem.name;
                            previousItem.next = itemToDelete.next;
                        }

                        itemToDelete.remove({
                            "link": [previousItemName, itemToDelete.name, itemToDelete.next]
                        }).then(deleteSuccess, deleteFailure);
                    }

                    $scope.features.splice($scope.features.indexOf(itemToDelete), 1);
                    $scope.selectedItems.splice(0, 1);

                }

            }, function() {
                console.log('cancel');
                $scope.isModalOpen = false;
            });

        }

        function deleteSuccess() {
            mmAlertService.addSuccess("Deleted feature");
        }

        function deleteFailure() {
            mmAlertService.addError("Error: Failure deleting data");
        }


        //Save updates to features
        var result;
        $scope.saveFeaturesChanges = function() {
             $scope.saveChangesDisabled = true;
            result = 0;
            for (var i = 0; i < $scope.features.length; i++) {
                var feature = $scope.features[i];

                var savedFailure = getSaveFailureFunction(feature.name);
                feature.put().then(savedSuccess, savedFailure);

            }

        };

        function savedSuccess() {
            result++;
            if (result == $scope.features.length) {
                mmAlertService.addSuccess("Saved data");
                refreshData();
            }
        }

        //Saving feature update function
        function getSaveFailureFunction(featureName) {
            function savedFailure() {
                mmAlertService.addError("Error: Failure saving data for feature: " + featureName);
                 $scope.saveChangesDisabled = false;
            }
              
            return savedFailure;
        }
    }
]);
