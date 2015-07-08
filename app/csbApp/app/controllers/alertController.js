/**
 * Created by Rick.Jones on 11/12/14.
 */
app.controller('alertCtrl', ['$scope', 'errorFactory',
    function($scope, errorFactory){

        $scope.alerts = errorFactory.errorMessages;

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
            errorFactory.removeErrorMessage(index);
        };
    }
]);