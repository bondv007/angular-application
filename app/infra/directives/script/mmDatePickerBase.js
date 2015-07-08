'use strict'
app.directive('mmDatePickerBase', [function () {
	return {
		restrict: 'E',
		require: ['mmModel'],
		templateUrl: 'infra/directives/views/datePicker/mmDatePickerBase.html',
		controller: ['$rootScope', '$scope', '$document', 'datePickerHelper', function ($rootScope, $scope, $document, datePickerHelper) {
			$scope.dateFormat = (!$scope.mmDateFormat) ? datePickerHelper.defaultDateFormat : $scope.mmDateFormat;
			$scope.onMouseOver = function () {
				if (!$scope.mmDisable) {
					$scope.isMouseOverTb = true;
					$scope.isHoverMode = true;
				}
			};
			$scope.onMouseOut = function () {
				if (!$scope.mmDisable) {
					$scope.isMouseOverTb = false;
					$scope.isHoverMode = false;
				}
			};
			$scope.onMouseOverDatePicker = function () {
				if (!$scope.mmDisable) {
					$scope.isMouseOverDatePicker = true;
				}
			};
			$scope.onMouseOutDatePicker = function () {
				if (!$scope.mmDisable) {
					$scope.isMouseOverDatePicker = false;
				}
			};
			$scope.onSelectedTB = function () {
				if (!$scope.mmDisable) {
					$scope.isTbSelected = true;
					$scope.isEditMode = true;
				}
			};
			$scope.onBlurTB = function (mmModel) {
				$scope.mmModel = mmModel;
				if (!$scope.mmDisable) {
					$scope.isTbSelected = false;
					if (!$scope.isMouseOverDatePicker) {
						$scope.isEditMode = false;
						$scope.isHoverMode = false;
					}
				}
			};
			$scope.onChange = function (mmModel) {
				if (!$scope.mmDisable) {
					var dpObj = {mmModel:mmModel,mmMinDate:$scope.mmMinDate,mmMaxDate:$scope.mmMaxDate};
					$scope.mmOnDatePickerChange({dpObj:dpObj});
					$scope.mmModel = mmModel;
					$scope.$root.isDirtyEntity = true;
					$scope.isHoverMode = false;
				}
			};
			$document.bind('click', function () {
				if (!$scope.mmDisable && !$scope.isHoverMode) {
					$rootScope.safeApply(function(){
            $scope.isTbSelected = false;
            $scope.isEditMode = false;
          }, $scope);
				}
			});

			$scope.$on('$destroy', function() {
				$document.off('click');
			});
		}]
	};
}]);