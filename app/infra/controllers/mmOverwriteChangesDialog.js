/**
 * Created by liad.ron on 1/20/2015.
 */

app.controller('mmOverwriteChangesDialogCtrl', ['$scope', '$modalInstance', 'entity', function ($scope,  $modalInstance, entity){

  $scope.keepChanges = function () {
    $modalInstance.dismiss(false);
  };

  $scope.overwriteChanges = function () {
    $modalInstance.close(true);
  };

  manipulateTextMsg();

  function manipulateTextMsg(){
    var msg;
    if (entity === "advertiser")
      msg = "an advertiser";
    else if (entity === "campaign")
      msg = "a campaign";

    $scope.textMsg = "Changing " + msg + " will remove any information entered under Settings and Contacts sections. Would you like to proceed?";
  }
}]);
