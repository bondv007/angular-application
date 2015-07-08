/**
 * Created by rotem.perets on 2/8/15.
 */
app.directive( 'exportTree', [ 'headerService',
  function(headerService) {
    return {
      restrict: 'A',
      link: function( scope, element, attrs ) {
        element.bind( 'click', function() {
          headerService.exportToPdf(scope);
        });
      }
    }
  }
]);