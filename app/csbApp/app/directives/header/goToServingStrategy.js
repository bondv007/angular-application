/**
 * Created by rotem.perets on 2/8/15.
 */
app.directive('goToServingStrategy', ['headerService',
  function (headerService) {
    return {
      restrict: 'A',
      scope: {},
      link: function (scope, element, attrs) {
        element.bind('click', function () {
          headerService.goToServingStrategy();
        });

        scope.$on('$destroy', function() {
          element.off('click');
        });
      }
    };
  }
]);