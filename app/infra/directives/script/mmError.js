app.directive('mmErrorDiv', [function () {
	return {
		restrict: 'AE',
		require: ['errorText'],
		scope: {
			errorText: "=",
			mmMinWidth: "="
		},
		templateUrl: 'infra/directives/views/mmError.html',
		controller: ['$scope', function ($scope) {
			$scope.mmStyle = null;
			if( $scope.mmMinWidth != undefined &&$scope.mmMinWidth != "" ){
				$scope.mmStyle = {'min-width': $scope.mmMinWidth,'top': '8px'};
      }
		}]
	}
}]
);