'use strict';

app.controller('deliveryGroupSettingsCtrl', ['$scope', '$modalInstance', 'mmMessages', 'mainEntity', '$filter',
    function ($scope, $modalInstance, mmMessages, mainEntity, $filter) {

        $scope.deliveryGroup = mainEntity;
        $scope.cloneDeliveryGroup = {};
        angular.copy($scope.deliveryGroup, $scope.cloneDeliveryGroup);
        $scope.selectedTime = 'Seconds';

        $scope.impressionsPerUser = ($scope.cloneDeliveryGroup.servingSetting.impressionsPerUser != null);
        $scope.impressionsPerUserPerDay = ($scope.cloneDeliveryGroup.servingSetting.impressionsPerDay != null);
        $scope.timeBetweenAds = ($scope.cloneDeliveryGroup.servingSetting.timeBetweenAds != null);

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        }

        $scope.apply = function () {
            $modalInstance.close($scope.cloneDeliveryGroup);
        }

        $scope.rotations = [
            {type: 'EvenDistribution', name: 'Even Distribution'},
            {type: 'Weighted', name: 'Weighted'},
            {type: 'TimeBased', name: 'Time Based'}
        ];

        $scope.timeOptions = ['Seconds', 'Minutes', 'Hours', 'Days', 'Weeks', 'Months'];


        $scope.impressionsPerUserDD = [];
        $scope.impressionsPerUserPerDayDD = [];
        for (var i = 0; i < 61; i++) {
            $scope.impressionsPerUserDD.push(i);
            $scope.impressionsPerUserPerDayDD.push(i);
        }

        $scope.onUnSelectedFrequencyCapping  = function(option){

            switch(option)
            {
                case 'impressionsPerUser':
                    if($scope.impressionsPerUser){// on CB is unselected set impressionsPerUser to null
                        $scope.impressionsPerUser = false;
                        $scope.cloneDeliveryGroup.servingSetting.impressionsPerUser = null;
                    }
                    else if (!$scope.impressionsPerUser && $scope.cloneDeliveryGroup.servingSetting.impressionsPerUser == null){ // on CB selected set impressionsPerUser to 1
                        $scope.impressionsPerUser = true;
                        $scope.cloneDeliveryGroup.servingSetting.impressionsPerUser = 1;
                    }
                    break;
                case 'impressionsPerDay':
                    if($scope.impressionsPerUserPerDay){
                        $scope.impressionsPerUserPerDay= false;
                        $scope.cloneDeliveryGroup.servingSetting.impressionsPerDay = null;
                    }
                    else if(!$scope.impressionsPerUserPerDay && $scope.cloneDeliveryGroup.servingSetting.impressionsPerDay == null){
                        $scope.impressionsPerUserPerDay= true;
                        $scope.cloneDeliveryGroup.servingSetting.impressionsPerDay = 1;
                    }
                    break;
                case 'timeBetweenAds':
                    if($scope.timeBetweenAds){
                        $scope.timeBetweenAds = false;
                        $scope.cloneDeliveryGroup.servingSetting.timeBetweenAds = null;
                    }
                    else{
                        $scope.timeBetweenAds = true;
                    }
                    break;
            }
        }
    }]);