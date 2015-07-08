/**
 * Created by Axel.Martínez on 12/11/14.
 */
app.directive('textBoxItem', ['panelFactory', 'appService', '$timeout', 'modalFactory', 'decisionTreeService', 'csb',
    function(panelFactory, appService, $timeout, modalFactory, decisionTreeService, csb){

        return {
            restrict: 'A',
            replace: true,
            scope: {
                textBoxItem: '='
            },
            templateUrl: 'csbApp/app/directives/views/textBoxItem.html',
            link: function(scope, element){

                scope.appService = appService;

                // this is the element that will have the highlighted style when selecting the text box
                var inner = $(element.context.childNodes[1]);

                // create tabIndex property so we can delete nodes
                element.attr('tabIndex', -1);

                // remove the browser outline of the decision element that is focused
                element.css('outline', 0);

                var selectTextBox = function() {

                  if ( csb.params.permissions.edit ) {

                    // wrapping in a timeout because sometimes the panel does not
                    // refresh and the "toggle border" button doesn't update its label
                    $timeout(function() {

                      // https://github.com/fraywing/textAngular/issues/64
                      // textAngular won't change its content unless we do this :(
                      angular.element(':focus').blur();

                      // tell appService what kind of item is being selected
                      appService.selectedCanvasItem = scope.textBoxItem;

                      // set the selected TextBox item
                      panelFactory.setSelectedTextBox(scope.textBoxItem);

                      // removing the selected decision so the highlight from the decision goes away
                      decisionTreeService.setSelectedDecision(null);

                    });
                  }

                };

                element.on('click', selectTextBox);

                // delete the decision element when the user hits the 'delete' key on the user's keyboard
                element.bind('keydown keypress', function(event){

                    event.preventDefault();
                    event.stopPropagation();

                    if( ( event.keyCode == 46 || event.keyCode == 8 ) )

                        modalFactory.showPrompt('Delete Text Box?', 'Are you sure you want to delete this text box?')
                            .then(function(result){

                                if(result == 'ok'){

                                    // delete the TextBox
                                    $timeout(function(){
                                        appService.deleteTextBox(scope.textBoxItem);
                                    }, 100);
                                }

                                // close the panel
                                panelFactory.showPanelUI = false;

                            });
                });




              scope.onElementDrag = function(event, ui){
                    // update position
                    var draggedElement = $(ui.helper);
                    var right = $('.main').width() - (draggedElement.width() + 2);
                    var bottom = $('.main').height() - 31;

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

                    var textBox_id = draggedElement.attr('id');
                    var style = {left: ui.position.left, top: ui.position.top};
                    appService.updateTextBoxStyle(textBox_id, style);

                };

              scope.onElementDragStart = function() {
                selectTextBox();
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
            }
        };
    }
]);
