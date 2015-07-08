/**
 * Created by Rick.Jones on 8/11/14.
 */

app.controller( 'canvasCtrl', [ '$scope', '$sce', '$timeout', 'GraphFactory', 'appService', 'panelFactory', 'decisionTreeService',
    function($scope, $sce, $timeout, GraphFactory, appService, panelFactory, decisionTreeService){

        $scope.csbData = appService.csbData;
        $scope.htmlContent = '';

        /**
         * This is the method that is called when an element is dropped on the canvas.
         * It will save the object in an array that can be called
         *
         * @param event
         * @param ui
         */
        $scope.onDrop = function(event, ui)
        {


            var droppedItem = angular.element(ui.helper[0]);

            if (droppedItem.hasClass(GraphFactory.cssClasses.SKETCHING_TOOLS_NOTE)) {

                // pushing the note into the collection of notes
                var note = appService.addNote(ui);
                // Show note panel
                panelFactory.setSelectedNote(note);
                // setting the selected item to the note just created
                appService.selectedCanvasItem = note;

                // removing the selected decision so the highlight from the decision goes away
                decisionTreeService.setSelectedDecision(null);


            } else if (droppedItem.hasClass(GraphFactory.cssClasses.SKETCHING_TOOLS_TEXT_BOX)) {

                // pushing the textBox into the collection of textBoxes
                var textBox = appService.addTextBox(ui);
                // Show textBox panel
                panelFactory.setSelectedTextBox(textBox);

                // setting the selected item to the textBox just created
                appService.selectedCanvasItem = textBox;

                // removing the selected decision so the highlight from the decision goes away
                decisionTreeService.setSelectedDecision(null);

            } else if (droppedItem.hasClass(GraphFactory.cssClasses.SKETCHING_TOOLS_ARROW)) {

                // pushing the arrow into the collection of arrows
                var arrow = appService.addArrow(ui);
                //no panel wil be shown, but the call needs to be in place
                panelFactory.setSelectedArrow(arrow);

                // setting the selected item to the arrow just created
                appService.selectedCanvasItem = arrow;

                // removing the selected decision so the highlight from the decision goes away
                decisionTreeService.setSelectedDecision(null);

            }



        };

        $scope.dropOptions = {

            accept: function(draggable){

                var data = draggable.data();

                var graphItem = GraphFactory.getGraphItem(data.graphId);

                if(graphItem && (graphItem.type == GraphFactory.diagramTypes.SKETCHING_TOOLS_NOTE
                             || graphItem.type == GraphFactory.diagramTypes.SKETCHING_TOOLS_TEXT_BOX
                             || graphItem.type == GraphFactory.diagramTypes.SKETCHING_TOOLS_ARROW )){
                    return true;
                }

                return false;
            }
        };


    }
]);
