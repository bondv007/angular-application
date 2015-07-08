/**
 * Created by atdg on 4/8/2014.
 */
app.directive('folderFocus', ['$parse', function($parse) {
    return function(scope, element, attr) {
        var fn = $parse(attr['ngFocus'])
        var focusHandler = function(event) {
            $('.dstFolder').click();
            scope.$apply(function() {
                fn(scope, {$event:event});
            });
        };
        element.bind('focus', focusHandler);

        scope.$on('$destroy', function() {
            element.unbind('focus', focusHandler);
        });
    }
}]);