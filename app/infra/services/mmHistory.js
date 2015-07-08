'use strict';
app.factory('mmHistory',['mmModal', 'EC2Restangular', 'mmUtils',
    function (mmModal, EC2Restangular, mmUtils) {
        return {
                open:function(id, type){
                    mmModal.open({
                        templateUrl: './infra/views/mmHistory.html',
                        controller: 'mmHistoryCtrl',
                        title: "History",
                        modalWidth: screen.width - 300,
                        bodyHeight: screen.height - 300,
                        confirmButton: { name: "Close", funcName: "cancel", isPrimary: true},
                        discardButton: { name: "Close", funcName: "cancel" ,hide:true},
                        resolve: {
                            obj: function() {
                                return EC2Restangular.all(mmUtils.utilities.replaceParams('history/entitychanges?id={0}&type={1}',[id, type])).getList();
                            }
                        }
                    });
                }
        };
    }]);