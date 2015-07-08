/**
 * Created by rotem.perets on 2/8/15.
 */
app.directive( 'textBoxPanel', [ 'panelFactory', '$timeout', 'textAngularManager', 'csb',
  function( panelFactory, $timeout, textAngularManager, csb ) {

    return {
      restrict: 'A',
      replace: true,
      scope: {
        showPanel: '=',
        selectedTextBox: '=',
        closePanelUi: '&'
      },
      templateUrl: 'csbApp/app/directives/views/rightPanel/addTextBoxUI.html',
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

        panelFactory.validatePanel(scope, panelFactory.diagramTypes.SKETCHING_TOOLS_TEXT_BOX, init);

        /*
         * This method will toggle the border around the textbox
         */
        scope.toggleBorder = function() {

          // toggling the border
          scope.selectedTextBox.showBorder = !scope.selectedTextBox.showBorder;

          // switching the text on the button's label
          scope.borderLabel = scope.selectedTextBox.showBorder ? 'Hide Border' : 'Show Border';

        };

        function init() {

          // default values for the border variables
          if (typeof scope.selectedTextBox.showBorder === 'undefined') {
            scope.selectedTextBox.showBorder = true;
            scope.borderLabel = 'Hide Border';
          } else {
            scope.borderLabel = scope.selectedTextBox.showBorder ? 'Hide Border' : 'Show Border';
          }

          var editorScope = textAngularManager.retrieveEditor('defaultEditor').scope;

          scope.textBoxLabel = angular.copy(scope.selectedTextBox.label);

          scope.originalLabel = angular.copy(scope.selectedTextBox.label);

          // select the name input when opening the panel.. have to use timeout on this one
          $timeout(function() {

            var innerTaTextElementId = editorScope.displayElements.text[0].id;
            placeCaretAtEnd( document.getElementById(innerTaTextElementId));
          });

        };

        scope.closePanel = function(){

          scope.selectedTextBox = null;

          // hide panel
          scope.closePanelUi();
        };


        scope.cancelChanges = function(){
          scope.selectedTextBox.label = scope.originalLabel;
          scope.closePanel();
        };

        scope.save = function(){
          scope.closePanel();
        };
      }
    }

  }
]);