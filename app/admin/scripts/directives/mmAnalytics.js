/**
 * Created by reut.sar-Israel on 1/20/2015.
 */

'use strict';

app.directive("mmAnalytics", [function(){
  return {
    restrict: 'EA',
    scope:{
      mmModel: "=",
      mmAccount: "=?",
      mmAdvertiser: "=?",
      mmEntityType: "@",
      mmErrorMessage: "=?",
      mmIsTabValid: "=?",
      mmParentId: "=?",
      mmPermission: "=?"
    },
    templateUrl: 'admin/views/analytics.html',
    controller: ['$scope', 'enums',
      function ($scope, enums) {
        var noData = "No Viewability Collection";
        var cellsValidation = {};
        cellsValidation.surface = true;
        cellsValidation.duration = true;
        $scope.columns = [];
        $scope.columnsAdv = [];
        $scope.labelWidth = 230;
        $scope.width = 150;
        $scope.textBoxWidth = 50;
        $scope.dropDownWidth = 140;
        $scope.linkInfo = {};
        $scope.miniSectionTitle = "viewability";
        $scope.isAdvertiserEnhanced = false;
        $scope.viewabilityMode = enums.viewabilityMode;

        var watcher = $scope.$watch('mmModel', function (newValue, oldValue) {
          if(newValue != undefined){
            initialize();
          }
        });

        function initialize() {
          if ($scope.mmEntityType == "advertiser") {
            $scope.linkInfo.text = "Account Settings";
            $scope.linkInfo.redirect = "spa.account.accountEdit";
            $scope.linkInfo.parentEntityType = 'account';

            if ($scope.mmModel.viewabilityMode == "COLLECT_ENHANCED_VIEWABILITY_DATA") {
              $scope.isAdvertiserEnhanced = true;
              buildGridColumnsWithAdvertiser();
            }
            else {
              buildGridColumns();
            }
          }
          else if ($scope.mmEntityType == "campaign") {
            $scope.linkInfo.text = "Advertiser Settings";
            $scope.linkInfo.redirect = "spa.advertiser.advertiserEdit";
            $scope.linkInfo.parentEntityType = 'advertiser';
            buildGridColumnsWithAdvertiser();
          }

          $scope.displayViewabilityProperties = $scope.mmModel.viewabilityMode !== "NO_COLLECTION";
        }

        function buildGridColumns(){
          $scope.columns = [
            {field: 'settings', displayName: 'Viewability settings', gridControlType: enums.gridControlType.getName("Label")},
            {field: 'account', displayName: 'Account', gridControlType: enums.gridControlType.getName("Label")}];

          buildGridData();
        }

        function buildGridColumnsWithAdvertiser(){
          $scope.columnsAdv = [
            {field: 'settings', displayName: 'Viewability settings', gridControlType: enums.gridControlType.getName("Label")},
            {field: 'advertiser', displayName: 'Advertiser', isColumnEdit: $scope.isAdvertiserEnhanced, gridControlType: enums.gridControlType.getName("TextBox"), functionOnCellEdit: onCellChanged},
            {field: 'account', displayName: 'Account', gridControlType: enums.gridControlType.getName("Label")}];

          buildGridData();
        }

        function buildGridData(){
          if($scope.mmAccount.viewabilityMode == "NO_COLLECTION") {
            $scope.mmAccount.viewabilityThreshold.minimumSurface = noData;
            $scope.mmAccount.viewabilityThreshold.minimumDuration = noData;
          }
          if($scope.mmEntityType == 'campaign' ){
            if($scope.mmAdvertiser.viewabilityMode == "COLLECT_BASIC_VIEWABILITY_DATA" || $scope.mmAdvertiser.viewabilityMode == "NO_COLLECTION"){
              $scope.mmAdvertiser.viewabilityThreshold.minimumSurface  = noData;
              $scope.mmAdvertiser.viewabilityThreshold.minimumDuration = noData;
            }

            $scope.itemsSettings = [
              {settings: 'Display Minimum Surface Threshold (%)', advertiser: $scope.mmAdvertiser.viewabilityThreshold.minimumSurface, account: $scope.mmAccount.viewabilityThreshold.minimumSurface },
              {settings: 'Display Minimum Duration Threshold (Sec)', advertiser: $scope.mmAdvertiser.viewabilityThreshold.minimumDuration, account: $scope.mmAccount.viewabilityThreshold.minimumDuration}
            ];
          }
          else if(!$scope.isAdvertiserEnhanced){
            $scope.itemsSettings = [
              {settings: 'Display Minimum Surface Threshold (%)', account: $scope.mmAccount.viewabilityThreshold.minimumSurface },
              {settings: 'Display Minimum Duration Threshold (Sec)', account: $scope.mmAccount.viewabilityThreshold.minimumDuration}
            ];
          }
          else {//edit advertiser
            $scope.itemsSettings =
              [
                {settings: 'Display Minimum Surface Threshold (%)', advertiser: $scope.mmModel.viewabilityThreshold.minimumSurface, account: $scope.mmAccount.viewabilityThreshold.minimumSurface },
                {settings: 'Display Minimum Duration Threshold (Sec)', advertiser: $scope.mmModel.viewabilityThreshold.minimumDuration, account: $scope.mmAccount.viewabilityThreshold.minimumDuration}
              ];
          }
        }

        function onCellChanged(col, valueId, colIndex, fieldName, row, selectedItem){
          var result = {};

          if(row.rowIndex == 0){
            result = surfaceCellChange(valueId);
            cellsValidation.surface = result.isSuccess;
          }
          else{
            result = durationCellChange(valueId);
            cellsValidation.duration = result.isSuccess;
          }

          if( cellsValidation.surface && cellsValidation.duration){
            $scope.mmIsTabValid = true;
          }
          else{
            $scope.mmIsTabValid = false;
          }

          $scope.$root.isDirtyEntity = true;
          return result;
        }

        function surfaceCellChange(value){
          $scope.mmModel.viewabilityThreshold.minimumSurface = value;
          var minSurface = $scope.mmModel.viewabilityThreshold.minimumSurface;
          var result = {};
          result.isSuccess = true;

          if(minSurface != "" && (isNaN(minSurface))){
            result.isSuccess = false;
          }
          else if(minSurface != "" && (minSurface < 1 || minSurface > 100)){
            result.isSuccess = false;
          }

          if(!result.isSuccess){
            result.message = "Please enter a positive number between 1 and 100";
          }

          return result;
        }

        function durationCellChange(value){
          $scope.mmModel.viewabilityThreshold.minimumDuration = value;
          var result = {};
          result.isSuccess = true;
          if(isNaN($scope.mmModel.viewabilityThreshold.minimumDuration)){
            result.isSuccess = false;
          }
          else if($scope.mmModel.viewabilityThreshold.minimumDuration < 0){
            result.isSuccess = false;
          }

          if(!result.isSuccess){
            result.message = "Please enter a positive number bigger than 0";
          }

          return result;
        }


        var accountEventListener = $scope.$on('accountChange', function (event, data) {
          if($scope.mmAccount.viewabilityMode != "NO_COLLECTION") {
            $scope.itemsSettings[0].account = $scope.mmAccount.viewabilityThreshold.minimumSurface;
            $scope.itemsSettings[1].account = $scope.mmAccount.viewabilityThreshold.minimumDuration;
          }
          else {
            $scope.itemsSettings[0].account = noData;
            $scope.itemsSettings[1].account = noData;
          }

          if($scope.mmEntityType == 'campaign'){
            $scope.itemsSettings[0].advertiser = noData;
            $scope.itemsSettings[1].advertiser = noData;
            //set campaign to default until advertiser is selected
            $scope.mmModel.viewabilityMode = "NO_COLLECTION";
            $scope.mmModel.ignoreCostCalculation = true;
            $scope.mmModel.viewabilityThreshold.minimumSurface = 50;
            $scope.mmModel.viewabilityThreshold.minimumDuration = 1;
            initialize();
          }
          else{
            //get advertiser settings from account
            $scope.mmModel.viewabilityMode = $scope.mmAccount.viewabilityMode;
            $scope.mmModel.ignoreCostCalculation = $scope.mmAccount.ignoreCostCalculation;
            initialize();
          }
        });

        var advertiserEventListener = $scope.$on('advertiserChange', function (event, data) {
          //get campaign settings from advertiser
          $scope.mmModel.viewabilityMode = $scope.mmAdvertiser.viewabilityMode;
          $scope.mmModel.ignoreCostCalculation = $scope.mmAdvertiser.ignoreCostCalculation;

          if($scope.mmAdvertiser.viewabilityMode == "COLLECT_ENHANCED_VIEWABILITY_DATA") {
            $scope.itemsSettings[0].advertiser = $scope.mmAdvertiser.viewabilityThreshold.minimumSurface;
            $scope.itemsSettings[1].advertiser = $scope.mmAdvertiser.viewabilityThreshold.minimumDuration;
          }
          else {
            $scope.itemsSettings[0].advertiser = noData;
            $scope.itemsSettings[1].advertiser = noData;
          }

          initialize();
        });

        var manipulatorEventListener = $scope.$on('analyticsManipulator', function (event, data) {
          if($scope.mmModel.viewabilityMode == "NO_COLLECTION" || ($scope.mmEntityType == "advertiser" && $scope.mmModel.viewabilityMode == "COLLECT_BASIC_VIEWABILITY_DATA")){
            $scope.mmModel.viewabilityThreshold.minimumSurface = 50;
            $scope.mmModel.viewabilityThreshold.minimumDuration = 1;
           }
          if($scope.mmAccount && $scope.mmAccount.viewabilityMode == "NO_COLLECTION" ){
            $scope.mmAccount.viewabilityThreshold.minimumSurface = 50;
            $scope.mmAccount.viewabilityThreshold.minimumDuration = 1;
          }
          if($scope.mmAdvertiser && ($scope.mmAdvertiser.viewabilityMode == "NO_COLLECTION" || $scope.mmAdvertiser.viewabilityMode == "COLLECT_BASIC_VIEWABILITY_DATA")){
            $scope.mmAdvertiser.viewabilityThreshold.minimumSurface = 50;
            $scope.mmAdvertiser.viewabilityThreshold.minimumDuration = 1;
          }
          if($scope.mmModel.viewabilityThreshold.minimumSurface == null || $scope.mmModel.viewabilityThreshold.minimumSurface == ""){
            $scope.mmModel.viewabilityThreshold.minimumSurface = 50;
            if($scope.mmEntityType == 'advertiser'){
              $scope.itemsSettings[0].advertiser = 50;
            }
          }
          if($scope.mmModel.viewabilityThreshold.minimumDuration == null || $scope.mmModel.viewabilityThreshold.minimumDuration  == ""){
            $scope.mmModel.viewabilityThreshold.minimumDuration = 1;
            if($scope.mmEntityType == 'advertiser'){
              $scope.itemsSettings[1].advertiser = 1;
            }
          }
        });

        $scope.onViewabilityModeChange = function(){
          $scope.displayViewabilityProperties = $scope.mmModel.viewabilityMode !== "NO_COLLECTION";

          if(!$scope.displayViewabilityProperties){
            $scope.mmIsTabValid = true;
            if($scope.mmEntityType == "account"){
              $scope.mmErrorMessage.surfaceError = '';
              $scope.mmErrorMessage.durationError = '';
            }
          }

          if($scope.mmEntityType == "advertiser") {
            if ($scope.mmModel.viewabilityMode == "COLLECT_ENHANCED_VIEWABILITY_DATA") {
              $scope.isAdvertiserEnhanced = true;
              buildGridColumnsWithAdvertiser();
            }
            else{ //when change from enhanced to basic
              $scope.isAdvertiserEnhanced = false;
              $scope.mmIsTabValid = true;
              buildGridColumns();
            }
          }
        };

        $scope.onSurfaceChange = function(){
          $scope.mmErrorMessage.surfaceError = '';
          if($scope.mmErrorMessage.durationError == ''){
            $scope.mmIsTabValid = true;
          }
        };

        $scope.onDurationChange = function(){
          $scope.mmErrorMessage.durationError = '';
          if($scope.mmErrorMessage.surfaceError == ''){
            $scope.mmIsTabValid = true;
          }
        };

        $scope.$on('$destroy', function () {
          if (accountEventListener) accountEventListener();
          if (advertiserEventListener) advertiserEventListener();
          if (manipulatorEventListener) manipulatorEventListener();
          if (watcher) watcher();
        })
      }]
  }
}]);
