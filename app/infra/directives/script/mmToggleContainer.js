/**
 * Created by eran.nachum on 2/17/14.
 */
app.directive('mmToggleContainer', function () {
    return {
      restrict: 'AE',
      scope: {
        startOpen:"=?",
        mmCaption: '@',
				mmDisable: "=?",
        mmId: "@"
      },
			transclude: true,
			templateUrl: 'infra/directives/views/mmToggleContainer.html',
      controller: ['$scope', '$element','mmUtils', 'infraEnums', function ($scope, $element, mmUtils, infraEnums) {
				$scope.mmId = mmUtils.elementIdGenerator.getId(infraEnums.controlTypes.toggle.toLowerCase(), $scope.mmCaption, $scope.mmId);
				$scope.toggleSection = function() {
					if ($scope.mmDisable) { alert("Section disabled"); return; }
					$scope.startOpen = $scope.startOpen ? !$scope.startOpen : true;
				}
      }]
    }
});
