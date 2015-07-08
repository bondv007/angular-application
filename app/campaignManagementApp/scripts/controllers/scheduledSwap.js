/**
 * Created by ofir.fridman on 9/22/14.
 */
'use strict';

app.controller('scheduledSwapCtrl', ['$scope', '$modalInstance', 'dgValidation', 'mmAlertService', 'smartAttachAdsToDgs', 'subGroup',
	function ($scope, $modalInstance, dgValidation, mmAlertService, smartAttachAdsToDgs, subGroup) {
		$scope.subGroup = (subGroup.timeBased && subGroup.timeBased.startDate) ? subGroup.timeBased : {name: "Scheduled_Swap_1", startDate: null, endDate: null, sgDate: ""};
		$scope.disableEndDate = (subGroup.timeBased && subGroup.timeBased.endDate) ? true : false;
		$scope.toDay = new Date();

		function initErrorsToEmptyString() {
			$scope.sgNameError = {text: ''};
			$scope.mmErrorStartDate = {text: ""};
			$scope.mmErrorEndDate = {text: ""};
		}

		initErrorsToEmptyString();

		$scope.ok = function () {
			if (isValid()) {
				$scope.subGroup.sgDate = smartAttachAdsToDgs.createSgDateText($scope.subGroup);
				mmAlertService.closeAllExceptSuccess();
				$modalInstance.close($scope.subGroup);
			} else {
				mmAlertService.addError("Please fix the errors below.");
			}
		};

		function isValid() {
			var valid = true;
			if (!dgValidation.swapNameValidation($scope.subGroup.name, $scope.sgNameError)) {
				valid = false;
			}
			if(!dgValidation.isSwapStartDateEqualOrGreaterThanToday({startDate: $scope.subGroup.startDate, error: $scope.mmErrorStartDate})){
				valid = false;
			}
			if ($scope.mmErrorStartDate.text.trim() == "" && !dgValidation.swapStartDateMandatoryValidation($scope.subGroup.startDate, $scope.mmErrorStartDate)) {
				valid = false;
			}
			if (!dgValidation.isSwapEndGreaterThanStartDate({fieldName:"", startDate: $scope.subGroup.startDate, endDate: $scope.subGroup.endDate, error: $scope.mmErrorEndDate})) {
				valid = false;
			}
			return valid;
		}

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};

	}]);