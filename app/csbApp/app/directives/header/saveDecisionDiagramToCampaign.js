/**
 * Created by rotem.perets on 2/8/15.
 */
app.directive( 'saveDecisionDiagramToCampaign', ['saveDecisionDiagramService', function(saveDecisionDiagramService) {
    return {
      restrict: 'A',
      scope: {
        setStrategyVars: '&'
      },
      link: function( scope, element, attrs ) {
        /**
         * opens and inits the modal for saving the campaign
         */
        element.bind( 'click', function() {
          saveDecisionDiagramService.saveToCampaign(scope);
        });
      }
    }
  }
]);