/**
 * Created by Rick.Jones on 9/11/14.
 */
app.directive('noteItem', ['panelFactory', 'appService', '$timeout', 'modalFactory', 'decisionTreeService', 'csb',
    function(panelFactory, appService, $timeout, modalFactory, decisionTreeService, csb){

        return {
            restrict: 'A',
            replace:true,
            scope: {
                noteItem: '='
            },
            templateUrl: 'csbApp/app/directives/views/canvas/noteItem.html',
            link: function(scope, element){

                scope.appService = appService;

                // this is the element that will have the highlighted style when selecting the note
                var inner = $(element.context.childNodes[1]);

                scope.noteItem.label = scope.noteItem.label || '';
                scope.noteItem.arrow = scope.noteItem.arrow || 'bottom';

                // create tabIndex property so we can delete nodes
                element.attr('tabIndex', -1);

                // remove the browser outline of the decision element that is focused
                element.css('outline', 0);

                var selectNote = function() {

                  if ( csb.params.permissions.edit ) {

                    // adding a timeout just in case, I had to do this on the other sketching tools as well
                    $timeout(function () {
                      // https://github.com/fraywing/textAngular/issues/64
                      // textAngular won't change its content unless we do this :(
                      angular.element(':focus').blur();

                      // tell appService what kind of item is being selected
                      appService.selectedCanvasItem = scope.noteItem;

                      // set the selected note item
                      panelFactory.setSelectedNote(scope.noteItem);

                      // removing the selected decision so the highlight from the decision goes away
                      decisionTreeService.setSelectedDecision(null);
                    });
                  }

                };


                var keyHandler = function(event){

                    event.preventDefault();
                    event.stopPropagation();

                    if( ( event.keyCode == 46 || event.keyCode == 8 ) )

                        modalFactory.showPrompt('Delete Note', 'Are you sure you want to permanently delete this note?')
                            .then(function(result){

                                if(result == 'ok'){

                                    // delete the note
                                    $timeout(function(){
                                        appService.deleteNote(scope.noteItem);
                                    }, 100);
                                }

                                // close the panel
                                panelFactory.showPanelUI = false;

                            });
                };

                element.bind('click', selectNote);

                // delete the decision element when the user hits the 'delete' key on the user's keyboard
                element.bind('keydown keypress', keyHandler);


                scope.onElementDrag = function(event, ui){
                    // update position

                    var draggedElement = $(ui.helper);
                    var main = $('.main');
                    var right = main.width() - (draggedElement.width() + 2);
                    var bottom = main.height() - 31;

                    if(ui.position.left <= 0){
                        ui.position.left = 0;
                    }

                    if(ui.position.top <= 0){
                        ui.position.top = 0;
                    }

                    if(ui.position.top >= bottom){
                        ui.position.top = bottom;
                    }

                    if(ui.position.left >= right){
                        ui.position.left = right;
                    }

                    var note_id = draggedElement.attr('id');
                    var style = {left: ui.position.left, top: ui.position.top};
                    appService.updateNoteStyle(note_id, style);

                };

                scope.onElementDragStart = function() {
                    selectNote();
                };

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
                    };
                };


                scope.dragOptions = function(){

                    return {
                        containment: '#note-canvas'
                    };
                };

                scope.closePanel = function(){
                    $timeout(function(){
                        panelFactory.showPanelUI = false;

                    }, 100);

                };

                scope.$on('$destroy', function() {
                    element.off('click', selectNote);

                    // delete the decision element when the user hits the 'delete' key on the user's keyboard
                    element.unbind('keydown keypress', keyHandler);
                });
            }
        };
    }
]);
