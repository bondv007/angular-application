/**
 * Created by Lior.Bachar on 5/1/14.
 */

app.directive('mmRequiredSign', [function() {
	return {
		restrict: 'AE',
		templateUrl: 'infra/directives/views/mmRequired.html',
		controller: ['$scope', '$element', function ($scope, $element) {
		}]
	}
}]
);
