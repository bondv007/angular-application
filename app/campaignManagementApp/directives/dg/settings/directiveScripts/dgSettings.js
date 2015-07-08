/**
 * Created by Ofir.Fridman on 11/16/14.
 */
"use strict";
app.directive('dgSettings', [function () {
	return {
		restrict: 'E',
		scope: {
			deliveryGroup:"=",
			defaultServeSelectedItem: "=?",
			defaultAdsCb:"=?",
      mmId:"@"
		},
		templateUrl: 'campaignManagementApp/directives/dg/settings/views/dgSettings.html',
		controller: ['$scope', 'dgSettingsService', 'enums', function ($scope, dgSettingsService, enums) {
			$scope.frequencyCapping = {};
			$scope.deliveryGroup.timeBetweenAds = {selectedTimeUnit:{id:1}};
			$scope.defaultServeOptions = enums.defaultServeOptions;
			$scope.impressionsPerUserDD = [];
			$scope.impressionsPerUserPerDayDD = [];
			$scope.timeOptions = dgSettingsService.timeOptions;
			$scope.frequencyCappingLevel = enums.frequencyCappingLevelOptions;

			$scope.unCheckALlDefaultServeItems = function(){
				dgSettingsService.unCheckALlDefaultServeItems($scope.defaultServeOptions,$scope.deliveryGroup.defaultAds,$scope.defaultAdsCb);
			};

			$scope.onImpressionsPerUserClick = function () {
				dgSettingsService.onImpressionsPerUserClick($scope.frequencyCapping, $scope.deliveryGroup);
			};

			$scope.onImpressionsPerDayClick = function () {
				dgSettingsService.onImpressionsPerDayClick($scope.frequencyCapping, $scope.deliveryGroup);
			};

			$scope.onTimeBetweenAdsClick = function () {
				dgSettingsService.onTimeBetweenAdsClick($scope.frequencyCapping, $scope.deliveryGroup, $scope.deliveryGroup.timeBetweenAds.selectedTimeUnit);
			};

			dgSettingsService.decisionFrequencyCappingCbState($scope.frequencyCapping, $scope.deliveryGroup);

			dgSettingsService.fillImpressionDropDown($scope.impressionsPerUserDD, $scope.impressionsPerUserPerDayDD);

			dgSettingsService.setTimeBetweenAds($scope.deliveryGroup);

		}]
	}
}]
);
