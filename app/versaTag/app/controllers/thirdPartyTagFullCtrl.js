/**
 * Created by Rick.Jones on 1/21/15.
 */
app.controller('thirdPartyTagFullCtrl', ['$scope', '$state', '$stateParams',
    function($scope, $state, $stateParams){
        $scope.type = 'thirdPartyTags';
        $scope.entityId = $stateParams.thirdPartyTagId;
        $scope.entityActions = [];
    }
]);