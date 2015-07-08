/**
 * Created by rotem.perets on 2/8/15.
 */
/**
 * NEED TO UPDATE THIS DIRECTIVES TO USE THE NEW CODE
 */

app.directive( 'dynamicRetargetingPanel', [ 'GraphFactory', 'csb',
  function( GraphFactory, csb ) {

    return {
      restrict: 'A',
      replace: true,
      scope: {
        closePanelUi: '&'
      },
      templateUrl: 'csbApp/app/directives/views/rightPanel/dynamicRetargetingUI.html',
      link: function( scope, element, attrs ) {
        scope.csb = csb;
        // handle iteractions with the dom and model here
        // in a completely isolated scope.. no worrying about conflicting issues

        scope.showUI = false;

        WatcherUtils.watchFactoryChange(scope, GraphFactory, 'currentSelectedItem', function(){

          if(GraphFactory.currentSelectedItem != null)
            scope.showUI = GraphFactory.currentSelectedItem.type == GraphFactory.diagramTypes.DYNAMIC_RETARGETING;

        });

      }
    }

  }
]);