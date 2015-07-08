/**
 * Created by yoav.karpeles on 12/30/13.
 *
 *
 * how to use:
 *
 * <input ng-init="focus=true" auto-focus="focus" ...>
 */
app.directive('autoFocus', ['$timeout', '$parse', function($timeout, $parse) {
	return {
		link: function(scope, element, attrs) {
			var model = $parse(attrs.autoFocus);
			var watcher = scope.$watch(model, function(value) {
				if(value === true) {
					$timeout(function() {
						element.parents("form").find("input").trigger('input').trigger('change').trigger('keydown');
						element[0].focus();
					}, 500);
				}
			});
			element.bind('blur', function() {
				scope.$apply(model.assign(scope, false));
			})



			scope.$on('$destroy', function() {
				if (watcher){
					watcher();
					element.off('blur');
				}
			});


		}
	};
}]);
