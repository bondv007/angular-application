'use strict';
app.controller('disableEnableCtrl',['$scope', '$modalInstance', 'action',
    function ($scope, $modalInstance, action) {

        $scope.action = action;

        $scope.params = {
            action: action,
            comment: null
        };
        $scope.save = function(){
            $modalInstance.close($scope.params.comment);
        }

        $scope.cancel = function(){
            $modalInstance.dismiss('cancel');
        }
    }
]);


