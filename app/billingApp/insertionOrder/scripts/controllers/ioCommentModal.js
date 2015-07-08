'use strict';
app.controller('ioCommentModalCtrl',['$scope', '$modalInstance', 'params',
    function ($scope, $modalInstance, params) {

        $scope.params = params;

        $scope.IOStatusChangeReason =   {
            //11 - IO Enabled
            "EnableIO": [
            { id: "1", value: "Hardcopy IO delivered", name: "Hardcopy IO delivered"},
            { id: "2", value: "IO cannot be generated (technical problem)", name: "IO cannot be generated (technical problem)"},
            { id: "3", value: "IO cannot be signed (technical problem)", name: "IO cannot be signed (technical problem)"},
            { id: "4", value: "Other", name: "Other"}
            ],
            "DisableIO": [
            //12 - IO Disabled
            { id: "5", value: "Account is no longer a client", name: "Account is no longer a client"},
            { id: "6", value: "Dispute over charges", name: "Dispute over charges"},
            { id: "7", value: "Other", name: "Other"}
            ]};

        $scope.save = function(){
            var comment = '';
            if($scope.params.reason) {
                for (i = 0; i < $scope.IOStatusChangeReason[$scope.params.action].length; i++) {
                    var item = $scope.IOStatusChangeReason[$scope.params.action][i];
                    if (item.id == $scope.params.reason) {
                        comment = 'Reason: ' + item.value + '. ';
                        break;
                    }
                }
            }
            if($scope.params.comment)
            {
                comment = comment + 'User comment: ' + $scope.params.comment;
            }
            $modalInstance.close(comment);
        };

        $scope.cancel = function(){
            $modalInstance.dismiss('cancel');
        }
    }
]);


