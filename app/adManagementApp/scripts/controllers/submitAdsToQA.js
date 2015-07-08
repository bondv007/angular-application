/**
 * Created by alon.shemesh on 4/17/14.
 */

'use strict';

app.controller('submitAdsToQACtrl', ['$scope', '$modalInstance', 'EC2Restangular', 'ads', 'mmAlertService', 'enums',
	function ($scope, $modalInstance, EC2Restangular, ads, mmAlertService,  enums) {

        EC2Restangular.all('advertisers').getList().then(function (all) {
        $scope.advertisers = all;
      },"");

        EC2Restangular.all('accounts/global').getList().then(function (all) {
            $scope.mediaAgencies = all;
        },"");
        $scope.adQARequest = [{ "type" : "AdQARequest",
                               "requesterInstructions" : "",
                               "assignUponSubmit" : true,
                               "testMobileDevices" : "NOT_REQUIRED",
                               "mediaAgencyId" :"",
                               "advertiserId":"",
                               "campaignId":"",
                               //"creativeShopId": "",
                               "submitterId":"",
                               "submitterName":"",
                               "submitterEmail":"",
                               "ads" : ads
                             }]
        $scope.iseditMode = false;
        $scope.isModal = true;
        $scope.labelWidth= 110;
        $scope.labelWidth2= 160;
        $scope.isEditable ={
                mediaAgencySelected : false,
                advertiserSelected :false
            }
        /*$scope.toggleHandler= {
            submitToQACampaignDetails :true,
            submitToQARequestDetails : true
        }
        $scope.subscribeToNotification={
                        columns : [
                            {field: 'email', displayName: 'Email' },
                            {field: 'notify', displayName: 'Notify', width: 150,  isShowToolTip: false, isPinned: false, gridControlType: enums.gridControlType.getName("SingleCheckbox")}],// gridControlType: enums.gridControlType.getName("Action") }],
                        actions :[{
                            name: "Add",
                            func: addSubscribe,
                            isDisable: false
                        },
                        {
                            name: "Remove",
                            func: removeSubscribe,
                            isDisable: false
                        }
                ],
                        subscribers :[]}*/
        $scope.mobileDeviceNotRequired = "Not Required"
        $scope.TestMobileDevices = enums.mobileDevices;

        onPageLoad();

        function onPageLoad(){
            $scope.html5Exist = true;
          _.each(ads, function(ad){
            if(ad[0]){
                if(ad[0].adStatus === 'SUBMITTED_TO_QA'){
                    EC2Restangular.one('ads/qa',ad[0].id).get().then(function(entity){
                        $scope.adQARequest[0] = entity})
                }
                if(ad[0].html5){
                            $scope.html5Exist= false;
                        }
                if(!$scope.campaign){
                            var getCampaign = EC2Restangular.one('campaigns', ad[0].campaignId);
                                getCampaign.get().then(function (data) {
                                $scope.campaign = data;
                                $scope.mediaAgencyId =data.accountId ;
                                $scope.advertiserId = data.advertiserAccountId;
                                $scope.isEditable.mediaAgencySelected = data.accountId  ? true: false;
                                $scope.isEditable.advertiserSelected  = data.advertiserAccountId ? true: false;
                        })}}
          })
        }

        $scope.submit = function() {

        if(!$scope.adQARequest[0].ads){
          return;
        }
            var selectedAds =[];
            for(var  i=0; i < $scope.adQARequest[0].ads.length ; i++){
                if(!ads[i].advertiserId){
                    ads[i].advertiserId = $scope.advertiserId;
                    selectedAds.push(ads[i]);
                }
                var adId = $scope.adQARequest[0].ads[i][0].ad.id;
                $scope.adQARequest[0].ads[i] = "";
                $scope.adQARequest[0].ads[i] = {adId : adId};
            }
            if(selectedAds.length > 0){
                    EC2Restangular.all('ads/qa').customPOST({entities: $scope.adQARequest}).then(processData, processError);
            }
            else{
                $modalInstance.close();
            }
      }

        function processError(error) {
            console.log("ERROR: " + JSON.stringify(error));
            mmAlertService.addError("Submit Ad to QA failed.");
        $modalInstance.close();
        }

        function processData(data) {
            $scope.isAfterSave = true;
            mmAlertService.addSuccess("You successfully submit ads to qa.");
        $modalInstance.close(data);
        }

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        function addSubscribe(){
                $scope.subscribeToNotification.subscribers.push({email:"", actions:true})
            }
        function removeSubscribe(){
                adService.removeItemFromGrid($scope.subscribeToNotification.subscribers,$scope.subscribeToNotification.selectedSubscribers)
            }
}]);