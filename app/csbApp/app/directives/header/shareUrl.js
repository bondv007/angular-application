/**
 * Created by rotem.perets on 2/8/15.
 */
app.directive('shareUrl', ['headerService',
  function(headerService) {
    return{
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        var clickHandler = function() {
          headerService.shareUrl(scope);
        };

        element.on('click', clickHandler);

        scope.$on('$destroy', function() {
          element.off('click', clickHandler);
        });
      }
    }
  }
]);