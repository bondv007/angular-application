/**
 * Created by liad.ron on 1/14/2015.
 */

'use strict';

app.directive('mmCampaignSettings', [function () {
	return {
		restrict: 'AE',
		scope: {
			mmModel: "=",
			mmLabelWidth: "@",
			mmIsRequired: '@',
			mmHideDataAccess: '=',
			mmDisableTraffickingMode: '=',
      mmOnTraffickingModeChange: '&',
			hasPermission: '='
		},
		templateUrl: 'admin/views/campaignSettings.html',
		controller: ['$scope', 'enums',
			function ($scope, enums) {
				$scope.settings = $scope.mmModel;
				$scope.hardStops = enums.hardStop;
				$scope.traffickingMode = enums.traffickingMode;
				$scope.noPermission = $scope.hasPermission ? !$scope.hasPermission : true;
				$scope.traffickingStatus = $scope.mmDisableTraffickingMode ? $scope.mmDisableTraffickingMode : false;
				$scope.displayDataAccess = !$scope.mmHideDataAccess;
				$scope.disableTrafficking = $scope.noPermission == true ? $scope.noPermission : $scope.traffickingStatus;
				var modelWatcher = $scope.$watch('mmModel', function (newValue, oldValue) {
					if (newValue != oldValue || oldValue == null || !!$scope.isEntral) {
						$scope.settings = $scope.mmModel;
						$scope.noPermission = $scope.hasPermission ? !$scope.hasPermission : true;
					}
				});
				var traffickingWatcher = $scope.$watch('mmDisableTraffickingMode', function (newValue, oldValue) {
					if (newValue != oldValue || oldValue == null || !!$scope.isEntral) {
						$scope.disableTrafficking = $scope.noPermission == true ? $scope.noPermission : newValue;
					}
				});

        $scope.mmOnTraffickingChange = function(){
          if (typeof $scope.mmOnTraffickingModeChange == 'function') {
            $scope.mmOnTraffickingModeChange();
          }
        };

				$scope.$on('$destroy', function(){
					if(modelWatcher) modelWatcher();
					if(traffickingWatcher) traffickingWatcher();
				});
			}]
	}
}]);
