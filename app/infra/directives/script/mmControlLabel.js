/**
 * Created by rotem.perets on 6/5/14.
 */
app.directive('mmControlLabel', [function() {
  return {
    restrict: 'E',
    scope: {
      mmClass: "@",
      mmCaption: "@",
      mmIsRequired: "@",
      mmLayoutClass: "@",
      mmLabelWidth: "@",
      mmShowLabel: "@"
    },
    templateUrl: 'infra/directives/views/mmControlLabel.html',
		controller: ['$scope', function ($scope ) {
      $scope.showLabel = ($scope.mmShowLabel === undefined) ? true : $scope.mmShowLabel;
			$scope.labelWidth = ($scope.mmLabelWidth === undefined || $scope.mmLabelWidth == "") ? 'width: 130px' : 'width: ' + $scope.mmLabelWidth + 'px';
      $scope.$watch('mmLabelWidth', function(newVal){
        $scope.labelWidth = ($scope.mmLabelWidth === undefined || $scope.mmLabelWidth == "") ? 'width: 130px' : 'width: ' + $scope.mmLabelWidth + 'px';
      });
		}]
  }
}]
);