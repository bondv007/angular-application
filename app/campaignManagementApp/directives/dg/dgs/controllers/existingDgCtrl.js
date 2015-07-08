/**
 * Created by Ofir.Fridman on 11/23/14.
 */
'use strict';

app.controller('existingDgCtrl', ['$scope', '$modalInstance', 'campaignDgs', 'enums', 'existingDgService', 'selectedTaId', '$timeout', '$q',
    function ($scope, $modalInstance, campaignDgs, enums, existingDgService, selectedTaId, $timeout, $q) {
        function onLoad() {
            $scope.dgs = [];
            $scope.selectedDgs = [];
            existingDgService.createGridData(campaignDgs, $scope.dgs);
            $scope.columns = existingDgService.getColumns();
            existingDgService.addPreviewButtonToEachRow($scope.dgs);
            disableEnableAssignButton();
        }

        onLoad();

        function disableEnableAssignButton(){
            var disable = $scope.selectedDgs.length == 0;
            $timeout(function(){
                angular.element("[ng-click='onSelect()']").attr("disabled", disable);
            },10);
        }

        $scope.afterSelectionChange = function(){
            disableEnableAssignButton()
        };

        $scope.onSelect = function () {
            var defer = $q.defer();
            if(existingDgService.isAllSelectedDgsAreNotAssignToTa($scope.selectedDgs)){
                existingDgService.AssignAndSave($scope.selectedDgs, campaignDgs, selectedTaId).then(function () {
                    defer.resolve(true);
                    $modalInstance.close();
                });
            }
            return defer.promise;
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);