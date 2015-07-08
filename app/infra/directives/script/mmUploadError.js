/**
 * Created by atdg on 7/16/14.
 */
app.directive('mmUploadError', [function() {
	return {
		restrict: 'AE',
		require: ['errorText'],
		scope: {
			errorText: "="
		},
		templateUrl: 'infra/directives/views/mmUploadError.html',
		controller: ['$scope', '$element', function ($scope, $element) {
		}]
	}
}]
);