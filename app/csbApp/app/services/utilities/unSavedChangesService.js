/**
 * Created by Ofir.Fridman on 1/12/15.
 */
'use strict';
app.service('unSavedChangesService', ['$rootScope', 'mmModal','$q', function ($rootScope, mmModal, $q) {
    function checkForUnSavedChanges() {
        var defer = $q.defer();
        if ($rootScope.isDirtyEntity) {
            displayUnSavedChangesModal().then(function(result){
                defer.resolve(result);
            });
        }
        else{
            defer.resolve(true);
        }
        return defer.promise;
    }

    function displayUnSavedChangesModal() {
        var defer = $q.defer();
        var modalInstance = mmModal.open({
            templateUrl: './infra/infraModalMessages/unSavedChanges/views/mmUnSavedChanges.html',
            controller: 'mmDiscardDialogCtrl',
            title: "Are you sure you want to leave this page?",
            modalWidth: 420,
            bodyHeight: 86,
            discardButton: { name: "Stay on this page", funcName: "cancel" },
            confirmButton: { name: "Leave this page", funcName: "discard"}
        });
        modalInstance.result.then(function () { // Case move
            $rootScope.isDirtyEntity = false;
            defer.resolve(true);
        }, function () { // Case stay
            $rootScope.isDirtyEntity = true;
            defer.resolve(false);
        });
        return defer.promise;
    }


    return {
        checkForUnSavedChanges: checkForUnSavedChanges
    };
}]);