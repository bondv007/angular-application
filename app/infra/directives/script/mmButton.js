/**
 * Created by rotem.perets on 5/1/14.
 */

app.directive('mmButton', [function() {
    return {
      restrict: 'E',
      scope: {
        mmCaption: "@",
        mmDisable: "=",
        mmAction: "&",
        mmBtnType: "@",
        mmId: "@"
      },
      templateUrl: 'infra/directives/views/mmButton.html',
      controller: ['$scope', '$element',
        function ($scope, $element) {
          $scope.mmDisableButton = ($element.attr('mm-disable') !== undefined) ? $scope.mmDisable : false;

          switch ($scope.mmBtnType) {
            case "save":
              $scope.mmClass = "mm-save-button";
              break;
            case "cancel":
              $scope.mmClass = "mm-discard-button";
              break;
//            case "attach":
//              $scope.mmClass = "mm-attach-button";
//              break;
          }
      }]
    }
  }]
);