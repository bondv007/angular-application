/**
 * Created by alon.shemesh on 4/17/14.
 */

'use strict';
app.controller('attachAdToCampaignManagerCtrl', ['$scope',  '$modalInstance', 'EC2Restangular', 'ads','campaignManagers', 'advertisers', 'mmAlertService', 'multipleAttach',
    function ($scope, $modalInstance, EC2Restangular, ads, campaignManagers, advertisers, mmAlertService, multipleAttach) {

        $scope.multipleAttach = multipleAttach;
        $scope.labelWidth = 140;


        $scope.accounts = campaignManagers;
        $scope.advertisers = [];
        var none= {id:"None",
            name:"None"};
        $scope.selected = {accountManager:"",
            advertiser : ""};
        $scope.originalSelected = {accountManager:"",
            advertiser : ""};

        if(ads && ads.length == 1){
            if(ads[0].adAssignmentData.accountId){
                $scope.accounts.unshift(none);
                $scope.selected.accountManager = ads[0].adAssignmentData.accountId;
                $scope.originalSelected.accountManager = $scope.selected.accountManager
                $scope.advertisers =  _.filter(advertisers ,{'accountId': $scope.selected.accountManager})
            }
            if(ads[0].adAssignmentData.advertiserId){
                $scope.advertisers.unshift(none);
                $scope.selected.advertiser = ads[0].adAssignmentData.advertiserId;
                $scope.originalSelected.advertiser = $scope.selected.advertiser
            }
        }
        $scope.ads = ads;

        $scope.assign = function() {
            var adIds  = _.pluck($scope.ads, "id");

                if($scope.originalSelected.accountManager != $scope.selected.accountManager){
                    if(!$scope.selected.accountManager  || $scope.selected.accountManager === "None"){
                           assignAds('ads/unassignMasterAd','',adIds);
                            return;
                    }
                    if(!$scope.selected.advertiser || $scope.selected.advertiser === "None"){
                        assignAds('ads/assignMasterAd/Account',$scope.selected.accountManager, adIds);
                        return;
                    }
                }
                if($scope.originalSelected.advertiser != $scope.selected.advertiser){
                    if(!$scope.selected.advertiser || $scope.selected.advertiser === "None"){
                       assignAds('ads/assignMasterAd/Account',$scope.selected.accountManager, adIds);
                    }
                    else{
                        assignAds('ads/assignMasterAd/Advertiser', $scope.selected.advertiser, adIds);
                    }
            }
        }

        $scope.changeCampaignManager = function() {
            if($scope.selected.accountManager === "None"){
                $scope.advertisers = [none];
                $scope.selected.advertiser = $scope.advertisers[0].id;
            }
            else{
                $scope.advertisers.length  =  0;
                $scope.selected.advertiser =null;
              $scope.lazyTypeParams = 'advertisers?accountId=' + $scope.selected.accountManager;
            }

        };

        function assignAds(service, assignObject, adIds){
            if(assignObject){
                adIds.unshift(assignObject);
            }
            var attachAds = EC2Restangular.all(service);
            attachAds.customPOST(adIds).then(processData, processError);
        }

        function processError(error) {
            console.log("ERROR: " + JSON.stringify(error));
            mmAlertService.addError("Assignment failed.");
            $modalInstance.close();
        }

        function processData(data) {
            $scope.isAfterSave = true;
            mmAlertService.addSuccess("You successfully assigned/unassigned ad to Campaign manager/Advertiser");
            $modalInstance.close(data);
        }

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };


    }]);
