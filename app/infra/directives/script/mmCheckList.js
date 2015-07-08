/**
 * Created by rotem.perets on 5/13/14.
 */
app.directive('mmCheckList',[function(){
  return {
    restrict: 'E',
    scope: {
      mmClass: "@",
      mmMinWidth:'@',
      mmError: '=?',
      mmModel: "=?",
      mmDataModel: '=?',
      mmCaption: '@',
      mmHideLabel: "@",
      mmCloseModeClass: "@",
      mmChange: "&",
      mmIsRequired: "@",
      mmIsEditMode: "=?",
      mmDisable: "=?",
      textTooltip: '@',
      mmIsLink: "=?",
      mmEntityType: "@",
      lazyType: '=?',
      mmEditMultiple: "=?",
      mmLabelWidth: "@",
      mmLayoutType: '@',
      mmCustomControlWidth: "@",
      mmTabIndex: "@",
			mmId: "@"
    },
    template: '<mm-control-base control-type="checklist"></mm-control-base>',
    controller: ['$scope', '$element', '$timeout', 'mmUtils', 'infraEnums',
      function ($scope, $element, $timeout, mmUtils, infraEnums) {
        $scope.controlType = "checklist";
        $scope.isShowControl = true;
        $scope.mmForceHide = true;
        $scope.mmIsMultiSelect = ($element.attr('allow-multi-select') !== undefined);
        $scope.mmOptionId = ($element.attr('mm-option-id') !== undefined) ? $element.attr('mm-option-id') : 'id';
        $scope.mmOptionName = ($element.attr('mm-option-name') !== undefined) ? $element.attr('mm-option-name') : 'name';
        $scope.mmShowSearchBox = ($element.attr('show-search-box') !== undefined);
        $scope.isEditMultiple=($scope.mmEditMultiple !== undefined) ? $scope.mmEditMultiple : false;
				$scope.mmId = mmUtils.elementIdGenerator.getId(infraEnums.controlTypes.checklist.toLowerCase(), $scope.mmCaption, $scope.mmId);

        $scope.onClick = function (itemId) {
          if(!$scope.mmDisable){
            var ind = $scope.mmModel.indexOf(itemId);
            if (ind > -1) {
              $scope.mmModel.splice(ind, 1);
            } else {
              $scope.mmModel.push(itemId);
            }
          }
        };

        $scope.onKeyPress = function($event, itemId) {
          if ($event.keyCode == 13 || $event.keyCode == 32) {
            // Here is where I must fire the click event of the button
            $scope.onClick(itemId);
          }
        };
      }]
  }
}]);
