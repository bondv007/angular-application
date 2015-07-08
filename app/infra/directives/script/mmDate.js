/**
 * Created by Lior.Bachar on 1/6/14.
 *
 * change input to label after date click
 */
'use strict'
app.directive('mmDate', [function () {
	return {
		restrict: 'E',
		templateUrl: 'infra/directives/views/mmDate.html',
    scope: {
      mmClass: "@",
      mmShowLabel: "@",
      mmIsRequired: '@',
      mmLayoutType: '@',
      mmLabelLayoutClass: "@",
      mmControlLayoutClass: "@",
      mmOuterControlClass: "@",
      mmCloseModeClass: "@",
      mmCaption: "@",
      mmPlaceholder: "@",
      mmModel: "=",
      mmError: "=",
      mmIsDirtyCounter: "=",
      mmDisable: "=",
      textTooltip: '@',
      mmChange: "&",
      mmIsEditMode: "=",
      mmFormat:"@",
      mmLabelWidth: "@"
    },
		controller: ['$scope', '$timeout' ,function ($scope, $timeout) {

			$scope.isOpen = true;
			$scope.dateFormat = $scope.mmFormat !== undefined  ? $scope.mmFormat : "dd/MM/yyyy";
			$scope.displayInput =  ($scope.mmModel) ? false : true;
      $scope.mmModelObj = {val: ""};

			$scope.displayDatePicker = function() {
				//$scope.isOpen = true;
			}

			$scope.inputChanged = function() {

			}

      $scope.$watch('mmModel', function (newVal) {
        if(newVal !== undefined && newVal !== null){
          $scope.mmModelObj = {val: $scope.mmModel};

          if($scope.mmModelToWatch === undefined){
            $scope.mmModelToWatch = newVal;
          }
        }
      });

      $scope.$watch('mmModelObj.val', function (newVal) {
        if ($scope.mmModel !== newVal) {
          $scope.mmModel = newVal;
          $scope.mmModelToWatch = newVal;
          if($scope.mmChange !== undefined){
            $timeout(function(){$scope.mmChange();},50);
          }
        }
      });

      $scope.showControl = function(isShow){

      }
      $scope.documentClick = function(){

      }
		}]
	};
}]);


