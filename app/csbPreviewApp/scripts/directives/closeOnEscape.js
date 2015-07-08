/**
 * Created by atdg on 10/27/2014.
 */

app.directive('closeOnEscape', function ($parse) {
	return function (scope, element, attr) {
		angular.element(document).keyup(function (e) {
			if (e.keyCode == 27) {
				for (var index = 0; index < scope.filtered.filteredAds.length; index++) {
					var advert = scope.filtered.filteredAds[index];
					advert.showAdDetailBoxOnLiveView = advert.showAdDetailBox = false;
				}
				if (!scope.$$phase)
					scope.$apply();
			}
		});
	}
});
