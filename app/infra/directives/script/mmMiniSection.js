/**
 * Created by Ofir.Fridman on 8/14/14.
 */
'use strict';
app.directive('mmMiniSection', [function() {
		return {
			restrict: 'AE',
			transclude:true,
			scope: {
				mmCaption:"=",
				mmStartOpen:"=",
				mmIsModal:"=?",
				mmStartOpenDisabled: "=?",
				mmStopAnimation:"=?",
				mmId:"@"
			},
			templateUrl: 'infra/directives/views/mmMiniSection.html',
			controller: ['$scope','mmUtils', 'infraEnums', function ($scope, mmUtils, infraEnums) {
				$scope.mmId = mmUtils.elementIdGenerator.getId(infraEnums.controlTypes.minisection.toLowerCase(), $scope.mmCaption, $scope.mmId);
			}]
		}
	}]
);