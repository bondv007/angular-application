/**
 * Created by Alon.Shemesh on 5/1/14.
 */
app.directive('mmCheckboxSingle', [function() {
	return {
		restrict: 'E',
		require: ['mmModel'],
		scope: {
			mmModel: "=",
			mmCaption: "@",
			mmShowLabel: "@",
			mmVisible: "=",
			mmTextTooltip: '@',
			mmControlLayoutClass: "@",
			mmChange: "&",
			mmTrueValue: "@",
			mmFalseValue: "@",
			mmDisable: "=",
			mmLabelWidth: "@",
			mmPartially :"="
		},
		templateUrl: 'infra/directives/views/mmCheckboxSingle.html',
		controller: ['$scope', '$element', '$timeout', function ($scope, $element, $timeout) {
			$scope.disable = ($scope.mmDisable === undefined) ? false : $scope.mmDisable;
			$scope.showLabel = ($scope.mmShowLabel === undefined) ? true : $scope.mmShowLabel;
			$scope.visible = $scope.mmVisible !== false;
			$scope.trueValue = ($scope.mmTrueValue === undefined) ? true : $scope.mmTrueValue;
			$scope.falseValue = ($scope.mmFalseValue === undefined) ? false : $scope.mmFalseValue;
			$scope.mmControlClass = ($scope.mmControlLayoutClass === undefined) ? 'mm-directive-control' : $scope.mmControlLayoutClass;
			$scope.onClick = function () {
				if (!$scope.disable) {
					$scope.mmModel = ($scope.trueValue === $scope.mmModel) ? $scope.falseValue : $scope.trueValue;
					$scope.mmOnChangeDirective();
				}
			};
			$scope.mmOnChangeDirective = function () {
				$timeout(function () {
					$scope.mmChange()
				}, 100);
			};
			$scope.onMouseOver = function(){
				if (!$scope.disable) {
					$scope.mouseIsOverCB = true;
				}
			};
			$scope.onMouseOut = function(){
				if (!$scope.disable) {
					$scope.mouseIsOverCB = false;
				}
			}
			$scope.$watch('mmModel', function (newValue, oldValue) {
				if (newValue != oldValue) {
					$scope.mmModel = newValue;
				}
			});
		}]
	}
}]
);