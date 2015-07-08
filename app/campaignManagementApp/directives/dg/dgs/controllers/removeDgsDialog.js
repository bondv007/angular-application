/**
 * Created by Ofir.Fridman on 12/14/14.
 */
'use strict';

app.controller('removeDgsDialogCtrl', ['$scope', '$modalInstance','targetAudienceName', function ($scope,  $modalInstance,targetAudienceName) {
    $scope.targetAudienceName = targetAudienceName;
    $scope.discard = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);