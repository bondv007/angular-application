/**
 * Created by atd on 10/30/2014.
 */
app.directive('keyShortcuts', function ($timeout) {
	return function (scope, element, attr) {
		angular.element(document).keydown(function (e) {

			if (e.ctrlKey && e.keyCode == 65) {
				e.preventDefault();
				if (scope.showLiveView) {

				}
				else if (scope.showTileView) {
					scope.toggleAllCheckBoxesOnGridView();
				}
				else if (scope.showGridView) {
					$(".mmGrid-customCheckbox").trigger('click');
				}
			}
			else if (e.keyCode == 37) {//left

			}
			else if (e.keyCode == 38) {//up

			}
			else if (e.keyCode == 39) {//right
			}
			else if (e.keyCode == 40) {//down
//				e.preventDefault();
//				var selected = $(".selected");
//				$("li.add-tile").addClass("focussed");

				// if there is no element before the selected one, we select the last one
//				if (!selected.prev().is("li")) {
//					selected.siblings().last().addClass("selected");
//				} else { // otherwise we just select the next one
//					selected.next().addClass("selected");
//				}
//				$("li.add-tile").next().addClass("selected");
			}
//			else if (e.keyCode == 49) {
//				scope.changeViews(true);
//			}
//			else if (e.keyCode == 50) {
//				scope.changeViews(false);
//			}
//			else if (e.keyCode == 80) {
//				scope.redirectToLiveView();
//			}
			else if (e.keyCode == 191) {
				e.preventDefault();
				$(".search-btn").prev().focus();
			}
			if (!scope.$$phase)
				scope.$apply();
		});
	}
});