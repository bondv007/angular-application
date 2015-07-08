/**
 * Created by Alon.Shemesh on 5/1/14.
 */
app.directive('mmCheckbox', [function () {
  return {
    restrict: 'E',
    require: ['mmModel'],
    template: '<mm-control-base control-type="checkbox"></mm-control-base>',
    controller: ['$scope', '$element', '$timeout', function ($scope, $element, $timeout) {
      $scope.controlType = 'checkbox';
      $scope.isShowControl = true;
      $scope.mmForceHide = true;
      $scope.disable = ($scope.mmDisable === undefined) ? false : $scope.mmDisable;
      $scope.showLabel = ($scope.mmShowLabel === undefined) ? true : $scope.mmShowLabel;
      $scope.visible = $scope.mmVisible !== false;
      $scope.trueValue = ($scope.mmTrueValue === undefined) ? true : $scope.mmTrueValue;
      $scope.falseValue = ($scope.mmFalseValue === undefined) ? false : $scope.mmFalseValue;
      $scope.mmControlClass = ($scope.mmControlLayoutClass === undefined) ? 'mm-directive-control' : $scope.mmControlLayoutClass;

      $scope.onClick = function () {
        if (!$scope.mmDisable) {
          $scope.$root.isDirtyEntity = true;
          $scope.mmModel = ($scope.trueValue === $scope.mmModel) ? $scope.falseValue : $scope.trueValue;
          $scope.mmOnChangeDirective();
        }
      };

			var timeOut;
      $scope.mmOnChangeDirective = function () {
        timeOut = $timeout(function () {
          $scope.mmChange()
        }, 100);
      };

      $scope.onMouseOver = function () {
        if (!$scope.disable) {
          $scope.mouseIsOverCB = true;
        }
      };

      $scope.onMouseOut = function () {
        if (!$scope.disable) {
          $scope.mouseIsOverCB = false;
        }
      }

      $scope.isEditMultiple = ($scope.mmEditMultiple !== undefined) ? $scope.mmEditMultiple : false;
      if ($scope.isEditMultiple) {
        $scope.trueValue = ($scope.mmTrueValue === undefined) ? true : $scope.mmTrueValue;
        $scope.falseValue = ($scope.mmFalseValue === undefined) ? false : $scope.mmFalseValue;
        $scope.mmDataModel = [
          {id: 0, name: $scope.falseValue},
          {id: 1, name: $scope.trueValue}
        ]
      }

      $scope.onKeyPress = function($event) {
        if ($event.keyCode == 13 || $event.keyCode == 32) {
          // Here is where I must fire the click event of the button
          $scope.onClick();
        }
      };

			$scope.$on('$destroy', function() {
				$timeout.cancel(timeOut);
			});
    }
    ]
  }
}]
);