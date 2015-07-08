/**
 * Created by atd on 10/31/2014.
 */
app.directive("loadOnScroll", function () {
	return function (scope, elem, attrs) {
		var scrollContainer = $("." + attrs.containerClass)
		var raw = scrollContainer[0];
		scrollContainer.bind("scroll", function () {
			if (raw.scrollTop + raw.offsetHeight + 5 >= raw.scrollHeight) {
				scope.$apply(attrs.loadOnScroll);
			}
		});
	}
});