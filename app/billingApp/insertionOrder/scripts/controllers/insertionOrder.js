/**
 * Created by Shuki.Levy on 9/8/2014.
 */
'use strict';
app.controller('campaignIoCtrl',['$scope', 'mmUtils',
    function ($scope, mmUtils) {

        var user = mmUtils.session.getLoggedInUser();
        var filterArr = [];

        filterArr.push({key: 'userName', value: user.username});

        if(!user.platformUser){
            if(user.accountId) {
                filterArr.push({key: 'type', value: 'accountCampaign'});
                filterArr.push({key: 'accountId', value: user.accountId});
            }
            else{
                mmAlertService.addWarning("User object missing accountID");
                return;
            }
        }
        else{
            filterArr.push({key: 'type', value: 'campaign'});
        }

        $scope.centralDataObject = [
        {
            type: 'campaignIo',
            centralActions: [],
            isEditable: true,
            hideAddButton: true,
            hideRowCheckbox: true,
            isEditMultiple: false,
            filters: filterArr
        }];
    }
]);

app.controller('mediaIoCtrl',['$scope', 'mmUtils', 'mmAlertService',
    function ($scope, mmUtils, mmAlertService) {
        var user = mmUtils.session.getLoggedInUser();
        var filterArr = [];

        if(!user.platformUser){
            if(user.accountId) {
                filterArr.push({key: 'type', value: 'account'});
                $scope.entityId = user.accountId; //not platformUser, need to filter by accountId
            }
            else{
                mmAlertService.addWarning("User object missing accountID");
                return;
            }
        }
        else{
            filterArr.push({key: 'type', value: 'all'});
        }

        filterArr.push({key: 'userName', value: user.username});

        $scope.centralDataObject = [
        {
            type: 'mediaIo',
            centralActions: [],
            isEditable: true,
            hideAddButton: true,
            hideRowCheckbox: true,
            isEditMultiple: false,
            filters: filterArr
        }];
    }
]);