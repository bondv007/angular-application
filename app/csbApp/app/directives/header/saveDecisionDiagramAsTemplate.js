/**
 * Created by rotem.perets on 2/8/15.
 */
app.directive('saveDecisionDiagramAsTemplate', [ 'saveDecisionDiagramService',
  function( saveDecisionDiagramService ) {

    return {
      restrict: 'A',
      scope: {
        templates: '=',
        setStrategyVars: '&'
      },
      link: function( scope, element, attrs ) {
        // create the diagram object to store some data about it
        scope.decisionDiagram = {};

        // open the modal and init some vars
        element.bind( 'click', function() {
          saveDecisionDiagramService.saveToTemplate(scope);
        });
      }
    }
  }
]);