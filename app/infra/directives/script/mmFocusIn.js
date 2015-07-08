/**
 * Created by atd on 6/20/2014.
 */

app.directive('mmFocusIn', function() {
	return function(scope, element, attr) {
		element.bind('focusin', function () {
			//apply scope (attributes)
			scope.$apply(attr.mmFocusIn);
		});

        scope.$on('$destroy', function() {
            element.off('focusin');
        });
	};
});
