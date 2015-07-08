/**
 * Created by liron.tagger on 1/6/14.
 */
'use strict'
app.directive('mmDatepicker', [function () {
	return {
		restrict: 'E',
		templateUrl: 'infra/directives/views/mmDatepicker.html',
		controller: ['$rootScope', '$scope', '$element', '$document' ,function ($rootScope, $scope, $element, $document) {
			$scope.isclicked2 = false;
			$scope.isclicked1 = false;
			$scope.isclicked3 = false;
			$scope.startDate = $scope.mmModel.startDate
			$scope.endDate = $scope.mmModel.endDate
			$scope.dateFormat = $scope.mmFormat !== undefined  ? $scope.mmFormat : "dd/MM/yyyy";
			$scope.isRange = $scope.mmIsRange !== undefined  ? $scope.mmIsRange: false;
			$scope.isDisabled = $scope.mmIsDisabled !== undefined  ? $scope.mmIsDisabled: false;
			$scope.mmIsDirty = ($element.attr('mm-is-dirty') !== undefined && $scope.mmIsDirty === undefined) ? 0 : $scope.mmIsDirty;
			$scope.mmModelToWatch = $scope.mmModel.startDate;
			$scope.mmLabelClass = ($scope.mmLabelLayoutClass === undefined) ? 'mm-directive-label mm-label-text' : $scope.mmLabelLayoutClass;
			$scope.mmControlClass = ($scope.mmControlLayoutClass === undefined) ? 'col-lg-5 col-md-5 col-xs-4' : $scope.mmControlLayoutClass;
			$scope.mmShouldShowLabel = ($scope.mmShowLabel === undefined) ? true : $scope.mmShowLabel;
			$scope.opened1 = false;
			$scope.open1 = function(isRange) {
				$scope.isclicked1 = true;
				$scope.startDate=	$scope.mmModel.startDate.toLocaleDateString();

				if(!isRange && $scope.isclicked1)
				{	$scope.isclicked3 =true
					$scope.isclicked1 =false}
				else if($scope.isclicked1 && $scope.isclicked2)
				{$scope.isclicked3 =true
					$scope.isclicked2 =false
					$scope.isclicked1 =false}

				$scope.mmModelToWatch = $scope.mmModel.startDate.toLocaleDateString();;
			};

			if ($element.attr('mm-is-dirty') !== undefined && $scope.mmIsDirty === undefined) {
				$scope.mmIsDirty = 0;
			}
			$scope.open2 = function() {
				$scope.isclicked2 = true;
				$scope.endDate=$scope.mmModel.endDate.toLocaleDateString();
				if($scope.isclicked1 && $scope.isclicked2)
				{$scope.isclicked3 = true
					$scope.isclicked2 = false
					$scope.isclicked1 = false}
					$scope.mmModelToWatch = $scope.mmModel.endDate.toLocaleDateString();
			};



			$scope.parse = function() {
				$scope.mmModel.startDate = new Date($scope.startDate)
				$scope.mmModel.endDate = new Date($scope.endDate)
				$scope.mmModelToWatch = $scope.mmModel.startDate.toLocaleDateString();
			};

			$element.bind('click', function(event) {
				event.stopPropagation();
			});

			$document.bind('click', function(){
				$rootScope.safeApply(function(){
				  $scope.isOpen = false;
        }, $scope);
			});

			$scope.$on('$destroy', function() {
				$element.off('click');
				$document.off('click');
			});
		}],
		scope: {
			mmError: "=",
			mmModel: "=",
			mmCaption:"@",
			mmRangeDelimiter:"@",
			mmFrom:"@",
			mmTo: "@",
			mmIsRange: "=",
			mmFormat:"@",
			mmIsDisabled: "=",
			mmLabelLayoutClass: "@",
			mmControlLayoutClass: "@",
			mmShowLabel: '@',
			mmIsRequired: "@"
		}

	};
}]);


