'use strict';

app.controller('adsCentralCtrl',
    ['$scope', '$stateParams','EC2Restangular', 'adService', 'assetsLibraryService', 'enums', '$state', 'mmAlertService', 'infraEnums', 'mmHistory', 'baseAdBl',
        function ($scope, $stateParams,EC2Restangular, adService, assetsLibraryService, enums, $state, mmAlertService, infraEnums, mmHistory, baseAdBl) {
            var accountId = 1;
            $scope.adFormats = enums.adFormats;
            $scope.entityId = accountId;

            var oneMB =1048576;
            var oneKB =1024;
            var centralAdActions = [
								{ name: 'Duplicate', func: duplicateAds, disableFunc:editAdsActionManipulator}, //the disable func handle edit button behavior.
                { name: 'Delete', func: deleteAd, disableFunc: baseAdBl.enableDeleteButton},
                { name: 'Assign', func: assignAd},
                { name: 'Preview', func: previewAd},
								{ name: 'History', func: history, relationType: infraEnums.buttonRelationToRowType.any}];/*,
                { name: 'Send Ad to QA', func: sendAdToQA}];*///To-do- remove when comment when back to scope (also in list/Entity)


            var centralAssetActions = [
                { name: 'Duplicate', func: duplicateAsset },
                { name: 'Archive', func: archiveAsset},
                { name: 'Delete', func: deleteAssets},
                { name: 'Swap', func: swap},
                { name: 'Preview', func: previewAsset},
								{ name: 'History', func: history, relationType: infraEnums.buttonRelationToRowType.any}];

            $scope.centralDataObject = [
                {type: 'masterAd', centralActions: centralAdActions, dataManipulator: adChanger, isEditable: false},
                {type: 'asset', centralActions: centralAssetActions, dataManipulator: manipulateAssetData, isEditable: false, hideAddButton: true }
            ];

            function duplicateAds(adsList, selectedItems) {
                adService.duplicateAds(selectedItems).then(function(response){
                    adsList.concat(response);
										mmAlertService.addSuccess("Ad successfully duplicated");
									  $scope.centralDataObject[0].refreshCentral();
                }, function(error){
                    processError(error);
                });
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

            function history(list, selectedItems)	{
            if(selectedItems.length === 1){
              mmHistory.open(selectedItems[0].id, 'Ad');
            }
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

            function assignAd(list, selectedItems)	{
                func1()
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



            function addAsset() {
                $state.go('spa.AssetEdit');
            }

            function actionFunc() {
                alert('Todo');
            }

            function adChanger(masterAdsAssets) {
                $scope.ads = masterAdsAssets;
                for (var i = 0; i < masterAdsAssets.length; i++) {
                    if(masterAdsAssets[i].masterAdId )
                    {
                        masterAdsAssets.splice(i, 1);
                    }
                    else{
                        fillExternalData($scope.ads[i]);
                        masterAdsAssets[i].assetsIds = [];
                        if (masterAdsAssets[i].defaultImage != null) {
                            masterAdsAssets[i].assetsIds.push(masterAdsAssets[i].defaultImage.assetId);
                        }
                        if (masterAdsAssets[i].banner != null) {
                            masterAdsAssets[i].assetsIds.push(masterAdsAssets[i].banner.assetId);
                        }
                    }
                }
            }


            function manipulateAssetData(assets){
                var asset = null;
                var i = 0;
                for (i; i < assets.length; i++){
                    asset = assets[i];
                    asset.fileSize = assetsLibraryService.parseSizeFromBytes(asset.formatContext.fileSize);
                    asset.dimension = assetsLibraryService.getAssetDimension(asset);
                    asset.thumbnail = asset.thumbnails && asset.thumbnails.length > 0 ? asset.thumbnails[0].url : '';
                }
            }



            function fillExternalData(ad){
                ad.overallSize = assetsLibraryService.parseSizeFromBytes(ad.overallSize)
                adService.fillAccount(ad,$scope.ads);
                adService.fillCampaign(ad,$scope.ads);
//				adService.fillFormat(ad);
                ad.dimensions = assetsLibraryService.getAssetDimension(ad.defaultImage);
            }

            function processError(error) {
                $scope.showSPinner = false;
                mmAlertService.addError(error);
            }
						function editAdsActionManipulator(items){
						if(_.filter(items, {"createdByHTML5Factory":true}).length == 1){
							if(centralAdActions[0].name != 'Edit'){
								centralAdActions.unshift( { name: 'Edit', items:[
									{ name: 'Edit', func: editAds, disableFunc: editAds},
									{ name: 'Edit in HTML5 Factory', func: gotoFactory}]});
								$scope.centralDataObject[0].isEditable = false;
							}
						}
						else{
							if(centralAdActions[0].name === 'Edit'){
								centralAdActions.splice(0,1);
							}
							$scope.centralDataObject[0].isEditable = true;
						}
					}
						function gotoFactory(list, selectedItems)	{
						adService.gotoFactory($scope.$root.loggedInUserAccountId, $scope.$root.loggedInUserId, $scope.$parent.$parent.$parent.currentLanguage, selectedItems);
					}
						function editAds() {
						$scope.centralDataObject[0].openEntral();
					}
        }]);


