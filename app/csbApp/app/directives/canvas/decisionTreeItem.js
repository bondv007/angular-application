/**
 * Created by geff.gunderson
 * Split from original file by rotem.perets on 2/8/15.
 */
app.directive( 'decisionTreeItem', [ 'GraphFactory', 'panelFactory','decisionTreeService', '$timeout', 'csb', 'modalFactory', 'appService', 'mmUtils', 'enums',
  function( GraphFactory, panelFactory, decisionTreeService, $timeout, csb, modalFactory, appService, mmUtils, enums) {
    return {
      restrict: 'A',
      scope: {
        decision: '=',
        highlight: '='
      },
      templateUrl: 'csbApp/app/directives/views/canvas/decision-tree-item.html',
      link: function (scope, element, attrs) {

          // using the same technique to display icons in the audience segments that is used in the funnel
        scope.decisionIconMap = enums.csbFunnelDecisionIconMap;

        scope.itemId = mmUtils.clientIdGenerator.next();
        scope.decisionTreeService = decisionTreeService;
        scope.GraphFactory = GraphFactory;

        scope.active = false;

        // action on drop
        scope.onDrop = function (event, ui) {

          if ( csb.params.permissions.edit ) {

            var data = ui.draggable.data();
            var draggedItem = GraphFactory.getGraphItem(data.graphId);

            if ( draggedItem
                && scope.decision.type == GraphFactory.diagramTypes.AUDIENCE_SEGMENT
                && draggedItem.type != GraphFactory.diagramTypes.SKETCHING_TOOLS_NOTE
                && draggedItem.type != GraphFactory.diagramTypes.SKETCHING_TOOLS_TEXT_BOX
                && draggedItem.type != GraphFactory.diagramTypes.SKETCHING_TOOLS_ARROW ) {

              // change the decision type
              scope.decision.name = draggedItem.name;
              scope.decision.type = draggedItem.type;
              scope.decision.icon = draggedItem.icon;
              scope.editDecision(scope.decision);

            } else {
              // scope.addDecision(scope.decision, event, ui);
              // console.log('not adding because you can only drop new items on an audience segment');
            }
          }
          else {
            // console.log('no permission to add a node.. not really needed because we should be hiding any controls');
          }
        }

        // when we want to edit a decision -> popup the panel and set the new model
        scope.editDecision = function ( decision ) {

          panelFactory.showPanel( decision.type );
          panelFactory.setDecisionModel( decision );

          // set the selected decision rule in the decisionTreeService
          decisionTreeService.setSelectedDecision(scope.decision);

          // no sketching tools are selected when selecting a decision
          appService.selectedCanvasItem = null;

          // set focus // TODO what is this focusing? probably should remove
          element.focus();

        }

        /**
         * This method is the draggable options for elements already on the canvas
         *
         * @returns {{onStart: onElementDrag, onStop: onElementDrag, onDrag: onElementDrag}}
         */
        scope.elementDraggableSettings = function()
        {
          return {
            onStart: 'onElementDragStart',
            onStop: 'onElementDrag',
            onDrag: 'onElementDrag'
          }
        }

        scope.onElementDragStart = function(event, ui){
          $timeout(function() {
            // tell appService what kind of item is being selected
            appService.selectedCanvasItem = scope.decision;

            // This is still needed because panelFactory has a handle of the type of
            // item that has been selected and that info is used when the user
            // tries to delete an item
            panelFactory.setSelectedArrow(scope.decision);


            // removing the selected decision so the highlight from the decision goes away
            decisionTreeService.setSelectedDecision(null);

            // close the panel if open
            panelFactory.showPanelUI = false;
          });
        }

        scope.onElementDrag = function(event, ui){
          //Currently disabled
          event.preventDefault();
          return;


          if(!scope.decision || scope.decision.noDecisions.length < 1) {
            event.preventDefault();
            return;
          }

          //update position
          var draggedElement = $(ui.helper);
          var right = $('.main').width() - (draggedElement.width() + 2);
          var bottom = $('.main').height() - 31;
//          if(ui.position.left <= -90){
//            ui.position.left = -90;
//          }
//
//          if(ui.position.top <= 0){
//            ui.position.top = 0;
//          }

          if(ui.position.top >= bottom){
            ui.position.top = bottom;
          }

          if(ui.position.left >= right){
            ui.position.left = right;
          }
        }
      }
    }
  }
]);