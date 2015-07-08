'use strict';

app.controller('deliveryGroupCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {
    $scope.campaignId = $stateParams.campaignId;
    $scope.type = 'deliveryGroup';
    $scope.entityId = $stateParams.deliveryGroupId;
    $scope.entityActions = [

    ];
}]);