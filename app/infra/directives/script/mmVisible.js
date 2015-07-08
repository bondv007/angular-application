

(function () {

/**
 * Created by matan.werbner on 2/25/15.
 */


app.directive('mmVisible', function () {
    return function (scope, element, attr) {
        scope.$watch(attr.mmVisible, function (visible) {
            element.css('visibility', visible ? 'visible' : 'hidden');
        });
    };
})

})(angular);