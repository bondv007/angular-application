/**
 * Created by atd on 6/30/2014.
 */
app.directive('mmDraggable', function () {
  return {
    restrict: 'A',
    scope: {
      enableDrag: "=enable",
      container: "@?"
    },
    link: function (scope, element, attrs) {
      scope.$watch("enableDrag", function () {
        if (typeof scope.enableDrag == "undefined" || scope.enableDrag) {
        
          var options = {
            cursor: "move",
            revert: false,
            start: function (event, ui) {
            },
            stop: function (event, ui) {
            },
            containment: scope.container,
            scroll: false

          };
          if(scope.container)
          {
            options.containment = scope.container;
            options.scroll = false;
          }
          element.draggable(options);
          element.draggable('enable');
        }
        else if (!scope.enableDrag && element.hasClass("ui-draggable")) {
          element.draggable('disable');
        }
      });
    }
  }
});