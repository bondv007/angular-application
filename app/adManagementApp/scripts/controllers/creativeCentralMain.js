/**
 * Created by eran.nachum on 1/2/14.
 */
'use strict';

app.controller('creativeCentralMainCtrl', ['$scope', '$state', 'EC2Restangular', 'adService', '$modal' ,'mmModal', 'flowToolBar', 'configuration', '$rootScope',
    function ($scope, $state, EC2Restangular, adService, $modal ,mmModal, flowToolBar, configuration, $rootScope) {
        var adServiceUrl = 'ads';
        $scope.hideGoTo = true;
        $scope.alerts = [];
        $scope.master = {};
        $scope.type = null;//must be null in order to hide the entityLayoutTitle
        $scope.entityActions = [
            {
                name: 'ads',
                actions: [
                    { name: 'Create New Ad', func: addAd },
                    { name: 'Create Ad From Bundle', func: showImportBundleModal},
                    { name: 'Mass Create Ads', func: massCreateStandard},
                    { name: 'Design HTML5 Ad', func: gotoFactory }
                ],
                views: [
                    {name: 'Master Ads', ref: '.adList', nodes: []},
                    {name: 'Placement Ads', ref: '.placementAdList', nodes: []}/*,
                    {name: 'Master Ads and Assets', ref: '.adCentral', nodes: []},
                    {name: 'Placement Ads and Assets', ref: '.placementAdsAssetsCentral', nodes: []},
                     {name: 'Ads by Advertiser', ref: '.account_advertiser', nodes: []},
                     {name: 'Ads by Campaign', ref: '.account_advertiser', nodes: []},
                     {name: 'Ads by Account', ref: '.account_advertiser', nodes: []}/*,
                     {name: 'Ads by Property', ref: '.', nodes: [
                     {name: 'Assets', ref: '.account_advertiser', nodes: []},
                     {name: 'Custom Scripts', ref: '.account_advertiser', nodes: []}]}
                     {name: 'Ads by Assets', ref: '.', nodes: []},
                     {name: 'Ads by Custom Scripts', ref: '.', nodes: []}*/
                ]
            },
            {
                name: 'Assets Library',
                ref: '.assetsLibrary.folderFilter",{ folderId: "1", viewType: "tile", search: false }',
                func: changeToAssetsLibraryView,
                preventOpenMenu: true
            }/*,
             {
             name: 'assets',
             actions: [
             { name: 'Upload Assets', func: showUploadAssetModal, nodes: []}],
             views: [
             {name: 'Assets', ref: '.assetList.assetEdit', nodes: []},
             {name: 'Assets by Advertiser', ref: '.account_advertiser', nodes: []},
             {name: 'Assets by Campaign', ref: '.account_advertiser', nodes: []},
             {name: 'Assets by Account', ref: '.account_advertiser', nodes: []},
             {name: 'Assigned Assets', ref: '.account_advertiser', nodes: []},
             {name: 'Assets by Property', ref: '.account_advertiser', nodes: [
             {name: 'Video', ref: '.account_advertiser', nodes: []},
             {name: 'Workspace', ref: '.account_advertiser', nodes: []}]},
             {name: 'Assets Library', ref: '.assetsLibrary', nodes: []}
             ]}*/
        ];
        $scope.entityActions.parentMenuItem = 'Creative';
        if($scope.$parent.isActive) $scope.$parent.isActive($scope.entityActions.parentMenuItem);
        flowToolBar.setPrefixToEntityActions('spa.creativeCentralMain',$scope.entityActions);

        function addAd() {
            changeView("spa.ad.adEdit");
        }

        function changeToAssetsLibraryView(){
          $state.go('spa.creativeCentralMain.assetsLibrary.tile', {folderId: "1", viewBy: "tile", search: "false"});
        };

        function changeView(view) {
            $state.go(view);
        }


        function adChanger(ads){
            for (var i = 0; i < ads.length; i++){
                ads[i].name += ' ...';
            }
        }
        function copyAd(list, selectedItems) {
            alert('todo copyAd');
        }

        function showUploadAssetModal() {

            if ($scope.isModalOpen) {
                return;
            }
            $scope.isModalOpen = true;

            var adDetails = adService.getAdDetailsForUpload(false, false, null, null, null);
            var modalInstance = $modal.open({
                templateUrl: './adManagementApp/views/uploadAsset.html',
                controller: 'uploadAssetCtrl',
                windowClass: 'upload-newux',
                backdrop: 'static',
                resolve: {
                    adDetailsForUpload: function () {
                        return adDetails;
                    }
                }
            });
            modalInstance.result.then(function () {
                $scope.isModalOpen = false;
            }, function () {
                $scope.isModalOpen = false;
            });
        }

        function showImportBundleModal() {
            if ($scope.isModalOpen) {
                return;
            }
            $scope.isModalOpen = true;

            var adDetails = adService.getAdDetailsForUpload(false, false, null, null, null);
            var modalInstance = $modal.open({
                templateUrl: './adManagementApp/views/uploadEBS.html',
                controller: 'uploadEBSCtrl',
                windowClass: 'upload-newux',
                resolve: {
                    adDetailsForUpload: function () {
                        return adDetails;
                    }
                }
            });
            modalInstance.result.then(function () {
                $scope.isModalOpen = false;
            }, function () {
                $scope.isModalOpen = false;
            });
        }

        function func1(){
            alert('todo');
        }

        function massCreateStandard(){
            massCreate("StandardBannerAd");
        }

        function massCreate(formatType) {
            mmModal.open({
                templateUrl: 'infra/directives/views/template/wizard/modalWizard.html',
                controller: 'massCreateAdCtrl',
                title: "Mass Create",
                modalWidth: 1200,
                bodyHeight: 559,
                discardButton: { name: "Close", funcName: "cancel" }
            });
        };

        function gotoFactory(){
            adService.gotoFactory($scope.$root.loggedInUserAccountId, $scope.$root.loggedInUserId, $scope.currentLanguage);
        }
    }]);
