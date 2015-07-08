/**
 * Created by geff.gunderson
 * Split from original file by rotem.perets on 2/8/15.
 */

app.directive( 'decisionTree', [ 'GraphFactory', 'decisionTreeService', 'panelFactory', 'csb', 'segmentsFactory', 'appService',
  function( GraphFactory, decisionTreeService, panelFactory, csb, segmentsFactory, appService ) {

    return {
      restrict: 'A',
      scope: {},
      templateUrl: 'csbApp/app/directives/views/canvas/decision-tree.html',
      link: function (scope, element, attrs) {

        // bind model to scope
        scope.decisionTreeService = decisionTreeService;
        scope.csbData = appService.csbData;

        // this is just for the first drop on the canvas.. it will only be used once if we are starting from scratch
        scope.onDropFirst = function( event, ui ) {
          if ( csb.params.permissions.edit ) {

            var graphItem = GraphFactory.getGraphItem( ui.draggable.data().graphId );

            if ( graphItem
                && graphItem.type != GraphFactory.diagramTypes.SKETCHING_TOOLS_NOTE
                && graphItem.type != GraphFactory.diagramTypes.SKETCHING_TOOLS_TEXT_BOX
                && graphItem.type != GraphFactory.diagramTypes.SKETCHING_TOOLS_ARROW ) {

              //console.log( graphItem.type );

              var data = {
                name: graphItem.name,
                description: graphItem.name,
                type: graphItem.name
              };

              scope.decision = csb.createDecision(data);
              scope.decision.icon = graphItem.icon;

              decisionTreeService.decisions.push( scope.decision );


              // open the panel and set the current element to be the selected decision
              panelFactory.showPanel( scope.decision.type );
              panelFactory.setDecisionModel( scope.decision );
              decisionTreeService.setSelectedDecision(scope.decision);

              appService.selectedCanvasItem = null;
              // set focus
              element.focus();

            }

          }

        }

      }
    }

  }
]);