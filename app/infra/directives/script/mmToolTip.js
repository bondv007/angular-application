/**
 * Created by Lior.Bachar 7/16/14.
 */

app.directive('mmTooltip', ['$timeout', function($timeout) {
	return {
		restrict: 'A',
		transclude:true,
		scope: {
			textTooltip: "@mmTooltip",
			tooltipTitle: "@"
		},

		templateUrl: 'infra/directives/views/mmTooltip.html',
		controller: ['$document', '$scope', '$element', '$attrs', function ($document,$scope, $element,$attrs) {

			$scope.popupDelay = 700;
			if ($attrs.disabled && ($attrs.disabled == "true" || $attrs.disabled == "disabled")) {
				$scope.popupDelay = 0;
			}


			$scope.showTooltip = false;
			$scope.tooltipDwell = false;

			var tooltipTimer;
			var tooltipLeaveTimer;


			$scope.displayTooltip = function(e) {
				if ($scope.showTooltip) return;
				tooltipTimer = $timeout(function() {
					var posX = e.clientX;
					var posY = e.clientY + 5;
					$scope.mousePosition = {left:  posX , top:  posY};
					$scope.showTooltip = true;

				},$scope.popupDelay);
			}

			$scope.hideTooltip = function() {
				$timeout.cancel(tooltipTimer);

				tooltipLeaveTimer = $timeout(function() {
					if ($scope.isTooltipDwell()) return;
					$scope.showTooltip = false;
					$scope.tooltipDwell = false;
				},500)
			}

			$scope.isTooltipDwell = function() {
				return $scope.tooltipDwell;
			}

			$scope.hideTooltipAfterDwell = function() {
				$scope.showTooltip = false;
				$scope.tooltipDwell = false;
			}

      $scope.$on('$destroy', function() {
        $timeout.cancel(tooltipTimer);
        $timeout.cancel(tooltipLeaveTimer);
      });
		}]

	}
}]
);

