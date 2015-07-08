'use strict'
app.directive('mmSingleDatePicker', ['$rootScope','dateFilter', function($rootScope,dateFilter) {

    return {
        restrict: 'E',
        require: ['mmModel'],
        scope: {
            mmModel: "=",
            mmDisable: "=?",
            mmMinDate: "=?",
            mmMaxDate: "=?",
            mmError: "=?",
            mmDateFormat: "@",
            mmCaption: "@",
            mmIsRequired: "@",
            mmHideLabel: "@",
            mmOnDatePickerChange: "&"
        },
        templateUrl: 'infra/directives/views/datePicker/mmSingleDatePicker.html',
        controller: ['$rootScope', '$scope', '$document', 'datePickerHelper', 'dgHelper', '$element', '$timeout', '$window', 'mmUtils','dateFilter', controllerFunc]
    };

    function controllerFunc($rootScope, $scope, $document, datePickerHelper, dgHelper, $element, $timeout, $window, mmUtils,dateFilter) {
       
        $scope.enableShield = true;
        $scope.dateFormat = (!$scope.mmDateFormat) ? datePickerHelper.defaultDateFormat : $scope.mmDateFormat;
    
        $scope.onMouseOver = function() {

            if (!$scope.mmDisable) {
                $scope.isMouseOverTb = true;
                $scope.isHoverMode = true;
            }
        };
        $scope.onMouseOut = function() {
            if (!$scope.mmDisable) {
                $scope.isMouseOverTb = false;
                $scope.isHoverMode = false;
            }
        };
        $scope.onMouseOverDatePicker = function() {
            if (!$scope.mmDisable) {
                $scope.isMouseOverDatePicker = true;
            }
        };
        $scope.onMouseOutDatePicker = function() {
            if (!$scope.mmDisable) {
                $scope.isMouseOverDatePicker = false;
            }
        };
        $scope.onSelectedTB = function() {
          

            if (!$scope.mmDisable) {
                showDatePicker();
            }
        };

        $scope.onChange = function(mmModel) {
            if (!$scope.mmDisable) {
                
                var dpObj = {
                    mmModel: mmModel,
                    mmMinDate: $scope.mmMinDate,
                    mmMaxDate: $scope.mmMaxDate
                };
                $scope.mmOnDatePickerChange({
                    dpObj: dpObj
                });
                
                $scope.mmModel = dateFilter(mmModel,$scope.dateFormat);
                $scope.$root.isDirtyEntity = true;
                hideDatePicker();
            }
        };

        $scope.hideDatePicker = hideDatePicker;

        function hideDatePicker() {
            $scope.isEditMode = false;
            $scope.isMouseOverTb = false;
            $scope.isHoverMode = false;
            $scope.isTbSelected = false;
        }

        function showDatePicker() {
            $scope.isTbSelected = true;
            $scope.isEditMode = true;
        }

        $scope.$on('$destroy', function() {
            $document.off('click');
        });
    }
}]);
