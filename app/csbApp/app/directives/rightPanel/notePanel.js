/**
 * Created by rotem.perets on 2/8/15.
 */
app.directive( 'notePanel', [ 'panelFactory', '$timeout', 'textAngularManager', 'csb',
  function( panelFactory, $timeout, textAngularManager, csb ) {

    return {
      restrict: 'A',
      replace: true,
      scope: {
        showPanel: '=',
        selectedNote: '=',
        closePanelUi: '&'
      },
      templateUrl: 'csbApp/app/directives/views/rightPanel/addNoteUI.html',
      link: function( scope, element, attrs ) {
        scope.csb = csb;
        /**
         TextAngular: This is going to aid to select the text inside the textArea whenever the panel is open
         https://github.com/fraywing/textAngular/issues/453#issuecomment-66935547
         */
        function createCaretPlacer(atStart) {
          return function(el) {
            el.focus();
            if (typeof window.getSelection != "undefined"
                && typeof document.createRange != "undefined") {
              var range = document.createRange();
              range.selectNodeContents(el);
              var sel = window.getSelection();
              sel.removeAllRanges();
              sel.addRange(range);
            } else if (typeof document.body.createTextRange != "undefined") {
              var textRange = document.body.createTextRange();
              textRange.moveToElementText(el);
              textRange.select();
            }
          };
        }

        var placeCaretAtStart = createCaretPlacer(true);
        var placeCaretAtEnd = createCaretPlacer(false);


        // handle interactions with the dom and model here
        // in a completely isolated scope.. no worrying about conflicting issues
        panelFactory.validatePanel(scope, panelFactory.diagramTypes.SKETCHING_TOOLS_NOTE, init);

        function init(){

          scope.setArrowDirection(scope.selectedNote.arrow);

          var editorScope = textAngularManager.retrieveEditor('noteEditor').scope;

          scope.noteLabel = angular.copy(scope.selectedNote.label);

          scope.noteArrow = angular.copy(scope.selectedNote.arrow);

          scope.originalLabel = angular.copy(scope.selectedNote.label);

          scope.originalArrow = angular.copy(scope.selectedNote.arrow);

          // select the name input when opening the panel.. have to use timeout on this one
          $timeout(function() {

            var innerTaTextElementId = editorScope.displayElements.text[0].id;

            // TODO: this is a hack, since textAngular was not updating it's text, this needs to be addressed
            $('#'+innerTaTextElementId).html(scope.noteLabel);

//                        console.log(editorScope.displayElements.text);
//                        console.log(document.getElementById(innerTaTextElementId));

            // editorScope.displayElements.text.trigger('focus');
            placeCaretAtEnd( document.getElementById(innerTaTextElementId));

            // the following line seems not to be doing any difference
            // textAngularManager.refreshEditor('noteEditor');
          });

        };

        scope.setArrowDirection = function(direction) {
          scope.selectedNote.arrow = direction;
        }

        scope.closePanel = function(){

          scope.selectedNote = null;
          // hide panel
          scope.closePanelUi();
        };


        scope.cancelChanges = function(){
          scope.selectedNote.label = scope.originalLabel;
          scope.selectedNote.arrow = scope.originalArrow;
          scope.closePanel();
        };

        scope.save = function(){
          scope.closePanel();
        };
      }
    }

  }
]);