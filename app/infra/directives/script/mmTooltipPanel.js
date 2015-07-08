
app.directive('mmTpanel', ['$rootScope', function($rootScope) {

  return {
    restrict: 'E',
    scope: {
      inGrid: "=?"
    },
    templateUrl: 'infra/directives/views/mmTooltipPanel.html',
    controller: ['$rootScope', '$scope', '$document', 'datePickerHelper', 'dgHelper', '$element', '$timeout','$window','mmUtils',
        function($rootScope, $scope, $document, datePickerHelper, dgHelper, $element, $timeout,$window,mmUtils) {

      $scope.onmouseover = function() {
        console.log(123);
        showTooltip();
      }

      function showTooltip() {

        var dpOffset = mmUtils.utilities.GetElementOffset($element);

        $scope.topPos = dpOffset.top + dpOffset.height;
        $scope.leftPos = dpOffset.left;

        $scope.isTbSelected = true;
        $scope.isEditMode = true;
        $timeout(function(){

          var dpFrameOffset = mmUtils.utilities.GetElementOffset($element.find(".dpFrame"));
          if($scope.topPos + dpFrameOffset.height >= $window.innerHeight)
          {
            $scope.topPos = dpOffset.top - dpFrameOffset.height - 5;
          }

          if($scope.leftPos + dpOffset.width >= $window.innerWIdth)
          {
            $scope.leftPos = dpOffset.left - dpFrameOffset.width - 5;
          }
          $scope.showShield = true;
        });
      }

    }]
  };

}]);