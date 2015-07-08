/**
 * Created by rotem.perets on 5/1/14.
 */

app.directive('mmLabel', [function () {
  return {
    restrict: 'E',
    require: ['mmModel'],
    scope: {
      mmClass: "@",
      mmShowLabel: "@",
      mmIsRequired: "@",
      mmLabelLayoutClass: "@",
      mmControlLayoutClass: "@",
      mmOuterControlClass: "@",
      mmCloseModeClass: "@",
      mmCaption: "@",
      mmModel: "=",
      mmLabelWidth: "@",
      mmShowControl: "@",
      mmLayoutType: '@',
      mmCustomControlWidth: "@"
    },
    template: '<mm-control-base control-type="label"></mm-control-base>',
    controller: ['$scope', function ($scope) {
      $scope.controlType = 'label';
      $scope.isShowControl = false;
      $scope.mmDisable = true;
      $scope.mmPadding = (!!$scope.mmIsRequired) ? '0px' : '10px';
    }]
  }}]
);

