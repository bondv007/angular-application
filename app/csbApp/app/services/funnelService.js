/**
 * Created by Ofir.Fridman on 1/12/15.
 */
'use strict';
app.service('funnelService', ['unSavedChangesService', '$q', 'traffickingConst', function (unSavedChangesService, $q, traffickingConst) {

  function checkForUnSavedChanges() {
    var defer = $q.defer();
    unSavedChangesService.checkForUnSavedChanges().then(function (result) {
      defer.resolve(result);
    });
    return defer.promise;
  }

  function getDefaultTa(decision) {
    var defaultTa = {id: null, name: traffickingConst.strDefaultAudience, isSelected: false};
    if (decision && decision.length > 0) {
      defaultTa.name = getDefaultTaName(decision[0]);
    }
    return defaultTa;
  }

  function getDefaultTaName(decision) {
    var defaultName = findDefaultTa(decision);
    if (!defaultName) {
      defaultName = traffickingConst.strDefaultAudience;
    }
    return defaultName;
  }

  function findDefaultTa(decision) {
    var defaultTaName = null;
    var noDecisions;
    for (var i = 0; i < decision.noDecisions.length; i++) {
      noDecisions = decision.noDecisions[i];
      if (noDecisions.noDecisions.length > 0) {
        defaultTaName = findDefaultTa(noDecisions);
      }
      else {
        return noDecisions.name;
      }
    }
    return defaultTaName;
  }

  return {
    checkForUnSavedChanges: checkForUnSavedChanges,
    getDefaultTa: getDefaultTa
  };
}]);
