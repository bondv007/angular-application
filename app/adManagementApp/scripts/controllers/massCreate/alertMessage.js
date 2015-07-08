/**
 * Created by roi.levy on 11/24/14.
 */
'use strict';

app.controller('alertMessageCtrl', ['$scope', '$modalInstance', '$timeout', 'headerText', 'bodyMessage',function ($scope, $modalInstance, $timeout, headerText, bodyMessage) {

  $scope.headerText =  headerText;
  $scope.bodyMessage = bodyMessage;

  $scope.discard = function () {
    $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $timeout(function () {
    var mainParent = $(".modal-dialog");
    mainParent.before("<div id='confirmbackdrop' ng-style='{'z-index': 1040 + index*10}' ng-class='{in: animate}' class='modal-backdrop fade in' modal-backdrop='' style='z-index: 1050;'></div>")
  }, 20);

}]);