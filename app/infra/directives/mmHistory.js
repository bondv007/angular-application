'use strict';
app.directive('mmHistory', function () {
return {
    restrict: 'AE',
    scope: {
        type:'=',
        id: '=',
        isCentral: '=',
        disable: "="
    },
    transclude: true,
    templateUrl: 'infra/directives/views/mmHistory.html',
    controller: ['$scope','entityMetaData', 'mmModal', 'EC2Restangular', function ($scope, entityMetaData, mmModal, EC2Restangular) {

        $scope.openHistory = function(){
            if($scope.type  && $scope.id){
            var type= entityMetaData[$scope.type].restPath;
            type = type.charAt(0).toUpperCase() + type.slice(1, type.length-1);
            mmModal.open({
                templateUrl: './infra/views/mmHistory.html',
                controller: 'mmHistoryCtrl',
                title: "History",
                modalWidth: screen.width - 300,
                bodyHeight: screen.height - 260,
                confirmButton: { name: "Close", funcName: "cancel", isPrimary: true},
                discardButton: { name: "Close", funcName: "cancel" ,hide:true},
                resolve: {
                    obj: function() {
                        return EC2Restangular.all('history/entityhistory?id=' + $scope.id + '&type=' + type).withHttpConfig({cache: false}).getList();
                    }
                }
            });
        }
    }}]
}});
