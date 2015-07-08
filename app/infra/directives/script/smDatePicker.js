'use strict'
app.directive('smDatePicker', [function () {
	return {
		restrict: 'E',
		require: ['mmModel'],
		scope: {
			mmModel: "=",
			mmDateFormat: "@",
			mmDisable:"="

		},
		templateUrl: 'infra/directives/views/smDatePicker.html',
		controller: ['$scope', function ($scope) {
			var defaultDateFormat = 'MM/dd/yyyy';
			$scope.mmModel.startDate = (!$scope.mmModel && !$scope.mmModel.startDate) ? new Date() : $scope.mmModel.startDate;
			$scope.mmModel.endDate = (!$scope.mmModel && !$scope.mmModel.endDate) ? new Date() : $scope.mmModel.endDate;
			$scope.mmDateFormat = (!$scope.mmDateFormat) ? defaultDateFormat : $scope.mmDateFormat;
			$scope.mmDisable = (!$scope.mmDisable)?false:$scope.mmDisable;
		}]
	};
}]);