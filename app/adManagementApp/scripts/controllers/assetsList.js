/**
 * Created by Cathy Winsor on 4/9/14.
 */
'use strict';

app.controller('assetsListCtrl', ['$scope', '$state','$stateParams', 'EC2Restangular', 'assetService', 'mmAlertService', '$filter', '$http', function ($scope, $state, $stateParams, EC2Restangular, assetService, mmAlertService, $filter, $http ) {
//	var adServiceUrl = 'ads';

  //  console.log("cfw - enter assetlist ctrl");
    /*	$scope.centralDataObject = [
     { type: 'creative', centralActions: centralAdsActions },
     { type: 'asset', centralActions: centralAdsActions }
     ];*/

    $scope.alerts = [];
    $scope.master = {};
    $scope.displayData = {};

    var accountId = 1;
    $scope.entityId = accountId;

    var assetActions = [
        { name: 'Open', func: openAsset },
        { name: 'Add', func: addAsset },
        { name: 'Delete', func: deleteAsset},
        { name: 'Copy', func: copyAsset}
    ];

    var assetMetaData = [
        {key: 'assetId', text:'ID'},
        {key: 'assetCode', text:'Asset Code'},
        {key: 'assetType', text:'Asset Type'},
        {key: 'mediaType', text: 'Media Type'},
        {key: 'mimeType', text: 'Mime Type'},
        {key: 'status', text:'Status'}
    ];

    var assets = [
        { "assetId": 1000003283, "title": "Sample asset 1", "assetType": "source", "mediaType": "image", "mimeType": "image/gif", "status": "available"},
        { "assetId": 1000003284, "title": "Sample asset 2", "assetType": "source", "mediaType": "image", "mimeType": "image/jpeg", "status": "available"},
        { "assetId": 1000003285, "title": "Sample asset 3", "assetType": "source", "mediaType": "image", "mimeType": "image/jpeg", "status": "available"}
    ];

    $http.get('/adManagementApp/assets/assetlist.json').success(function(data) {
        //   $scope.assetsjson = data;
        var assetsjson = data.asset;
        console.log("Assets JSON", assetsjson);
        $scope.displayData.assets = assetsjson;
        $scope.showSPinner = false;
        console.log("Assets", $scope.displayData.assets);
        console.log("Assets array length", $scope.displayData.assets.length);
        $scope.displayData.assetActions = assetActions;
        $scope.displayData.assetMetaData = assetMetaData;
        console.log("Metadata", $scope.displayData.assetMetaData);
    });

    /*$scope.displayData.assets = assets;
     //   $scope.selectedItems = $filter('filter')($scope.displayData.assets, {isSelected:true});
     console.log("Assets", $scope.displayData.assets);
     console.log("Assets array length", $scope.displayData.assets.length);
     $scope.displayData.assetActions = assetActions;
     $scope.displayData.assetMetaData = assetMetaData;
     console.log("Metadata", $scope.displayData.assetMetaData);*/
    $scope.displayData.isEditable = true;
    $scope.displayData.isGrid = false;
    // selected assets
    $scope.selection = [];
    $scope.selected = {};
    $scope.checkboxClick = function(asset, $event){
        $event.stopPropagation();
        //  var selectedItems = [];
        $scope.selected = asset;
        var selectedItems = $filter('filter')($scope.displayData.assets, {isSelected:true});
        $scope.selection = selectedItems;
        console.log("checkbox clicked", $scope.displayData.assets);
        console.log("last selected id", $scope.selected.assetId);
        console.log("selection array changed?", selectedItems);
    };
    $scope.rowDoubleClicked = function(id) {
        console.log("row double clicked", id);
        $stateParams.assetId = id;
        console.log("row double clicked", $stateParams);
        changeView("spa.asset", $stateParams);
        /*$state.transitionTo('spa.asset', {assetId:id});*/
    };
    $scope.setSelected = function() {
        $scope.selected = this.asset;
        console.log("row clicked", $scope.selected);
    };

    $scope.centralActionInvoke = function(func, list) {
        var selectedItems = [];
     //   console.log("cfw - action invoke", list);
        selectedItems = $filter('filter')(list, {isSelected:true});
        console.log("selected items", selectedItems);
        if (selectedItems.length > 0) {
            func(list, selectedItems);
        } else {
            console.log("Must select an item to perform action");
          mmAlertService.addInfo("An item must be selected to perform this action.");
        }
    };

    function openAsset() {
        console.log("open asset details", $scope.selected);
        $stateParams.assetId = $scope.selected.assetId;
        console.log("open asset details", $stateParams);
        changeView("spa.asset", $stateParams);
        //  changeView("spa.asset.assetEdit");
    };

    function addAsset() {
        changeView("spa.asset.assetEdit");
    };

    function changeView(view, parameters) {
        $state.go(view, parameters);
    };

    function deleteAsset(list, selectedItems) {

    };

    function copyAsset(list, selectedItems) {
        alert('todo copyAsset');
    };

}]);