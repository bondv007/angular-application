/**
 * Created by alon.shemesh on 13/4/14.
 */
'use strict';

app.controller('placementAdsAssetsCentralCtrl', ['$scope', '$state','EC2Restangular', 'adService','enums', 'mmAlertService',
    function ($scope, $state, EC2Restangular, adService, enums, mmAlertService) {
        var adServiceUrl = 'ads';
        $scope.hideGoTo = true;
        $scope.alerts = [];
        $scope.master = {};

        var accountId = 1;
        var oneMB =1048576;
        var oneKB =1024;
        var serverCampaigns = EC2Restangular.all('campaigns');
        var serverAccounts = EC2Restangular.all('accounts');
        $scope.entityId = accountId;
        $scope.type = 'Creative Central';

        $scope.adFormats = enums.adFormats;

        var centralAdActions = [
            { name: 'Duplicate', func: duplicateAd },
            { name: 'Archive', func: archiveAd},
            { name: 'Delete', func: deleteAd},
            { name: 'Preview', func: previewAd},
            { name: 'Assign', func: assignAd},
            { name: 'Send Ad to QA', func: sendAdToQA}];

        var centralPlacementAdActions = [
            { name: 'Duplicate', func: duplicatePlacementAd },
            { name: 'Preview', func: previewAd}];

        var centralAssetActions = [
            { name: 'Duplicate', func: duplicateAsset },
            { name: 'Archive', func: archiveAsset},
            { name: 'Delete', func: deleteAssets},
            { name: 'Swap', func: swap},
            { name: 'Preview', func: previewAsset}];


        $scope.centralDataObject = [
            { type: 'masterAd', centralActions: centralAdActions,dataManipulator: filterOnlyMaster, isEditable: true},
            { type: 'placementAd', centralActions: centralPlacementAdActions, dataManipulator: adChanger, isEditable: true, hideAddButton: true},
            {type: 'asset', centralActions: centralAssetActions, dataManipulator: manipulateAssetData,isEditable: true}
        ];

        function addAd() {
            changeView("spa.ad.adEdit");
        }

        function duplicateAd(adsList, selectedItems) {
            adService.duplicateAds(selectedItems).then(function(response){
                adsList.concat(response);
            }, function(error){
                processError(error);
            });
        }

        function archiveAd(list, selectedItems)	{
            func1()
        }

        function deleteAd(list, selectedItems) {
        }

        function previewAd(list, selectedItems)	{
            if(selectedItems.length === 1){
                $state.go("adPreview", {adId: selectedItems[0].id, sid: 'mdx3', mdx2: false});
            }
            else{
                var adIds = '';
                for (var i = 0; i < selectedItems.length; i++) {
                    adIds = adIds + selectedItems[i].id + '|';
                }
                adIds = adIds.substring(0, adIds.length - 1);
                $state.go("csbAdPreview", {adIds: adIds});
            }
        }

        function assignAd(list, selectedItems)	{
            func1()
        }
        function sendAdToQA(list, selectedItems)	{

            if ($scope.isModalOpen) {
                return;
            }

            if (!selectedItems || selectedItems.length == 0){
                mmAlertService.addError("No ads selected");
                return;
            }
            else{
                var  foundCampaign =null;
                var isValid = true;
                for (var i = 0; i < selectedItems.length; i++) {
                    var item = selectedItems[i];
                    if(!foundCampaign){
                        if(item.campaignId){
                            foundCampaign = item.campaignId;
                        }
                        else{
                            foundCampaign = 0;
                        }
                    }
                    else if((item.campaignId && foundCampaign != item.campaignId) ||(!item.campaignId && foundCampaign != 0)){
                        mmAlertService.addError("Its possible to send multiple ads just from same campaign");
                        isValid = false;
                        return;
                    }
                }
            }
            if(!isValid){return}
            $scope.selectedItems = selectedItems;
            $scope.isModalOpen = true;

            var modalInstance = mmModal.open({
                templateUrl: './adManagementApp/views/submitAdsToQA.html',
                controller: 'submitAdsToQACtrl',
                title: "Submit Ads to QA",
                //smallTitle: "Master Ad ID: " + $stateParams.adId,ad
                modalWidth: 950,
                bodyHeight: 500,
                confirmButton: { name: "Submit", funcName: "save", hide: false, isPrimary: true},
                discardButton: { name: "Cancel", funcName: "cancel" },
                resolve: {
                    ads: function() {
                        return  [$scope.selectedItems];
                    }
                }
            });

            modalInstance.result.then(function (ad) {
                $scope.isModalOpen = false;
                //TODO - refresh
                $scope.ads.refreshCentral();
            }, function () {
                $scope.isModalOpen = false;
            });

        }

        function duplicatePlacementAd(list, selectedItems) {
            alert('todo copyAd');
        }

        function deletePlacementAd(list, selectedItems) {
            var f = [];
            for (var i = 0; i < selectedItems.length; i++) {
                f[i] = function(k){
                    var ad = selectedItems[i];

                    var promise = adService.deleteAd(ad);
                    promise.then(function(ad){
                            var index = _.indexOf(list, ad);
                            list.splice(index, 1);
                        },
                        function(response){
                            console.log(response);
                        });
                }(i);
            }
        }


        function duplicateAsset(list, selectedItems) {
            alert('todo copyAd');
        }

        function archiveAsset(list, selectedItems)	{
            func1()
        }

        function deleteAssets(centralSelectedList, assets) {
            for (var i = 0; i < assets.length; i++) {
                var p = assets[i];
                p.remove().then(function () {

                    //not good......

                    var index = _.indexOf(centralSelectedList, p);
                    centralSelectedList.splice(index, 1);
                }, function (response) {
                    console.log(response);
                });
            }
        }

        function swap(list, selectedItems)	{
            func1()
        }

        function previewAsset(list, selectedItems)	{
            func1()
        }



        function changeView(view) {
            $state.go(view);
        }

        function copiesRemoval(ads){
            for (var i = 0; i < ads.length; i++){
                if(ads.masterAdId != "")
                {
                    ads.remove(ads[i]);
                }
                $scope.ads= ads;
            }
        }
        function filterOnlyMaster(ads){
            $scope.ads = ads;
            for (var i = 0; i < $scope.ads.length; i++){
                if($scope.ads[i].masterAdId)
                {
                    $scope.ads.splice(i, 1);
                    i=i-1;
                }
                else{
                    fillExternalData($scope.ads[i]);
                }
            }
        }
        function fillExternalData(ad){
            ad.overallSize = parseSizeFromBytes(ad.overallSize)
            fillAccount(ad);
            fillCampaign(ad);
            fillFormat(ad);
        }

        function fillFormat(ad){
            adService.fillFormat(ad);
        }
        function fillAccount(ad){
            if(ad.accountId ){
                serverAccounts.get(ad.accountId).then(function(account){
                    var ad = _.findWhere($scope.ads, {'accountId': account.id});
                    if(ad){
                        ad.accountId = account.name
                    }
                },{})
            }}

        function fillCampaign(ad){
            if(ad.campaignId ){
                serverCampaigns.get(ad.campaignId).then(function(campaign){
                    var ad = _.findWhere($scope.ads, {'campaignId': campaign.id});
                    if(ad){
                        ad.campaignId = campaign.name
                    }
                },{})
            }}

        function adChanger(masterAdsPlacementAds) {
            for (var i = 0; i < masterAdsPlacementAds.length; i++) {
                masterAdsPlacementAds[i].adsIds = [];
                if (masterAdsPlacementAds[i].masterAdId !=  null && masterAdsPlacementAds[i].masterAdId != "") {
                    masterAdsPlacementAds[i].adsIds.push(masterAdsPlacementAds[i].masterAdId);
                }
                masterAdsPlacementAds[i].assetsIds = [];
                if (masterAdsPlacementAds[i].defaultImage != null) {
                    masterAdsPlacementAds[i].assetsIds.push(masterAdsPlacementAds[i].defaultImage.assetId);

                }
                if (masterAdsPlacementAds[i].banner != null) {
                    masterAdsPlacementAds[i].assetsIds.push(masterAdsPlacementAds[i].banner.assetId);
                }
                fillFormat(masterAdsPlacementAds[i]);
                masterAdsPlacementAds[i].overallSize = parseSizeFromBytes(masterAdsPlacementAds[i].overallSize);
            }
            $scope.masterAdsPlacementAds = masterAdsPlacementAds;
        }
        function parseSizeFromBytes(fileSize){
            if(fileSize >= oneMB){
                fileSize=(fileSize/oneMB).toFixed(2) +'MB';
            }
            else if(fileSize < oneMB){
                fileSize=(fileSize/oneKB).toFixed(2) +'KB';
            }
            return fileSize;
        }

        function manipulateAssetData(assets){
            var asset = null;
            var i = 0;
            for (i; i < assets.length; i++){
                asset = assets[i];
                asset.fileSize = parseSizeFromBytes(asset.formatContext.fileSize);
                asset.dimension = adService.getAssetDimension(asset);
                asset.thumbnail = asset.thumbnails && asset.thumbnails.length > 0 ? asset.thumbnails[0].url : '';
            }
        }




        function processError(error) {
            $scope.showSPinner = false;
            mmAlertService.addError(error);
        }

        function func1(){
            alert('todo');
        }
    }]);
