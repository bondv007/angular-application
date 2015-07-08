/**
 * Created by ATD on 2/18/2015.
 */
'use strict';

app.controller('ctsEventsSpreadsheetCtrl', ['$scope', '$interval','$state', '$stateParams', 'EC2Restangular', 'mmAlertService', 'spreadsheetService', '$q', 'enums', 'mmSession', 'contactsService', 'mmModal', '$modal', '$timeout', 'validationHelper',
  function ($scope, $interval, $state, $stateParams, EC2Restangular, mmAlertService, spreadsheetService, $q, enums, mmSession, contactsService, mmModal, $modal, $timeout,validationHelper) {

    $scope.user = mmSession.get('user');
    $scope.campaignId = $stateParams.campaignId ? $stateParams.campaignId : $scope.$parent.entityId;
    $scope.$root.isDirtyEntity = true;
    $scope.pageReady = false;
    $scope.isEditMode = true;
    $scope.labelWidth = 165;
    $scope.isRequired = true;
    $scope.cellButtonMargin = 5;
    $scope.validation = {};
    $scope.showSPinner = true;
    $scope.showSpread =false;
    $scope.interactionsOrEvents = [{id: 1, name: 'Interactions'}, {id: 2, name: 'Events'}];
    $scope.editType = 1;
    /*** Toolbar ***/

    //$scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: save, ref: null, nodes: []};
    $scope.entityLayoutInfraButtons.saveButton = {name: 'Update Media Plan', func: saveData, ref: null, nodes: [], isPrimary: true};

    $scope.spreadFirstActions = [
      { name: 'Fix Validation Errors', func: spreadsheetService.fixValidationErrorsFunc },
      { name: 'Import', func: placeholderFunc, items: [
        {name: 'Import from CSV', func: importCSVModal},
        {name: 'Import from Excel', func: importXLSXModal}
      ]},
      { name: 'Export', func: placeholderFunc, items: [
        {name: 'Export to CSV', func: exportCSV},
        {name: 'Export to Excel', func: exportXLSX}
      ]}
    ];
    $scope.spreadSecondActions = [
      { name: 'Clear', func: spreadsheetService.clearRowsFunc },
      { name: 'Add Suffix', func: placeholderFunc },
      { name: 'Apply Single CTU', func: placeholderFunc }
    ];
    $scope.spreadThirdActions = [
      { name: 'Freeze', func: placeholderFunc },
      { name: 'Filter & Sort', func: placeholderFunc, items: [
        {name: 'Sort Ascending', func: spreadsheetService.sortFunc.bind(null, true)},
        {name: 'Sort Descending', func: spreadsheetService.sortFunc.bind(null, false)},
        {name: 'Turn Filter On', func: spreadsheetService.turnFilterOn},
        {name: 'Clear All Filters', func: spreadsheetService.clearAllFilters}
      ] },
      { name: 'Find', func: placeholderFunc, items: [
        {name: 'Find', func: placeholderFunc},
        {name: 'Replace', func: placeholderFunc}
      ]}
    ];

    $scope.onEditTypeSelected = function(val){
      if ($scope.editType == 2) {
        $scope.spreadSecondActions = [
          { name: 'Clear', func: spreadsheetService.clearRowsFunc },
          { name: 'Add Events', func: showAddEvents },
          { name: 'Add Suffix', func: placeholderFunc }
        ];
      }
      else {
        $scope.spreadSecondActions = [
          { name: 'Clear', func: spreadsheetService.clearRowsFunc },
          { name: 'Add Suffix', func: placeholderFunc },
          { name: 'Apply Single CTU', func: placeholderFunc }
        ];
      }
      setup();
    };

    $scope.spreadActionInvoke = function(acFunc, list) {
      var func = acFunc.func;
      if (!acFunc.disable && func){
        func();
      }
    };

    function importCSVModal(){
      $("#csv-file").click();
    }

    function importXLSXModal(){
      $("#excel-file").click();
    }

    function exportCSV(){
      //TODO: set file name based on type of data being edited
      spreadsheetService.exportToCSV($scope.campaignId + "_placements.csv");
    }

    function exportXLSX(){
      //TODO: set file name based on type of data being edited
      spreadsheetService.exportToXLSX($scope.campaignId + " Placements", $scope.campaignId + "_placements.xlsx");
    }

    function placeholderFunc() {}

    function showAddEvents(){
      $scope.toggleAddEventsContainer(true);
    }

    /*** End Toolbar ***/

    /*** Data Setup ***/
    $scope.campaignStatuses = enums.campaignStatus;
    $scope.thirdPartyTracking = enums.thirdpartyURLsTypes;
    $scope.dateFormats = enums.dateFormats;
    $scope.thirdPartyAdTags = enums.thirdPartyAdTags;
    $scope.regulationProgram = enums.regulationProgram;
    $scope.targetWindowTypes = enums.targetWindowTypes;
    $scope.gmtOffset = enums.GMTOffset;
    var dataOperations = 0;
    var saveDataOperations = 0;
    var saveDataOperationsCurrentCount = 0;
    var saveResponseData = [];
    var saveResponseErrorData = [];

    $scope.idsToDelete = [];
    $scope.placementTypes = enums.placementTypes;
    $scope.placementTypeList = [];
    $scope.siteList = [];
    $scope.sections = [];
    $scope.siteSectionList = [];
    $scope.packageList = [];
    $scope.newPlacementAd = {};
    $scope.placementAds = [];
    $scope.targetWindowTypeList = [];
    $scope.eventColTypes = []; //urlType, count
    $scope.newEvent = {type: "ThirdPartyURL", url: "", urlSource: "AD", urlType: ""};
    $scope.ciRows = [];
    $scope.deDupCI = false;

    EC2Restangular.all('ads').getList({campaignId:$scope.campaignId}).then(function (all) {
      for (var i = 0; i < all.length; i++){
        if (all[i].placementId != null){
          $scope.placementAds.push(all[i]);
        }
      }
      console.log("placementAds", $scope.placementAds);
      dataOperations++;
      setup();
    }, function (response) {
      console.log(response);
    });

    EC2Restangular.all('placements').getList({campaignId:$scope.campaignId}).then(function (all) {
      $scope.placements = all;
      for (var i = 0; i < all.length; i++){
        setSectionName(all[i]);
      }
      dataOperations++;
      setup();
    }, function (response) {
      console.log(response);
    });

    EC2Restangular.all('placements').all('packages').getList({campaignId:$scope.campaignId}).then(function (all) {
      $scope.packages = all;
      $scope.selectedPackages = $scope.packages;
      for (var i = 0; i < $scope.packages.length; i++){
        $scope.packageList.push($scope.packages[i].name);
      }
      dataOperations++;
      setup();
    }, function (response) {
      console.log(response);
    });

    $scope.getSite = function(site){
      EC2Restangular.all('sites').all('global').one(site.siteId).get().then(function(_site){
        for(var i=0;i<$scope.sheetData.length;i++)
        {
          if(this.siteId == $scope.sheetData[i].siteId)
          {
            $scope.spreadSheet.setValue(i,4,_site.name, $.wijmo.wijspread.SheetArea.viewport);
          }
        }
      }.bind(site));
    }

    $scope.getSection = function(placement){
      EC2Restangular.all('sitesection').all('global').one(placement.sectionId).get().then(function(section){
        this.siteSectionName = section.name;
        addSection2Session(section);
      }.bind(placement));
    }

    /*EC2Restangular.all('sites').all('sitesection').all('global').getList().then(function (all) {
      $scope.sections = all;
      $scope.siteSections = $scope.sections;
      dataOperations++;
      setup();
    }, function (response) {
      console.log(response);
    });*/

    $scope.prepareData = function (items, colDefs){
      for (var i = 0; i < $scope.targetWindowTypes.length; i++){
        $scope.targetWindowTypeList.push($scope.targetWindowTypes[i].id);
      }

      //add additional columns to placementAds - these must be removed before saving this data
      for (var i = 0; i < items.length; i++){
        for (var j = 0; j < $scope.placements.length; j++){
          if ($scope.placements[j].id == items[i].placementId){
            items[i].placementType = $scope.placements[j].type;
            items[i].placementName = $scope.placements[j].name;
            items[i].sectionName = ""; //TODO: complete when sections service is working again
            break;
          }
        }
      }
    };

    /*** End Data Setup ***/

    function setSectionName(placement){
      var sections = $.grep($scope.sections, function(e){ return e.id == placement.sectionId; });
      if(sections.length > 0){
        placement.siteSectionName = sections[0].name;
      }
      else{
        $scope.getSection(placement);
      }
    }

    function addSection2Session(section){
      var existSections = $.grep($scope.sections, function(e){ return e.id == section.id; });
      if(existSections.length == 0)
      {
        $scope.sections.push(section);
      }
    }

    /*** Data Saving ***/

    function saveData(){
      if ($scope.deDupCI){
        deDupCIRows();
        $scope.depDupCI = false;
      }
      //build event objects
      for (var i = 0; i < $scope.placementAds.length; i++){
        var ad = $scope.placementAds[i];
        if (ad.adURLs != undefined) ad.adURLs.length = 0;
        for (var j = 0; j < $scope.eventColTypes.length; j++){
          var evt = $scope.eventColTypes[j];
          for (var k = 0; k < evt.count; k++){
            var fieldName = evt.urlType + "__" + k;
            if (ad[fieldName] != undefined && ad[fieldName].length > 0){
              var newEvent = angular.copy($scope.newEvent);
              newEvent.urlType = evt.urlType;
              newEvent.url = ad[fieldName];
              if (ad.adURLs == undefined) ad.adURLs = [];
              ad.adURLs.push(newEvent);
            }
            if (ad[fieldName] != undefined) delete ad[fieldName];
          }
        }
      }
      console.log($scope.placementAds)

      //build custom interaction objects


      //fields to remove:
      //delete ad.placementType
      //delete ad.placementName
      //delete ad.sectionName

      //make call(s) to save the data

      //reload $scope.placementAds
      //rerun setup();
    }

    /*** End Data Saving ***/

    /*** Spreadsheet setup ***/
    /*** spreadsheet Service Properties / Functions ***/
    $scope.validationProgress = {inProgress: false, complete: false, total: 0, currentCount: 0, error: false  };
    $scope.sheetData = $scope.placementAds;
    $scope.newSheetDataObject = $scope.newPlacementAd;
    $scope.spreadCols = [];
    $scope.spreadSheet = {};
    $scope.selectedRows = [];
    $scope.firstSelectedRowIndex = 0;
    $scope.selectedRowIndexes = [];
    $scope.copyRows = [];
    $scope.barCurrentCount = 0;
    $scope.barCurrentPercentage = 0;
    $scope.validationSuccessCount = 0;
    $scope.validationErrorCount = 0;
    $scope.validationWarningCount = 0;
    $scope.validationErrorCells = [];
    $scope.validationErrorActiveCell = {row: -1, col: -1};
    $scope.validationWarningCells = [];
    $scope.validationWarningActiveCell = {row: -1, col: -1, message: ''};
    $scope.validationFixSimilar = true;
    $scope.validationFixColDef = {};
    $scope.validationFixInputVal = {theValue: ""};
    $scope.fileToImport = "";
    $scope.allowNewRows = false;

    $scope.importCSVFile = function (evt){
      spreadsheetService.importCSVFile(evt, convertImportItem);
    }

    $scope.importXLSXFile = function (evt) {
      spreadsheetService.importXLSXFile(evt, convertImportItem)
    }

    function convertImportItem(placement, input){
      /*placement.status = input['Status'] != undefined ? input['Status'] : "New";
      placement.id = input['Id'] != undefined ? input['Id'] : "";
      placement.name = input['Name'] != undefined ? input['Name'] : "";
      placement.packageName = input['Package'] != undefined ? input['Package'] : "";
      placement.siteName = input['Site'] != undefined ? input['Site'] : "";
      placement.siteSectionName = input['Site Section'] != undefined ? input['Site Section'] : "";
      placement.contactNames = input['Site Contacts'] != undefined ? input['Site Contacts'] : "";
      placement.servingAndCostData.mediaServingData.startDate = input['Start Date'] != undefined ? input['Start Date'] : "";
      placement.servingAndCostData.mediaServingData.endDate = input['End Date'] != undefined ? input['End Date'] : "";
      placement.placementTypeName = input['Placement Type'] != undefined ? input['Placement Type'] : "";
      placement.bannerSizeName = input['Dimensions'] != undefined ? input['Dimensions'] : "";
      placement.servingAndCostData.mediaCostData.costModel = input['Cost Model'] != undefined ? input['Cost Model'] : "";
      placement.servingAndCostData.mediaServingData.units = input['Units'] != undefined ? input['Units'] : "";
      placement.servingAndCostData.mediaCostData.orderedUnits = input['Ordered Units'] != undefined ? input['Ordered Units'] : "";
      placement.servingAndCostData.mediaCostData.rate = input['Rate'] != undefined ? input['Rate'] : "";
      placement.servingAndCostData.mediaCostData.ignoreOverDelivery = input['Ignore Over Delivery'] != undefined ? (input['Ignore Over Delivery'] == "TRUE" ? true : false) : false;
      //placement.servingAndCostData.mediaCostData.actionType = input['Action Type'] != undefined ? input['Action Type'] : "";
      placement.servingAndCostData.mediaServingData.servingCompletedMethodName = input['Stop Serving Method'] != undefined ? input['Stop Serving Method'] : "";
      */return placement;
    }
    /*** End spreadsheet Service Properties / Functions ***/

    function setup(){
      if (dataOperations == 3){ //data dependencies loaded
        if ($scope.placementAds.length == 0){
          mmAlertService.addWarning('The are no placement ads on this campaign.', '', 'No Placement Ads');
          $scope.showSpread = false;
        }

        var colDefs = [];
        colDefs.push(new spreadsheetService.colDef('input','placementType','Placement Type',150,[],'', '', '', '', true, [], '', ''));
        colDefs.push(new spreadsheetService.colDef('input','placementId','Placement ID',150,[],'', '', '', '', true, [], '', ''));
        colDefs.push(new spreadsheetService.colDef('input','placementName','Placement Name',150,[],'', '', '', '', true, [], '', ''));
        colDefs.push(new spreadsheetService.colDef('input','siteName','Site',150,[],'', '', '', '', true, [], '', ''));
        colDefs.push(new spreadsheetService.colDef('input','sectionName','Section',150,[],'', '', '', '', true, [], '', ''));
        colDefs.push(new spreadsheetService.colDef('input','id','Placement Ad ID',150,[],'', '', '', '', true, [], '', ''));
        colDefs.push(new spreadsheetService.colDef('input','name','Placement Ad Name',150,[],'', '', '', '', true, [], '', ''));
        colDefs.push(new spreadsheetService.colDef('input','adFormat','Ad Format',150,[],'', '', '', '', true, [], '', ''));
        colDefs.push(new spreadsheetService.colDef('input','mainClickthrough.url','Click Through URL',150,[],'',$scope.validateURL, '', '', false, [], '', ''));
        colDefs.push(new spreadsheetService.colDef('combo','mainClickthrough.targetWindowType','Target Window',150, $scope.targetWindowTypeList, $scope.validateTargetWindowType, '', '', '', false, [], '', ''));
        colDefs.push(new spreadsheetService.colDef('check','mainClickthrough.showAddressBar','Show Address Bar',150, '', '', '', '', '', false, [], '', ''));
        colDefs.push(new spreadsheetService.colDef('check','mainClickthrough.showMenuBar','Show Menu Bar',150, '', '', '', '', '', false, [], '', ''));

        var hasCI = false;
        for (var i = 0; i < $scope.placementAds.length; i++){
          if ($scope.placementAds[i].customInteractions != null) hasCI = true;
        }

        prepareInitialEventTypes();
        if (!hasCI && $scope.editType == 1){
          mmAlertService.addWarning('The are no placement ads on this campaign with custom interactions. Editing of interactions has been disabled.', '', 'No Custom Interactions');
          $scope.editType = 2;
        }
        if ($scope.editType == 1){
          prepareCIRows();
          $scope.deDupCI = true;
          colDefs.push(new spreadsheetService.colDef('input','ci.name','Custom Interaction Name',200,[],'', '', '', '', false, [], '', ''));
          colDefs.push(new spreadsheetService.colDef('input','ci.reportingName','Custom Interaction Reporting Name',200,[],'', '', '', '', false, [], '', ''));
          colDefs.push(new spreadsheetService.colDef('input','ci.redirectURL','Custom Interaction URL',200,[],'', $scope.validateURL, '', '', false, [], '', ''));
          $scope.sheetData = $scope.ciRows;
        }
        else {
          if ($scope.deDupCI){
            deDupCIRows();
            $scope.depDupCI = false;
          }
          $scope.sheetData = $scope.placementAds;
          for (var i = 0; i < $scope.eventColTypes.length; i++){
            for (var j = 0; j < $scope.eventColTypes[i].count; j++){
              var colField = $scope.eventColTypes[i].urlType + '__' + j;
              var colName = $scope.eventColTypes[i].urlType.replace('_', ' ') + ' ' + (j+1);
              colDefs.push(new spreadsheetService.colDef('input',colField,colName,250,[],'', $scope.validateURL, '', '', false, [], '', ''));
            }
          }
          //prepare values for event type quantity modal
          for (var j = 0; j < $scope.thirdPartyTracking.length; j++){
            var exists = false;
            for (var i = 0; i < $scope.eventColTypes.length; i++) {
              if ($scope.thirdPartyTracking[j].id == $scope.eventColTypes[i].urlType) {
                exists = true;
                $scope.eventColTypes[i].urlTypeName = $scope.thirdPartyTracking[j].name;
                break;
              }
            }
            if (!exists){
              $scope.eventColTypes.push({urlType: $scope.thirdPartyTracking[j].id, urlTypeName: $scope.thirdPartyTracking[j].name, count: 0});
            }
          }
          console.log($scope.eventColTypes);
        }

        var cols = spreadsheetService.buildColumns(colDefs);
        $scope.spreadCols = cols;
        if ($scope.sheetData.length == 0) $scope.placementAds.push(angular.copy($scope.newSheetDataObject));
        spreadsheetService.initSpread($scope.sheetData, cols);

        $scope.initValidationProgress();
        $scope.initMPProgress();
      }
    }

    function prepareCIRows() {
      $scope.ciRows.length = 0;
      for (var i = 0; i < $scope.placementAds.length; i++) {
        var ad = $scope.placementAds[i];
        if (ad.customInteractions != undefined && ad.customInteractions.length > 0) {
          var ci = ad.customInteractions;
          for (var j = 0; j < ci.length; j++){
            if (ci[j].type.toLowerCase().indexOf('click') > -1){
              var newAd = angular.copy(ad);
              newAd.ci = ci[j];
              $scope.ciRows.push(newAd);
            }
          }
        }
      }
    }

    function deDupCIRows(){
      var temp = [];
      var item = {id: '', list: []};
      for (var i = 0; i < $scope.ciRows.length; i++){
        var row = $scope.ciRows[i];
        if (temp[row.id] != undefined){
          temp[row.id].push(row.ci);
        }
        else {
          temp[row.id] = [];
          temp[row.id].push(row.ci);
        }
      }
      for (var i = 0; i < $scope.placementAds.length; i++){
        var ad = $scope.placementAds[i];
        if (temp[ad.id] != undefined){
          var adCI = angular.copy(ad.customInteractions);
          var newCI = [];
          if (adCI != undefined){
            for (var k = 0; k < adCI.length; k++){
              if (adCI[k].type.toLowerCase().indexOf('click') == -1) newCI.push(adCI[k]);
            }
          }
          for (var k = 0; k < temp[ad.id].length; k++){
            newCI.push(temp[ad.id][k]);
          }
          ad.customInteractions = ad.customInteractions || [];
          ad.customInteractions.length = 0;
          for (var k = 0; k < newCI.length; k++){
            ad.customInteractions.push(newCI[k]);
          }
        }
      }
    }

    function prepareInitialEventTypes(){
      for (var i = 0; i < $scope.placementAds.length; i++){
        var ad = $scope.placementAds[i];
        var adEvents = [];
        if (ad.adURLs != undefined && ad.adURLs.length > 0){
          for (var j = 0; j < ad.adURLs.length; j++){
            if (adEvents.length == 0){
              adEvents.push({urlType: ad.adURLs[j].urlType, count: 1});
              ad[ad.adURLs[j].urlType + '0'] = ad.adURLs[j].url;
            }
            else {
              for (var k = 0; k < adEvents.length; k++){
                if (adEvents[k].urlType == ad.adURLs[j].urlType) {
                  adEvents[k].count = adEvents[k].count++;
                  ad[ad.adURLs[j].urlType + '__' + adEvents[k].count-1] = ad.adURLs[j].url;
                }
                else {
                  adEvents.push({urlType: ad.adURLs[j].urlType, count: 1});
                  ad[ad.adURLs[j].urlType + '__0'] = ad.adURLs[j].url;
                }
              }
            }
          }
          if ($scope.eventColTypes.length == 0) {
            $scope.eventColTypes = angular.copy(adEvents);
          }
          else {
            for (var l = 0; l < adEvents.length; l++){
              var exists = false;
              for (var k = 0; k < $scope.eventColTypes.length; k++) {
                var eventCol = $scope.eventColTypes[k];
                if (eventCol.urlType == adEvents[l].urlType) {
                  if (eventCol.count < adEvents[l].count) eventCol.count = adEvents[l].count;
                  exists = true;
                  break;
                }
              }
              if (!exists){
                $scope.eventColTypes.push({urlType: adEvents[l].urlType, count: adEvents[l].count});
              }
            }
          }
        }
      }
      for (var i = 0; i < $scope.eventColTypes.length; i++){
        for (var j = 0; j < $scope.eventColTypes[i].count; j++){
          var colField = $scope.eventColTypes[i].urlType + '__' + j;
          var colName = $scope.eventColTypes[i].urlType.replace('_', ' ') + ' ' + (j+1);
          for (var k = 0; k < $scope.placementAds.length; k++){
            var ad = $scope.placementAds[k];
            if (ad[colField] == undefined){
              ad[colField] = "";
            }
          }
        }
      }
    }

    $(document).ready(function () {
      $("#ss").wijspread({ sheetCount: 1, tabStripVisible :false });
    });
    /*** End Spreadsheet setup ***/


    /**** Modal Functions *****/

    $scope.moveToNextError = function (fix, close){ //gives UI access to sheet service move next error function
      spreadsheetService.moveToNextError(fix, close);
    };

    $scope.initValidationProgress = function(saveData) {
      $scope.barCurrentPercentage = 0;
      $scope.validationSuccessCount = 0;
      $scope.validationErrorCount = 0;
      $scope.validationWarningCount = 0;
      $scope.validationProgress = {inProgress: false, complete: false, progressItems: [{caption: "Validating Spreadsheet", type: "bar", total: 0, currentCount: 0, itemDone: false, error: false, statusMessage: "" }]};
      if (saveData){
        var transfer = {caption: "Transferring Data", itemInProgress: false, itemDone: false, type: "spinner", statusMessage: "Transfer in-progress...", error: false  };
        var processing = {caption: "Processing Data", itemInProgress: false, itemDone: false, type: "spinner", statusMessage: "Data processing in-progress...", error: false  };
        var retrieval = {caption: "Refreshing Data", itemInProgress: false, itemDone: false, type: "spinner", statusMessage: "Data retrieval in-progress...", error: false  };
        $scope.validationProgress.progressItems.push(transfer);
        $scope.validationProgress.progressItems.push(processing);
        $scope.validationProgress.progressItems.push(retrieval);
      }
    };

    $scope.initMPProgress = function() {
      $scope.mediaPlanProgress = {inProgress: false, complete: false, error: false, progressItems: [{caption: "Submitting Plan", type: "boolean", itemDone: false, error: false },
        {caption: "Processing Plan", type: "bar", total: 0, currentCount: 0, error: false },
        {caption: "Refreshing Data", type: "boolean", itemDone: false, error: false }]};
    };

    $scope.toggleProgressContainer = function (view) {
      if (view) {$scope.showVPContainer = !$scope.showVPContainer;}
      else {$scope.showMPContainer = !$scope.showMPContainer;}
    };

    $scope.closeProgressContainer = function(view) {
      if (view) {
        $scope.initValidationProgress();
        $scope.showVPContainer = false;
      } else {
        $scope.initMPProgress();
        $scope.showMPContainer = false;
      }
    };

    $scope.minimizeProgressContainer = function(view) {
      if (view) {
        $scope.showVPContainer = false;
      } else {
        $scope.showMPContainer = false;
      }
    };

    $scope.toggleValidationFixContainer = function (view) {
      $scope.showValidationFixContainer = view;
      $timeout(function() {
        //hack to force an apply and display the dialog; the dialog won't show without this (reason unknown)
      },10);
    };

    $scope.closeValidationFix = function(view) {
      if (view) {
        $scope.showValidationFixContainer = false;
      } else {
        $scope.showValidationFixContainer = false;
      }
    };

    $scope.saveValidationFix = function(view) {
      if (view) {
        $scope.showValidationFixContainer = false;
      } else {
        $scope.showValidationFixContainer = false;
      }
    };

    $scope.toggleAddEventsContainer = function (view) {
      $scope.showAddEventsContainer = view;
      if (view) {
        $scope.eventColTypesModal = angular.copy($scope.eventColTypes);
        $timeout(function () {
          document.getElementById('addEventsContainerId').style.visibility = 'visible';
        }, 10);
      }
    };

    $scope.closeAddEventsContainer = function(view) {
      $scope.showAddEventsContainer = false;
    };

    $scope.addEvents = function(view) {
      $scope.showAddEventsContainer = false;
      console.log($scope.eventColTypesModal);
      var colDefs = [];
      var removedCols = false;
      for (var i = 0; i < $scope.eventColTypesModal.length; i++){
        for (var j = 0; j < $scope.eventColTypes.length; j++){
          if ($scope.eventColTypes[j].urlType == $scope.eventColTypesModal[i].urlType){
            if ($scope.eventColTypes[j].count < $scope.eventColTypesModal[i].count){
              var numToAdd = $scope.eventColTypesModal[i].count - $scope.eventColTypes[j].count;
              for (var k = 0; k < numToAdd; k++){
                var colField = $scope.eventColTypes[j].urlType + "__" + ($scope.eventColTypes[j].count + (0 + k));
                var colName = $scope.eventColTypes[j].urlType.replace('_', ' ') + ' ' + ($scope.eventColTypes[j].count + (1 + k));
                colDefs.push(new spreadsheetService.colDef('input',colField,colName,250,[],'', $scope.validateURL, '', '', false, [], '', ''));
                for (var l = 0; l < $scope.placementAds.length; l++){
                  var ad = $scope.placementAds[l];
                  if (ad[colField] == undefined){
                    ad[colField] = "";
                  }
                }
              }
              $scope.eventColTypes[j].count = Number($scope.eventColTypesModal[i].count);
            }
            else if ($scope.eventColTypes[j].count > $scope.eventColTypesModal[i].count){
              var numToRemove = $scope.eventColTypes[j].count - $scope.eventColTypesModal[i].count;
              for (var k = 0; k < numToRemove; k++){
                var colField = $scope.eventColTypes[j].urlType + "__" + ($scope.eventColTypes[j].count - (k + 1));
                var indexToRemove = -1;
                for (var l = 0; l < $scope.spreadCols.length; l++){
                  if ($scope.spreadCols[l].name == colField) indexToRemove = l;
                }
                if (indexToRemove > -1) {
                  $scope.spreadCols.splice(indexToRemove, 1);
                  removedCols = true;
                  for (var l = 0; l < $scope.placementAds.length; l++){
                    var ad = $scope.placementAds[l];
                    if (ad[colField] != undefined){
                      delete ad[colField];
                    }
                  }
                }
              }
              $scope.eventColTypes[j].count = $scope.eventColTypes[j].count - numToRemove;
            }
          }
        }
      }
      if (colDefs.length > 0) {
        var cols = spreadsheetService.buildColumns(colDefs);
        for (var i = 0; i < cols.length; i++){
          $scope.spreadCols.push(cols[i]);
        }
      }
      if (colDefs.length > 0 || removedCols){
        spreadsheetService.initSpread($scope.sheetData, $scope.spreadCols);
        console.log($scope.sheetData);
      }
    };

    /**** Modal Functions *****/


    /**** SPREADSHEET COLUMN CUSTOM FUNCTIONS ****/

    //Validate Functions

    $scope.validateURL = function (row, rowIndex, dataSource, col){

      var url = "";
      if(col.name.indexOf('.') > -1)
      {
        var arr = col.name.split('.');
        if(row[arr[0]] == undefined) return {isValid: true, hasWarning: false, message: "yay"};

        url = row[arr[0]][arr[1]];
      }
      else
      {
        if(row[col.name]== undefined) return {isValid: true, hasWarning: false, message: "yay"};
        url = row[col.name];
      }
      if (url != "" && url.length > 0 && !isValidUrl(url))
        return {isValid: false, hasWarning: false, message: "Please enter a valid url including the protocol (e.g. http://www.sizmek.com)"};
      return {isValid: true, hasWarning: false, message: "yay"};
    }

    $scope.validateTargetWindowType = function(row, rowIndex, dataSource, col){

      if(row.mainClickthrough.targetWindowType == null)
      {
        return {isValid: false, hasWarning: false, message: "Please choose Target window"};
      }
      else
      {
        return {isValid: true, hasWarning: false, message: "yay"};
      }

    }
    /**** END SPREADSHEET COLUMN CUSTOM FUNCTIONS ****/

    /*** Utils ***/
    function validateThirdPartyURL(row) {
      var result =
      {
        isSuccess: true,
        message: []
      };
      if ($scope.isMultiple && row.entity.url === multipleValue) {
        return result;
      }

      if (!row.entity.url) {
        result.message.push("Enter valid URL");
        result.isSuccess = false;
      }
      else {
        result = validationHelper.gridValidationHelper.validateUrl(row.entity, 'url');
      }

      if (result.isSuccess) {
        $scope.errors.adURLs = "";
      }
      else {
        thirdPartyUrlValidationResult.fields.push({'fieldName': 'url', 'value': row.entity.url, message: 'Enter valid URL'})
      }

      return result;
    }

    function isValidUrl(url) {
      $scope.urlError = {text: ''};
      var res = validationHelper.gridValidationHelper.validateUrl(url, 'url');
      return res.isSuccess;
    }

    function fetchFromObject(obj, prop){
      if(typeof obj === 'undefined') return false;
      var _index = prop.indexOf('.')
      if(_index > -1){
        return fetchFromObject(obj[prop.substring(0, _index)], prop.substr(_index+1));
      }
      return obj[prop];
    }

    function processError(error) {
      $scope.showSPinner = false;
      if (error.data == undefined || error.data.error == undefined){
        mmAlertService.addError(error);
      } else {
        mmAlertService.addError(error.data.error);
      }
      $timeout(function() {
        //hack to force an apply and display the alert dialog; the dialog won't show without this (reason unknown)
      },10);
    }

    /*** End Utils ***/

  }]);

