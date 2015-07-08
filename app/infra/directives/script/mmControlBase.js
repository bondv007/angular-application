/**
 * Created by Liron.Tagger on 8/25/14.
 */
app.directive('mmControlBase', [function(){
  return {
    restrict: 'E',
    templateUrl:	function(scope, e){
      var type = scope.attr('control-type');
      return (type == 'text' || type == 'single' || type == 'multi' || type == 'label' || type == 'dropdown' || type == 'textArea') ?      
        'infra/directives/views/base/mmInputControlBase.html' : 'infra/directives/views/base/mmClickControlBase.html';
    },
		controller: ['$scope', '$timeout', 'enums', function ($scope, $timeout, enums) {
			initData();
			setLayout();

			function initData() {
        //$scope.isShowControl = true;
				$scope.mmShowControllLabel = true;
				$scope.mmHideLabel = $scope.mmHideLabel || false;
        $scope.mmIsRequired = ($scope.mmIsRequired === undefined) ? false : $scope.mmIsRequired == 'true';
				$scope.mmLabelWidth = $scope.mmLabelWidth ? $scope.mmLabelWidth : '130';
        $scope.mmLabelLeft = $scope.mmLabelWidth ? '' + $scope.mmLabelWidth + 'px' : '130px';

        // adding the ability to position the label certain pixels from the left
        if ($scope.mmCustomLabelPadding) {
          $scope.mmPadding = $scope.mmCustomLabelPadding + 'px';
        } else {
          $scope.mmPadding = ($scope.mmIsRequired) ? '0px' : '10px';
        }

				//$scope.mmIsEditMode = false;
				($scope.mmIsEditMode === undefined) ? true : $scope.mmIsEditMode;
				$scope.mmDisable = $scope.mmDisable || false;
			}
			function setLayout(){
				if($scope.mmLayoutType === undefined || $scope.mmLayoutType === ''){
          $scope.mmLayoutType = enums.layoutType.getName("medium");
				}
        switch ($scope.mmLayoutType){
          case enums.layoutType.getName("custom"):
            var fullWidth = parseInt($scope.mmLabelWidth) + parseInt($scope.mmCustomControlWidth) + parseInt(30);
            $scope.mmControlClass = '';
            $scope.mmControlWidth = 'width: ' + $scope.mmCustomControlWidth + 'px;';
            $scope.mmControlContainerWidth = 'width: ' + fullWidth + 'px;';
            break;
          default:
            $scope.mmControlClass = 'mm-control-' + $scope.mmLayoutType;
            break;
        }
			}

			var timeOut;
      $scope.mmModelChange = function(){
        timeOut = $timeout(function(){$scope.mmChange();},100);
        if(!$scope.mmDisable){
          $scope.$root.isDirtyEntity = true;
        }
      }

      $scope.mmModelBlur = function(){
        timeOut = $timeout(function(){$scope.mmBlur();},100);
        if(!$scope.mmDisable){
          $scope.$root.isDirtyEntity = true;
        }
      }

      $scope.openToEdit = function(show){
        if($scope.mmDisable){
          return;
        }
        if($scope.mmIsLink){
          $scope.isShowControl = true;
        }
      };

			$scope.$on('$destroy', function() {
				$timeout.cancel(timeOut);
			});
    }]
  }
}]
);
