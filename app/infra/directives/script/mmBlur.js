/**
 * Created by atd on 6/20/2014.
 */

app.directive('mmBlur', function() {
	return function(scope, element, attr) {
		element.bind('focusout', function () {
			//apply scope (attributes)
			scope.$apply(attr.mmBlur);
		});

		scope.$on('$destroy', function() {
			element.off('focusout');
		});
	};
});