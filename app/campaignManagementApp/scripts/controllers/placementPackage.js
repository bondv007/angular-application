'use strict';

app.controller('placementPackageCtrl', ['$scope', '$stateParams','EC2Restangular', function ($scope, $stateParams,EC2Restangular) {
    $scope.type = 'placementPackage';
	  $scope.campaignId = $stateParams.campaignId;
    $scope.entityId = $stateParams.placementPackageId;
    $scope.entityActions = [

    ];

}]);