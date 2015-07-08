app.controller('vtFiringConditionsCtrl', [ '$scope', '$state', 'mmRest', 'EC2Restangular', 'mmModal', 'mmAlertService', 'firingConditionsService',
    function($scope, $state, mmRest, EC2Restangular, mmModal, mmAlertService , firingConditionsService, RestangularProvider){

    $scope.centralDataObject = [
      //{ type: 'account', centralActions: centralAccountActions, dataManipulator: dataManipulator, isEditable: true, editButtons: [] }
    ];



    function deleteRow(list, selectedItems){


        var modalInstance = mmModal.openAlertModal("DeleteAlertTitle", "DeleteAlertMessage");

        modalInstance.result.then(function() {
            firingConditionsService.remove(selectedItems).then(function(deletedTags){

                var numberOfDeletedTags = deletedTags.length;

                for (var i = 0; i < deletedTags.length; i++ ) {
                    var deletedId = deletedTags[i].id;
                    for (var j = list.length - 1; j >=0; j--) {
                        var tag = list[j];

                        if(tag.id === deletedId){
                            //console.log('tag.id', tag.id, 'deletedId', deletedId);
                            list.splice(j,1);
                            break;
                        }
                    }
                }

                if(i == numberOfDeletedTags){
                    mmAlertService.addSuccess("Firing Conditions successfully deleted");
                    $scope.centralDataObject[0].refreshCentral();
                }
            });
        });
    }


    function getSelectedItem(){

        var selectedItem = null;

        if($scope.centralDataObject[0] && $scope.centralDataObject[0].selectedItem)
        {
            selectedItem = $scope.centralDataObject[0].selectedItem;
        }
        return selectedItem;
    }

    function formatData(data){

        for(var i = 0; i < data.length; i++){

            var firingCondition = data[i];
            var conditions = firingCondition.conditions;

            // format fire condition text
            firingCondition.formattedConditions = formatFiringConditionText(conditions);
        }

        return data;
    }

    function formatFiringConditionText(conditions){


        var formattedCondition = 'Condition has not been set';

        if(conditions && conditions.length > 0){
            for(var k = 0; k < conditions.length; k++){

                var cond = conditions[k];

                var landedOn = cond.ifUser == 'LandedOn' ? 'Landed on': '';
                var urlThat = 'a URL that ' + cond.urlThat;

                var url = '';

                if(cond.urlList && cond.urlList.length){
                    url = cond.urlList.length == 1 ? cond.urlList[0] : ' one of ' + cond.urlList.length + ' urls';
                }

                formattedCondition = landedOn + " " + urlThat + " " + url;

            }
        }


        return formattedCondition;

    }

    function initialize() {

        EC2Restangular.setDefaultHeaders({"Authorization" : "MDMD admin:admin:123456"});

        $scope.centralDataObject = [
            {
                type: 'firingConditions',
                centralActions: [
                    { name: 'Archive', func: function(){ console.log('Archive row') } },
                    { name: 'Delete', func: deleteRow }
                ],
                isEditable: true,
                isEditMultiple: false,
                useMock: false,
                dataManipulator: formatData
            }
        ];
    }

    initialize();

}]);
