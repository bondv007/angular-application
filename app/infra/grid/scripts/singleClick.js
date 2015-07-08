/**
 * Created by atdg on 8/15/14.
 *
 * Directive to differentiate between single and double click and allow use of both
 * at same time on same element
 */
app.directive('sglclick', ['$parse', function($parse) {
	return {
		restrict: 'A',
		link: function(scope, element, attr) {
			var fn = $parse(attr['sglclick']);
			var delay = 300, clicks = 0, timer = null;
            var clickHandler = function (event) {
                clicks++;  //count clicks
                if(clicks === 1) {
                    timer = setTimeout(function() {
                        scope.$apply(function () {
                            fn(scope, { $event: event });
                        });
                        clicks = 0;             //after action performed, reset counter
                    }, delay);
                } else {
                    clearTimeout(timer);    //prevent single-click action
                    clicks = 0;             //after action performed, reset counter
                }
            }
			element.on('click', clickHandler);

            scope.$on('$destroy', function() {
                element.off('click', clickHandler);
            });
		}
	};
}])