'use strict'

app.directive('mmRangeDatePicker', [function () {
  return {
    restrict: 'E',
    require: ['mmModelStartDate','mmModelEndDate'],
    scope: {
      mmId: "@",
      mmModelStartDate:"=",
      mmModelEndDate:"=",
      mmDisable: "=?",
      mmError: "=?",
      mmDateFormat: "@",
      mmCaption: "@",
      mmCaptionStartDate: "@",
      mmCaptionEndDate: "@",
      mmIsRequired: "@",
      mmHideLabel: "@",
      mmLabelWidth: "@",
      mmLayoutType: '@',
      mmCustomControlWidth: "@"
    },
    templateUrl: 'infra/directives/views/datePicker/mmRangeDatePicker.html',
    controller: ['$scope','datePickerHelper', function ($scope,datePickerHelper) {
      $scope.controlType= 'daterange';
      $scope.isShowControl = true;
      $scope.disable = (!$scope.mmDisable) ? false : $scope.mmDisable;
      $scope.mmId = ($scope.mmId) ? $scope.mmId : '';
      $scope.startDatePickerObj = {minDate: null, maxDate: null};
      $scope.endDatePickerObj = {minDate: null, maxDate: null};
      $scope.onDatePickerChange = function(dpObj){
        datePickerHelper.isEndGreaterThanStartDate($scope.mmError,dpObj.mmMinDate,dpObj.mmMaxDate,dpObj.mmModel);
      };
    }]
  };
}]);