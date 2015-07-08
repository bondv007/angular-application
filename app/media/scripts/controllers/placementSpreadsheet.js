/**
 * Created by atd on 12/4/14.
 */

'use strict';

app.controller('placementSpreadsheetCtrl', ['$scope', '$interval','$state', '$stateParams', 'EC2Restangular', 'mmAlertService', 'spreadsheetService', '$q', 'enums', 'mmSession', 'contactsService', 'mmModal', '$modal', '$timeout',
  function ($scope, $interval, $state, $stateParams, EC2Restangular, mmAlertService, spreadsheetService, $q, enums, mmSession, contactsService, mmModal, $modal, $timeout) {

    $scope.brandId = $stateParams.brandId;
    $scope.user = mmSession.get('user');
    $scope.campaignId = $stateParams.campaignId ? $stateParams.campaignId : $scope.$parent.entityId;
    $scope.$root.isDirtyEntity = false;
    $scope.pageReady = false;
    $scope.isEditMode = true;
    $scope.labelWidth = 165;
    $scope.isRequired = true;
    $scope.cellButtonMargin = 5;
    $scope.validation = {};
    $scope.showSPinner = true;
    $scope.showSpread = false;
    $scope.isPlacementsExist = false;
    $scope.placementsCentralLink = {link: "spa.campaign.placements.placementEdit"};

    /*** Toolbar ***/
      //$scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: save, ref: null, nodes: []};
    $scope.entityLayoutInfraButtons.saveButton = {
      name: 'Update Media Plan',
      func: validateSave,
      ref: null,
      nodes: [],
      isPrimary: true
    };

    $scope.placementSpreadFirstActions = [
      /*{ name: 'Copy', func: copyRowsFunc },
       { name: 'Paste', func: pasteRowsFunc },
       { name: 'Insert', func: insertRowsFunc },*/
      {name: 'Clear Selected Rows', func: spreadsheetService.clearRowsFunc}
    ];
    $scope.placementSpreadSecondActions = [
      {name: 'Fix Validation Errors', func: spreadsheetService.fixValidationErrorsFunc},
      //{ name: 'Validate', func: validateOnly },
      {
        name: 'Import', func: placeholderFunc, items: [
        {name: 'Import from CSV', func: importCSVModal},
        {name: 'Import from Excel', func: importXLSXModal}
      ]
      },
      {
        name: 'Export', func: placeholderFunc, items: [
        {name: 'Export to CSV', func: exportCSV},
        {name: 'Export to Excel', func: exportXLSX}
      ]
      }
    ];
    $scope.placementSpreadThirdActions = [
      {name: 'Freeze', func: placeholderFunc},
      {
        name: 'Filter & Sort', func: placeholderFunc, items: [
        {name: 'Sort Ascending', func: spreadsheetService.sortFunc.bind(null, true)},
        {name: 'Sort Descending', func: spreadsheetService.sortFunc.bind(null, false)},
        {name: 'Turn Filter On', func: spreadsheetService.turnFilterOn},
        {name: 'Clear All Filters', func: spreadsheetService.clearAllFilters}
      ]
      },
      {
        name: 'Find', func: placeholderFunc, items: [
        {name: 'Find', func: placeholderFunc},
        {name: 'Replace', func: placeholderFunc}
      ]
      }
    ];

    $scope.placementSpreadActionInvoke = function (acFunc, list) {
      var func = acFunc.func;
      if (!acFunc.disable && func) {
        func();
      }
    };

    function placeholderFunc() {
    }

    function importCSVModal() {
      $("#csv-file").click();
    }

    function importXLSXModal() {
      $("#excel-file").click();
    }

    function exportCSV() {
      spreadsheetService.exportToCSV($scope.campaignId + "_placements.csv");
    }

    function exportXLSX() {
      spreadsheetService.exportToXLSX($scope.campaignId + " Placements", $scope.campaignId + "_placements.xlsx");
    }

    function copyRowsFunc() {
      $scope.copyRows.length = 0;
      $scope.copyRows = angular.copy($scope.selectedRows);
    }

    /*** End Toolbar ***/

    /*** Data Setup ***/
      //set enums objects
    $scope.campaignStatuses = enums.campaignStatus;
    $scope.thirdPartyTracking = enums.thirdpartyURLsTypes;
    $scope.dateFormats = enums.dateFormats;
    $scope.thirdPartyAdTags = enums.thirdPartyAdTags;
    $scope.regulationProgram = enums.regulationProgram;
    $scope.gmtOffset = enums.GMTOffset;
    var dataOperations = 0;
    var saveDataOperations = 0;
    var saveDataOperationsCurrentCount = 0;
    var saveResponseData = [];
    var saveResponseErrorData = [];
    var defaultStartEndDate = new Date();
    var saveNewSectionsQueue = [];

    $scope.idsToDelete = [];
    $scope.placementTypes = enums.placementTypes;
    $scope.bannerSizeMap = []; //$scope.bannerSizeMap.push("Add New");
    $scope.placementTypeList = [];
    $scope.sites = [];
    $scope.siteList = [];
    $scope.sections = [];
    $scope.siteSectionList = [];
    $scope.selectedContacts = [];
    $scope.siteContacts = [];
    $scope.packageList = []; //$scope.packageList.push("Add New");
    $scope.placements = [];
    $scope.newPlacement = {
      isNew: true,
      isDirty: false,
      adBlocking: false,
      adEnableBaseUrl: "",
      adsToAttach: null,
      asyncMode: false,
      bandwidth: false,
      bannerSize: {},
      bannerSizeName: "",
      campaignId: $scope.campaignId,
      campaignName: "",
      collectWebPage: false,
      contactNames: "",
      controlOverDelivery: false,
      disableCookies: false,
      endTimeOfDay: 0,
      flightTargetingInfo: "",
      id: "",
      impressionForWholePlacement: -1,
      mobileApplicationAdEnabler: null,
      name: "",
      packageId: "",
      packageName: "",
      placementMV: false,
      placementType: "",
      placementTypeName: "",
      sectionId: "",
      servingAndCostData: {
        mediaServingData: {
          units: "",
          hardStopMethod: "KEEP_SERVING_AS_USUAL",
          startDate: "",
          endDate: ""
        },
        mediaCostData: {
          type: "MediaCost",
          costModel: "",
          rate: "",
          orderedUnits: "",
          customInteraction: null,
          conversionId: null,
          interactionId: null,
          ignoreOverDelivery: false,
          actionType: ""
        },
        placementLevel: true
      },
      servingEnabled: false,
      siteContacts: {selectedContacts: [], siteContacts: []},
      siteId: "",
      siteName: "",
      siteSectionName: "",
      startTimeOfDay: 0,
      status: "",
      supportMobileApplication: false,
      supportMobileApplications: false,
      targetingValue: "",
      testImpressions: 0,
      type: ""
    };
    $scope.newPackage = {
      "type": "PlacementPackage",
      "id": "",
      "name": "",
      "campaignId": $scope.campaignId,
      "siteId": "",
      "mediaServingData": {"units": null, "hardStopMethod": "", "startDate": null, "endDate": null},
      "mediaCostData": {
        "type": "MediaCost",
        "costModel": "",
        "rate": null,
        "orderedUnits": null,
        "actionType": null,
        "customInteraction": null,
        "conversionId": null,
        "interactionId": null,
        "ignoreOverDelivery": false
      },
      "placementLevel": false
    };
    $scope.costModels = enums.packageCostModels;
    $scope.costModelNames = [];
    $scope.servingCompletedMethods = enums.hardStop;
    $scope.servingCompletedMethodNames = [];
    $scope.actionTypes = enums.packageCostActionTypes;
    $scope.actionTypeNames = [];
    $scope.dataPrepared = false;
    $scope.placementsToSave = 0;

    for (var i = 0; i < $scope.costModels.length; i++) {
      $scope.costModelNames.push($scope.costModels[i].name);
    }

    for (var i = 0; i < $scope.servingCompletedMethods.length; i++) {
      $scope.servingCompletedMethodNames.push($scope.servingCompletedMethods[i].name);
    }

    for (var i = 0; i < $scope.actionTypes.length; i++) {
      $scope.actionTypeNames.push($scope.actionTypes[i].name);
    }

    for (var i = 0; i < $scope.placementTypes.length; i++) {
      $scope.placementTypeList.push($scope.placementTypes[i].name);
    }

    EC2Restangular.all('placements').getList({campaignId: $scope.campaignId}).then(function (all) {
      $scope.placements = all;
      $scope.sheetData = $scope.placements;
      $scope.selectedPackages = $scope.packages;
      for (var i = 0; i < all.length; i++){
        all[i].siteName = all[i].relationsBag.parents.site.name;
        addSite2Session(all[i].relationsBag.parents.site);
        setSectionName(all[i]);
      }
      dataOperations++;
      initialize();
    }, function (response) {
      console.log(response);
    });

    EC2Restangular.all('placements').all('packages').getList({campaignId: $scope.campaignId}).then(function (all) {
      $scope.packages = all;
      $scope.selectedPackages = $scope.packages;
      for (var i = 0; i < $scope.packages.length; i++) {
        $scope.packageList.push($scope.packages[i].name);
      }
      dataOperations++;
      initialize();
    }, function (response) {
      console.log(response);
    });

    function searchSites(searchInput) {
      $scope.siteList = [];
      EC2Restangular.all('sites').all('global').getList({q: searchInput}).then(function (all) {
        for (var i = 0; i < all.length; i++) {
          $scope.siteList.push(all[i].name);
          addSite2Session(all[i]);
        }
        if ($("#sAutoComplete").length > 0) {
          $("#sAutoComplete").autocomplete('option', 'source', $scope.siteList);
          $("#sAutoComplete").autocomplete('search', '');
          }
      }, function (response) {
        console.log(response);
      });
    }

    function setSectionName(placement){
      var sections = $.grep($scope.sections, function(e){ return e.id == placement.sectionId; });
      if(sections.length > 0){
        placement.siteSectionName = sections[0].name;
      }
      else{
        $scope.getSection(placement);
      }
    }

    $scope.getSite = function(placement){
      EC2Restangular.all('sites').all('global').one(placement.siteId).get().then(function(site){
        this.siteName = site.name;
        $scope.spreadSheet.repaint();
        addSite2Session(site);
      }.bind(placement));
    }

    $scope.getSection = function(placement){
      EC2Restangular.all('sitesection').all('global').one(placement.sectionId).get().then(function(section){
        this.siteSectionName = section.name;
        $scope.spreadSheet.repaint();
        addSection2Session(section);
      }.bind(placement));
    }

    $scope.getSiteSections = function (siteId){
      EC2Restangular.all('sites').all('sitesection').all('global').getList({siteId: siteId}).then(function (all) {
        $scope.siteSectionList = [];
        for (var i = 0, len = all.length; i < len; i++) {
          $scope.siteSectionList.push(all[i].name);
          addSection2Session(all[i]);
        }
        if ($("#sAutoComplete").length > 0) {
          $("#sAutoComplete").autocomplete('option', 'source', $scope.siteSectionList);
          $("#sAutoComplete").autocomplete('search', '');
        }
      }, function (response) {
        console.log(response);
      });
    }

    //searchSites('');
    EC2Restangular.all('placements').all('bannerSizes').getList().then(function (all) {
      $scope.bannerSize = all;
      formatBannerSize();
      dataOperations++;
      initialize();
    }, function (response) {
      mmAlertService.addError(response);
    });

    $scope.changeSectionsBySiteId = function () {
      if ($scope.placement && $scope.placement.siteId) {
        $scope.siteSections = _.filter($scope.sections, {siteId: $scope.placement.siteId});
        $scope.selectedPackages = _.filter($scope.packages, {
          siteId: $scope.placement.siteId,
          campaignId: $scope.placement.campaignId
        });
      }
      else {
        $scope.siteSections = $scope.sections;
        $scope.selectedPackages = $scope.packages;
      }
    };

    function addSite2Session(site){
      var existSites = $.grep($scope.sites, function(e){ return e.name.toLowerCase() == site.name.toLowerCase(); });
      if(existSites.length == 0)
      {
        $scope.sites.push(site);
      }
    }

    function addSection2Session(section){
      var existSections = $.grep($scope.sections, function(e){ return e.id == section.id; });
      if(existSections.length == 0)
      {
        $scope.sections.push(section);
      }
    }

    function formatBannerSize() {
      var name;
      $scope.bannerSizeDD = [];
      for (var i = 0; i < $scope.bannerSize.length; i++) {
        name = $scope.bannerSize[i]['width'] + 'X' + $scope.bannerSize[i]['height'];
        addBannerSizeToDropDown(name);
      }
    }

    function addBannerSizeToDropDown(name) {
      $scope.bannerSizeDD.push({id: name, name: name});
      $scope.bannerSizeMap.push(name);
    }

    /**** Prepare initial data ****/
    $scope.prepareData = function (items, colDefs) {
      for (var i = 0; i < items.length; i++) {
        for (var c = 0; c < colDefs.length; c++) {
          if (colDefs[c].name == "servingAndCostData.mediaServingData.startDate") {
            if (items[i].servingAndCostData == null) items[i].servingAndCostData = {
              mediaCostData: {},
              mediaServingData: {startDate: '', endDate: ''}
            };
            else {
              if (items[i].servingAndCostData.mediaServingData.startDate != "") {
                var date = new Date(items[i].servingAndCostData.mediaServingData.startDate);
                items[i].servingAndCostData.mediaServingData.startDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
              }
            }
          }
          if (colDefs[c].name == "servingAndCostData.mediaServingData.endDate") {
            if (items[i].servingAndCostData == null) items[i].servingAndCostData = {
              mediaCostData: {},
              mediaServingData: {startDate: '', endDate: ''}
            };
            else {
              if (items[i].servingAndCostData.mediaServingData.endDate != "") {
                var date = new Date(items[i].servingAndCostData.mediaServingData.endDate);
                items[i].servingAndCostData.mediaServingData.endDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
              }
            }
          }
        }
        for (var c = 0; c < colDefs.length; c++) {
          if (colDefs[c].validator != undefined && colDefs[c].validator.length > 0) colDefs[c].validator(items[i], null, items);
        }
      }

      $scope.dataPrepared = true;
    };

    initialize();

    function initialize() {
      setup();
    }

    /*** End Data Setup ***/

    /*** Data Saving ***/
    $scope.saveNewSection = function (row, old_val, rowIndex) {
      if (row.siteId == null || row.siteId.length == 0) {
        processError("Please select a site before adding a new section.");
        row.siteSectionName = "";
      } else {
        var section = {
          type: "SiteSection",
          name: row.siteSectionName.replace("Add New: ", ""),
          siteId: row.siteId,
          url: ""
        };
        var saveSection = EC2Restangular.all('sitesection');
        saveSection.post(section).then(function (data) {
          $scope.siteSectionList.push(data.name);
          $scope.sections.push(data);
          $scope.spreadSheet.isPaintSuspended(true);
          row.siteSectionName = data.name;
          spreadsheetService.validateRows(rowIndex + 1, 1, $scope.spreadSheet, $scope.placements, $scope.spreadCols, false);
          var colIndex;
          for (var i = 0; i < $scope.sheetData.length; i++) {
            if (i != rowIndex && $scope.sheetData[i].siteSectionName != undefined && $scope.sheetData[i].siteSectionName.replace("Add New: ", "") == row.siteSectionName) {
              $scope.sheetData[i].siteSectionName = row.siteSectionName;
              spreadsheetService.validateRows(i + 1, 1, $scope.spreadSheet, $scope.placements, $scope.spreadCols, false);
            }
          }
          $scope.spreadSheet.isPaintSuspended(false);
          $scope.$root.isDirtyEntity = true;
          mmAlertService.addSuccess('Section ' + row.siteSectionName + ' was successfully created.', '', 'Create a new section');
        }, function (error) {
          processError(error);
          row.siteSectionName = "";
        });
      }
    }

    $scope.saveNewBannerSize = function (row, old_val, rowIndex) {
      var valid = false;
      var bannerWidth = "";
      var bannerHeight = "";
      var bannerSize = row.bannerSizeName.toUpperCase();
      bannerSize = bannerSize.replace("ADD NEW: ", "");
      if (bannerSize.indexOf('X') > 0) {
        var wh = bannerSize.split('X');
        if (wh.length == 2 && wh[0].length > 0 && wh[1].length > 0) {
          bannerWidth = wh[0];
          bannerHeight = wh[1];
          valid = true;
        }
      }
      if (!valid) {
        processError("Please enter new banner sizes in the format of [WIDTH]X[HEIGHT] (e.g. 200X100)");
        row.bannerSizeName = "";
      } else {
        var bannerSize = {type: "APIBannerSize", width: bannerWidth, height: bannerHeight};
        var saveBannerSize = EC2Restangular.all('placements/bannerSizes');
        saveBannerSize.post(bannerSize).then(function (data) {
          $scope.spreadSheet.isPaintSuspended(true);
          row.bannerSizeName = bannerWidth + "X" + bannerHeight;
          addBannerSizeToDropDown(bannerWidth + "X" + bannerHeight);
          spreadsheetService.validateRows(rowIndex + 1, 1, $scope.spreadSheet, $scope.placements, $scope.spreadCols, false);
          $scope.spreadSheet.isPaintSuspended(false);
          $scope.$root.isDirtyEntity = true;
          mmAlertService.addSuccess('Banner Size ' + row.bannerSizeName.toUpperCase() + ' was successfully created.', '', 'Create a new banner size');
        }, function (error) {
          processError(error);
          row.bannerSizeName = "";
        });
      }
    };

    $scope.saveNewPackage = function (thePackage) {
      var updatePackage = EC2Restangular.all('placements/packages/');
      updatePackage.customPOST(thePackage).then(function (data) {
        $scope.spreadSheet.isPaintSuspended(true);
        for (var i = 0; i < $scope.placements.length; i++) {
          if ($scope.placements[i].packageName == data.name) {
            $scope.placements[i].packageId = data.id;
            $scope.placements[i].servingAndCostData.placementLevel = false;
          }
        }
        $scope.spreadSheet.isPaintSuspended(false);
        $scope.packages.push(data);
        $scope.selectedPackages = $scope.packages;
        $scope.packageList.push(data.name);
        $scope.newPackagesSaved++;
        serverSavePlacements();
        $scope.$root.isDirtyEntity = true;
      }, function (error) {
        processError("An error occurred while saving the new package. Changes have been reverted. Msg: " + error);
      });
    };

    function deletePlacement(id) {
      var del = EC2Restangular.all('placements/' + id);
      del.customDELETE().then(function (data) {
        $scope.placementsDeleted++;
        serverSavePlacements();
        $scope.$root.isDirtyEntity = true;
      }, function (error) {
        processError("An error occurred while deleting placement " + id + ". Changes have been reverted. Msg: " + error);
      });
    }

    function sortNumber(a, b) {
      return b - a;
    }

    function save() {
      var deleteIndexes = [];
      var hasPlacementsToDelete = false;
      $scope.placementsToDelete = 0;
      $scope.placementsDeleted = 0;
      for (var i = 0; i < $scope.placements.length; i++) {
        if ($scope.placements[i].isDeleted != undefined && $scope.placements[i].isDeleted) {
          hasPlacementsToDelete = true;
          deleteIndexes.push(i);
          $scope.placementsToDelete++;
          deletePlacement($scope.placements[i].id);
        }
      }
      deleteIndexes.sort(sortNumber);
      for (var i = 0; i < deleteIndexes.length; i++) {
        $scope.placements.splice(deleteIndexes[i], 1);
      }

      var hasNewPackages = false;
      $scope.newPackageCount = 0;
      $scope.newPackagesSaved = 0;
      var newPackageNames = [];
      for (var i = 0; i < $scope.placements.length; i++) {
        if ($scope.placements[i].packageName != undefined && $scope.placements[i].packageName.length > 0 && ($scope.placements[i].packageId == undefined || $scope.placements[i].packageId == "")) {
          if (newPackageNames[$scope.placements[i].packageName] == undefined) {
            hasNewPackages = true;
            $scope.newPackageCount++;
            var thePackage = angular.copy($scope.newPackage);
            thePackage.name = $scope.placements[i].packageName;
            thePackage.siteId = $scope.placements[i].siteId;
            thePackage.mediaServingData.units = $scope.placements[i].servingAndCostData.mediaServingData.units;
            thePackage.mediaServingData.hardStopMethod = $scope.placements[i].servingAndCostData.mediaServingData.hardStopMethod;
            /*var startD = $scope.placements[i].servingAndCostData.mediaServingData.startDate.split("/");
             var endD = $scope.placements[i].servingAndCostData.mediaServingData.endDate.split("/");
             thePackage.mediaServingData.startDate = startD[2] + "-" + startD[0] + "-" + startD[1];
             thePackage.mediaServingData.endDate = endD[2] + "-" + endD[0] + "-" + endD[1];*/
            var sd = new Date($scope.placements[i].servingAndCostData.mediaServingData.startDate);
            //sd.setDate(sd.getDate() + 1);
            var ed = new Date($scope.placements[i].servingAndCostData.mediaServingData.endDate);
            //ed.setDate(ed.getDate() + 1);
            thePackage.mediaServingData.startDate = sd.getTime() - (sd.getTimezoneOffset() * 60000);
            thePackage.mediaServingData.endDate = ed.getTime() - (ed.getTimezoneOffset() * 60000);
            thePackage.mediaCostData.costModel = $scope.placements[i].servingAndCostData.mediaCostData.costModel;
            thePackage.mediaCostData.ignoreOverDelivery = $scope.placements[i].servingAndCostData.mediaCostData.ignoreOverDelivery;
            $scope.saveNewPackage(thePackage);
          }
        }
      }

      if (!hasNewPackages && !hasPlacementsToDelete) serverSavePlacements(); //otherwise the package save and/or delete placement functions will call this method
    }

    function serverSavePlacements() {
      if ($scope.newPackageCount != $scope.newPackagesSaved || $scope.placementsToDelete != $scope.placementsDeleted) return;
      var placementsClean = [];
      var placementsUpdateClean = [];
      for (var i = 0; i < $scope.placements.length; i++) {
        var p = angular.copy($scope.placements[i]);
        if (p.siteName && p.siteName.length > 0 && p.siteSectionName && p.siteSectionName.length > 0 && p.servingAndCostData.mediaServingData.startDate.length > 0 && p.servingAndCostData.mediaServingData.startDate.length > 0) {
          delete p.packageName;
          delete p.siteName;
          delete p.siteSectionName;
          delete p.contactNames;
          delete p.placementTypeName;
          delete p.bannerSizeName;
          delete p.row_hasAlert;
          delete p.row_isValid;
          if (p.isDeleted != undefined) delete p.isDeleted;
          if (p.isNew != undefined) delete p.isNew;
          delete p.servingAndCostData.mediaCostData.costModelName;
          delete p.servingAndCostData.mediaCostData.actionTypeName;
          delete p.servingAndCostData.mediaServingData.servingCompletedMethodName;
          /*var startD = p.servingAndCostData.mediaServingData.startDate.split("/");
           p.servingAndCostData.mediaServingData.startDate = startD[2] + "-" + startD[0] + "-" + startD[1];
           var endD = p.servingAndCostData.mediaServingData.endDate.split("/");
           p.servingAndCostData.mediaServingData.endDate = endD[2] + "-" + endD[0] + "-" + endD[1];*/

          var sd = new Date(p.servingAndCostData.mediaServingData.startDate);
          //sd.setDate(sd.getDate() + 1);
          var ed = new Date(p.servingAndCostData.mediaServingData.endDate);
          //ed.setDate(ed.getDate() + 1);
          p.servingAndCostData.mediaServingData.startDate = sd.getTime() - (sd.getTimezoneOffset() * 60000);
          p.servingAndCostData.mediaServingData.endDate = ed.getTime() - (ed.getTimezoneOffset() * 60000);

          if (p.servingAndCostData.mediaCostData.actionType != undefined && p.servingAndCostData.mediaCostData.actionType == "") delete p.servingAndCostData.mediaCostData.actionType;
          setPlacementTypeBeforeSave(p);
          if (p.status == undefined || p.status == "") p.status = "New";
          if ($scope.placements.length <= 100 && p.id != undefined && p.id != "") placementsUpdateClean.push(p);
          else placementsClean.push(p);
        }
      }
      $scope.placementsToSave = placementsClean.length + placementsUpdateClean.length;
      if ($scope.validationErrorCount == 0) {
        var serverBulkProcessing = EC2Restangular.all('mediaPrep/bulkPlacementProcess');
        var serverPlacements = EC2Restangular.all('placements');
        var startTime = new Date().getTime();
        if (placementsClean.length > 0) saveDataOperations++;
        if (placementsUpdateClean.length > 0) saveDataOperations++;
        console.log('Saving ' + (placementsClean.length + placementsUpdateClean.length) + ' started ' + startTime);
        $scope.validationProgress.progressItems[1].itemInProgress = true;
        if (placementsUpdateClean.length > 0) {
          serverPlacements.customPUT(placementsUpdateClean).then(function (result) {
            var endTime = new Date().getTime();
            console.log('Updated ' + placementsUpdateClean.length + ' ended ' + Math.abs(startTime - endTime));
            console.log('Response', result);
            for (var i = 0; i < result.length; i++) {
              saveResponseData.push(result[i]);
            }
            saveDataOperationsCurrentCount++;
            afterSaveData();
          }, function (error) {
            var endTime = new Date().getTime();
            console.log('Error updating ' + placementsClean.length + ' ended ' + Math.abs(startTime - endTime));
            console.log(error);
            $scope.validationProgress.progressItems[0]['error'] = true;
            $scope.validationProgress.progressItems[0]['statusMessage'] = "Error updating data";
            saveDataOperationsCurrentCount++;
            afterSaveData();
          });
        }
        if (placementsClean.length > 0) {
          serverPlacements.customPOST(placementsClean).then(function (result) {
            var endTime = new Date().getTime();
            console.log('Saved ' + placementsClean.length + ' ended ' + Math.abs(startTime - endTime));
            console.log('Response', result);
            for (var i = 0; i < result.length; i++) {
              saveResponseData.push(result[i]);
            }
            saveDataOperationsCurrentCount++;
            afterSaveData();
          }, function (error) {
            var endTime = new Date().getTime();
            console.log('Error saving ' + placementsClean.length + ' ended ' + Math.abs(startTime - endTime));
            console.log(error);
            $scope.validationProgress.progressItems[0]['error'] = true;
            $scope.validationProgress.progressItems[0]['statusMessage'] = "Error saving data";
            saveDataOperationsCurrentCount++;
            afterSaveData();
          });
        }
      }
      else {
        $scope.validationProgress.progressItems[0]['error'] = true;
        $scope.validationProgress.progressItems[0]['statusMessage'] = "Please correct validation errors before saving.";
      }
    }

    function afterSaveData(workflowId) {
      if (saveDataOperations == saveDataOperationsCurrentCount) {
        $scope.placements = angular.copy(saveResponseData);
        $scope.sheetData = $scope.placements;
        saveResponseData.length = 0;
        spreadsheetService.initSpread($scope.placements, $scope.spreadCols);
        $scope.$root.isDirtyEntity = false;
        mmAlertService.addSuccess('Your media plan was updated successfully.', '', 'Update Media Plan');
        $scope.minimizeProgressContainer(true);
        $scope.validationProgress.progressItems[1].itemInProgress = false;
        $scope.validationProgress.progressItems[1].itemDone = true;
        $scope.validationProgress.progressItems[1].statusMessage = "Data saved";

        $scope.validationProgress.progressItems[2].itemInProgress = false;
        $scope.validationProgress.progressItems[2].itemDone = true;
        $scope.validationProgress.progressItems[2].statusMessage = "Data processing complete";

        $scope.validationProgress.progressItems[3].itemInProgress = false;
        $scope.validationProgress.progressItems[3].itemDone = true;
        $scope.validationProgress.progressItems[3].statusMessage = "Data refreshed";

        $scope.spreadSheet.isPaintSuspended(true);
        var cells = $scope.spreadSheet.getCells(0, 0, $scope.placements.length, $scope.spreadCols.length);
        cells.borderRight(null);
        cells.borderLeft(null);
        cells.borderTop(null);
        cells.borderBottom(null);
        cells.textDecoration($.wijmo.wijspread.TextDecorationType.None);
        $scope.spreadSheet.isPaintSuspended(false);
        $scope.$root.isDirtyEntity = true;
        $scope.spreadSheet.repaint();
        //pollDataProcessComplete(workflowId);
      }
    }

    function setPlacementTypeBeforeSave(p) {
      switch (p.placementType) {
        case 'TRACKING_ONLY':
          delete p['bannerSize'];
          p.type = "TrackingOnlyPlacement";
          if (p.impressionTrackingURL) {
            p.impressionTrackingURL.type = "MainClickthrough";
          }
          if (p.clickThroughURL) {
            p.clickThroughURL.type = "MainClickthrough";
          }
          if (p.clickTrackingURL) {
            p.clickTrackingURL.type = "MainClickthrough";
          }
          break;
        case 'IN_STREAM_VIDEO':
          delete p['bannerSize'];
          p.type = "InStreamVideoPlacement";
          break;
        case 'IN_BANNER':
          p.type = "InBannerPlacement";
          p.bannerSize.type = "APIBannerSize";
          break;
        default:
          delete p['bannerSize'];
      }
    }

    function pollDataProcessComplete(workflowId) {
      setTimeout(function () {
        var serverWorkflow = EC2Restangular.all('mediaPrep/' + workflowId);
        serverWorkflow.customGET().then(function (result) {
          if (result.status == "COMPLETED") {
            console.log('Workflow status', result);
            //poll for data processing complete
            $scope.validationProgress.progressItems[2].itemInProgress = false;
            $scope.validationProgress.progressItems[2].itemDone = true;
            $scope.validationProgress.progressItems[2].statusMessage = "Data processing complete";

            //refresh data
            $scope.validationProgress.progressItems[3].itemInProgress = false;
            $scope.validationProgress.progressItems[3].itemDone = true;
            $scope.validationProgress.progressItems[3].statusMessage = "Data refreshed";

            $scope.validationProgress['complete'] = true;
          }
          else {
            //pollDataProcessComplete(workflowId);
          }
        }, function (error) {
          console.log(error);
        });
      }, 1000);
    }

    function validateOnly() {
      validate(false, true);
    }

    function validateSave() {
      validate(true, true);
    }

    function validate(saveData, showProgress) {
      var rowsToRemove = [];
      $scope.placementsToSave = 0;
      for (var i = 0; i < $scope.placements.length; i++) {
        if ($.isEmptyObject($scope.placements[i])) {
          rowsToRemove.push(i);
        }
        if ($scope.placements[i].isNew == undefined || $scope.placements[i].isNew == false) $scope.placementsToSave++;
        if ($scope.placements[i].isNew != undefined && $scope.placements[i].isNew == true && $scope.placements[i].status == "") $scope.placements[i].status = "New";
      }
      for (var i = 0; i < rowsToRemove.length; i++) {
        $scope.placements.splice(rowsToRemove[i], 1);
      }
      if (showProgress) {
        $scope.initValidationProgress(save);
        $scope.validationProgress['inProgress'] = true;
        $scope.validationProgress.progressItems[0].itemInProgress = true;
        $scope.validationProgress.progressItems[0].itemDone = false;
        $scope.validationProgress.progressItems[0]['total'] = $scope.placements.length;
        $scope.toggleProgressContainer(true);
      }
      if (saveData && $scope.validationErrorCells.length == 0) save();
    }

    /*** End Data Saving ***/

    /*** Spreadsheet setup ***/
    /*** spreadsheet Service Properties / Functions ***/
    $scope.validationProgress = {inProgress: false, complete: false, total: 0, currentCount: 0, error: false};
    $scope.sheetData = $scope.placements;
    $scope.newSheetDataObject = $scope.newPlacement;
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
    $scope.validationErrorActiveCell = {row: -1, col: -1, message: ''};
    $scope.validationWarningCells = [];
    $scope.validationWarningActiveCell = {row: -1, col: -1, message: ''};
    $scope.validationFixSimilar = true;
    $scope.validationFixColDef = {};
    $scope.validationFixInputVal = {theValue: ""};
    $scope.fileToImport = "";

    $scope.importCSVFile = function (evt) {
      spreadsheetService.importCSVFile(evt, convertImportItem);
    }

    $scope.importXLSXFile = function (evt) {
      spreadsheetService.importXLSXFile(evt, convertImportItem)
    }

    function convertImportItem(placement, input) {
      placement.status = input['Status'] != undefined ? input['Status'] : "New";
      placement.id = input['ID'] != undefined ? input['ID'] : "";
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
      return placement;
    }

    /*** End spreadsheet Service Properties / Functions ***/

    function setup() {
      if (dataOperations == 3) { //data dependencies loaded
        var colDefs = [];
        colDefs.push(new spreadsheetService.colDef('input', 'status', 'Status', 75, [], '', '', '', '', true, [], '', ''));
        colDefs.push(new spreadsheetService.colDef('input', 'id', 'ID', 75, [], '', '', '', '', true, [], '', ''));
        colDefs.push(new spreadsheetService.colDef('input', 'name', 'Name', 150, [], '', $scope.validateName, '', '', false, [], '', ''));
        colDefs.push(new spreadsheetService.colDef('autoComplete', 'packageName', 'Package', 150, $scope.packageList, '', $scope.validatePackageName, '', $scope.packageSelectionChange, false, [], packageNameValidationFixPrepare, packageNameValidationFixSave));
        colDefs.push(new spreadsheetService.colDef('autoComplete', 'siteName', 'Site', 150, $scope.siteList, '', $scope.validateSite, '', '', false, ['packageName', 'siteSectionName'], '', ''));
        colDefs.push(new spreadsheetService.colDef('autoComplete', 'siteSectionName', 'Site Section', 150, $scope.siteSectionList, '', $scope.validateSiteSection, $scope.saveNewSection, '', false, [], '', ''));
        colDefs.push(new spreadsheetService.colDef('multiAutoComplete', 'contactNames', 'Site Contacts', 150, $scope.siteContacts, $scope.buildSiteContactList, $scope.validateSiteContacts, '', '', false, [], '', ''));
        colDefs.push(new spreadsheetService.colDef('date', 'servingAndCostData.mediaServingData.startDate', 'Start Date', 150, '', '', $scope.validateStartDate, '', '', false, ['servingAndCostData.mediaServingData.endDate', 'packageName'], '', ''));
        colDefs.push(new spreadsheetService.colDef('date', 'servingAndCostData.mediaServingData.endDate', 'End Date', 150, '', '', $scope.validateEndDate, '', '', false, ['servingAndCostData.mediaServingData.startDate', 'packageName'], '', ''));
        colDefs.push(new spreadsheetService.colDef('combo', 'placementTypeName', 'Placement Type', 150, $scope.placementTypeList, '', $scope.validatePlacementType, '', '', false, [], '', ''));
        colDefs.push(new spreadsheetService.colDef('autoComplete', 'bannerSizeName', 'Dimensions', 150, $scope.bannerSizeMap, '', $scope.validateBannerSize, $scope.saveNewBannerSize, '', false, [], '', ''));
        colDefs.push(new spreadsheetService.colDef('combo', 'servingAndCostData.mediaCostData.costModelName', 'Cost Model', 150, $scope.costModelNames, '', $scope.validateCostModel, '', '', false, ['packageName'], '', ''));
        colDefs.push(new spreadsheetService.colDef('input', 'servingAndCostData.mediaServingData.units', 'Units', 150, '', '', $scope.validateNumeric, '', '', false, ['packageName'], '', ''));
        colDefs.push(new spreadsheetService.colDef('input', 'servingAndCostData.mediaCostData.rate', 'Rate', 150, '', '', '', '', '', false, [], '', ''));
        colDefs.push(new spreadsheetService.colDef('check', 'servingAndCostData.mediaCostData.ignoreOverDelivery', 'Ignore Over Delivery', 150, '', '', '', '', '', false, [], '', ''));
        colDefs.push(new spreadsheetService.colDef('combo', 'servingAndCostData.mediaServingData.servingCompletedMethodName', 'Stop Serving Method', 150, $scope.servingCompletedMethodNames, '', $scope.validateServingCompleteMethodNames, '', '', false, ['packageName'], '', ''));

        var cols = spreadsheetService.buildColumns(colDefs);
        $scope.spreadCols = cols;
        if ($scope.placements.length == 0) $scope.placements.push(angular.copy($scope.newPlacement));
        spreadsheetService.initSpread($scope.placements, cols);

        $scope.initValidationProgress();
        $scope.initMPProgress();
        $scope.spreadSheet.sortRange(0, 0,$scope.spreadSheet.getRowCount(), $scope.spreadSheet.getColumnCount(), true, [{ index: 1, ascending: true }]);
      }
    }

    $(document).ready(function () {
      $("#ss").wijspread({sheetCount: 1, tabStripVisible: false});
    });
    /*** End Spreadsheet setup ***/

    /**** Modal Functions *****/

    $scope.moveToNextError = function (fix, close) { //gives UI access to sheet service move next error function
      spreadsheetService.moveToNextError(fix, close);
    };

    /*$scope.updateProgress = function(currentCount, totalCount, saveData) {
     $timeout(function() {
     $scope.validationProgress.progressItems[0]['currentCount'] = currentCount;
     $scope.barCurrentCount = currentCount;
     var percentage = (currentCount / totalCount) * 100;
     if (percentage - $scope.barCurrentPercentage > 10) $scope.barCurrentPercentage = percentage;
     if ($scope.barCurrentPercentage >= 90 && $scope.barCurrentPercentage < 100) $scope.barCurrentPercentage = 100;
     if (currentCount == totalCount) {
     $scope.validationProgress['inProgress'] = false;
     $scope.validationProgress.progressItems[0].itemDone = true;
     $scope.validationProgress.progressItems[0].itemInProgress = false;
     if (saveData) save();
     else $scope.validationProgress['complete'] = true;
     }
     },10);
     }*/

    $scope.initValidationProgress = function (saveData) {
      $scope.barCurrentPercentage = 0;
      $scope.validationSuccessCount = 0;
      $scope.validationErrorCount = 0;
      $scope.validationWarningCount = 0;
      $scope.validationProgress = {
        inProgress: false,
        complete: false,
        progressItems: [{
          caption: "Validating Spreadsheet",
          type: "bar",
          total: 0,
          currentCount: 0,
          itemDone: false,
          error: false,
          statusMessage: ""
        }]
      };
      if (saveData) {
        var transfer = {
          caption: "Transferring Data",
          itemInProgress: false,
          itemDone: false,
          type: "spinner",
          statusMessage: "Transfer in-progress...",
          error: false
        };
        var processing = {
          caption: "Processing Data",
          itemInProgress: false,
          itemDone: false,
          type: "spinner",
          statusMessage: "Data processing in-progress...",
          error: false
        };
        var retrieval = {
          caption: "Refreshing Data",
          itemInProgress: false,
          itemDone: false,
          type: "spinner",
          statusMessage: "Data retrieval in-progress...",
          error: false
        };
        $scope.validationProgress.progressItems.push(transfer);
        $scope.validationProgress.progressItems.push(processing);
        $scope.validationProgress.progressItems.push(retrieval);
      }
    };

    $scope.initMPProgress = function () {
      $scope.mediaPlanProgress = {
        inProgress: false,
        complete: false,
        error: false,
        progressItems: [{caption: "Submitting Plan", type: "boolean", itemDone: false, error: false},
          {caption: "Processing Plan", type: "bar", total: 0, currentCount: 0, error: false},
          {caption: "Refreshing Data", type: "boolean", itemDone: false, error: false}]
      };
    };

    $scope.toggleProgressContainer = function (view) {
      if (view) {
        $scope.showVPContainer = !$scope.showVPContainer;
      }
      else {
        $scope.showMPContainer = !$scope.showMPContainer;
      }
    };

    $scope.closeProgressContainer = function (view) {
      if (view) {
        $scope.initValidationProgress();
        $scope.showVPContainer = false;
      } else {
        $scope.initMPProgress();
        $scope.showMPContainer = false;
      }
    };

    $scope.minimizeProgressContainer = function (view) {
      if (view) {
        $scope.showVPContainer = false;
      } else {
        $scope.showMPContainer = false;
      }
    };

    $scope.toggleValidationFixContainer = function (view) {
      $scope.showValidationFixContainer = view;
      $timeout(function () {
        //hack to force an apply and display the dialog; the dialog won't show without this (reason unknown)
      }, 10);
    };

    $scope.closeValidationFix = function (view, resetActiveErrorCell) {
      $scope.showValidationFixContainer = false;
      if (resetActiveErrorCell) {
        $scope.validationErrorActiveCell.row = -1;
        $scope.validationErrorActiveCell.col = -1;
        $scope.validationWarningActiveCell.row = -1;
        $scope.validationWarningActiveCell.col = -1;
      }
      $timeout(function () {
        //hack to force an apply and display the dialog; the dialog won't show without this (reason unknown)
      }, 10);
    };

    $scope.saveValidationFix = function (view) {
      if (view) {
        $scope.showValidationFixContainer = false;
      } else {
        $scope.showValidationFixContainer = false;
      }
    };

    $scope.toggleValidationWarningContainer = function (view) {
      $scope.showValidationWarningContainer = view;
      $timeout(function () {
        //hack to force an apply and display the dialog; the dialog won't show without this (reason unknown)
      }, 10);
    };

    $scope.closeValidationWarning = function (view) {
      if (view) {
        $scope.showValidationWarningContainer = false;
      } else {
        $scope.showValidationWarningContainer = false;
      }
    };

    $scope.toggleConfirmDeleteContainer = function (view) {
      if (view) {
        $scope.showConfirmDeleteContainer = !$scope.showConfirmDeleteContainer;
      }
      else {
        $scope.showConfirmDeleteContainer = !$scope.showConfirmDeleteContainer;
      }
    };

    $scope.closeConfirmDelete = function (view) {
      if (view) {
        $scope.showConfirmDeleteContainer = false;
      } else {
        $scope.showConfirmDeleteContainer = false;
      }
    };

    $scope.saveConfirmDelete = function (view) {
      if (view) {
        spreadsheetService.removeRows();
        $scope.showConfirmDeleteContainer = false;
      } else {
        $scope.showConfirmDeleteContainer = false;
      }
    };

    /**** End Modal Functions *****/

    /*var listenValProgress = $scope.$on("spreadsheetValidationProgress", function (event, validationProgress) {
     $scope.validationProgress = validationProgress;
     console.log("broadcast data (2)", event, validationProgress);
     if (!$scope.$$phase) $scope.$apply()
     });*/

    /**** SPREADSHEET COLUMN CUSTOM FUNCTIONS ****/

    /***** ONCHANGE FUNCTIONS *****/
    $scope.packageSelectionChange = function (row, oldValue, rowIndex) {
      for (var i = 0; i < $scope.packages.length; i++) {
        if ($scope.packages[i].name == row.packageName) {
          for (var j = 0; j < $scope.sites.length; j++) {
            if ($scope.sites[j].id == $scope.packages[i].siteId) {
              row.siteName = $scope.sites[j].name;
              row.siteId = $scope.sites[j].id;
              break;
            }
          }
          if ($scope.packages[i].mediaServingData.startDate != undefined) {
            var date = new Date($scope.packages[i].mediaServingData.startDate);
            row.servingAndCostData.mediaServingData.startDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
          }
          if ($scope.packages[i].mediaServingData.endDate != undefined) {
            var date = new Date($scope.packages[i].mediaServingData.endDate);
            row.servingAndCostData.mediaServingData.endDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
          }
          if ($scope.packages[i].mediaCostData.costModel != undefined) {
            for (var j = 0; j < $scope.costModels.length; j++) {
              if ($scope.costModels[j].id == $scope.packages[i].mediaCostData.costModel) {
                row.servingAndCostData.mediaCostData.costModel = $scope.costModels[j].id;
                row.servingAndCostData.mediaCostData.costModelName = $scope.costModels[j].name;
                break;
              }
            }
          }
          if ($scope.packages[i].mediaServingData.units != undefined) {
            row.servingAndCostData.mediaServingData.units = $scope.packages[i].mediaServingData.units;
          }
          if ($scope.packages[i].mediaServingData.hardStopMethod != undefined) {
            for (var j = 0; j < $scope.servingCompletedMethods.length; j++) {
              if ($scope.servingCompletedMethods[j].id == $scope.packages[i].mediaServingData.hardStopMethod) {
                row.servingAndCostData.mediaServingData.servingCompletedMethodName = $scope.servingCompletedMethods[j].name;
                row.servingAndCostData.mediaServingData.hardStopMethod = $scope.packages[i].mediaServingData.hardStopMethod;
              }
            }
          }
          break;
        }
      }
      //if the package does not already exist the add new and validation functions handle it
    };

    /***** VALIDATION FIX COL SPECIFIC FUNCTIONS *****/
    function packageNameValidationFixPrepare(rowIndex, colIndex, colDef) {
      var packageName = $scope.placements[rowIndex][colDef.name];
      for (var i = 0; i < $scope.packages.length; i++) {
        if ($scope.packages[i].name == packageName) {
          $scope.validationFixInputVal.editPackage = $scope.packages[i];
          break;
        }
      }
      for (var i = 0; i < $scope.siteList.length; i++) {
        if ($scope.sites[i].id == $scope.validationFixInputVal.editPackage.siteId) {
          $scope.validationFixInputVal.siteName = $scope.sites[i].name;
          break;
        }
      }
      $scope.validationFixInputVal.costModel = $scope.validationFixInputVal.editPackage.mediaCostData.costModel;
      spreadsheetService.initializeModalAutoComplete(false, $scope.siteList, $scope.validationFixInputVal.siteName, 'modalSiteAutoComplete');
      spreadsheetService.initializeModalAutoComplete(false, $scope.costModelNames, $scope.validationFixInputVal.costModel, 'modalCostModel');
    }

    function packageNameValidationFixSave(rowIndex, colIndex, colDef) {
      if ($scope.validationFixInputVal.editPackageTab) {
        for (var i = 0; i < $scope.sites.length; i++) {
          if ($scope.sites[i].name == $scope.validationFixInputVal.siteName) {
            $scope.validationFixInputVal.editPackage.siteId = $scope.sites[i].id;
            break;
          }
        }
        var startDate = new Date($scope.validationFixInputVal.editPackage.mediaServingData.startDate);
        var endDate = new Date($scope.validationFixInputVal.editPackage.mediaServingData.endDate);
        $scope.validationFixInputVal.editPackage.mediaServingData.startDate = startDate.getTime();
        $scope.validationFixInputVal.editPackage.mediaServingData.endDate = endDate.getTime();

        var updatePackage = EC2Restangular.all('placements/packages/' + $scope.validationFixInputVal.editPackage.id);
        updatePackage.customPUT($scope.validationFixInputVal.editPackage).then(function (data) {
          $scope.spreadSheet.isPaintSuspended(true);
          for (var i = 0; i < $scope.placements.length; i++) {
            if ($scope.placements[i].packageId == $scope.validationFixInputVal.editPackage.id) {
              $scope.placements[i].servingAndCostData.mediaServingData.startDate = (startDate.getMonth() + 1) + '/' + startDate.getDate() + '/' + startDate.getFullYear();
              $scope.placements[i].servingAndCostData.mediaServingData.endDate = (endDate.getMonth() + 1) + '/' + endDate.getDate() + '/' + endDate.getFullYear();
              $scope.placements[i].servingAndCostData.mediaServingData.units = $scope.validationFixInputVal.editPackage.mediaServingData.units;
              $scope.placements[i].servingAndCostData.mediaCostData.costModel = $scope.validationFixInputVal.editPackage.mediaCostData.costModel;
              $scope.placements[i].servingAndCostData.mediaCostData.costModelName = $scope.validationFixInputVal.editPackage.mediaCostData.costModel;
              $scope.placements[i].siteName = $scope.validationFixInputVal.siteName;
              $scope.placements[i].siteId = $scope.validationFixInputVal.editPackage.siteId;
              //TODO: do we need to run validation or mark the row as dirty?
            }
          }
          $scope.spreadSheet.isPaintSuspended(false);
          for (var i = 0; i < $scope.packages.length; i++) {
            if ($scope.packages[i].id = $scope.validationFixInputVal.editPackage.id) {
              $scope.packages[i].mediaServingData.startDate = startDate.getTime();
              $scope.packages[i].mediaServingData.endDate = endDate.getTime();
              $scope.packages[i].mediaServingData.units = $scope.validationFixInputVal.editPackage.mediaServingData.units;
              $scope.packages[i].mediaCostData.costModel = $scope.validationFixInputVal.editPackage.mediaCostData.costModel;
              $scope.packages[i].siteId = $scope.validationFixInputVal.editPackage.siteId;
              break;
            }
          }
          $scope.$root.isDirtyEntity = true;
        }, function (error) {
          processError("An error occurred while updating the package. Changes to the package have been reverted.");
        });
      }
      else if ($scope.validationFixInputVal.createNewTab) {
        $scope.spreadSheet.setValue(rowIndex, colIndex, $scope.validationFixInputVal.newPackageName);
      }
    }

    /***** END VALIDATION FIX COL SPECIFIC FUNCTIONS *****/

    /***** VALIDATION FUNCTIONS *****/
    $scope.validatePackageName = function (row, rowIndex, dataSource) {

      if($scope.isEmptyRow(row))  return {isValid: true, hasWarning: false, message: "yay"};
      if (row.packageName == undefined) row.packageName = "";
      var thePackage = {};
      if (row.packageName == "" && row.packageId != undefined && row.packageId.length > 0) {
        for (var i = 0; i < $scope.packages.length; i++) {
          if ($scope.packages[i].id == row.packageId) {
            row.packageName = $scope.packages[i].name;
            thePackage = $scope.packages[i];
            break;
          }
        }
      }
      else if (row.packageName.length > 0) {
        var existing = false;
        for (var i = 0; i < $scope.packages.length; i++) {
          if ($scope.packages[i].name == row.packageName) {
            row.packageId = $scope.packages[i].id;
            row.servingAndCostData.placementLevel = false;
            existing = true;
            thePackage = $scope.packages[i];
            break;
          }
        }
        if (!existing) {
          row.packageId = "";
          return {isValid: true, hasWarning: true, message: "The package does not exist yet and will be created."};
        }
      }
      if (row.packageId != undefined && row.packageName != "") {
        var pass = true;
        if (row.siteId != thePackage.siteId) pass = false;
        if (thePackage.mediaServingData.startDate != undefined) {
          var date = new Date(thePackage.mediaServingData.startDate);
          if (row.servingAndCostData.mediaServingData.startDate != (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear()) pass = false;
        }
        if (thePackage.mediaServingData.endDate != undefined) {
          var date = new Date(thePackage.mediaServingData.endDate);
          if (row.servingAndCostData.mediaServingData.endDate != (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear()) pass = false;
        }
        if (thePackage.mediaCostData.costModel != undefined) {
          if (row.servingAndCostData.mediaCostData.costModel != thePackage.mediaCostData.costModel) pass = false;
        }
        if (thePackage.mediaServingData.units != undefined) {
          if (row.servingAndCostData.mediaServingData.units != thePackage.mediaServingData.units) pass = false;
        }
        if (thePackage.mediaServingData.hardStopMethod != undefined) {
          if (row.servingAndCostData.mediaServingData.hardStopMethod != thePackage.mediaServingData.hardStopMethod) pass = false;
        }
        if (!pass) return {
          isValid: false,
          hasWarning: false,
          message: "The properties of this package conflict with this placement."
        };
      }
      return {isValid: true, hasWarning: false, message: "yay"};
    };

    $scope.validateName = function (row, rowIndex, dataSource) {
      if (row.name == undefined) row.name = "";
      if (!row.name.length > 0) {
        $scope.validateSite(row);
        if (!row.isNew) {
          row.name = $scope.campaignId + "_" + row.siteName + (rowIndex == null ? 1 : rowIndex);
          return {
            isValid: true,
            hasWarning: true,
            message: "The placement name was invalid and has been automatically updated."
          };
        }
      }
      else if (row.name.length > 0) {
        var cnt = 0;
        var tmpName = row.name;
        var tmpName2 = row.name;
        var notUnique = true;
        while (notUnique) {
          var matched = false;
          for (var i = 0; i < dataSource.length; i++) {
            if (dataSource[i].name == tmpName) {
              cnt++;
              if (cnt > 1) {
                tmpName = tmpName2 + "_" + cnt;
                matched = true;
                break;
              }
            }
          }
          if (!matched) notUnique = false;
        }
        if (row.name != tmpName && cnt > 1) {
          row.name = tmpName;
          return {
            isValid: true,
            hasWarning: true,
            message: "The placement name was invalid and has been automatically updated."
          };
        }
        else {
          return {isValid: true, hasWarning: false, message: "yay"};
        }
      }

    };

    $scope.validateSite = function (row, rowIndex) {

      if($scope.isEmptyRow(row))  return {isValid: true, hasWarning: false, message: "yay"};
      var exists = false;
      if (row.siteName == undefined) {
        return {isValid: false, hasWarning: false, message: "Please select an existing site."};
      }
      else if (row.siteName != undefined) {
        for (var i = 0, len = $scope.sites.length; i < len; i++) {
          if ($scope.sites[i] && $scope.sites[i].name.toLowerCase() == row.siteName.toLowerCase()) {
            row.siteId = $scope.sites[i].id;
            exists = true;
            row.siteName = $scope.sites[i].name;
            //$scope.buildSiteSectionList(row);
            //var isValid = false;
            //for (var c = 0, len = $scope.siteSectionList.length; c < len; c++) {
            //  if (row.siteSectionName == $scope.siteSectionList[c]) isValid = true;
            //}
            //if (!isValid) {
            //  if ($scope.siteSectionList.length == 1 && (row.siteSectionName == undefined || row.siteSectionName == '')) {
            //    row.siteSectionName = $scope.siteSectionList[0];
            //    $scope.validateSiteSection(row);
            //  }
            //  else {
            //    if (exists) {
            //      if (row.siteSectionName != undefined && row.siteSectionName != '') $scope.validateSiteSection(row, rowIndex);
            //    }
            //  }
            //}
          }
        }
      }
      if (!exists) return {isValid: false, hasWarning: false, message: "Please select an existing site."};
      return {isValid: true, hasWarning: false, message: "yay"};
    };

    $scope.validateSiteSection = function (row, rowIndex) {

      if($scope.isEmptyRow(row))  return {isValid: true, hasWarning: false, message: "yay"};

      if ((row.siteSectionName == undefined || row.siteSectionName == "") && row.siteName != undefined) {
       return {isValid: false, hasWarning: false, message: "Please enter a valid section." };
      }

      if (row.siteSectionName == "") {
        return {isValid: false, hasWarning: false, message: "Please enter a valid section."};
      }
      if (row.siteSectionName != undefined && row.siteSectionName.length > 0) {
        row.sectionId = "";
        for (i = 0; i < $scope.sections.length; i++) {
          if ($scope.sections[i].name == row.siteSectionName && $scope.sections[i].siteId == row.siteId) {
            row.sectionId = $scope.sections[i].id;
          }
        }
        if (row.sectionId == "") {
          var colIndex;
          for (var i = 0; i < $scope.spreadCols.length; i++) {
            if ($scope.spreadCols[i].name == "siteSectionName") colIndex = i;
          }
          console.log(saveNewSectionsQueue[row.siteId + "_" + row.siteSectionName]);
          if (row.siteId != '' && row.siteSectionName.indexOf("Add New: ") < 0 && saveNewSectionsQueue[row.siteId + "_" + row.siteSectionName] == undefined) {
            saveNewSectionsQueue[row.siteId + "_" + row.siteSectionName] = "";
            row.siteSectionName = "Add New: " + row.siteSectionName;
            $scope.spreadSheet.setValue(rowIndex, i, row.siteSectionName);
            $scope.saveNewSection(row, '', rowIndex);
            return {isValid: true, hasWarning: true, message: "A new section is being created."};
          }
          else if (row.siteId != '' && row.siteSectionName.indexOf("Add New: ") < 0 && saveNewSectionsQueue[row.siteId + "_" + row.siteSectionName] != undefined) {
            row.siteSectionName = "Add New: " + row.siteSectionName;
            $scope.spreadSheet.setValue(rowIndex, i, row.siteSectionName);
            return {isValid: true, hasWarning: true, message: "A new section is being created."};
          }
        }
      }
      return {isValid: true, hasWarning: false, message: "yay"};
    };

    $scope.validateSiteContacts = function (row) {

      if($scope.isEmptyRow(row))  return {isValid: true, hasWarning: false, message: "yay"};
      if (row.contactNames != undefined && row.contactNames.length > 0) {
        var contacts = row.contactNames.split(",");
        if (row.siteContacts == undefined) row.siteContacts = {selectedContacts: [], siteContacts: []};
        row.siteContacts.selectedContacts.length = 0;
        row.siteContacts.siteContacts.length = 0;
        for (var i = 0; i < $scope.sites.length; i++) {
          if (row.siteId == $scope.sites[i].id) {
            for (var c = 0; c < contacts.length; c++) {
              for (var so = 0; so < $scope.sites[i].siteContacts.siteContacts.length; so++) {
                if (contacts[c].trim() == $scope.sites[i].siteContacts.siteContacts[so].name) {
                  row.siteContacts.siteContacts.push({
                    id: $scope.sites[i].siteContacts.siteContacts[so].id,
                    name: $scope.sites[i].siteContacts.siteContacts[so].name
                  })
                  row.siteContacts.selectedContacts.push($scope.sites[i].siteContacts.siteContacts[so].id);
                }
              }
            }
          }
        }
      }
      else if (row.contactNames == undefined && $scope.dataPrepared) {
        if (row.siteContacts == undefined) row.siteContacts = {selectedContacts: [], siteContacts: []};
        row.siteContacts.selectedContacts.length = 0;
        row.siteContacts.siteContacts.length = 0;
      }
      else if (row.contactNames == undefined) {
        row.contactNames = '';
        if (row.siteContacts == undefined) row.siteContacts = {selectedContacts: [], siteContacts: []};
        for (var i = 0; i < row.siteContacts.siteContacts.length; i++) {
          row.contactNames += row.contactNames.length > 0 ? ',' + row.siteContacts.siteContacts[i].name : row.siteContacts.siteContacts[i].name;
        }
      }
      if (row.contactNames != undefined && row.contactNames != "") {
        var contactsArr = row.contactNames.split(",");
        if (row.siteContacts.selectedContacts.length != contactsArr.length) return {
          isValid: false,
          hasWarning: false,
          message: "The requested site contact seems to be missing, Please contact support@sizmek.com to add the contact or select a different one"
        };
        else return {isValid: true, hasWarning: false, message: "yay"};
      }
      else return {isValid: true, hasWarning: false, message: "yay"};

    };

    $scope.validatePlacementType = function (row) {

      if($scope.isEmptyRow(row))  return {isValid: true, hasWarning: false, message: "yay"};
      if (row.placementTypeName != undefined) {
        for (var i = 0; i < $scope.placementTypes.length; i++) {
          if (row.placementTypeName == $scope.placementTypes[i].name)
            row.placementType = $scope.placementTypes[i].placementType;
        }
      }
      else if (row.placementTypeName == undefined) {
        for (var i = 0; i < $scope.placementTypes.length; i++) {
          if (row.placementType == $scope.placementTypes[i].placementType)
            row.placementTypeName = $scope.placementTypes[i].name;
        }
      }
      return {isValid: true, hasWarning: false, message: "yay"};
    };

    var fromOADate = (function () {
      var epoch = new Date(1899, 11, 30);
      var msPerDay = 8.64e7;

      return function (n) {
        // Deal with -ve values
        var dec = n - Math.floor(n);

        if (n < 0 && dec) {
          n = Math.floor(n) - dec;
        }

        return new Date(n * msPerDay + +epoch);
      }
    }());

    $scope.validateStartDate = function (row) {

      if($scope.isEmptyRow(row))  return {isValid: true, hasWarning: false, message: "yay"};
      //if (row.servingAndCostData.mediaServingData.startDate == null) {
      //  return {isValid: true, hasWarning: false, message: "yay"};
      //}
      //if date contains letters --> return false //&& row.servingAndCostData.mediaServingData.startDate.indexOf("OADate") == -1
      if (/[a-zA-Z]/.test(row.servingAndCostData.mediaServingData.startDate)) {
        return {isValid: false, hasWarning: false, message: "Please enter a valid start date."};
      }
      if (row.servingAndCostData.mediaServingData.startDate.indexOf("OADate") == -1) {
        var longDatePattern = /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}$/,
          shortDatePattern = /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2}$/,
          sDate = row.servingAndCostData.mediaServingData.startDate;

        if (shortDatePattern.test(sDate)) {
          var splitter = /\./.test(sDate) ? '.' : /\//.test(sDate) ? '/' : '-';
          sDate = sDate.split(splitter);
          row.servingAndostData.mediaServingData.startDate = sDate[0] + splitter + sDate[1] + splitter + "20" + sDate[2];
        }

        if (!longDatePattern.test(row.servingAndCostData.mediaServingData.startDate)) {
          return {isValid: false, hasWarning: false, message: "Please enter a valid start date."};
        }
      }

      if (typeof row.servingAndCostData.mediaServingData.startDate === 'number') row.servingAndCostData.mediaServingData.startDate = "/OADate(" + row.servingAndCostData.mediaServingData.startDate + ")/";
      if (typeof row.servingAndCostData.mediaServingData.endDate === 'number') row.servingAndCostData.mediaServingData.endDate = "/OADate(" + row.servingAndCostData.mediaServingData.endDate + ")/";
      if (row.servingAndCostData.mediaServingData.startDate != undefined && row.servingAndCostData.mediaServingData.startDate.indexOf("OADate") > -1) {
        var oads = row.servingAndCostData.mediaServingData.startDate.replace("/OADate(", "");
        oads = oads.replace(")/", "");
        oads = fromOADate(oads);
        row.servingAndCostData.mediaServingData.startDate = (oads.getMonth() + 1) + '/' + oads.getDate() + '/' + oads.getFullYear();
      }
      if (row.servingAndCostData.mediaServingData.endDate != undefined && row.servingAndCostData.mediaServingData.endDate.indexOf("OADate") > -1) {
        var oade = row.servingAndCostData.mediaServingData.endDate.replace("/OADate(", "");
        oade = oade.replace(")/", "");
        oade = fromOADate(oade);
        row.servingAndCostData.mediaServingData.endDate = (oade.getMonth() + 1) + '/' + oade.getDate() + '/' + oade.getFullYear();
      }
      var start = new Date(row.servingAndCostData.mediaServingData.startDate);
      var end = new Date(row.servingAndCostData.mediaServingData.endDate);
      if (!isNaN(end.getTime()) && isNaN(start.getTime())) return {
        isValid: false,
        hasWarning: false,
        message: "Please enter an start date."
      };
      if (start > end) return {isValid: false, hasWarning: false, message: "Start date must be before the end date"};
      return {isValid: true, hasWarning: false, message: "yay"};
    }

    $scope.validateEndDate = function (row) {

      if($scope.isEmptyRow(row))  return {isValid: true, hasWarning: false, message: "yay"};
      //if (row.servingAndCostData.mediaServingData.endDate == null) {
      //  return {isValid: true, hasWarning: false, message: "yay"};
      //}
      //if date contains letters --> return false //&& row.servingAndCostData.mediaServingData.endDate.indexOf("OADate") == -1
      if (/[a-zA-Z]/.test(row.servingAndCostData.mediaServingData.endDate)) {
        return {isValid: false, hasWarning: false, message: "Please enter a valid start date."};
      }
      if (row.servingAndCostData.mediaServingData.endDate.indexOf("OADate") == -1) {
        var longDatePattern = /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}$/,
          shortDatePattern = /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2}$/,
          sDate = row.servingAndCostData.mediaServingData.endDate;

        if (shortDatePattern.test(sDate)) {
          var splitter = /\./.test(sDate) ? '.' : /\//.test(sDate) ? '/' : '-';
          sDate = sDate.split(splitter);
          row.servingAndostData.mediaServingData.endDate = sDate[0] + splitter + sDate[1] + splitter + "20" + sDate[2];
        }

        if (!longDatePattern.test(row.servingAndCostData.mediaServingData.endDate)) {
          return {isValid: false, hasWarning: false, message: "Please enter a valid start date."};
        }
      }

      if (typeof row.servingAndCostData.mediaServingData.startDate === 'number') row.servingAndCostData.mediaServingData.startDate = "/OADate(" + row.servingAndCostData.mediaServingData.startDate + ")/";
      if (typeof row.servingAndCostData.mediaServingData.endDate === 'number') row.servingAndCostData.mediaServingData.endDate = "/OADate(" + row.servingAndCostData.mediaServingData.endDate + ")/";
      if (row.servingAndCostData.mediaServingData.startDate != undefined && row.servingAndCostData.mediaServingData.startDate.indexOf("OADate") > -1 || typeof row.servingAndCostData.mediaServingData.endDate === 'number') {
        var oads = row.servingAndCostData.mediaServingData.startDate.replace("/OADate(", "");
        oads = oads.replace(")/", "");
        oads = fromOADate(oads);
        row.servingAndCostData.mediaServingData.startDate = (oads.getMonth() + 1) + '/' + oads.getDate() + '/' + oads.getFullYear();
      }
      if (row.servingAndCostData.mediaServingData.endDate != undefined && row.servingAndCostData.mediaServingData.endDate.indexOf("OADate") > -1) {
        var oade = row.servingAndCostData.mediaServingData.endDate.replace("/OADate(", "");
        oade = oade.replace(")/", "");
        oade = fromOADate(oade);
        row.servingAndCostData.mediaServingData.endDate = (oade.getMonth() + 1) + '/' + oade.getDate() + '/' + oade.getFullYear();
      }
      var start = new Date(row.servingAndCostData.mediaServingData.startDate);
      var end = new Date(row.servingAndCostData.mediaServingData.endDate);
      if (!isNaN(start.getTime()) && isNaN(end.getTime())) return {
        isValid: false,
        hasWarning: false,
        message: "Please enter an end date."
      };
      if (end < start) return {isValid: false, hasWarning: false, message: "End date must be after the start date"};
      return {isValid: true, hasWarning: false, message: "yay"};
    }

    $scope.validateCostModel = function (row) {
      if($scope.isEmptyRow(row))  return {isValid: true, hasWarning: false, message: "yay"};
      for (var i = 0; i < $scope.costModels.length; i++) {
        if (row.servingAndCostData == undefined) row.servingAndCostData = {mediaCostData: {}, mediaServingData: {}};
        if (row.servingAndCostData.mediaCostData.costModelName != undefined && row.servingAndCostData.mediaCostData.costModelName == $scope.costModels[i].name)
          row.servingAndCostData.mediaCostData.costModel = $scope.costModels[i].id;
        if (row.servingAndCostData.mediaCostData.costModelName == undefined) {
          for (var i = 0; i < $scope.costModels.length; i++) {
            if ($scope.costModels[i].id == row.servingAndCostData.mediaCostData.costModel)
              row.servingAndCostData.mediaCostData.costModelName = $scope.costModels[i].name;
          }
        }
      }
      return {isValid: true, hasWarning: false, message: "yay"};
    };

    $scope.validateActionTypeNames = function (row) {
      if($scope.isEmptyRow(row))  return {isValid: true, hasWarning: false, message: "yay"};
      for (var i = 0; i < $scope.actionTypes.length; i++) {
        if (row.servingAndCostData == undefined) row.servingAndCostData = {mediaCostData: {}, mediaServingData: {}};
        if (row.servingAndCostData.mediaCostData.actionTypeName != undefined && row.servingAndCostData.mediaCostData.actionTypeName == $scope.actionTypes[i].name)
          row.servingAndCostData.mediaCostData.actionType = $scope.actionTypes[i].id;
        if (row.servingAndCostData.mediaCostData.actionTypeName == undefined) {
          for (var i = 0; i < $scope.actionTypes.length; i++) {
            if (row.servingAndCostData.mediaCostData.actionType == $scope.actionTypes[i].id)
              row.servingAndCostData.mediaCostData.actionTypeName = $scope.actionTypes[i].name;
          }
        }
      }
      return {isValid: true, hasWarning: false, message: "yay"};
    };

    $scope.validateServingCompleteMethodNames = function (row) {
      if($scope.isEmptyRow(row))  return {isValid: true, hasWarning: false, message: "yay"};
      for (var i = 0; i < $scope.servingCompletedMethods.length; i++) {
        if (row.servingAndCostData == undefined) row.servingAndCostData = {mediaCostData: {}, mediaServingData: {}};
        if (row.servingAndCostData.mediaServingData.servingCompletedMethodName != undefined && row.servingAndCostData.mediaServingData.servingCompletedMethodName == $scope.servingCompletedMethods[i].name)
          row.servingAndCostData.mediaServingData.hardStopMethod = $scope.servingCompletedMethods[i].id;
        if (row.servingAndCostData.mediaServingData.servingCompletedMethodName == undefined) {
          for (var i = 0; i < $scope.servingCompletedMethods.length; i++) {
            if ($scope.servingCompletedMethods[i].id == row.servingAndCostData.mediaServingData.hardStopMethod)
              row.servingAndCostData.mediaServingData.servingCompletedMethodName = $scope.servingCompletedMethods[i].name;
          }
        }
      }
      return {isValid: true, hasWarning: false, message: "yay"};
    };

    $scope.validateBannerSize = function (row) {

      if($scope.isEmptyRow(row))  return {isValid: true, hasWarning: false, message: "yay"};
      if (row.bannerSizeName == undefined) {
        if (row.bannerSize == undefined) row.bannerSize = {width: '', height: '', type: 'APIBannerSize'};
        for (var i = 0, len = $scope.bannerSizeMap.length; i < len; i++) {
          if ((row.bannerSize.width + 'X' + row.bannerSize.height) == $scope.bannerSizeMap[i])
            row.bannerSizeName = row.bannerSize.width + 'X' + row.bannerSize.height;
        }
      }

      if (row.placementTypeName === "In Banner") {
        var sizePattern = /[0-9]X[0-9]/;
        if (row.bannerSizeName != undefined && sizePattern.test(row.bannerSizeName)) {
          var sizes = row.bannerSizeName.split("X");
          if (row.bannerSize == undefined) row.bannerSize = {width: '', height: '', type: 'APIBannerSize'};
          row.bannerSize.width = sizes[0];
          row.bannerSize.height = sizes[1];
          row.bannerSize.type = "APIBannerSize";
        }
        else {
          return {isValid: false, hasWarning: false, message: "Enter size format of [WIDTH]X[HEIGHT] (e.g. 200X100)"};
        }

      }
      else if (row.placementTypeName === "Tracking" || row.placementTypeName === "In-Stream Video") {
        if (row.bannerSizeName != undefined && row.bannerSizeName.trim().length > 0) {
          return {isValid: false, hasWarning: true, message: "dimension should be empty"};
        }
      }

      return {isValid: true, hasWarning: false, message: "yay"};
    };

    $scope.validateNumeric = function (row) {

      if($scope.isEmptyRow(row))  return {isValid: true, hasWarning: false, message: "yay"};
      var unit = row.servingAndCostData.mediaServingData.units,
        costModel = row.servingAndCostData.mediaCostData.costModelName;

      if (unit && costModel && costModel === "CPM") {
        if (isValidNumber(unit)) {
          return {isValid: true, hasWarning: false, message: ""};
        }
        else {
          return {isValid: false, hasWarning: false, message: "Enter a valid Number only"};
        }
      }
      return {isValid: true, hasWarning: false, message: ""};
    };

    $scope.isEmptyRow = function (row){
      return   $scope.isNullOrEmpty(row.name)
            && $scope.isNullOrEmpty(row.siteId)
            && $scope.isNullOrEmpty(row.status)
            && $scope.isNullOrEmpty(row.sectionId)
            && $scope.isNullOrEmpty(row.packageName)
            && $scope.isNullOrEmpty(row.placementType)
            && $scope.isNullOrEmpty(row.servingAndCostData.mediaServingData.units)
            && $scope.isNullOrEmpty(row.servingAndCostData.mediaCostData.costModel)
            && $scope.isNullOrEmpty(row.servingAndCostData.mediaServingData.endDate)
            && $scope.isNullOrEmpty(row.servingAndCostData.mediaServingData.startDate);
    }

    $scope.isNullOrEmpty = function (str)
    {
      return str == "" || str == null || str == undefined;
    }
    /**** ON BEGIN CHANGE FUNCTION ****/

    $scope.searchSitesList = function (query) {
      searchSites(query);
    };

    $scope.buildSiteSectionList = function (row) {
      var inputType = typeof row;
      if (inputType == 'number') row = $scope.placements[row];
      if (row.siteId == undefined) {
        for (var i = 0, len = $scope.sites.length; i < len; i++) {
          if ($scope.sites[i].name == row.siteName) {
            row.siteId = $scope.sites[i].id;
            break;
          }
        }
      }
      $scope.siteSectionList.length = 0;
      for (i = 0; i < $scope.sections.length; i++) {
        if ($scope.sections[i].siteId == row.siteId) {
          var inList = false;
          for (var j = 0; j < $scope.siteSectionList.length; j++) {
            if ($scope.siteSectionList[j] == $scope.sections[i].name) inList = true;
          }
          if (!inList) $scope.siteSectionList.push($scope.sections[i].name);
        }
      }
    };

    $scope.buildSiteContactList = function (row) {
      var inputType = typeof row;
      if (inputType == 'number') row = $scope.placements[row];
      if (row != undefined) {
        $scope.siteContacts.length = 0;
        for (var i = 0, len = $scope.sites.length; i < len; i++) {
          var site = $scope.sites[i];
          if (row.siteId == site.id && site.siteContacts && site.siteContacts.siteContacts) {
            for (var s = 0, cLen = site.siteContacts.siteContacts.length; s < cLen; s++) {
              $scope.siteContacts.push(site.siteContacts.siteContacts[s].name);
            }
          }
        }
      }
    };

    /**** END SPREADSHEET COLUMN CUSTOM FUCNTIONS ****/

    /*** Utils ***/
    function isValidUrl(url) {
      var valid = true;
      $scope.urlError = {text: ''};
      if (url !== null && url !== "") {
        var validUrl = /^(http|https):\/\/[^ "]+$/;
        return validUrl.test(url)
      }
    }

    function isValidNumber(num) {
      if (num) {
        return /^\d+$/.test(removeCommas(num));
      }
      return false;
    }

    function fetchFromObject(obj, prop) {
      if (typeof obj === 'undefined') return false;
      var _index = prop.indexOf('.')
      if (_index > -1) {
        return fetchFromObject(obj[prop.substring(0, _index)], prop.substr(_index + 1));
      }
      return obj[prop];
    }

    function processError(error) {
      $scope.showSPinner = false;
      if (error.data == undefined || error.data.error == undefined) {
        mmAlertService.addError(error);
      } else {
        mmAlertService.addError(error.data.error);
      }
      $timeout(function () {
        //hack to force an apply and display the alert dialog; the dialog won't show without this (reason unknown)
      }, 10);
    }

    function removeCommas(str) {
      str += '';
      return str.replace(/,/g, '');
    }

    function testSavePlacements() {
      var nameSuffix = "test13-01-";
      var count = 5;
      var placement = {
        "type": "InBannerPlacement",
        "id": null,
        "status": "New",
        "name": "Placement1",
        "accountId": null,
        "campaignId": "HRA0HT",
        "siteId": "HRA0HU",
        "sectionId": "HRA0HU",
        "placementType": "IN_BANNER",
        "packageId": null,
        "servingAndCostData": {
          "mediaServingData": {
            "units": "333",
            "servingCompletedMethod": "KEEP_SERVING_AS_USUAL",
            "startDate": "2014-12-29T05:00:00.000Z",
            "endDate": "2014-12-31T05:00:00.000Z"
          },
          "mediaCostData": {
            "type": "MediaCost",
            "costModel": "CPM",
            "rate": "1.25",
            "orderedUnits": "123",
            "customInteraction": null,
            "conversionId": null,
            "interactionId": null,
            "ignoreOverDelivery": false,
            "actionType": "ALL_USER_INTERACTIONS"
          },
          "placementLevel": true
        },
        "ads": null,
        "tagBuilderParams": null,
        "bannerSize": {"height": "600", "width": "120", "type": "APIBannerSize"},
        "siteContacts": {
          "siteContacts": [{"id": "HRA0HU", "name": "James", "advertiserDefault": true}],
          "selectedContacts": ["HRA0HU"]
        }
      };
      var placements = [];
      for (var i = 0; i < count; i++) {
        var placementToSave = angular.copy(placement);
        placementToSave.name = nameSuffix + i;
        $scope.placements.push(placementToSave);
      }
    }
  }]);

