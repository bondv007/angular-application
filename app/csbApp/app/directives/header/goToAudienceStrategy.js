/**
 * Created by rotem.perets on 2/8/15.
 */
app.directive('goToAudienceStrategy', [ 'csb', 'appService', '$state', 'unSavedChangesService',
  function (csb, appService, $state, unSavedChangesService) {

    return{
      restrict: 'A',
      scope: {},
      link: function (scope, element, attrs) {

        element.bind('click', function () {

          if (!appService.csbData.targetAudienceIDs.length) {
            return false;
          }

          unSavedChangesService.checkForUnSavedChanges().then(function (move) {
            if (move) {
              if (csb.config.env == 'mdx2') {
                var stateParamsObject = {
                  DecisionDiagramID: csb.params.diagramID,
                  SessionID: csb.params.sessionID,
                  AccountID: csb.params.accountID,
                  UserID: csb.params.userID,
                  EnvID: csb.config.envID
                }
              }
              else {
                var stateParamsObject = {
                  diagramID: csb.params.diagramID
                }
              }

              $state.go('csb-diagram', stateParamsObject);
            }
          });
        });

      }
    }
  }
]);