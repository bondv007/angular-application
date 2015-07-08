/**
 * Created by Rick.Jones on 9/17/14.
 */
app.directive('footerToolbar', [ 'decisionTreeService', 'panelFactory', '$timeout', 'appService', 'csb', 'modalFactory',
  function (decisionTreeService, panelFactory, $timeout, appService, csb, modalFactory) {

    return {
      scope: {},
      templateUrl: 'csbApp/app/directives/views/footer/footerToolbar.html',
      link: function (scope, element, attrs) {
        var closePanel = function () {
          panelFactory.showPanelUI = false;
        };
        /*
         * This function will remove decision items from the canvas
         * and from the diagram that is going to be persisted
         */
        var deleteDecision = function (decision) {
          modalFactory.showPrompt('Delete Decision', 'Are you sure you want to permanently delete this decision?', {height: 110, width: 400})
              .then(function (result) {
                // user clicked on ok
                if (result == 'ok') {
                  $timeout(function () {
                    decisionTreeService.deleteDecision(decision);
                    decisionTreeService.clearSelectedDecision();
                    decisionTreeService.removeAdvertiserIfNeeded();
                  }, 100);
                }
                // close the panel
                closePanel();
              }
          );
        };
        /**
         * This function will remove sketching tool items from the canvas
         * and from the diagram that is going to be persisted
         */
        var deleteSketchingTool = function (type) {

          modalFactory.showPrompt('Delete ' + type, 'Are you sure you want to permanently delete this ' + type.toLowerCase() + '?')
              .then(function (result) {

                if (result == 'ok') {
                  $timeout(function () {

                    if (type == 'Note')     appService.deleteNote(appService.selectedCanvasItem);
                    if (type == 'Text Box') appService.deleteTextBox(appService.selectedCanvasItem);
                    if (type == 'Arrow')    appService.deleteArrow(appService.selectedCanvasItem);

                  }, 100);
                }


                // close the panel
                closePanel();

              }, function (cancelled) { // user clicked on cancel, currently the promise is rejected, not resolving with a 'cancelled' message
                //clearing selectedCanvasItem...
                appService.selectedCanvasItem = null;
              });


        };

        scope.deleteItem = function () {
          var selectedItem = null;

          // Determine whether the currently selected item in the
          // canvas is a sketching tool or a decision type
          // (this is important since decisionTreeService is what holds on to the
          // selected decision, but appService is what holds on to the sketching tool)
          if (panelFactory.sketchingToolSelected && appService.selectedCanvasItem) {
            selectedItem = appService.selectedCanvasItem;
          } else {
            selectedItem = decisionTreeService.selectedDecision;
          }

          // none of the values were empty
          if (selectedItem) {
            switch (selectedItem.type) {
              case panelFactory.diagramTypes.SKETCHING_TOOLS_NOTE:
                deleteSketchingTool('Note');
                break;

              case panelFactory.diagramTypes.SKETCHING_TOOLS_TEXT_BOX:
                deleteSketchingTool('Text Box');
                break;

              case panelFactory.diagramTypes.SKETCHING_TOOLS_ARROW:
                deleteSketchingTool('Arrow');
                break;

              case panelFactory.diagramTypes.AUDIENCE_SEGMENT:
                break;

              default:
                deleteDecision(selectedItem);
                break;
            }
          }
        }

        scope.resetView = function () {
          if (confirm('CONFIRM DELETION:\n\nAre you sure you want to delete all decision rules?')) {
            decisionTreeService.decisions = [];
            appService.deleteAllNotes();
          }
        }

        scope.onDropDelete = function (event, ui) {
          scope.deleteItem();
        }
//                var removeIcon = element.find('.remove-icon');
//
//                removeIcon.droppable({
//                    drop: function(event, ui){
//                        console.log('dropped item!');
//                    }
//                });
      }
    };
  }
]);
