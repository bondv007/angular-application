/**
 * Created by roi.levy on 1/8/15.
 */
app.directive('mmTextArea', [function () {
  return {
    restrict: 'E',
    scope: {
      mmModel: '=',
      mmMinWidth: '@',
      mmError: "=?",
      mmCaption: "@",
      mmHideLabel: "@",
      mmChange: "&",
      mmIsRequired: '@',
      mmDisable: "=?",
      mmPlaceholder: "@",
      textTooltip: '@',
      mmClass: "@",
      mmLabelWidth: "@",
      mmLayoutType: '@',
      mmCustomControlWidth: "@",
      mmCustomControlClass: "@",
      mmTabIndex: "@",
      mmInputType: "@",
      mmRows: "@"
    },
    template: '<mm-control-base control-type="textArea"></mm-control-base>',
    controller: ['$scope', function ($scope) {
      $scope.controlType = 'textArea';
      $scope.mmShowAsLabel = false;
      $scope.isShowControl = true;
      $scope.setFocus = false;
      $scope.mmRows = ($scope.mmRows) ? $scope.mmRows : 4;
    }]
  }
}]);
