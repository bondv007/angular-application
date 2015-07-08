/**
 * Created by reut.sar-Israel on 1/25/2015.
 */

'use strict';

app.service('mediaValidationService', ['mmModal', '$q', function(mmModal, $q){

  function openOverwriteChangesModal(context){
    var deferred = $q.defer();
    var modalInstance = mmModal.open({
      templateUrl: './infra/infraModalMessages/overwriteChanges/views/mmOverwriteChanges.html',
      controller: 'mmOverwriteChangesDialogCtrl',
      title: manipulateTitle(context.toLowerCase()),
      modalWidth: 450,
      bodyHeight: 90,
      confirmButton: { name: "apply selection", funcName: "overwriteChanges", hide: false, isPrimary: true},
      discardButton: { name: "cancel selection", funcName: "keepChanges"},
      resolve: {
        entity: function(){
          return context.toLowerCase();
        }
      }
    });

    modalInstance.result.then(function(overwrite){
      deferred.resolve(overwrite);
    },function(overwrite){
      deferred.resolve(overwrite)
    });
    return deferred.promise;
  }

  function manipulateTitle(context){
    var title = "ARE YOU SURE YOU WANT TO CHANGE ";
    if (context === "advertiser")
      title = title + "AN ADVERTISER?";
    else if (context === "campaign")
      title = title + "A CAMPAIGN?";
    return title;
  }

  return {
    openOverwriteChangesModal: openOverwriteChangesModal
  };

}]);
