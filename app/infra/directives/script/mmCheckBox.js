/**
 * Created by rotem.perets on 5/13/14.
 */
app.directive('mmCheckBox',[function(){
  return {
    restrict: 'E',
    scope: {
      mmClass: "@",
      mmMinWidth:'@',
      mmError: '=?',
      mmModel: "=?",
      mmShowLabel: "@",
      mmVisible: "=?",
      mmTextTooltip: '@',
      mmDataModel: '=?',
      mmCaption: '@',
      mmHideLabel: "@",
      mmCloseModeClass: "@",
      mmSelectChangeFunc: "&",
      mmChange: "&",
      mmIsRequired: "@",
      mmIsEditMode: "=?",
      mmDisable: "=?",
      textTooltip: '@',
      mmIsLink: "=?",
      mmEntityType: "@",
      lazyType: '=?',
      mmTrueValue: "=?",
      mmFalseValue: "=?",
      mmEditMultiple: "=?",
      mmLabelWidth: "@",
      mmLayoutType: '@',
      mmPartially: "=?",
      mmDescription: "@",
      mmCustomControlWidth: "@",
      mmTabIndex: "@",
      mmId: '@',
			mmTitle: '@'
    },
		template:	function(scope, e){
      return (e.$attr.mmEditMultiple != undefined && e.$$element.attr(e.$attr.mmEditMultiple) == 'true') ? '<mm-singleselect control-type="single"></mm-singleselect>' : '<mm-checkbox></mm-checkbox>';
    },
		controller: ['$scope', '$element', 'mmUtils', 'infraEnums', function ($scope, $element, mmUtils, infraEnums) {
      $scope.mmOptionId = ($element.attr('mm-option-id') !== undefined) ? $element.attr('mm-option-id') : 'id';
      $scope.mmOptionName = ($element.attr('mm-option-name') !== undefined) ? $element.attr('mm-option-name') : 'name';
      $scope.isEditMultiple = ($scope.mmEditMultiple !== undefined) ? $scope.mmEditMultiple : false;
			$scope.mmTitle = $scope.mmTitle ? $scope.mmTitle : $scope.mmCaption;
			$scope.mmId = mmUtils.elementIdGenerator.getId(infraEnums.controlTypes.checkbox.toLowerCase(), $scope.mmDescription, $scope.mmId);

      if ($scope.isEditMultiple) {
        $scope.trueValue = ($scope.mmTrueValue === undefined) ? true : $scope.mmTrueValue;
        $scope.falseValue = ($scope.mmFalseValue === undefined) ? false : $scope.mmFalseValue;
        $scope.mmDataModel = [
          {id: 0, name: $scope.falseValue},
          {id: 1, name: $scope.trueValue}
        ]
      }
    }]
  }
}]);