/**
 * Created by rotem.perets on 2/8/15.
 */
app.directive('audienceSegmentPanel', ['panelFactory', 'decisionTreeService', '$timeout', 'csb',
  function(panelFactory, decisionTreeService, $timeout, csb) {
    return {
      restrict: 'A',
      replace: true,
      scope: {
        decision: '=',
        showPanel: '=',
        closePanelUi: '&'
      },
      templateUrl: 'csbApp/app/directives/views/rightPanel/audienceSegmentUI.html',
      link: function( scope, element, attrs ) {
        scope.csb = csb;
        // validate and init the panel
        panelFactory.validatePanel(scope, panelFactory.diagramTypes.AUDIENCE_SEGMENT, init);

        function init() {

          scope.originalDecision = angular.copy( scope.decision );

          // setting a var on scope so we don't edit decision directly
          scope.segmentName = {};
          scope.segmentName.text = angular.copy( scope.decision.name );
          // and making another copy so we can reset it
          scope.originalName = angular.copy( scope.decision.name );

          // select the name input when opening the panel.. have to use timeout on this one
          $timeout(function() {
            element.find('input').first().focus().select();
          });

        };// select the name input when opening the panel

        scope.save = function() {
          // set the var as the decision name and limit to 90 (also have maxlength on the html input)
          scope.decision.name = scope.segmentName.text.substring(0,90);

          // we are going to set a flag for whether it has a custom name so we know whether to update it or not
          if ( scope.segmentName.text != scope.originalName ) {
            scope.decision.customName = true;
          }

          // don't remove
          decisionTreeService.buildAudienceSegmentsFromDiagram();
          scope.closePanelUi();
        }

        scope.cancel = function() {
          // reset the decision name back to the original
          scope.decision.name = scope.originalName;

          scope.closePanelUi();
        }
      }
    }
  }
]);