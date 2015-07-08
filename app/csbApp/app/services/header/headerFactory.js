/**
 * Created by rotem.perets on 2/11/15.
 */
app.factory('headerFactory', ['csb', '$state', 'modalFactory', 'decisionTreeService', 'appService',
  function (csb, $state, modalFactory, decisionTreeService, appService) {
    var pub = {};

    pub.goToServingStrategy = function () {
      if (!angular.equals(angular.copy(decisionTreeService.original), angular.copy(decisionTreeService.decisions))) {
        modalFactory.showPrompt('Warning', 'You need to save your campaign before switching to the Serving Strategy page.', { showCancelButton: false });
        return false;
      }

      else if (!appService.csbData.targetAudienceIDs.length) {
        modalFactory.showPrompt('Warning', 'You need to save your template to a campaign before switching to the Serving Strategy page.', { showCancelButton: false });
        return false;
      }

      if (csb.config.env == 'mdx2') {
        var stateParamsObject = {
          DecisionDiagramID: csb.params.diagramID,
          SessionID: csb.params.sessionID,
          AccountID: csb.params.accountID,
          UserID: csb.params.userID,
          EnvID: csb.config.envID
        }
        $state.go('csb-trafficking', stateParamsObject);
      }
      else {
        var stateParamsObject = {
          diagramID: csb.params.diagramID
        }
        $state.go('spa.campaign.servingStrategies', stateParamsObject);
      }
    }

    return pub;
  }]);