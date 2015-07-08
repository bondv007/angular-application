/**
 * Created by rotem.perets on 5/15/14.
 */
app.directive('mmFocus',['$timeout', function($timeout) {
  return {
    restrict: 'A',
    scope: {
      focusValue: "=mmFocus"
    },
    link: function($scope, $element, attrs) {
			var timer;
      var watcher = $scope.$watch("focusValue", function(currentValue, previousValue) {
        if(!!$element && $element[0]){
          timer = $timeout(function(){
            if (currentValue === true) {
              $element[0].focus();
              $element[0].click();
            } else if (currentValue === false && previousValue) {
              $element[0].blur();
            }
          }, 10);
        }
      });
			$scope.$on('$destroy', function() {
				if (watcher){
					watcher();
				}

				$timeout.cancel(timer);
			});
    }
  }
}]);