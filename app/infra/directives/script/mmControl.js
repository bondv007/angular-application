/**
 * Created by rotem.perets on 5/1/14.
 */
app.directive('mmControl', [function(){
  return {
    restrict: 'E',
    templateUrl: 'infra/directives/views/mmControl.html',
    transclude: true,
    replace:true,
		controller: ['$scope', '$element', '$document','$timeout','$state', function ($scope, $element, $document,$timeout,$state) {
        // Visual initialization - should be first
      $scope.mmIsRequired = $scope.mmIsRequired || false;
			$scope.labelWidth = ($scope.mmLabelWidth === undefined || $scope.mmLabelWidth == "") ? '130px' : $scope.mmLabelWidth + 'px';
			$scope.$watch('mmLabelWidth', function(newVal){
				$scope.labelWidth = ($scope.mmLabelWidth === undefined || $scope.mmLabelWidth == "") ? '130px' : $scope.mmLabelWidth + 'px';
			});
      $scope.mmShouldShowLabel = ($scope.mmShowLabel === undefined) ? true : $scope.mmShowLabel;
			$scope.mmShouldShowControl = $scope.mmShowControl || true;
      $scope.isLink = ($scope.mmIsLink === undefined) ? false : $scope.mmIsLink;

      if($scope.mmLayoutType === undefined || $scope.mmLayoutType === ''){
        $scope.mmLayoutType = '3col';
      }
      if($scope.mmLayoutType === 'custom'){
        $scope.mmOuterClass = ($scope.mmOuterControlClass === undefined) ? 'mm-directive' : $scope.mmOuterControlClass;
				if($scope.mmLabelWidth === undefined){
        	$scope.mmLabelClass = ($scope.mmLabelLayoutClass === undefined) ? 'mm-directive-label' : $scope.mmLabelLayoutClass;// mm-label-text
				}
        $scope.mmControlClass = ($scope.mmControlLayoutClass === undefined) ? 'mm-directive-control' : $scope.mmControlLayoutClass;
      } else {
        $scope.mmOuterClass = 'mm-outer-' + $scope.mmLayoutType;
        $scope.mmLabelClass = 'mm-label-' + $scope.mmLayoutType;
        $scope.mmControlClass = 'mm-control-' + $scope.mmLayoutType;
        if($scope.mmShouldShowLabel == 'false'){
          $scope.mmOuterClass += '-no-label';
          $scope.mmControlClass += '-no-label';
        }
      }

      $scope.$watch('mmIsEditMode', function(newVal){
        if(newVal !== undefined){
          $scope.isEditMode = newVal;
          $scope.isShowControl = !$scope.isEditMode;
        }
      });


      $scope.mmDisableEdit = !!$scope.mmDisable;
      $scope.isEditMode = ($scope.mmIsEditMode === undefined) ? true : $scope.mmIsEditMode;
      $scope.isShowControl = !$scope.isEditMode;

			$scope.$watch('mmModel', function (newVal) {
        if(newVal !== undefined && newVal !== null){
          if(newVal !== undefined){
            $scope.mmModelToWatch = newVal;
          }
        }
			});

			$scope.$watch('mmModelObj.val', function (newVal) {
        if ($scope.mmModel !== newVal) {
          $scope.mmModelToWatch = newVal;
          if($scope.mmChange !== undefined){
            $timeout(function(){$scope.mmChange();},50);
          }
        }
      });

			$scope.openToEdit = function(show){
        if($scope.mmDisableEdit){
          return;
        }
        if($scope.isEditMode){
          $scope.isShowControl = true;
          $scope.showControl(show);
        }
      };

      $element.bind('click', function(event) {
        event.stopPropagation();
      });

      $document.bind('click', function(){
				if ($scope.documentClick){
        	$scope.documentClick();
				}
      });
    }]
  }
}]
);