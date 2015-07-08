 /*
  * Created by Axel.Martínez on 12/16/14.
 */
app.directive('arrowItem', ['panelFactory', 'appService', '$timeout', 'modalFactory', 'decisionTreeService', 'csb',
    function(panelFactory, appService, $timeout, modalFactory, decisionTreeService, csb){

        return {
            restrict: 'A',
            replace: true,
            scope: {
                arrowItem: '='
            },
            templateUrl: 'csbApp/app/directives/views/arrowItem.html',
            link: function(scope, element){

                scope.appService = appService;

                // create tabIndex property so we can delete nodes
                element.attr('tabIndex', -1);

                // remove the browser outline of the decision element that is focused
                element.css('outline', 0);

                // applying the style to rotate the arrow in case that it
                // already existed
                if (scope.arrowItem.rotation) element.css(scope.arrowItem.rotation);

                element.focus();

                var selectArrow = function(){

                  if ( csb.params.permissions.edit ) {

                    // timeout to give the app time to catch the change in appService
                    $timeout(function() {

                      // tell appService what kind of item is being selected
                      appService.selectedCanvasItem = scope.arrowItem;

                      // This is still needed because panelFactory has a handle of the type of
                      // item that has been selected and that info is used when the user
                      // tries to delete an item
                      panelFactory.setSelectedArrow(scope.arrowItem);


                      // removing the selected decision so the highlight from the decision goes away
                      decisionTreeService.setSelectedDecision(null);

                      // close the panel if open
                      panelFactory.showPanelUI = false;

                    });
                  }
                };


                var keyHandler = function(event){

                    event.preventDefault();
                    event.stopPropagation();

                    if( ( event.keyCode == 46 || event.keyCode == 8 ) )

                        modalFactory.showPrompt('Delete Arrow?', 'Are you sure you want to delete this arrow?')
                            .then(function(result){

                                if(result == 'ok'){

                                    // delete the arrow
                                    $timeout(function(){
                                        appService.deleteArrow(scope.arrowItem);
                                    }, 100);
                                }

                                // close the panel
                                panelFactory.showPanelUI = false;

                            });
                };

                element.on('click', selectArrow);

                // delete the decision element when the user hits the 'delete' key on the user's keyboard
                element.bind('keydown keypress', keyHandler);

                scope.onElementDrag = function(event, ui){
                    //update position


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

                    var arrow_id = draggedElement.attr('id');

                    var style = {left: ui.position.left, top: ui.position.top};
                    appService.updateArrowStyle(arrow_id, style);

                };

                scope.onElementDragStart = function(event, ui){

                  selectArrow();

                };

                /**
                 * This variable will hold the calculated length of the arrow
                 * to be able to place the handle again on the tip of the arrow.
                 */
                scope.lineLength = 0;


                /**
                 * This method will be called while the handle for the arrow is being dragged
                 * arround. It calculates the arrows direction and length starting
                 * from the origin (the leftmost point for the arrow) and ending on the mouse pointer.
                 */
                scope.dragHandle = function(event, ui) {

                    // these are the coordinates for the origin of the arrow
                    var x0 = ui.helper.context.parentNode.offsetLeft - 2;
                    var y0 = ui.helper.context.parentNode.offsetTop - 2;

                    // these are the coordinates for the mouse pointer
                    // taking into account the sidebar's width
                    // and the header height
                    // and the padding of the canvas
                    var x1 = ui.offset.left - $('.sidebar').width();
                    var y1 = ui.offset.top - $('.top-menu-nav').outerHeight();

                    var length = Math.sqrt((x1-x0)*(x1-x0) + (y1-y0)*(y1-y0)) - 10;
                    var angle  = Math.atan2(y1 - y0, x1 - x0);
                    var transform = 'rotate('+angle+'rad)';

                    // storing it to use it later on
                    scope.lineLength = length;

                    // identifying the arrow element
                    var arrow = $(ui.helper.context.parentNode);

                    // storing in an object so that it can be added to the
                    // arrow for saving purposes
                    var rotation = {
                          'position': 'relative',
                          '-webkit-transform':  transform,
                          '-moz-transform':     transform,
                          'transform':          transform
                        };

                    // applying the width and rotation to the arrow
                    arrow
                        .width(length)
                        .css(rotation);

                    // adding rotation information to the
                    // arrowItem so that it can be persisted
                    scope.arrowItem.rotation = rotation;
                };

                /*
                 * This method will be called when the dragging of the handler starts.
                 */
                scope.draggingHandleStarts = function(event, ui) {

                    // hiding the handler since it displays some kind of
                    // an erratic behaviour while dragging :(
                    $(ui.helper).hide();
                };

                /*
                 * This method will be called when the mouse is released after dragging the
                 * handle
                 */
                scope.draggingHandleStops = function(event, ui) {

                    /*Repositioning the handle on the tip of the arrow and
                    displaying it again*/

                    // accounts for the arrow head
                    $(ui.helper).css({left: scope.lineLength + 10});
                    // accounts for the handler's height
                    $(ui.helper).css('top','-2.5px');

                    $(ui.helper).fadeIn('fast');
                };


                scope.arrowHandleSettings = function() {
                    return {
                        onStart: 'draggingHandleStarts',
                        onDrag: 'dragHandle',
                        onStop: 'draggingHandleStops'
                    };
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

                scope.$on('$destroy', function() {

                    element.off('click', selectArrow);

                    // delete the decision element when the user hits the 'delete' key on the user's keyboard
                    element.unbind('keydown keypress', keyHandler);
                });
            }
        };
    }
]);
