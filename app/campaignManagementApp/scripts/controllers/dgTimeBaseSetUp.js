/**
 * Created by roi.levy on 11/10/14.
 */

'use strict';

app.controller('timeBaseSettingCtrl', ['$scope', '$modalInstance', 'dgValidation', 'mmAlertService', 'mmModal', 'weight','enums', 'dgConstants', 'deliveryGroupJsonObjects', 'validationHelper',
  function ($scope, $modalInstance, dgValidation, mmAlertService, mmModal, weight, enums, dgConstants, deliveryGroupJsonObjects, validationHelper) {

    $scope.timeBase = weight || deliveryGroupJsonObjects.getRotationSetting(dgConstants.strTimeBased).timeBase;

    $scope.lookups = {
      dateSettingOptions: enums.timeBasedDateSetting
    }

    $scope.uiFlags = {
      dateRangeRadioSelected:  $scope.timeBase.datesAccordingToPlacements ? "inheritDatesFromPlacement" : "custom",
      labelWidth: 50
    }

    $scope.toDay = new Date();

    function initErrorsToEmptyString() {
      $scope.mmErrorStartDate = {text: ""};
      $scope.mmErrorEndDate = {text: ""};
    }

    initErrorsToEmptyString();

    function prepareTimeBaseObjectForSave(){
      if($scope.timeBase.datesAccordingToPlacements){
        $scope.timeBase.startDate = null;
        $scope.timeBase.endDate = null;
      }
    }

    $scope.ok = function () {
      if (isValid()) {
        mmAlertService.closeAllExceptSuccess();
        prepareTimeBaseObjectForSave();
        $modalInstance.close($scope.timeBase);
      } else {
        mmAlertService.addError("Please fix the errors below.");
      }
    };

    function isValid() {
      initErrorsToEmptyString();
      if($scope.timeBase.datesAccordingToPlacements){
        return true;
      }

      var valid = true;
      if(!dgValidation.isSwapStartDateEqualOrGreaterThanToday({startDate: $scope.timeBase.startDate, error: $scope.mmErrorStartDate})){
        valid = false;
      }
      if ($scope.mmErrorStartDate.text.trim() == "" && !dgValidation.swapStartDateMandatoryValidation($scope.timeBase.startDate, $scope.mmErrorStartDate)) {
        valid = false;
      }
      if ($scope.mmErrorStartDate.text.trim() == "" && !validationHelper.singleDatePickerRequiredValidation({value: $scope.timeBase.endDate, error: $scope.mmErrorEndDate, fieldName: "End Date"})) {
        valid = false;
      }
      else if (!dgValidation.isSwapEndGreaterThanStartDate({fieldName:"", startDate: $scope.timeBase.startDate, endDate: $scope.timeBase.endDate, error: $scope.mmErrorEndDate})) {
        valid = false;
      }
      return valid;
    }

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.dateRangeRadioBtnChange = function(){
     if($scope.uiFlags.dateRangeRadioSelected === "inheritDatesFromPlacement"){
        $scope.timeBase.datesAccordingToPlacements = true;
      }
      else{
       $scope.timeBase.datesAccordingToPlacements = false;
     }
    }

  }]);