/**
 * Created by alon.shemesh on 2/23/14.
 */
'use strict'
app.controller('adEditCtrl', ['$scope', '$stateParams', '$interval', 'EC2Restangular', 'EC2AMSRestangular', '$state', '$timeout', 'mmModal', 'adService', 'configuration', 'mmRest',
  'enums', 'entityMetaData', 'mmAlertService', '$modal', 'validationHelper', 'adBlFactory', 'creativeConsts', '$q', '$filter', 'mmUtils', 'assetsLibraryService', 'creativeJsonObjects',
  function ($scope, $stateParams, $interval, EC2Restangular, EC2AMSRestangular, $state, $timeout, mmModal, adService, configuration,
            mmRest, enums, entityMetaData, mmAlertService, $modal, validationHelper, adBlFactory, creativeConsts, $q, $filter, mmUtils, assetsLibraryService, creativeJsonObjects) {
    var multipleValue = "Multiple Values";
    var serverAds = EC2Restangular.all('ads');
    var serverCampaigns = EC2Restangular.all('campaigns');
    var defaultImage = {};
    var banner = {};
    var html5 = {};
    var preloadBanner = {};
    var assets = [];
    var selectedCreativeType = '';
    var adBl = null;
    var panelValidationResult = {'fields': []};
    var thirdPartyUrlValidationResult = {isSuccess: false, 'fields': []};
    var creativeAssetBaseValidationResult = {'fields': []};
    var serverSearchAssets = EC2AMSRestangular.all('assetMgmt/search');
    var SingleExpandableBannerAdDefaultPanel;
    $scope.isEditMode = !!$stateParams.adId || !!$scope.isEntral;
    $scope.toggleHandler = {};
    $scope.inforceImageBox = !!$scope.isEntral;

    $scope.labelWidth4 = 180;
    $scope.labelWidth3 = 150;
    $scope.labelWidth2 = 120;
    $scope.labelWidth = 100;
    $scope.labelWidthSummary = 40;
    $scope.isAspectRatioDisabled = false;
    $scope.lookups = {adFormats: enums.adFormats,
      adStatuses: enums.adStatuses,
      targetWindowTypes: enums.targetWindowTypes,
      videoStartMethods: enums.videoStartMethods,
      hides: enums.hides,
      downloadModes: enums.downloadModes,
      retractions: enums.retractions,
      positionTypes: enums.positionTypes,
      scripts: enums.scripts,
      urlSourceTypes: enums.urlSourceTypes,
      trueFalseListdataArray: enums.trueFalseListdataArray,
      thirdpartyUrlTypes: enums.thirdpartyURLsTypes,
      deliveryTypes: enums.inStreamDeliveryTypes,
      panelFrequencies: enums.panelFrequencies,
      defaultPanelFrequencies: enums.defaultPanelFrequencies,
      vastTemplateFormats: enums.vastTemplateFormats,
      adChoicesLocations: enums.adChoicesLocations,
      expandTimes: [
        {id: 1, "name": "1"},
        {id: 2, "name": "2"},
        {id: 3, "name": "3"},
        {id: 4, "name": "4"},
        {id: 5, "name": "5"}
      ]
    };

    if (!$scope.isEditMode) { //!$scope.entityId
      var format = _.findWhere($scope.lookups.adFormats, {'id': "TRACKING_PIXEL_AD"});
      format ? $scope.lookups.adFormats = _.without($scope.lookups.adFormats, format) : '';
      format = _.findWhere($scope.lookups.adFormats, {'id': "FLOATING_AD"});
      format ? $scope.lookups.adFormats = _.without($scope.lookups.adFormats, format) : '';
      format = _.findWhere($scope.lookups.adFormats, {'id': "INSTREAM_ENHANCED_AD"});
      format ? $scope.lookups.adFormats = _.without($scope.lookups.adFormats, format) : '';

    }

    $scope.tabsFocused = { creativeAssetsBase: true,
      clickthroughs: true,
      ciClickthroughs: true,
      linears: true,
      general: true};
    $scope.toggleHandler = { showToggleCI: true,
      showToggleClickthrough: true,
      showToggleSettings: true,
      showToggleCreativeAssets: true,
      showToggleAdvancedPanelSettings: true,
      showToggleLinearSettings: true};

    $scope.campaign = '';
    $scope.isDirty = true;
    $scope.saveActionClicked = false;
    $scope.placementAds = [];

    $scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: discard, ref: null, nodes: []};
    $scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: save, ref: null, nodes: [], isPrimary: true};
    $scope.selectedAsset = {}; //inializing here coz it gives undefined error

    $scope.panelAssetsIds = [];
    $scope.additionalAssetAssetsIds = [];

    $scope.gridItems = {
      ciAutomaticEvents: [],
      ciClickthroughs: [],
      ciTimers: [],
      ciUserActions: []
    };

    $scope.isCiExist = false;
    $scope.creativeError = {name: ""};
    $scope.creativeDirty = 0;
    $scope.adAssets = [];
    $scope.controlStatus = {skipDelayDisabled: true,
      disable: true,
      notDisabled: false,
      isMultiple: false,
      panelFreqency: true,
      panelComponent: true,
      panelsNotfound: true};
    $scope.gridColumns = {
      creativeAssetsColumns: [
        {field: 'type', displayName: 'Ad Unit', isColumnEdit: false, width: 130, gridControlType: enums.gridControlType.getName("Required")},
        {field: 'file', displayName: 'Asset', isColumnEdit: false, gridControlType: enums.gridControlType.getName("Action"), width: 350},
        {field: 'parsedFileSize', displayName: 'Size', isColumnEdit: false},
        {field: 'dimensions', displayName: 'Dimensions', isColumnEdit: false}
      ],
      panelsColumns: [
        {field: 'iconPanel', displayName: '', isRequired: false, width: 50, isColumnEdit: false, gridControlType: enums.gridControlType.getName("Tooltip")},
        {field: 'name', displayName: 'Panel Name', validationFunction: validatePanelName, gridControlType: enums.gridControlType.getName("TextBox"), isColumnEdit: true, width: 170},
        {field: 'assetName', displayName: 'Asset', isColumnEdit: false, width: 170},
        {field: 'parsedFileSize', displayName: 'Size', isColumnEdit: false, width: 100},
        {field: 'positionX', displayName: 'X', gridControlType: enums.gridControlType.getName("TextBox"),  width: 100},
        {field: 'positionY', displayName: 'Y', gridControlType: enums.gridControlType.getName("TextBox"), width: 100},
        /* {field: 'positionType', displayName: 'position Types',listDataArray: $scope.lookups.positionTypes,  gridControlType: enums.gridControlType.getName("SelectList"),width:170},
         {field: 'autoExpand', displayName: 'Auto Expand', gridControlType: enums.gridControlType.getName("SingleCheckbox"), isColumnEdit: false, isPinned: false,enableDragDrop: false},
         {field: 'delayedExpansion', displayName: 'Delay Expansion', gridControlType: enums.gridControlType.getName("SingleCheckbox"), isColumnEdit: false, isPinned: false,enableDragDrop: false},
         {field: 'retraction', displayName: 'Retractions',listDataArray: $scope.lookups.retractions, gridControlType: enums.gridControlType.getName("SelectList"), isPinned: false,width:150},
         {field: 'transparent' , displayName: 'Transparency', gridControlType: enums.gridControlType.getName("SingleCheckbox"), isColumnEdit: false, isPinned: false,enableDragDrop: false}*/
      ],
      additionalAssetsColumns: [
        {field: 'name', displayName: 'Id', width: 80},
        {field: 'file', displayName: 'Asset', isColumnEdit: false, gridControlType: enums.gridControlType.getName("Action"), width: 350},
        {field: 'parsedFileSize', displayName: 'Size', isColumnEdit: false, width: 150},
        {field: 'dimensions', displayName: 'Dimensions', isColumnEdit: false, width: 250}
      ],
      ThirdPartyColumns: [
        {field: 'urlType', isRequired: true, displayName: 'Event Type', validationFunction: validateThirdPartyURLType, gridControlType: enums.gridControlType.getName("SelectList"), width: 150},
        {field: 'url', isRequired: true, displayName: 'URL', validationFunction: validateThirdPartyURL, gridControlType: enums.gridControlType.getName("TextBox"), isColumnEdit: true},
        {field: 'enabled', displayName: 'Enabled', gridControlType: enums.gridControlType.getName("SingleCheckbox"), isColumnEdit: false, width: 100, enableDragDrop: false}
        //{field: 'urlSource', displayName: 'Source',listDataArray: $scope.lookups.urlSourceTypes, gridControlType: enums.gridControlType.getName("SelectList"), isColumnEdit: false, width:150}
      ],
      clickthroughsColumns: [
        {field: 'iconPanel', displayName: '', isRequired: false, width: 50, isColumnEdit: false, gridControlType: enums.gridControlType.getName("Tooltip")},
        {field: 'Type', displayName: 'Type', isColumnEdit: false, width: 170},
        {field: 'url', displayName: 'Url', gridControlType: enums.gridControlType.getName("TextBox"), isColumnEdit: true}
        /*{field: 'targetWindowType', displayName: 'Target Window',listDataArray: $scope.lookups.targetWindowTypes, gridControlType: enums.gridControlType.getName("SelectList")},
         {field: 'showAddressBar', displayName: 'New Window Options- Show Address Bar', gridControlType: enums.gridControlType.getName("SingleCheckbox"), isColumnEdit: false,enableDragDrop: false},
         {field: 'showMenuBar', displayName: 'New Window Options-Show Menu Bar', gridControlType: enums.gridControlType.getName("SingleCheckbox"), isColumnEdit: false,enableDragDrop: false}*/
      ],
      html5AssetsColumns: [
        {field: 'name', displayName: 'Asset', isColumnEdit: false, width: 170},
        {field: 'thumbnail', displayName: 'Thumbnail', isColumnEdit: false, width: 100, gridControlType: enums.gridControlType.getName("Image")},
        {field: 'parsedFileSize.displayFileSize', displayName: 'Size', isColumnEdit: false, width: 170},
        {field: 'dimensions', displayName: 'Dimensions', isColumnEdit: false, width: 170},
        {field: 'thumbnail', displayName: 'Path', isColumnEdit: false, width: 170}
      ],
      inStreamCreativeAssetsColumns: [
        {field: 'file', displayName: 'Asset', isColumnEdit: false, width: 350, gridControlType: enums.gridControlType.getName("Action")},
        {field: 'dimensions', displayName: 'Dimensions', isColumnEdit: false, width: 150},
        {field: 'parsedFileSize', displayName: 'Size', isColumnEdit: false, width: 150},
        {field: 'duration', displayName: 'Video Duration', isColumnEdit: false, width: 150},
        {field: 'vpaid', displayName: 'VPAID', isColumnEdit: false, width: 150}
      ],
      inStreamCreativeAssetsLinearColumns: [
        {field: 'file', displayName: 'Asset', isColumnEdit: false, width: 350, gridControlType: enums.gridControlType.getName("Action")},
        {field: 'dimensions', displayName: 'Dimensions', isColumnEdit: false, width: 150},
        {field: 'parsedFileSize', displayName: 'Size', isColumnEdit: false, width: 150},
        {field: 'duration', displayName: 'Video Duration', isColumnEdit: false, width: 150}
      ],
      inStreamCreativeAssetsCompanionColumns: [
        {field: 'file', displayName: 'Asset', isColumnEdit: false, width: 350, gridControlType: enums.gridControlType.getName("Action")},
        {field: 'dimensions', displayName: 'Dimensions', isColumnEdit: false, width: 150},
        {field: 'parsedFileSize', displayName: 'Size', isColumnEdit: false, width: 150},
        {field: 'clickthrough', displayName: 'Clickthrough', gridControlType: enums.gridControlType.getName("TextBox"), isColumnEdit: true}
      ]
    };
    $scope.selectedAdURLs = [];
    //$scope.adRemaining = {val: false};
    fillciColumns();

    $scope.gridActions = {
      panelsGridButtonActions: [
        {
          name: "Add Panel",
          func: addPanel,
          isDisable: false
        },
        {
          name: "Remove Panel",
          func: removePanel,
          isDisable: false
        }
      ],
      additionalAssetsGridButtonActions: [
        {
          name: "Add  Asset",
          func: addAdditionalAsset,
          isDisable: false
        },

        {
          name: "Remove  Asset",
          func: removeAdditionalAsset,
          isDisable: false
        }
      ],

      thirdpartyUrlGridButtonActions: [
        {
          name: "Add",
          func: addURLClicked,
          isDisable: false
        },
        {
          name: "Remove",
          func: removeUrlClicked,
          isDisable: false
        }
      ],
      inStreamGridLButtonActions: [
        {
          name: "Add",
          func: addInStreamLinear,
          isDisable: false,
          mmId: "addInStreamLinear"
        },
        {
          name: "Delete",
          func: removeInStreamLinear,
          isDisable: false,
          mmId: "removeInStreamLinear"
        }
      ],
      variantInStreamGridLButtonActions: [
        {
          name: "Add",
          func: addVariantInStreamLinear,
          isDisable: false
        },
        {
          name: "Delete",
          func: removeVariantInStreamLinear,
          isDisable: false
        }
      ],
      inStreamVideoGridNLButtonActions: [
        {
          name: "Add",
          func: addInStreamNonLinear,
          isDisable: false
        },
        {
          name: "Delete",
          func: removeInStreamNonLinear,
          isDisable: false
        }
      ],
      inStreamVideoGridCButtonActions: [
        {
          name: "Add",
          func: addInStreamCompanion,
          isDisable: false
        },
        {
          name: "Delete",
          func: removeInStreamCompanion,
          isDisable: false
        }
      ],
      inStreamVideoGridACButtonActions: [
        {
          name: "Add",
          func: addInStreamAdvancedCompanion,
          isDisable: false
        },
        {
          name: "Delete",
          func: removeInStreamAdvancedCompanion,
          isDisable: false
        }
      ]
    };

    $scope.creativeAssets = {items: [], selectedItems: []};

    $scope.clickthroughs = [];
    $scope.placementAdsCentralLink = $stateParams.campaignId ? {link: "spa.campaign.placementAdList"} : {link: "spa.creativeCentralMain.placementAdList"};


    function initErrors() {
      $scope.errors = { adName: "",
        adFormat: "",
        downloadMode: "",
        creativeAssets: "",
        panels: "",
        additionalAssets: "",
        customInteractions: "",
        clickthroughs: "",
        adURLs: "",
        inStream: "",
        linearSettingsClickhrough: {text: ""}};
      thirdPartyUrlValidationResult['fields'] = [];
    }

    initErrors();

    function previewAd() {
      var url = '/#/adPreview/' + $scope.ad.id + '/mdx3/false';
      window.open("http:" +  url, '');
    }

    function generateTestTag() {
      //var modalInstance =
      var additionalLinks = [ {funcName: '', name: 'Copy tag to clipboard', additionalAttribute: "clip-copy=\"copyToClipBoard()\""}];
      //if($scope.ad.adFormat !== 'INSTREAM_AD' && $scope.ad.adFormat !== 'INSTREAM_INTERACTIVE_AD' && $scope.ad.adFormat !== 'INSTREAM_ENHANCED_AD'){
      //  additionalLinks.push({funcName: 'downloadTestPage', name: 'Download test page'});
      //}
      mmModal.open({
        templateUrl: './adManagementApp/views/generateTestTag.html',
        controller: 'generateTestTagCtrl',
        title: "Creative Test Tag",
        modalWidth: 800,
        bodyHeight: 350,
        confirmButton: { name: "Open test page", funcName: "openTestPage", isPrimary: true},
        discardButton: { name: "Close", funcName: "cancel" },
        additionalLinks: additionalLinks,
        resolve: {
          ad: function () {
            return $scope.ad;
          }
        }
      });

    }


    function discard() {
//                $scope.ad = mmRest.EC2Restangular.copy($scope.originalCopy);
      //updateByMode();
      updateState();
    }

    function updateByMode() {
      if (isNewMode()) { // Case New
        createNewAd();
      }
      else { // Case Edit
        editMode();
      }
    }

    function editMode() {
      $scope.mainEntityEdit = EC2Restangular.copy($scope.$parent.mainEntity);
    }

    editMultiple();

    if (($scope.adIds === undefined && $scope.selectedAds === undefined) || ($scope.adIds === undefined && $scope.selectedAds.length < 2)) {
      if (!$scope.isEditMode) {
        createNewAd();
      }
    }

    function editMultiple() {
      if ($scope.entralEntity !== undefined) {
        $scope.selectedAds = _.filter($scope.entralEntity.centralList, {'isSelected': true});
        if ($scope.selectedAds && $scope.selectedAds.length > 1) {
          execEditMultiple();
        }
      }
      else {
        if ($stateParams && $stateParams.adIds) {
          $scope.selectedAds = [];
          $scope.adIds = $stateParams.adIds.split(",");
          if ($scope.adIds.length > 1) {
            for (var i = 0; i < $scope.adIds.length; i++) {
              serverAds.get($scope.adIds[i]).then(function (ad) {
                $scope.selectedAds.push(ad);
                if ($scope.selectedAds.length === $scope.adIds.length) {
                  execEditMultiple();
                }
              });
            }
          }
        }
      }
    }

    function execEditMultiple() {
      $scope.isMultiple = [];
      $scope.controlStatus.isMultiple = false;
      createNewAd();
      $scope.account = null;
      var emptyPanelAd = false;

      var panelsDistincObjects = [];
      var panelsDistinctIds = [];
      var panelsUnique = {};

      $scope.additionalAssetsdistinctObjects = [];
      $scope.additionalAssetsdistinctIds = [];
      $scope.additionalAssetsunique = {};

      for (var i = 0; i < $scope.selectedAds.length; i++) {

        //panel edit multiple match
        if (!emptyPanelAd && $scope.selectedAds[i].panels) {
          distinctUniqueIds($scope.selectedAds[i].panels, 'assetId', ['name'], panelsDistincObjects, panelsDistinctIds, panelsUnique);
        }
        else {
          emptyPanelAd = true;
        }

        //additionalAssets edit multiple match
        var emptyAdditionalAssetsAd = false;
        if (!emptyAdditionalAssetsAd && $scope.selectedAds[i].additionalAssets) {
          distinctUniqueIds($scope.selectedAds[i].additionalAssets, 'assetId', ['name'], $scope.additionalAssetsdistinctObjects, $scope.additionalAssetsdistinctIds, $scope.additionalAssetsunique);
        }
        else {
          emptyAdditionalAssetsAd = true;
        }
      }

      if (!emptyPanelAd) {
        for (var k in panelsUnique) {
          if (panelsUnique[k] == $scope.selectedAds.length) {
            $scope.ad.panels.push(panelsDistincObjects[panelsDistinctIds.indexOf(k)]);
          }
        }
      }
      else $scope.ad.panels = null;

      if (!emptyAdditionalAssetsAd) {
        for (k in $scope.additionalAssetsunique) {
          if ($scope.additionalAssetsunique[k] == $scope.selectedAds.length) {
            $scope.ad.additionalAssets.push($scope.additionalAssetsdistinctObjects[$scope.additionalAssetsdistinctIds.indexOf(k)]);
          }
        }
      }
      else $scope.ad.additionalAssets = null;

      adBlFactory.getAdBl($scope.selectedAds[0].adFormat).fillEditMultipleMissingValues($scope.ad);

      fillPanels();
      fillAdditionalAsset();
      objectPropertiesScanner($scope.ad, $scope.selectedAds);
      prepareCreativeAssetsGrid($scope.ad.adFormat);
      prepareAdditionalAssetsGrid();
      fillClickthroughUrlsGrid();
      if ($scope.ad.defaultImage) {
        $scope.ad.defaultImage.dimensions = assetsLibraryService.getAssetDimension($scope.ad.defaultImage);
      }
      if ($scope.ad.banner) {
        $scope.ad.banner.dimensions = assetsLibraryService.getAssetDimension($scope.ad.banner);
      }
      clearSummaryBox();
    }

    function clearSummaryBox(){
      if($scope.creativeAssets.items && $scope.creativeAssets.items.length > 0 && $scope.creativeAssets.items[0].file[0].field ==  'Multiple Values'){
          $scope.ad.defaultImage.thumbnailUrl = null;
          $scope.ad.defaultImage.dimensions = null;
          $scope.ad.pricingSize = null;
          $scope.ad.overallSize = null;
          $scope.ad.initialSize = null;
          $scope.ad.lastUpdateOn= null;
        }
    }
    function objectPropertiesScanner(obj, objects, type) {
      for (i = 0; i < objects.length; i++) {
        obj = _.merge(obj, objects[i]);
      }

      for (var prop in obj) {
        if (obj[prop] != null && typeof (obj[prop]) == "object" && !(obj[prop] instanceof Array)) {
          var deepObject = [];
          for (i = 0; i < objects.length; i++) {
            if (objects[i][prop] != null) {
              deepObject.push(objects[i][prop])
            }
            else {
              deepObject.push(-999)
            }
          }
          objectPropertiesScanner(obj[prop], deepObject, prop);
        }
        else if (obj[prop] == null && typeof(creativeConsts.expandedAd[prop]) === "object" && !(creativeConsts.expandedAd[prop] instanceof Array)) {
          for (var i = 0; i < objects.length; i++) {
            if (objects[i][prop] !== null) {
              var innerObj = {};
              for (var innerProp in objects[i]) {
                innerObj[innerProp] = objects[i][innerProp];
              }
              //break;
            }
          }
        }
        else {
          var uniqResult = _.uniq(objects, prop);
          if (uniqResult != null && uniqResult.length > 1) {
            if (prop == "adFormat") {
              $scope.$parent.$parent.displayData.showEdit = false;
              mmAlertService.addInfo("You can only edit multiple ads for the same ad format.");
              break;
            }
            var multipleStr = type != undefined ? type + '.' + prop : prop;
            $scope.isMultiple.push(multipleStr);
            $scope.controlStatus.isMultiple = true;
            if (typeof obj[prop] == "string") {
              obj[prop] = multipleValue;
            }
          }
          else {
            obj[prop] = objects[0][prop];
          }
        }
      }
    }

    function fillPanels() {
      if (!$scope.ad.panels) {
        return;
      }
      for (var i = 0; i < $scope.ad.panels.length; i++) {
        if (!isNaN(parseInt($scope.ad.panels[i].assetId))) {
          if($scope.ad.panels[i].autoGeneratedPanel){
            SingleExpandableBannerAdDefaultPanel  = $scope.ad.panels[i];
             _.pull($scope.ad.panels, $scope.ad.panels[i]);
            break;
          }
          var panel = $scope.ad.panels[i];
          panel.dimensions = assetsLibraryService.getAssetDimension(panel);
          panel.parsedFileSize = assetsLibraryService.parseSizeFromBytes(panel.size);
          panel.iconPanel = [
            {template: "adManagementApp/views/panelExpansion.html", function: togglePanel, showControl: true, cssClass: "overrideHide"}
          ];
          panel.showChild = false;
          panel.retractionLookup = $scope.lookups.retractions;
          panel.positionTypesLookup = $scope.lookups.positionTypes;
        }
      }
    }

    function fillAdditionalAsset() {
      $scope.additionalAssetAssetsIds = [];
      if ($scope.ad.additionalAssets && $scope.ad.additionalAssets.length > 0) {
        for (var i = 0; i < $scope.ad.additionalAssets.length; i++) {
          var additionalAsset = $scope.ad.additionalAssets[i];
          additionalAsset.dimensions = assetsLibraryService.getAssetDimension(additionalAsset);
          additionalAsset.parsedFileSize = assetsLibraryService.parseSizeFromBytes(additionalAsset.size);
          $scope.additionalAssetAssetsIds.push(additionalAsset.assetId);
        }
      }
    }

    /*
     function fillMasterAd(){
     if (!$scope.ad.masterAdId  && $scope.entityId){
     EC2Restangular.all('ads/getPlacementAdsByMasterAdId').get($scope.entityId).then(function(list){
     $scope.placementAds = list;

     }, function(error){
     // in that case there is no placement Ads to this master - do not publish error message
     $scope.placementAds = [];
     });}}
     */
    function fillAccount() {
      if ($scope.ad && !$scope.ad.accountId) {
        if ($scope.$root.loggedInUserAccountId) {
          $scope.ad.accountId = $scope.$root.loggedInUserAccountId;
          EC2Restangular.one('accounts', $scope.$root.loggedInUserAccountId).get().then(function (account) {
            $scope.ad.accountName = account.name;
          });
        }
        else if ($scope.$root.loggedInUserId) {
          EC2Restangular.one('users', $scope.$root.loggedInUserId).get().then(function (user) {
            $scope.ad.accountId = user.accountId;
            EC2Restangular.one('accounts', $scope.ad.accountId).get().then(function (account) {
              $scope.ad.accountName = account.name;
            });
          });

        }
      }
    }

    function fillExternalData() {
      adBl = adBlFactory.getAdBl($scope.ad.adFormat);
      prepareCreativeAssetsGrid($scope.ad.adFormat);
      prepareAdditionalAssetsGrid();
      manipulateArchive($scope.ad.html5);
      fillPanels();
      fillAdditionalAsset();
      fillClickthroughUrlsGrid();
      fillCustomInteractions();
      fillInstreamAd();
      fillPanelSettings();
      adBl.fillEventTypes($scope.ad);
    }

    function fillInStreamGrid(adAsset, isExisting) {
      alignInstreamAdGridData(adAsset);
      switch (adAsset.type) {
        case("Linear"):
        {
          if (!isExisting) {
            if ($scope.ad.masterAdId) {
              if (adAsset.variants && adAsset.variants.length > 0) {
                for (var i = 0; i < adAsest.variants; i++) {
                  alignInstreamAdGridData(adAsset.variants[i]);
                  $scope.variants.linears.push(adAsset.variants[i]);
                }
              }
              else {
                $scope.variants.linears.push(adAsset);
              }
            }
            $scope.ad.linears.push(adAsset);
          }
          break;
        }
        case("NonLinear"):
        {
          if (!isExisting) {
            $scope.ad.nonLinears.push(adAsset);
          }
          break;
        }
        case("Companion"):
        {
          if (!isExisting) {
            $scope.ad.companions.push(adAsset);
          }
          break;
        }
        case("additionalAsset"):
        {
          if (!isExisting) {
            $scope.ad.additionalAsset.push(adAsset);
          }
          break;
        }
      }
    }

    function alignInstreamAdGridData(adAsset, isSource) {
      var fileName = '';
      if ($scope.isMultiple == undefined || $scope.isMultiple.length == 0 || $scope.isMultiple.indexOf(adAsset.type + '.assetId') == -1) {
        fileName = adAsset.assetName && adAsset.assetName.length > 40 ? $filter('limitTo')(adAsset.assetName, 40) + "..." : adAsset.assetName;
      }
      else {
        fileName = 'Multiple Values';
      }
      adAsset.duration = adAsset.duration && adAsset.duration > 0 ? adAsset.duration > 60000000 ? ((adAsset.duration / 60000000)).toFixed(3) + ' min' : ((adAsset.duration / 1000000)).toFixed(3) + ' sec' : "-";
      adAsset.file = [
        {field: adAsset.assetName && adAsset.assetName.length > 40 ? $filter('limitTo')(adAsset.assetName, 40) + "..." : adAsset.assetName, actionFieldType: enums.actionFieldType.getName("Text"), cssClass: ""},
        {field: 'fa fa-eye', actionFieldType: enums.actionFieldType.getName("Icon"), function: openAssetPreview, cssClass: "hideIcon"},
        {field: 'fa fa-search', actionFieldType: enums.actionFieldType.getName("Icon"), function: rowDoubleCLickFromGrid, isImage: true, height: "16", width: "16", cssClass: "hideIcon"},
      ];
      // taking the file source according the asset status - instead of creating new property
      adAsset.fileSource = adAsset.assetStatus === "FAILED_TRANSCODING" || adAsset.assetStatus === "PENDING_TRANSCODING" ? _.filter(enums.fileSource, {id: 'Auto'})[0].name : isSource ? _.filter(enums.fileSource, {id: 'Source'})[0].name : _.filter(enums.fileSource, {id: 'Manual'})[0].name;
      adAsset.transcoding = [
        {field: adAsset.fileSource, actionFieldType: enums.actionFieldType.getName("Text"), cssClass: ""},
        {field: adAsset.status, actionFieldType: enums.actionFieldType.getName("Text"), cssClass: ""}

      ];
      if(!adAsset.dimensions){
        adAsset.dimensions = assetsLibraryService.getAssetDimension(adAsset)
      }
      if(!adAsset.parsedFileSize){
        adAsset.parsedFileSize = assetsLibraryService.parseSizeFromBytes(adAsset.size);
      }

    }

    function fillClickthroughUrlsGrid() {
      $scope.clickthroughs = [];
      if (!$scope.ad.mainClickthrough) {
        $scope.ad.mainClickthrough = {
          "type": "MainClickthrough",
          "url": "",
          "targetWindowType": "NEW",
          "showAddressBar": true,
          "showMenuBar": true
        };
      }
      var isInstreamAD = true;
      if ($scope.ad.adFormat != "INSTREAM_AD" && $scope.ad.adFormat != "INSTREAM_INTERACTIVE_AD" && $scope.ad.adFormat != "INSTREAM_ENHANCED_AD") {
        isInstreamAD = false;
      }
      if (!isInstreamAD && !$scope.ad.defaultImageClickthrough) {
        $scope.ad.defaultImageClickthrough = {
          "type": "MainClickthrough",
          "url": "",
          "targetWindowType": "NEW",
          "showAddressBar": true,
          "showMenuBar": true
        };
      }
      $scope.clickthroughs.push($scope.ad.mainClickthrough);
      $scope.clickthroughs[0]['Type'] = 'Main Clickthrough';
      fillClicthroughExpansionData($scope.clickthroughs[0]);
      if (!isInstreamAD) {
        $scope.clickthroughs.push($scope.ad.defaultImageClickthrough);
        $scope.clickthroughs[1]['Type'] = 'Default Image Clickthrough';
        fillClicthroughExpansionData($scope.clickthroughs[1]);
      }


    }
    function fillClicthroughExpansionData(row) {
      row['iconPanel'] = [
        {template: "adManagementApp/views/clickthroghUrlsExpansion.html", function: toggleclickThroughs, showControl: true, cssClass: "overrideHide"}
      ];
      row['showChild'] = false;
      row['targetWindowTypeslookup'] = $scope.lookups.targetWindowTypes;
    }

    function fillciColumns() {
      var asset = {field: 'asset', displayName: 'Asset', isColumnEdit: false, width: 170};
      var name = {field: 'name', displayName: 'Name', isColumnEdit: false, width: 250};
      var reportingName = {field: 'reportingName', displayName: 'Reporting Name', isColumnEdit: true, width: 170};
      var closeAdParts = {field: 'closeAdParts', displayName: 'Close Ad Parts', gridControlType: enums.gridControlType.getName("SingleCheckbox"), isColumnEdit: false, width: 170};
      var redirectURL = {field: 'redirectURL', displayName: 'Redirect URL', isColumnEdit: true, width: 170};
      var IncludeInInteractionRate = {field: 'IncludeInInteractionRate', displayName: 'Include in interaction Rate', gridControlType: enums.gridControlType.getName("SingleCheckbox"), isColumnEdit: false, width: 180};
      var type = {field: 'displayType', displayName: 'Type', isColumnEdit: false, width: 170};

      $scope.gridColumns.ciClickthroughColumns = [asset, name, reportingName, closeAdParts, redirectURL];
      $scope.gridColumns.ciAutomaticEventColumns = $scope.gridColumns.ciUserActionColumns = [asset, name, reportingName, IncludeInInteractionRate, closeAdParts, redirectURL];
      $scope.gridColumns.ciTimerColumns = [asset, name, reportingName];
      $scope.gridColumns.ciAllColumns = [asset, name, reportingName, type, IncludeInInteractionRate, closeAdParts, redirectURL];
    }

    function fillCustomInteractions() {
      resetCIGrid();
      if (!$scope.ad || !$scope.ad.customInteractions || !$scope.ad.customInteractions.length || $scope.ad.customInteractions.length == 0) {
        $scope.isCiExist = false;
        return;
      }
      $scope.isCiExist = true;
      for (var i = 0; i < $scope.ad.customInteractions.length; i++) {
        var interaction = $scope.ad.customInteractions[i];
        fillCustomInteraction(interaction);
      }
    }

    function fillCustomInteraction(customInteraction) {
      switch (customInteraction.type) {
        case 'AdAutomaticEventInteraction':
        case '3':
          customInteraction.type = 'AdAutomaticEventInteraction';
          customInteraction.displayType = enums.customInteractionTypes.getName('AdAutomaticEventInteraction');
          $scope.gridItems['ciAutomaticEvents'].push(customInteraction);
          break;
        case 'AdClickthroughInteraction':
        case '4':
          customInteraction.type = 'AdClickthroughInteraction';
          customInteraction.displayType = enums.customInteractionTypes.getName('AdClickthroughInteraction');
          $scope.gridItems['ciClickthroughs'].push(customInteraction);
          break;
        case 'AdTimerInteraction':
        case '2':
          customInteraction.type = 'AdTimerInteraction';
          customInteraction.displayType = enums.customInteractionTypes.getName('AdTimerInteraction');
          $scope.gridItems['ciTimers'].push(customInteraction);
          break;
        case 'AdUserActionInteraction':
        case '1':
          customInteraction.type = 'AdUserActionInteraction';
          customInteraction.displayType = enums.customInteractionTypes.getName('AdUserActionInteraction');
          $scope.gridItems['ciUserActions'].push(customInteraction);
          break;
      }
    }

    function resetCIGrid() {
      $scope.gridItems.ciAutomaticEvents = [];
      $scope.gridItems.ciClickthroughs = [];
      $scope.gridItems.ciTimers = [];
      $scope.gridItems.ciUserActions = [];
    }

    function fillPanelSettings() {
      $scope.ad.panelsSettings = $scope.ad.panelsSettings || {panelFrequencyTimes :1, defaultPanelFrequency : "UNLIMITED", panelFrequency : "UNLIMITED"};
      $scope.ad.panelsSettings.type = adBlFactory.getAdBl($scope.ad.adFormat).setPanelSettingsType();
      if($scope.ad.panelsSettings.autoExpandDefaultPanel){
        $scope.controlStatus.panelFreqency = false;
      }
      else{
        $scope.ad.panelsSettings.isPanelFrequencyEnabled = false;
      }
      if ($scope.ad.adFormat === "EXPANDABLE_BANNER_AD" || $scope.ad.adFormat === "PUSHDOWN_BANNER_AD" || $scope.ad.adFormat === "SINGLE_EXPANDABLE_BANNER_AD") {
        var dimensionExist =_.filter($scope.gridColumns.panelsColumns, {field: 'dimensions'});
        if(!dimensionExist){
          $scope.gridColumns.panelsColumns.push({field: 'dimensions', displayName: 'Dimensions', isColumnEdit: false});
        }
        var defaultColumn = _.filter($scope.gridColumns.panelsColumns, {'field': 'defaultPanel'});
        if ($scope.ad.adFormat != "SINGLE_EXPANDABLE_BANNER_AD") {
          if (defaultColumn.length === 0) {
            $scope.gridColumns.panelsColumns.push({field: 'defaultPanel', displayName: 'Default', gridControlType: enums.gridControlType.getName("SingleCheckbox"), isColumnEdit: false, isPinned: false, enableDragDrop: false});
          }
        }
        else{
          if (defaultColumn.length > 0) {
            $scope.gridColumns.panelsColumns.pop();
          }
          if ($scope.ad.panels.length > 0) {
            $scope.controlStatus.panelsNotfound = false;
          }
        }

        if (!$scope.ad.panelsSettings.panelFrequencyTimes) {
          $scope.ad.panelsSettings.panelFrequencyTimes = 1;
        }
        if (!$scope.ad.panelsSettings.panelFrequency || $scope.ad.panelsSettings.panelFrequency === "UNLIMITED" || $scope.ad.panelsSettings.defaultPanelFrequency === "UNLIMITED") {
          $scope.ad.panelsSettings.defaultPanelFrequency = "UNLIMITED";
          $scope.ad.panelsSettings.panelFrequency = "ONCE_IN_CAMPAIGN";
          $scope.ad.panelsSettings.isPanelFrequencyEnabled = false;
        }
        else {
          $scope.ad.panelsSettings.defaultPanelFrequency = "AUTO_EXPAND";
          $scope.ad.panelsSettings.isPanelFrequencyEnabled = $scope.ad.panelsSettings.autoExpandDefaultPanel &&  true;
        }
      }
      else if ($scope.ad.adFormat === "HTML5_EXPANDABLE_BANNER_AD") {
        var dimensionExist = _.filter($scope.gridColumns.panelsColumns, {field: 'dimensions'});
        if(!dimensionExist){
          $scope.gridColumns.panelsColumns.push({field: 'dimensions', displayName: 'Dimensions', validationFunction: validatePanelDimension, gridControlType: enums.gridControlType.getName("TextBox"), isColumnEdit: true, width: 170});
        }
       }
      }

    $scope.panelFrequencyClick = function () {
      if ($scope.ad.panelsSettings.defaultPanelFrequency == "UNLIMITED") {
        $scope.ad.panelsSettings.isPanelFrequencyEnabled = false;
      }
      else {
        $scope.ad.panelsSettings.isPanelFrequencyEnabled = true;
        $scope.ad.panelsSettings.panelFrequency = $scope.ad.panelsSettings.panelFrequency ||  "ONCE_IN_CAMPAIGN";
      }
    };

    function distinctUniqueIds(array, property, additionalProperties, distinctObjects, distinctIds, uniqueCounter) {
      for (var j = 0; j < array.length; j++) {
        if (typeof(uniqueCounter[array[j][property]]) == "undefined") {
          if (additionalProperties != undefined) {
            distinctObjects.push(_.clone(array[j]))
          }
          distinctIds.push(array[j][property]);
          uniqueCounter[array[j][property]] = 1
        }
        else { //already found object
          if (additionalProperties != undefined) {
            for (var k = 0; k < additionalProperties.length; k++) {
              if ((distinctObjects[distinctIds.indexOf(array[j][property])][additionalProperties[k]] != 'Multiple Values' || distinctObjects[distinctIds.indexOf(array[j][property])][additionalProperties[k]] != -1 ) &&
                  distinctObjects[distinctIds.indexOf(array[j][property])][additionalProperties[k]] != array[j][additionalProperties[k]]) {
                distinctObjects[distinctIds.indexOf(array[j][property])][additionalProperties[k]] = -1;
              }
            }
            uniqueCounter[array[j][property]] = uniqueCounter[array[j][property]] + 1;
          }
        }
      }

    }

    function isNewMode() {
      return  $scope.$parent.mainEntity == undefined || $scope.$parent.mainEntity === null || $scope.$parent.mainEntity.id == undefined;
    }

    function createNewAd() {
      $scope.$root.isDirtyEntity = false;
      var initialAdType = "STANDARD_BANNER_AD";
      $scope.placementAds = 0;
      if ($scope.isEntral == false && _.filter($scope.entityLayoutButtons, {'name': 'ASSIGNMENT'}).length === 0) {
        $scope.addButtons([
            {name: 'ASSIGNMENT', isDisabled: true,
              actions: [
                {name: 'Assign to Campaign Manager', func: assignCampaignManager, nodes: []},
                {name: 'Assign to Campaign', func: assignCampaign, nodes: []}
              ],
              views: []},
            {name: 'PREVIEW', func: previewAd, isDisabled: true},
            {name: 'TEST TAG', func: generateTestTag, ref: null, isDisabled: true}]);
      }
      $scope.ad = {
        "type": "StandardBannerAd",
        "id": "",
        "name": "",
        "masterAdId": "",
        "isChanged": false,
        "adStatus": "NEW",
        "adFormat": initialAdType,
        "accountId": "",
        "advertiserId": "",
        "campaignId": "",
        "placementId": null,
        "createdBy": null,
        "createdOn": null,
        "lastUpdateBy": null,
        "lastUpdateOn": null,
        "overallSize": 0,
        "pricingSize": 0,
        "html5OverallSize": 0,
        "downloadMode": "POLITE",
        "defaultImage": {"type": "AdAsset", "assetId": ""},
        "banner": null,
        "html5": null,
        "mainClickthrough": {
          "type": "MainClickthrough",
          "url": "",
          "targetWindowType": "NEW",
          "showAddressBar": true,
          "showMenuBar": true
        },
        "defaultImageClickthrough": {
          "type": "MainClickthrough",
          "url": "",
          "targetWindowType": "NEW",
          "showAddressBar": true,
          "showMenuBar": true
        },
        "tooltip": "",
        "changed": false,
        "panelsAppearance": true,
        "preloadPanels": false,
        "videoStartMethod": "USER_START",
        // Expandable Banner Ad additional properties
        "preloadBanner": null,
        "panels": [],
        "additionalAssets": [],
        "customInteractions": [],
        adChoicesStatus: false,
        adChoicesLocation: "TOP_RIGHT"
      };

      if (!$scope.isMultiple) {
        fillAccount();
        prepareCreativeAssetsGrid(initialAdType);
        fillClickthroughUrlsGrid();

        if ($scope.contextData && $scope.contextData.isInContext &&
            $scope.contextData.contextEntityType == 'campaign' &&
            $scope.contextData.contextEntityId && $scope.contextData.contextEntityId != '') {
          $scope.ad.adAssignmentData = { 'type' : 'AdAssignmentData'};
          $scope.ad.campaignId = $scope.contextData.contextEntityId; //server request.
          $scope.ad.adAssignmentData.campaignId = $scope.contextData.contextEntityId;
          $scope.ad.adAssignmentData.campaignName = $scope.contextData.contextEntityName;
        }
      }

    }

    function prepareCreativeAssetsGrid(type) {

      if ($scope.ad['selectedAdditionalAssets'] === undefined) {
        $scope.ad['selectedAdditionalAssets'] = [];
      }
      else {
        $scope.ad['selectedAdditionalAssets'].length = 0;
      }

      if (type !== creativeConsts.adFormats.inStream.format && type !== creativeConsts.adFormats.inStreamInteractive.format) {
        addAssetObjectToCreativeAssetsGrid($scope.ad.defaultImage, 'defaultImage');
      }

      switch (type) {
        case 'STANDARD_BANNER_AD':
          addAssetObjectToCreativeAssetsGrid($scope.ad.banner, 'banner');
          addAssetObjectToCreativeAssetsGrid($scope.ad.html5, 'html5');
          break;
        case 'EXPANDABLE_BANNER_AD':
        case 'PUSHDOWN_BANNER_AD':
        case 'SINGLE_EXPANDABLE_BANNER_AD':
          addAssetObjectToCreativeAssetsGrid($scope.ad.banner, 'banner');
          $scope.ad['selectedPanels'] = [];
          break;
        case 'ENHANCED_STANDARD_BANNER_AD':
        case 'RICH_MEDIA_BANNER_AD':
          addAssetObjectToCreativeAssetsGrid($scope.ad.preloadBanner, 'preloadBanner');
          addAssetObjectToCreativeAssetsGrid($scope.ad.banner, 'banner');
          break;
        case 'FLOATING_AD':
          break;
        case 'HTML5_RICH_MEDIA_BANNER_AD':
          addAssetObjectToCreativeAssetsGrid($scope.ad.html5, 'html5');
          break;
        case 'HTML5_EXPANDABLE_BANNER_AD':
        case 'HTML5_SINGLE_EXPANDABLE_BANNER_AD':
          addAssetObjectToCreativeAssetsGrid($scope.ad.html5, 'html5');
          break;
      }
      if ($scope.ad && $scope.ad.html5 && $scope.ad.html5.assetId) {
        adService.getAllHtml5assets($scope.ad.html5.assetId).then(function (response) {
          $scope.ad.html5.archiveManifest = response;
        });
      }
    }

    function prepareAdditionalAssetsGrid(){
      if($scope.ad.additionalAssets){
        for(var i = 0; i < $scope.ad.additionalAssets.length ; i++ ){
          addAssetObjectsToGrid($scope.ad.additionalAssets, $scope.ad.additionalAssets[i])
        }
      }
    }

    function addAssetObjectToCreativeAssetsGrid(adAsset, type) {
      var mandatoryRow = false;
      var requiredFormats = adService.getRequiredFormatsByAdType();
      if (requiredFormats[$scope.ad.adFormat] != undefined) {
        mandatoryRow = requiredFormats[$scope.ad.adFormat].contains(type);
      }
      var typeName = enums.assetTypes.getName(type);
      var gridItem = _.findWhere($scope.creativeAssets.items, {'type': typeName});
      var fileName = "";
      var fileSize = "";
      var dimension ="";
      var indexAssetId = $scope.isMultiple ? $scope.isMultiple.indexOf(type + '.assetId') : -1;
      if ($scope.isMultiple && adAsset && adAsset.assetId === multipleValue && indexAssetId != -1) {
        fileName = 'Multiple Values';
      }
      else{
        dimension = assetsLibraryService.getAssetDimension(adAsset);
        fileSize = adAsset ? assetsLibraryService.parseSizeFromBytes(adAsset.size) : '';
        if (adAsset && adAsset.assetName) {
          fileName = adAsset.assetName && adAsset.assetName.length > 40 ? $filter('limitTo')(adAsset.assetName, 40) + "..." : adAsset.assetName;
        }
      }

      if (gridItem) {
        gridItem.requiredSign = mandatoryRow;
        gridItem.file[0].field = fileName;
        gridItem.file[1].showControl = true;
        gridItem.file[2].showControl = false;
        gridItem.file[3].showControl = true;
        gridItem.parsedFileSize = fileSize;
        gridItem.dimensions = dimension;
      }
      else {
        var showButton = (adAsset && adAsset.assetId != "") ? false : true;
        $scope.creativeAssets.items.push({
              requiredSign: mandatoryRow,
              type: typeName,
              file: [
                {field: fileName, actionFieldType: enums.actionFieldType.getName("Text"), cssClass: ""},
                {field: 'fa fa-search', actionFieldType: enums.actionFieldType.getName("Icon"), function: rowDoubleCLickFromGrid, isImage: true, height: "16", width: "16", cssClass: "hideIcon", showControl: !showButton},
                {field: 'button', title: 'Assign Asset', actionFieldType: enums.actionFieldType.getName("Button"), function: rowDoubleCLickFromGrid, showControl: showButton},
                {field: '/ignoreImages/si_close_entity_normal.png', actionFieldType: enums.actionFieldType.getName("Image"), function: removeAsset, isImage: true, height: "16", width: "16", cssClass: "hideIcon", showControl: !showButton}
              ],
              parsedFileSize: fileSize,
              dimensions: dimension
            }
        );
      }
    }

    function addAssetObjectsToGrid(gridItems, adAsset) {
      var gridItem = gridItems.length > 0 ?_.findWhere(gridItems, {'name': adAsset.name}) : undefined;
      var fileName = "";
      var fileSize = "";
      var dimension ="";
      var indexAssetId = $scope.isMultiple ? $scope.isMultiple.indexOf(adAsset.type + '.assetId') : -1;
      if ($scope.isMultiple && adAsset && adAsset.assetId === multipleValue && indexAssetId != -1) {
        fileName = 'Multiple Values';
      }
      else{
        dimension = assetsLibraryService.getAssetDimension(adAsset);
        fileSize = adAsset ? assetsLibraryService.parseSizeFromBytes(adAsset.size) : '';
        if (adAsset && adAsset.assetName) {
          fileName = adAsset.assetName && adAsset.assetName.length > 40 ? $filter('limitTo')(adAsset.assetName, 40) + "..." : adAsset.assetName;
        }
      }
      var showButton = (adAsset && adAsset.assetId != "") ? false : true;
      if (gridItem) {
        if(!gridItem.file){
          gridItem.file= [
            {field: fileName, actionFieldType: enums.actionFieldType.getName("Text"), cssClass: ""},
            {field: 'fa fa-search', actionFieldType: enums.actionFieldType.getName("Icon"), function: rowDoubleCLickFromGrid, isImage: true, height: "16", width: "16", cssClass: "hideIcon", showControl: !showButton},
            {field: '/ignoreImages/si_close_entity_normal.png', actionFieldType: enums.actionFieldType.getName("Image"), function: removeAsset, isImage: true, height: "16", width: "16", cssClass: "hideIcon", showControl: !showButton}
          ];
        }
        else{
          gridItem.file[0].field = fileName;
          gridItem.file[1].showControl = true;
          gridItem.file[2].showControl = true;
          gridItem.parsedFileSize = fileSize;
          gridItem.dimensions = dimension;
          gridItem.assetId = adAsset.assetId;
        }
      }
      else {
        gridItems.push({
          type: adAsset.type,
          name: adAsset.name,
          assetId : adAsset.assetId,
          file: [
            {field: fileName, actionFieldType: enums.actionFieldType.getName("Text"), cssClass: ""},
            {field: 'fa fa-search', actionFieldType: enums.actionFieldType.getName("Icon"), function: rowDoubleCLickFromGrid, isImage: true, height: "16", width: "16", cssClass: "hideIcon", showControl: !showButton},
            {field: '/ignoreImages/si_close_entity_normal.png', actionFieldType: enums.actionFieldType.getName("Image"), function: removeAsset, isImage: true, height: "16", width: "16", cssClass: "hideIcon", showControl: !showButton}
          ],
          parsedFileSize: fileSize,
          dimensions: dimension
        });
      }
    }

    function updateState() {
      if($scope.ad && ($scope.ad.adStatus === 'PUBLISHED' || $scope.ad.adStatus  === 'IDLE'  ||  $scope.ad.adStatus === 'LIVE')){
        mmAlertService.addInfo("Please keep in mind that you are editing a trafficked ad");
      }
      $scope.panelAssetsIds = [];
      $scope.additionalAssetAssetsIds = [];
      initErrors();
      if ($scope.$parent.mainEntity != null && $scope.isEditMode) {
        //$scope.ad = $scope.$parent.mainEntity;

        //TODO change bacck to $scope.ad = $scope.$parent.mainEntity after save/update return enriched data
        serverAds.get($scope.$parent.mainEntity.id).then(function (ad) {
          $scope.ad = mmRest.EC2Restangular.copy(ad);

          if ($scope.ad.defaultImage) {
            $scope.ad.defaultImage.dimensions = assetsLibraryService.getAssetDimension($scope.ad.defaultImage);
          }
          adBl = adBlFactory.getAdBl($scope.ad.adFormat);
          if ($scope.ad && !$scope.ad.masterAdId) {

            if (!$scope.isEntral && _.filter($scope.entityLayoutButtons, {'name': 'ASSIGNMENT'}).length === 0) {
              if ($scope.ad.createdByHTML5Factory) {
                $scope.entityLayoutButtons.push({name: 'Edit in HTML5 Factory', ref: null, func: gotoFactory});
              }
              $scope.addButtons([{name: 'ASSIGNMENT',
                ref: null,
                actions: [
                  {name: 'Assign to Campaign Manager', func: assignCampaignManager, nodes: []},
                  {name: 'Assign to Campaign', func: assignCampaign, nodes: []}
                ],
                views: []}]);

            }
            if($scope.ad.adFormat === "INSTREAM_AD" || $scope.ad.adFormat === "INSTREAM_INTERACTIVE_AD") {
              $scope.gridActions.additionalAssetsGridButtonActions = [
                {
                  name: "Add  Asset",
                  func: addAdditionalAsset,
                  isDisable: false
                },
                {
                  name: "Add  Variant",
                  func: addVariant,
                  isDisable: $scope.ad && $scope.ad.selectedAdditionalAssets && $scope.ad.selectedAdditionalAssets.length > 0
                },
                {
                  name: "Remove  Asset",
                  func: removeAdditionalAsset,
                  isDisable: false
                }
              ]
            }
            if (!!$scope.ad.numberOfPlacementAds || $scope.ad.numberOfPlacementAds > 0) {
              $scope.entityLayoutInfraButtons.saveButton = {isPrimary: true, name: 'save', func: '', ref: null, nodes: [
                {name: 'save Common', description: 'Effects only linked placement ads', func: saveCommon, ref: null, nodes: []},
                {name: 'save Override', description: 'Effect all placement ads and override existing values', func: saveOverride, ref: null, nodes: []}
              ]}
            }
          }
          else {
            $scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: save, ref: null, nodes: [], isPrimary: true};
          }
          if ($scope.isEntral === false && _.filter($scope.entityLayoutButtons, {'name': 'PREVIEW'}).length === 0) {
            $scope.addButtons([
                {name: 'PREVIEW', func: previewAd},
                {name: 'TEST TAG', func: generateTestTag, ref: null}])
            /*,
             {name: 'Send Ad to QA', func: sendAdToQA});*/ //To-do- remove when comment when back to scope (also in list)
          }
          fillExternalData();
//                        $scope.originalCopy = mmRest.EC2Restangular.copy($scope.ad);

          if ($scope.tabfocused) {
            $scope.tabfocused === 'creativeAssetsBase' ? $scope.focusedTab('additionalAssetsTab') : $scope.focusedTab('creativeAssetsBase');
            $scope.focusedTab($scope.tabfocused);
          }
          if ($scope.clickthroghstabfocused) {
            $scope.clickthroghstabfocused === 'clickthroughs' ? $scope.clickthroghsfocusedTab('thirdParty') : $scope.clickthroghsfocusedTab('clickthroughs');
            $scope.clickthroghsfocusedTab($scope.clickthroghstabfocused);
          }


        });
      }
      else {
        createNewAd();
        adBl = adBlFactory.getAdBl($scope.ad.adFormat);
        if ($scope.ad && $scope.ad.numberOfPlacementAds && $scope.ad.numberOfPlacementAds > 0) {
          $scope.entityLayoutInfraButtons.saveButton = {isPrimary: true, name: 'save', func: '', ref: null, nodes: [
            {name: 'save Common', description: 'Effects only linked placement ads', func: saveCommon, ref: null, nodes: []},
            {name: 'save Override', description: 'Effect all placement ads and override existing values', func: saveOverride, ref: null, nodes: []}
          ]}
          if($scope.ad.adFormat === "INSTREAM_AD" || $scope.ad.adFormat === "INSTREAM_INTERACTIVE_AD") {
            $scope.gridActions.additionalAssetsGridButtonActions = [
              {
                name: "Add  Asset",
                func: addAdditionalAsset,
                isDisable: false
              },
              {
                name: "Add  Variant",
                func: addVariant,
                isDisable: $scope.ad && $scope.ad.selectedAdditionalAssets && $scope.ad.selectedAdditionalAssets.length > 0
              },
              {
                name: "Remove  Asset",
                func: removeAdditionalAsset,
                isDisable: false
              }
            ]
          }
        }
        else {
          $scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: save, ref: null, nodes: [], isPrimary: true};
        }
        fillExternalData();
//                    $scope.originalCopy = mmRest.EC2Restangular.copy($scope.ad);
      }
    }

    $scope.changeAdType = function () {
      initErrors();
      $scope.creativeAssets.items.length = 0;
      $timeout(function () {
        var type = "";

        switch ($scope.ad.adFormat) {
          case "STANDARD_BANNER_AD":
            type = "StandardBannerAd";
            break;
          case "ENHANCED_STANDARD_BANNER_AD":
            type = "EnhancedStandardBannerAd";
            break;
          case "EXPANDABLE_BANNER_AD":
            type = "ExpandableBannerAd";
            fillPanelSettings();
            break;
          case "SINGLE_EXPANDABLE_BANNER_AD":
            type = "SingleExpandableBannerAd";
            fillPanelSettings();
            $scope.ad.panelsSettings.multiplePanels = $scope.ad.panelsSettings.multiplePanels || true;
            $scope.ad.panelsSettings.componentPositionX = $scope.ad.panelsSettings.componentPositionX || 0;
            $scope.ad.panelsSettings.componentPositionY = $scope.ad.panelsSettings.componentPositionY || 0;
            $scope.ad.panelsSettings.componentCollapsedSizeX = $scope.ad.panelsSettings.componentCollapsedSizeX || 0;
            $scope.ad.panelsSettings.componentCollapsedSizeY = $scope.ad.panelsSettings.componentCollapsedSizeY || 0;
            break;
          case "RICH_MEDIA_BANNER_AD":
            type = "RichMediaBannerAd";
            break;
          case "TRACKING_PIXEL_AD":
            type = "TrackingPixelAd";
            break;
          case "INSTREAM_AD":
            type = "InStreamAd";
            $scope.ad.defaultImage = null;
            $scope.ad.deliveryType = "PROGRESSIVE";
            $scope.ad.vastTemplateFormat = "INSTREAM_VIDEO";
            $scope.ad.vastVariables = null;
            fillInstreamAd();
            break;
          case "INSTREAM_INTERACTIVE_AD":
            type = "InStreamInteractiveAd";
            $scope.ad.defaultImage = null;
            $scope.ad.deliveryType = "PROGRESSIVE";
            $scope.ad.vastTemplateFormat = "INSTREAM_VIDEO";
            $scope.ad.vastVariables = null;
            fillInstreamAd();
            break;
          case "PUSHDOWN_BANNER_AD":
            type = "PushdownBannerAd";
            fillPanelSettings();
            $scope.ad.showMotion = true;
            break;
          case"FLOATING_AD" :
            type = "Floating Ad";
            break;
          case "HTML5_RICH_MEDIA_BANNER_AD" :
            type = "HTML5RichMediaBannerAd";
            fillPanelSettings();
            break;
          case "HTML5_EXPANDABLE_BANNER_AD" :
            type = "HTML5ExpandableBannerAd";
            fillPanelSettings();
            $scope.ad.panelsSettings.multiplePanels = $scope.ad.panelsSettings.multiplePanels || true;
            break;
          case "HTML5_SINGLE_EXPANDABLE_BANNER_AD" :
            type = "HTML5SingleExpandableBannerAd";
            break;

        }
        $scope.ad.type = type;
        adBl = adBlFactory.getAdBl($scope.ad.adFormat);
        adBl.fillEventTypes($scope.ad);
        prepareCreativeAssetsGrid($scope.ad.adFormat);
        fillClickthroughUrlsGrid();
        sizeCalculation();
      }, 5);
    };

    $scope.focusedTab = function (opened) {
      $timeout(function () {
        $scope.tabfocused = opened;
        switch (opened) {
          case 'creativeAssetsBase' :
            $scope.tabsFocused.creativeAssetsBase = true;
            $scope.tabsFocused.additionalAssetsTab = false;
            $scope.tabsFocused.panels = false;
            $scope.tabsFocused.html5 = false;
            break;
          case 'panels' :
            $scope.tabsFocused.panels = true;
            $scope.tabsFocused.additionalAssetsTab = false;
            $scope.tabsFocused.creativeAssetsBase = false;
            $scope.tabsFocused.html5 = false;
            break;
          case 'additionalAssetsTab' :
            $scope.tabsFocused.additionalAssetsTab = true;
            $scope.tabsFocused.creativeAssetsBase = false;
            $scope.tabsFocused.panels = false;
            $scope.tabsFocused.html5 = false;
            $scope.tabsFocused.linears = false;
            $scope.tabsFocused.nonLinears = false;
            $scope.tabsFocused.companions = false;
            $scope.tabsFocused.advancedCompanions = false;
            $scope.tabsFocused.additionalAssets = false;
            if ($scope.ad.adFormat == "INSTREAM_AD" ||
                $scope.ad.adFormat == "INSTREAM_INTERACTIVE_AD" ||
                $scope.ad.adFormat == "INSTREAM_ENHANCED_AD") {
              $scope.transcodeStatusPicker();
            }
            break;
          case 'html5' :
            $scope.tabsFocused.html5 = true;
            $scope.tabsFocused.additionalAssetsTab = false;
            $scope.tabsFocused.creativeAssetsBase = false;
            $scope.tabsFocused.panels = false;
            break;
          case 'linears' :
            $scope.tabsFocused.linears = true;
            $scope.tabsFocused.nonLinears = false;
            $scope.tabsFocused.companions = false;
            $scope.tabsFocused.advancedCompanions = false;
            $scope.tabsFocused.additionalAssets = false;
            $scope.transcodeStatusPicker();
            break;
          case 'nonLinears' :
            $scope.tabsFocused.nonLinears = true;
            $scope.tabsFocused.linears = false;
            $scope.tabsFocused.companions = false;
            $scope.tabsFocused.advancedCompanions = false;
            $scope.tabsFocused.additionalAssets = false;
            break;
          case 'companions' :
            $scope.tabsFocused.companions = true;
            $scope.tabsFocused.linears = false;
            $scope.tabsFocused.nonLinears = false;
            $scope.tabsFocused.advancedCompanions = false;
            $scope.tabsFocused.additionalAssets = false;
            break;
          case 'advancedCompanions' :
            $scope.tabsFocused.advancedCompanions = true;
            $scope.tabsFocused.linears = false;
            $scope.tabsFocused.nonLinears = false;
            $scope.tabsFocused.companions = false;
            $scope.tabsFocused.additionalAssets = false;
            break;
          case 'general' :
            $scope.tabsFocused.general = true;
            break;
        }

      }, 50);
    };
    $scope.clickthroghsfocusedTab = function (opened) {
      $timeout(function () {
        $scope.clickthroghstabfocused = opened;
        switch (opened) {
          case 'clickthroughs' :
            $scope.tabsFocused.clickthroughs = true;
            break;
          case 'thirdParty' :
            $scope.tabsFocused.thirdParty = true;
            break;

        }
      }, 50);
    };
    function saveCommon() {
      save(false);
    }

    function saveOverride() {
      save(true);
    }

    function save(isOverride) {
      $scope.saveActionClicked = false;
      if (!validate()) {
        $scope.saveActionClicked = true;
        //fillExternalData();
      }
      else {
        if ($scope.selectedAds && $scope.selectedAds.length > 1) {
          prepareSaveData($scope.ad);
          prepareMultipleSaveData($scope.ad, $scope.selectedAds);
          return serverAds.customPUT($scope.selectedAds, undefined, {isOverride: isOverride}, undefined).then(processData, processError);
        }
        else {
          prepareSaveData($scope.ad);
          if ($scope.ad.id === "") {
            $scope.ad.adAssignmentData = null;
            return serverAds.post($scope.ad).then(tempAllowAssignAfterSaveprocessData, processError);
          }
          else {
            return serverAds.customPUT($scope.ad, undefined, {isOverride: isOverride}, undefined).then(processData, processError);
          }
        }
      }
    }

    function prepareMultipleSaveData(obj, selectedObjects, type) {
      for (var prop in obj) {
        if (obj[prop]  instanceof Array) {
          switch (prop) {
            case 'panels':
              for (i = 0; i < selectedObjects.length; i++) {
                for (j = 0; j < selectedObjects[i].panels.length; j++) {
                  if (_.indexOf($scope.panelsDistinctIds, selectedObjects[i].panels[j].assetId) == -1) {
                    selectedObjects[i].panels.splice(j, 1)
                  }
                }
              }
              for (i = 0; i < obj.panels.length; i++) {
                for (j = 0; j < selectedObjects.length; j++) {
                  var tempAsset = _.findWhere(selectedObjects[j].panels, {'assetId': obj.panels[i].assetId});
                  if (undefined === tempAsset) {
                    selectedObjects[j].panels.push(obj.panels[i]);
                  }
                }
              }

              break;
            case 'additionalAssets':
              for (i = 0; i < selectedObjects.length; i++) {
                if (selectedObjects[i].additionalAssets) {
                  for (j = 0; j < selectedObjects[i].additionalAssets.length; j++) {
                    if (_.indexOf($scope.additionalAssetsdistinctIds, selectedObjects[i].additionalAssets[j].assetId) == -1) {
                      selectedObjects[i].additionalAssets.splice(j, 1);
                    }
                  }
                }
              }
              for (i = 0; i < obj.additionalAssets.length; i++) {
                for (var j = 0; j < selectedObjects.length; j++) {
                  var tempAsset = _.findWhere(selectedObjects[j].additionalAssets, {'assetId': obj.additionalAssets[i].assetId});
                  if (tempAsset === undefined) {
                    var additionalAsset = _.clone(obj.additionalAssets[i]);
                    var name = selectedObjects[j].additionalAssets.length;
                    while (_.findWhere(selectedObjects[j].additionalAssets, {'name': name.toString()}) != undefined) {
                      name = name + 1;
                    }
                    additionalAsset.assetName = name.toString();
                    selectedObjects[j].additionalAssets.push(additionalAsset);
                  }
                }
              }
              break;
          }
        }
        else if (obj[prop] != null && typeof obj[prop] == "object") {
          var deepObject = [];
          for (var i = 0; i < selectedObjects.length; i++) {
            if (selectedObjects[i][prop] == null && obj[prop] != multipleValue) {
              selectedObjects[i][prop] = obj[prop];
            }
            deepObject.push(selectedObjects[i][prop])
          }
          prepareMultipleSaveData(obj[prop], deepObject, prop);
          for (var i = 0; i < selectedObjects.length; i++) {
            selectedObjects[i][prop] = deepObject[i];
          }
        }

        else if ((typeof obj[prop] == "string" && obj[prop] != multipleValue) ||
            typeof obj[prop] != "string" && obj[prop] != -1) {
          for (var i = 0; i < selectedObjects.length; i++) {
            if (selectedObjects[i]) {
              selectedObjects[i][prop] = obj[prop];
            }
          }
        }
        else if (obj[prop] == multipleValue) {
          for (var i = 0; i < selectedObjects.length; i++) {
            if (selectedObjects[i] && selectedObjects[i][prop] == multipleValue) {
              if (prop == 'type') {
                selectedObjects[i] = null;
              }
              else {
                selectedObjects[i][prop] = null;
              }
            }
          }

        }

      }
      if (type == undefined) {
        for (j = 0; j < selectedObjects.length; j++) {
          prepareAssetListForSave(selectedObjects[j].panels);
          prepareAssetListForSave(selectedObjects[j].additionalAssets);
        }
      }
      console.log('Start Selected objects: ' + JSON.stringify(selectedObjects) + 'finish Selected objects');
    }

    function prepareSaveData(obj) {
      prepareThirdPartyForSave(obj.adURLs);
      switch (obj.type) {
        case 'StandardBannerAd':
          obj.videoStartMethod = null;
        break;
        case 'ExpandableBannerAd':
          preparePanelSettingsForSave(obj);
          break;
        case 'EnhancedStandardBannerAd':
          obj.videoStartMethod = null;
          break;
        case 'RichMediaBannerAd':
          break;
        case 'TrackingPixelAd':
          break;
        case 'PushDownBanner':
          preparePanelSettingsForSave();
          break;
        case 'InStreamAd':
        case 'InStreamInteractiveAd':
          removeDurationMinusSign($scope.ad.linears);
          removeDurationMinusSign($scope.ad.companions);
          removeDurationMinusSign($scope.ad.additionalAssets);

          break;
        case 'FloatingAd':
          break;
        case 'Html5RichMediaBanner':

          break;
        case 'HTML5SingleExpandableBannerAd':
        case 'HTML5ExpandableBannerAd':
          preparePanelSettingsForSave();
          break;
        case 'SingleExpandableBannerAd':
          preparePanelSettingsForSave();
          if($scope.ad.panels && SingleExpandableBannerAdDefaultPanel) {
            $scope.ad.panels.push(SingleExpandableBannerAdDefaultPanel);
          }
      }
      if(obj.html5 ) {
        obj.html5.archiveManifest = null;
      }
    }

    function prepareThirdPartyForSave(obj) {
      if (obj) {
        for (var i = 0; i < obj.length; i++) {
          obj[i].enabled = obj[i].enabled.length > 0;
        }
      }
    }

    function prepareAssetListForSave(list) {
      if (list) {
        _.each(list, function (item) {
          if (item.asset) {
            item.assetId = item.asset.id;
            item.asset = null;
          }
        })
      }
    }

    function preparePanelSettingsForSave() {
      if ($scope.ad.panelsSettings && $scope.ad.panelsSettings.panelFrequency && $scope.ad.panelsSettings.defaultPanelFrequency == "UNLIMITED") {
        $scope.ad.panelsSettings.panelFrequency = "UNLIMITED";
      }
    }

    function removeDurationMinusSign(linears) {
      if (linears) {
        for (var i = 0; i < linears.length; i++) {
          linears[i].duration = null;
          if(linears){
            removeDurationMinusSign(linears[i].variants);
          }
        }
      }
    }

    function processError(error) {
      console.log("ERROR: " + JSON.stringify(error));
      $scope.showSPinner = false;
      fillExternalData();
      //sizeCalculation();
    }

    function adNameError(error) {
      if(error && error.data && error.data.error){
        if(error.data.error instanceof Array){
          error = error.data.error[0].errors[0];
        }
        else{
          error = error.data.error.errors[0];
        }
      }
      var errorMessage = $filter('T')(error.code.toString());
      if (error.params && error.params.length > 0) {
        errorMessage = mmUtils.utilities.replaceParams(errorMessage, error.params);
        $scope.errors.adName = errorMessage;
      }
    }

    function tempAllowAssignAfterSaveprocessData(data) {
      var returnData = data[0] ? data[0] : data;
      if ($scope.contextData.contextEntityId && $scope.contextData.contextEntityId != '') {
        $timeout(function () {
          assignAds([returnData.id], $scope.contextData.contextEntityId);
        }, 1000);
      }
      else {
        processData(data);
      }
    }

    function assignAds(adIds, campaignsToAssign) {
      if (campaignsToAssign && campaignsToAssign.length > 0) {
        adIds.unshift(campaignsToAssign);
        var attachAds = EC2Restangular.all('ads/assignMasterAd/Campaign');
        attachAds.customPOST({entities: adIds}).then(processData, processError);
      } else {
        $modalInstance.close();
      }
    }

		function processData(data) {
			var returnData =  data[0] ? data[0]: data;
			getData(returnData);
			fillExternalData();

			if($scope.isEntral == false){
				if(returnData.masterAdId){
					$state.go("spa.placementAd.adEdit", {adId:returnData.id},{location : "replace"});
				}
				else{
					$state.go("spa.ad.adEdit", {adId:returnData.id},{location : "replace"});
				}
			}

			if($scope.isEditMode){
				mmAlertService.addSuccess("Ad has been saved successfully.");
			}
			else{
				$scope.isEditMode = true;
				mmAlertService.addComplexAlert("success", [
					{
						msg: "The ad was successfully saved. You can now", linkText: "preview", func: function(){
						var url = $state.href('adPreview', {adId: returnData.id, sid: 'mdx3', mdx2: false});
						window.open(url,'_blank');}
					},
					{msg: "the ad or", linkText: "assign it to a campaign manager.", func:  assignCampaignManagerFromAlertCue}
				]);
			}

			return returnData;
		}

    function getData(data) {
      $scope.showSPinner = false;
      return $scope.$parent.mainEntity = data;
    }

    function validate() {
      initErrors();
      var isMultiple = false;

      if ($scope.selectedAds != undefined && $scope.selectedAds.length > 1) {
        isMultiple = true;
      }
      var isValid = adBlFactory.getAdBl($scope.ad.adFormat).validateBeforeSave($scope.ad, $scope.errors, $scope.isMultiple);

      if(!isValid) {
        mmAlertService.addError("Please fix errors bellow");
      }

      if ($scope.ad.overallSize && $scope.ad.overallSize.size > adService.getMaxPolitePreLoadBannerSize()) {
        isValid = false;
        $scope.toggleHandler.showToggleCreativeAssets = true;
        $scope.errors.creativeAssetsError += "The ad exceeds the size limit (1,0280 KB). Please remove some assets.";
      }

      if ($scope.ad.panels && $scope.ad.panels.length > 0 && $scope.ad.adFormat != 'SINGLE_EXPANDABLE_BANNER_AD') {
        var isFoundDefault = false;
        var uniqueAssets = _.uniq($scope.ad.panels, 'assetId');
        if (uniqueAssets.length < $scope.ad.panels.length) {
          $scope.errors.panels += "The \"Panels\" " + _.pluck(_.xor($scope.ad.panels, uniqueAssets), 'name').toString() + " contains a duplicate asset. A unique asset is required to be configured for each panel.";
          isValid = false;
          $scope.toggleHandler.showToggleCreativeAssets = true;
        }
        for (var i = 0; i < $scope.ad.panels.length; i++) {
          if (!$scope.ad.panels[i].name) {
            isValid = false;
            $scope.toggleHandler.showToggleCreativeAssets = true;
            $scope.errors.panels += "Panel Name is required";
            return;
          }

          if ($scope.ad.panels[i]) {
            //								if(_.findWhere(adService.getPanelFormatType(), {'type': $scope.ad.panels[i].mediaType.toUpperCase()}) == undefined){
//									isValid = false;
//									$scope.toggleHandler.showToggleCreativeAssets = true;
//									$scope.errors.panels += $scope.errors.panels.length > 0 ? ", ": "" +  "The panel format is not supported. Please consider replace this asset with valid 'swf' format ";
//								}
          }
          if ($scope.ad.panels[i].defaultPanel) {
            if (isFoundDefault) {
              $scope.errors.panels += $scope.errors.panels.length > 0 ? ", " : "";
              $scope.errors.panels += "It is possible to set Only one default panel";
              isValid = false;
            }
            else {
              isFoundDefault = true;
            }
          }
        }
        if (!isFoundDefault) {
          $scope.errors.panels += $scope.errors.panels.length > 0 ? ", " : "";
          $scope.errors.panels += "The panel must have default panel ";
          isValid = false;
        }
      }

      if ($scope.ad.additionalAssets) {
        for (i = 0; i < $scope.ad.additionalAssets.length; i++) {
          if (!validateAssetDuplication($scope.ad.additionalAssets[i], $scope.additionalAssetAssetsIds)) {
            $scope.errors.additionalAssets += "The \"Additional Asset \"" + $scope.ad.additionalAssets[i].assetName + " contains a duplicate asset. A unique asset is required to be configured for each additional panel.";
            isValid = false;
            $scope.toggleHandler.showToggleCreativeAssets = true;
          }
        }
      }

      if ($scope.errors.customInteractions) {
        $scope.showToggleCI = true;
      }

      //if ($scope.ad.adURLs && $scope.ad.adURLs.length > 0 && thirdPartyUrlValidationTest() > 0) {
      //  isValid = false;
      //}

      return isValid;
    }

    $scope.isDirty = function (param) {
      if ($scope.originalAd == undefined) {
        return true;
      }
      if (param == undefined) {
        return !_.isEqual($scope.ad, $scope.originalAd);
      } else {
        return !_.isEqual($scope.ad[param], $scope.originalAd[param]);
      }
    };

    function select(item, type) {
      $scope.selectedAsset = item;
      selectedCreativeType = type;
    }

    function manipulateArchive(html5Asset) {
      var manifestObj, baseUrl;

      if (!html5Asset || !html5Asset.archiveManifest) {
        return;
      }
      if (html5Asset.thumbnailUrl) {
        baseUrl = html5Asset.thumbnailUrl.substring(0, html5Asset.thumbnailUrl.lastIndexOf('/') + 1);
      }

      for (var i = 0; i < html5Asset.archiveManifest.length; i++) {
        manifestObj = html5Asset.archiveManifest[i];
        if (baseUrl) {
          manifestObj.thumbnail = baseUrl + manifestObj.path;
        }

        if (manifestObj.width && manifestObj.height) {
          manifestObj.dimensions = manifestObj.width + 'X' + manifestObj.height;
        }
        else {
          manifestObj.dimensions = '';
        }
        if (manifestObj.size) {
          manifestObj.parsedFileSize = assetsLibraryService.parseSizeFromBytes(manifestObj.size);
        }
      }
    }

    function rowDoubleCLickFromGrid(item) {
      if(item.entity.type){
        switch (item.entity.type) {
          case 'Default Image':
            select($scope.ad.defaultImage && $scope.ad.defaultImage.type != multipleValue ? $scope.ad.defaultImage : {"type": "AdAsset", "assetId": ""}, 'defaultImage');
            break;
          case 'Banner':
            select($scope.ad.banner && $scope.ad.banner.type != multipleValue ? $scope.ad.banner : {"type": "AdAsset", "assetId": ""}, 'banner');
            break;
          case 'Preload Banner':
            select($scope.ad.preloadBanner && $scope.ad.preloadBanner.type != multipleValue ? $scope.ad.preloadBanner : {"type": "AdAsset", "assetId": ""}, 'preloadBanner');
            break;
          case 'Workspace Folder':
            select($scope.ad.html5 && $scope.ad.html5.type != multipleValue ? $scope.ad.html5 : {"type": "AdAssetFolder", "assetId": ""}, 'html5');
            break;
          case 'AdditionalAsset':
            select( item.entity, 'additionalAsset');
            break;
        }
      }
      else{ // grid without type - additionalassets , panels
        if($scope.ad.additionalAssets && item.entity.name){
          item.entity.type = "AdditionalAsset";
          select( item.entity, 'additionalAsset');
        }
        else{
          select({"type": "AdditionalAsset", "assetId": ""}, 'additionalAsset');
        }
      }
      $scope.showUploadAssetModal(true, selectedCreativeType);
    }

    function openAssetPreview(item) {
      $scope.selectedAdAsset = item.entity;
      //var modalInstance =
      mmModal.open({
        templateUrl: './adManagementApp/views/assetPreviewModal.html',
        controller: 'AssetPreviewModalCtrl',
        title: "Asset Preview",
        confirmButton: { name: "ok", funcName: "ok", hide: true},
        discardButton: { name: "Close", funcName: "cancel" },
        scope: $scope
      });
    }

    /* not in the scope for now
     $scope.openAdditionalAssetPreview = function()
     {
     var modalInstance = mmModal.open({
     templateUrl: 'adManagementApp/views/assetPreviewModal.html',
     controller: 'AssetPreviewModalCtrl',
     title: "Asset Preview",
     confirmButton: { name: "ok", funcName:"ok", hide: true},
     discardButton: { name: "Close", funcName: "cancel" },
     scope: $scope
     });
     };
     */

    function removeAsset(row) {
      $scope.$root.isDirtyEntity = true;
      var assetTypeObj = _.findWhere($scope.creativeAssets.items, {'type': row.entity.type});
      if (assetTypeObj != undefined) {
        assetTypeObj.file[0].field = '';
        assetTypeObj.size = null;
        assetTypeObj.parsedFileSize = null;
        assetTypeObj.dimensions = null;
      }
      var type = enums.assetTypes.getId(row.entity.type);
      if (type === 'defaultImage') {
        $scope.ad[type] = null;
      } else {
        if (type === 'banner' && $scope.ad.adFormat === 'SINGLE_EXPANDABLE_BANNER_AD') {
          $scope.controlStatus.panelComponent = true;
        }
        if ($scope.ad[type] && $scope.ad[type].assetId) {
          spliceCustomInteractionFromAsset($scope.ad[type].assetId)
        }
        $scope.ad[type] = null;
      }
      row.entity['file'] = [
        {field: '', actionFieldType: enums.actionFieldType.getName("Text"), cssClass: ""},
        {field: 'fa fa-search', actionFieldType: enums.actionFieldType.getName("Icon"), function: rowDoubleCLickFromGrid, isImage: true, height: "16", width: "16", cssClass: "hideIcon", showControl: false},
        {field: 'button', title: 'Assign Asset', actionFieldType: enums.actionFieldType.getName("Button"), function: rowDoubleCLickFromGrid, showControl: true},
        {field: '/ignoreImages/si_close_entity_normal.png', actionFieldType: enums.actionFieldType.getName("Image"), function: removeAsset, isImage: true, height: "16", width: "16", cssClass: "hideIcon", showControl: false}
      ]
      sizeCalculation();
    }

    function addAdditionalAsset() {
      if ($scope.ad.additionalAssets && $scope.ad.additionalAssets > 100) {
        $scope.errors.additionalAssets = "Additional assets are limited to 100 assets. You have reached the limitation.";
      }
      else {
        $scope.selectedAsset = {
          type: "AdditionalAsset",
          name: "",
          assetId: "",
          checked: false
        }
        $scope.showUploadAssetModal(false, 'all');
      }
    }

    function addVariant(row) {
      if ($scope.ad.additionalAssets && $scope.ad.additionalAssets > 100) {
        $scope.errors.additionalAssets = "Additional assets are limited to 100 assets. You have reached the limitation.";
      }
      else {
        var newAdditionalAsset = {
          type: "AdditionalAsset",
          name: row.name,
          assetId: "",
          checked: false
        }
        $scope.selectedAsset = newAdditionalAsset;
        $scope.showUploadAssetModal(false, 'all');
      }
    }

    function addPanel() {
      if (!$scope.ad.panels || $scope.ad.panels.length < 5) {
        $scope.selectedAsset = {
          "type": "Panel",
          "id": "",
          "name": "",
          "assetId": "",
          "defaultPanel": false,
          "positionX": 0,
          "positionY": 0,
          "positionType": "BANNER_RELATIVE",
          "autoExpand": false,
          "delayedExpansion": false,
          "retraction": "NEVER",
          "transparent": true,
          "isNew": true,
          "autoGeneratedPanel": false
        };
        if ($scope.ad.adFormat === "HTML5_EXPANDABLE_BANNER_AD") {
          $scope.showUploadAssetModal(false, 'html5Panels');
        }
        $scope.showUploadAssetModal(false, 'banner');
      }
      else {
        mmAlertService.addError("The ad riched limit of 5 panels. Consider replace existing panels.");
      }
    }

    function removePanel() {
      removeItemFromGrid($scope.ad.panels, $scope.ad.selectedPanels);
      if ($scope.ad.adFormat === "SINGLE_EXPANDABLE_BANNER_AD" && $scope.ad.panels.length == 0) {
        $scope.controlStatus.panelsNotfound = true;
      }
    }

    function removeAdditionalAsset() {
      if($scope.ad.masterAdId && ($scope.ad.adFormat === "INSTREAM_AD" || $scope.ad.adFormat === "INSTREAM_INTERACTIVE_AD" ||$scope.ad.adFormat === "INSTREAM_ENHANCED_AD")){
        removeVariantAdditionalAsset();
      }
      else{
        removeItemFromGrid($scope.ad.additionalAssets, $scope.ad.selectedAdditionalAssets);
      }
    }

    function removeVariantAdditionalAsset() {
      var index = $scope.ad.selectedAdditionalAssets.length - 1;
      while (index >= 0) {
        if ($scope.ad.selectedAdditionalAssets[index].assetSourceId) {
          var sourceAsset = _.find($scope.ad.additionalAssets, {assetId: $scope.ad.selectedAdditionalAssets[index].assetSourceId});
          if (sourceAsset) {
            var variantToDelete = _.find(sourceAsset.variants, {assetId: $scope.ad.selectedAdditionalAssets[index].assetId});
            if (variantToDelete) {
              if (variantToDelete['transcoding'][1].field == '') {
                sourceAsset.variants.splice(sourceAsset.variants.indexOf(variantToDelete), 1);
                $scope.ad.selectedAdditionalAssets.splice(index, 1);
              }
              else {
                mmAlertService.addError("It is impossible to delete variant while transconding");
              }
            }
          }
        }
        else {
          var sourceAsset = _.find($scope.ad.additionalAssets, {assetId: $scope.ad.selectedAdditionalAssets[index].assetId});
          if (sourceAsset) {
            $scope.ad.additionalAssets.splice($scope.ad.additionalAssets.indexOf(sourceAsset), 1);
          }
        }
        index--;
      }
      removeItemFromGrid($scope.variants.additionalAssets, $scope.ad.selectedAdditionalAssets);
    }

    function sizeCalculation() {
      adBl = adBlFactory.getAdBl($scope.ad.adFormat);
      adBl.setInitialSize($scope.ad);
      adBl.setOverallAndBillingSize($scope.ad);
    }

    function addURLClicked() {
      if ($scope.ad.adURLs == undefined) {
        $scope.ad.adURLs = [];
      }
      $scope.ad.adURLs.push({"type": "ThirdPartyURL", "enabled": [0], "urlSource": "AD", "url": ""});
      adBl = adBlFactory.getAdBl($scope.ad.adFormat);
      adBl.fillEventTypes($scope.ad);
      $scope.$root.isDirtyEntity = true;
    }

    function removeUrlClicked() {
      for (var i = $scope.selectedAdURLs.length - 1; i >= 0; i--) {
        var selected = $scope.selectedAdURLs[i];
        for (var j = $scope.ad.adURLs.length - 1; j >= 0; j--) {
          var thirdParty = $scope.ad.adURLs[j];
          if (selected.id === thirdParty.id) {
            $scope.ad.adURLs.splice(j, 1);
            break;
          }
        }
        $scope.selectedAdURLs.splice(i, 1);
      }
      $scope.$root.isDirtyEntity = true;
    }

    function fillInstreamAd() {
      if (adService.getInStreamType().contains($scope.ad.adFormat)) {
        if (!$scope.ad.linears) {
          $scope.ad.linears = [];
          $scope.ad['selectedLinears'] = [];
        }
      }
      if ($scope.ad.masterAdId) {
        $scope.variants = {additionalAssets: [],
          linears: []}
        if($scope.gridColumns.inStreamCreativeAssetsLinearColumns[$scope.gridColumns.inStreamCreativeAssetsLinearColumns.length-1].field != 'transcoding'){
        $scope.gridColumns.inStreamCreativeAssetsLinearColumns.push(
            {field: 'transcoding', displayName: 'Transcoding', width: 200, isColumnEdit: false, isShowToolTip: false, isPinned: false, gridControlType: enums.gridControlType.getName("Action")});
        }
        if ($scope.ad.additionalAssets) {
          fillVariant($scope.ad.additionalAssets, $scope.variants.additionalAssets);
        }
        if ($scope.ad.linears) {
          fillVariant($scope.ad.linears, $scope.variants.linears);
        }
        $scope.transcodeStatusPicker();
      }
      else if ($scope.ad.linears) {
          for (var i = 0; i < $scope.ad.linears.length; i++) {
            fillInStreamGrid($scope.ad.linears[i], true);
        }
      }
      if ($scope.ad.linears && !$scope.ad.linearSettings) {
        $scope.ad.linearSettings = {
          "type": "LinearSettings",
          "fileDuration": 15,
          "scalable": true,
          "maintainAspectRatio": true,
          "clickThroughURL": "",
          "skipDelay": 0.0
        }
      }
      if (!$scope.ad.nonLinears) {
        $scope.ad.nonLinears = [];
        $scope.ad['selectedNonLinears'] = [];
      }
      if (!$scope.ad.companions) {
        $scope.ad.companions = [];
        $scope.ad['selectedCompanions'] = []
      }
      else {
        for (var i = 0; i < $scope.ad.companions.length; i++) {
          alignInstreamAdGridData($scope.ad.companions[i]);
        }
      }
      if (!$scope.ad.advancedCompanions) {
        $scope.ad.advancedCompanions = [];
      }
      creativeJsonObjects.setTemplateData($scope.ad);
      if($scope.ad.templateData){
        $scope.adRemaining = {value: "true"};// _.find($scope.ad.templateData.vastVariables, {'name': 'standardAdRemaining'});
      }

    }

    function fillVariant(assetsList, variantContatinerList) {
      for (var i = 0; i < assetsList.length; i++) {
        var asset = assetsList[i];
        if (asset) {
          if (asset.variants) {
            for (var j = 0; j < asset.variants.length; j++) {
              alignInstreamAdGridData(asset.variants[j]);
              asset.variants[j].assetSourceId = asset.assetId; // in order to delete the variant from the source.
              variantContatinerList.push(asset.variants[j]);
            }
          }
          else {
            alignInstreamAdGridData(asset, true);
            variantContatinerList.push(asset);
          }
        }
      }
    }

    function addInStreamLinear() {
      $scope.selectedAsset = {
        "type": "Linear",
        "id": "",
        "name": "",
        "assetId": "",
        "size": "",
        "duration": ""
      };
      if ($scope.ad.format === "INSTREAM_AD") {
        $scope.showUploadAssetModal(false, 'LinearNonVpaid');
      }
      else {
        $scope.showUploadAssetModal(false, 'Linear');
      }
    }

    function addVariantInStreamLinear() {
      $scope.selectedAsset = {
        "type": "Linear",
        "id": "",
        "name": "",
        "assetId": "",
        "size": "",
        "duration": ""
      };
      $scope.showUploadAssetModal(false, 'variantLinear');
    }

    function addInStreamNonLinear() {
      $scope.selectedAsset = {
        "type": "NonLinear",
        "id": "",
        "name": "",
        "assetId": "",
        "size": "",
        "duration": ""
      };
      $scope.showUploadAssetModal(false, 'NonLinear');
    }

    function addInStreamCompanion() {
      $scope.selectedAsset = {
        "type": "Companion",
        "id": "",
        "name": "",
        "assetId": "",
        "size": "",
        "clickthrough": ""
      };
      $scope.showUploadAssetModal(false, 'Companion');
    }

    function addInStreamAdvancedCompanion() {
      $scope.selectedAsset = {
        "type": "AdvancedCompanion",
        "id": "",
        "name": "",
        "assetId": "",
        "size": "",
        "duration": ""
      };
      $scope.showUploadAssetModal(false, 'AdvancedCompanion');
    }

    function removeInStreamLinear() {
      if ($scope.ad.selectedLinears) {
        for (var i = 0; i < $scope.ad.selectedLinears.length; i++) {
          if ($scope.ad.selectedLinears[i]['transcoding'][1] &&
              $scope.ad.selectedLinears[i]['transcoding'][1].field &&
              $scope.ad.selectedLinears[i]['transcoding'][1].field != '') {
            //$scope.deleteSources($scope.confirmDiscardChanges, $scope.cancelDiscardChanges);
            return;
          }
        }
        removeItemFromGrid($scope.ad.linears, $scope.ad.selectedLinears);
      }
    }

    function removeVariantInStreamLinear() {
      var index = $scope.variants.selectedLinears.length - 1;
      while (index >= 0) {
        if ($scope.variants.selectedLinears[index].assetSourceId) {
          var sourceAsset = _.find($scope.ad.linears, {assetId: $scope.variants.selectedLinears[index].assetSourceId});
          if (sourceAsset) {
            var variantToDelete = _.find(sourceAsset.variants, {assetId: $scope.variants.selectedLinears[index].assetId});
            if (variantToDelete) {
              if (variantToDelete['transcoding'][1].field == '') {
                sourceAsset.variants.splice(sourceAsset.variants.indexOf(variantToDelete), 1);
                $scope.variants.selectedLinears.splice(index, 1);
              }
              else {
                mmAlertService.addError("It is impossible to delete variant while transconding");
              }
            }
          }
        }
        else {
          var sourceAsset = _.find($scope.ad.linears, {assetId: $scope.variants.selectedLinears[index].assetId});
          if (sourceAsset) {
            $scope.ad.linears.splice($scope.ad.linears.indexOf(sourceAsset), 1);
          }
        }
        index--;

      }
      removeItemFromGrid($scope.variants.linears, $scope.variants.selectedLinears);
    }

    function removeInStreamNonLinear() {
    }

    function removeInStreamCompanion() {
      removeItemFromGrid($scope.ad.companions, $scope.ad.selectedCompanions);
    }

    function removeInStreamAdvancedCompanion() {
    }

    function removeItemFromGrid(originalList, selectedList) {
      $scope.$root.isDirtyEntity = true;
      if (selectedList && selectedList.length > 0) {
        var index = selectedList.length - 1;
        while (index >= 0) {
          var itemToDelete = selectedList[index];
          if (itemToDelete.assetId) {
            spliceCustomInteractionFromAsset(itemToDelete.assetId);
          }
          originalList.splice(originalList.indexOf(itemToDelete), 1);
          selectedList.splice(index, 1);
          index--;
        }
      }
      sizeCalculation();
    }

    $scope.getClickthroughUrlType = function (id) {
      return _.findWhere(enums.clickthroughURLsTypes, {'id': id});
    };

    $scope.checkAll = function (list, isChecked) {
      isChecked = !isChecked;

      _.each(list, function (item) {
        item.checked = isChecked;
      })
    };

    $scope.showUploadAssetModal = function (isSingleFileUpload, selectedCreativeType) {

      if ($scope.isModalOpen) {
        return;
      }
      $scope.isModalOpen = true;

      var adDetails = adService.getAdDetailsForUpload(isSingleFileUpload, true, selectedCreativeType, $scope.ad.adFormat, $scope.ad.campaignId);
      var modalInstance = $modal.open({
        templateUrl: './adManagementApp/views/uploadAsset.html',
        controller: 'uploadAssetCtrl',
        title: "Upload Asset",
        backdrop: 'static',
        windowClass: 'upload-newux',
        resolve: {
          adDetailsForUpload: function () {
            return adDetails;
          }
        }
      });

      modalInstance.result.then(function (returnAssets) {
        if (returnAssets) {
          $scope.errors.creativeAssetsError = "";
          $scope.$root.isDirtyEntity = true;
          $scope.assetTemplate = $scope.selectedAsset;
          if (returnAssets instanceof Array) {
            for (var i = 0; i < returnAssets.length; i++) {
              if (returnAssets.length > 1) {
                $scope.selectedAsset = jQuery.extend(true, {}, $scope.assetTemplate);
              }
              var oldAssetID = "";
              if ($scope.selectedAsset.assetId) {
                oldAssetID = $scope.selectedAsset.assetId;
              }
              switch ($scope.selectedAsset.type) {
                case "AdAsset":{
                  var adAsset = adService.createAdAssetFromAsset(returnAssets[i]);
                  if (adAsset) {
                    adAsset.dimensions = assetsLibraryService.getAssetDimension(adAsset);
                    addAssetObjectToCreativeAssetsGrid(adAsset, selectedCreativeType);
                    $scope.ad[selectedCreativeType] = adAsset;
                  }
                  if ($scope.ad.html5 && selectedCreativeType === "html5") {
                    manipulateArchive($scope.ad.html5);
                  }
                  if (selectedCreativeType === 'preloadBanner') {
                    $scope.lookups.downloadModes = _.clone(enums.downloadModes);
                    $scope.lookups.downloadModes.push({ "id": 'InstantWithoutPreLoad', "name": "Instant - skip pre-load banner"});
                  }
                  if (selectedCreativeType === 'banner' && $scope.ad.adFormat === 'SINGLE_EXPANDABLE_BANNER_AD') {
                    $scope.controlStatus.panelComponent = false;
                  }
                  var nextAssignStep = adBlFactory.getAdBl($scope.ad.adFormat).nextAssignAssetStep(selectedCreativeType);
                  if (nextAssignStep) {
                    mmAlertService.addSuccess("The asset was successfully attached to the ad. You can now", null, "assign " + nextAssignStep,
                        function () {
                          $scope.showUploadAssetModal('true', nextAssignStep)
                        });
                  }
                  else {
                    mmAlertService.addSuccess("The asset was successfully attached to the ad.");
                  }
                  break;
                }
                case "Panel":{
                  if (!$scope.ad.panels || $scope.ad.panels.length < 5) { //limit panels to 5.
                    var panel = adService.createPanelFromAsset(returnAssets[i]);
                    if (panel && $scope.selectedAsset.isNew) {
                      panel.isNew = false;
                      if (!$scope.ad.panels) {
                        $scope.ad.panels = [];
                        $scope.ad["selectedPanels"] = [];
                      }
                    }
                    if ($scope.ad.panels.length === 0 && $scope.ad.adFormat != "SINGLE_EXPANDABLE_BANNER_AD") {
                      panel.defaultPanel = true;
                    }
                    $scope.ad.panels.push(panel);
                    if ($scope.ad.adFormat == "SINGLE_EXPANDABLE_BANNER_AD") {
                      if ($scope.errors.autoExpand) {
                        $scope.errors.autoExpand = "";
                      }
                      $scope.controlStatus.panelsNotfound = false;
                    }
                    panel.iconPanel = [
                      {template: "adManagementApp/views/panelExpansion.html", function: togglePanel, showControl: true, cssClass: "overrideHide"}
                    ];
                    panel.showChild = false;
                    panel.retractionLookup = $scope.lookups.retractions;
                    panel.positionTypesLookup = $scope.lookups.positionTypes;
                  }
                  else {
                    mmAlertService.addInfo(i + " Panels added, Ad has 5 panels limitation");
                    $scope.isModalOpen = false;
                    return modalInstance;
                  }
                  break;
                }
                case "AdditionalAsset":{
                  var additionalAsset = adService.createAdAssetFromAsset(returnAssets[i], $scope.selectedAsset.type);
                  if ($scope.ad.additionalAssets === null || $scope.ad.additionalAssets === undefined) {
                    $scope.ad.additionalAssets = [];
                    $scope.ad['selectedAdditionalAssets'] = [];
                  }
                  else if ($scope.ad.additionalAssets && $scope.ad.additionalAssets.length > 99) {
                    $scope.errors.additionalAssets = "Additional asset reach the limitaion of 100 Assets.";
                  }
                  if($scope.selectedAsset.name){
                    additionalAsset.name = $scope.selectedAsset.name;
                  }
                  else{
                    additionalAsset.name = $scope.ad.additionalAssets.length + 1;
                  }
                  addAssetObjectsToGrid($scope.ad.additionalAssets, additionalAsset);
                  if($scope.ad.masterAdId &&  ($scope.ad.adFormat === "INSTREAM_AD" || $scope.ad.adFormat === "INSTREAM_INTERACTIVE_AD" ||$scope.ad.adFormat === "INSTREAM_ENHANCED_AD")){
                    addAssetObjectsToGrid($scope.variants.additionalAssets, additionalAsset);
                  }
                  $scope.additionalAssetAssetsIds.push(additionalAsset.assetId);
                  break;
                }
                case "Linear":{
                  var linear = adService.createInStreamAdFromAsset(returnAssets[i], "Linear");
                  fillInStreamGrid(linear, false);
                  if (returnAssets[i].formatContext.duration && returnAssets[i].formatContext.duration > 0) {
                    var secDuration = Math.round(returnAssets[i].formatContext.duration / 1000000);
                    if (secDuration > $scope.ad.linearSettings.fileDuration) {
                      $scope.ad.linearSettings.fileDuration = secDuration;
                    }
                  }
                  break;
                }
                case "NonLinear":{
                  var nonLinear = adService.createInStreamAdFromAsset(returnAssets[i], "NonLinear");
                  fillInStreamGrid(nonLinear, false);
                  break;
                }
                case "Companion": {
                  var companion = adService.createInStreamAdFromAsset(returnAssets[i], "Companion");
                  fillInStreamGrid(companion, false);
                  break;
                }
                case "AdvancedCompanion":{
                  var advancedCompanion = adService.createInStreamAdFromAsset(returnAssets[i], "AdvancedCompanion");
                  fillInStreamGrid(advancedCompanion, false);
                  break;
                }
              }
              if(oldAssetID){
                spliceCustomInteractionFromAsset(oldAssetID);
              }
              fillCustomInteractionFromAsset(returnAssets[i]);
              $scope.errors.creativeAssets = '';
              sizeCalculation();
            }
          }
          else { //it is folder
            var type;
            if($scope.selectedAsset.type === 'Linear'){
              type = 'LinearHtml5Folder';
            }
            adService.createFolderFromAsset(returnAssets, type).then(function (response) {
              if(!$scope.ad.html5){
                $scope.ad.html5 = {};
              }
              $scope.ad.html5.archiveManifest = response.archiveManifest;
              response.size = 0;
              for(var i=0; i < $scope.ad.html5.archiveManifest.length ; i++){
                response.size += $scope.ad.html5.archiveManifest[i].formatContext && $scope.ad.html5.archiveManifest[i].formatContext.fileSize ? $scope.ad.html5.archiveManifest[i].formatContext.fileSize : 0;
              }
              addAssetObjectToCreativeAssetsGrid(response, selectedCreativeType);
              $scope.ad[selectedCreativeType] = response;
              sizeCalculation();
            })
          }
        }
        else {
          console.log("No assets were selected or uploaded for Ad.");
        }
        $scope.isModalOpen = false;
        return modalInstance;
      }, function () {
        $scope.isModalOpen = false;
      });
    };

    function toggleclickThroughs(row, col, action) {
      adService.toggleAllExpansions(row, col, action, $scope.clickthroughs);
    }

    function togglePanel(row, col, action) {
      adService.toggleAllExpansions(row, col, action, $scope.ad.panels);
    }

    function fillCustomInteractionFromAsset(asset) {
      if (asset.swfContext && asset.swfContext.customInteractions) {
        if($scope.ad.adFormat === 'STANDARD_BANNER_AD'){
          mmAlertService.addWarning('An asset(s) with custom interactions has been detected in your standard ad which does not support custom interactions. Consider changing the ad format to an Enhanced Standard banner or a Rich-Media banner.')
        }
        _.each(asset.swfContext.customInteractions, function (item) {
          var ci = {'asset': asset.assetCode,
            'assetId': asset.id,
            'name': item.cname,
            'reportingName': item.classificationID,
            'type': item.type,
            'IncludeInInteractionRate': item.interactionSign !== "0",
            'closeAdParts': item.closeFlag !== "0",
            'redirectURL': item.jumpURL
            // TODo - fill missing  fields
            // '':item.countAsClick
          };
          if (!$scope.ad.customInteractions) {
            $scope.ad.customInteractions = [];
          }
          $scope.ad.customInteractions.push(ci);
          fillCustomInteraction(ci);
          $scope.isCiExist = true;
        })
      }
    }

    function spliceCustomInteractionFromAsset(assetId) {
      if ($scope.ad.customInteractions) {
        for (var i = 0; i < $scope.ad.customInteractions.length; i++) {
          if ($scope.ad.customInteractions[i].assetId == assetId) {
            $scope.ad.customInteractions.splice(i, 1);
            i--;
          }
        }
        fillCustomInteractions();
      }
    }

    function sendAdToQA() {
      adService.sendAdToQA($scope, [
        {ad: $scope.ad}
      ])
    }

    function assignCampaignManager(refreshAfterAssign) {
      if ($scope.isModalOpen) {
        return;
      }

      $scope.isModalOpen = true;
      var modalInstance = mmModal.open({
        templateUrl: './adManagementApp/views/attachAdToCampaignManager.html',
        controller: 'attachAdToCampaignManagerCtrl',
        title: "Assign To Campaign Manager",
        modalWidth: 600,
        bodyHeight: 450,
        confirmButton: { name: "Apply", funcName: "assign", hide: false, isPrimary: true},
        discardButton: { name: "Close", funcName: "cancel" },
        resolve: {
          ads: function () {
            return  $scope.ad ? [$scope.ad] : [data];
          },
          campaignManagers: function () {
            return EC2Restangular.all('accounts').getList();
          },

          advertisers: function () {
            return EC2Restangular.all('advertisers').getList();
          },
          multipleAttach: function () {
            return false;
          }
        }
      });

      modalInstance.result.then(function (ads) {
        $scope.isModalOpen = false;
        if (ads && ads[0]) {
          if (refreshAfterAssign) {
            $state.go($state.current, {}, {reload: true});
          }
          else {
            updateState();
          }
        }
      }, function () {
        $scope.isModalOpen = false;
      });
    }

    function assignCampaignManagerFromAlertCue() {
      return assignCampaignManager(true);
    }

    function gotoFactory() {
      adService.gotoFactory($scope.$root.loggedInUserAccountId, $scope.$root.loggedInUserId, $scope.$parent.$parent.$parent.currentLanguage, [$scope.ad]);
    }

    function assignCampaign() {
      if ($scope.isModalOpen) {
        return;
      }

      $scope.isModalOpen = true;
      var modalInstance = $modal.open({
        templateUrl: './adManagementApp/views/attachAdToCampaign.html',
        controller: 'attachAdToCampaignCtrl',
        windowClass: 'assign-campaign',
        confirmButton: { name: "Done", funcName: "save", hide: false, isPrimary: true},
        discardButton: { name: "Close", funcName: "cancel" },
        resolve: {
          ads: function () {
            return  [$scope.ad];
          },
          campaigns: function () {
            return EC2Restangular.all('campaigns').getList();
          },

          accounts: function () {
            return $scope.accounts;
          },
          multipleAttach: function () {
            return false;
          }
        }
      });

      modalInstance.result.then(function (ads) {
        $scope.isModalOpen = false;
        if (ads && ads[0]) {
          updateState();
        }
      }, function () {
        $scope.isModalOpen = false;
      });
    }

    function validateAssetDuplication(asset, IdsArray) {
      var isValid = true;
      if (asset) {
        var firstIndex = _.indexOf(IdsArray, asset.assetId);
        var lastIndex = _.lastIndexOf(IdsArray, asset.assetId);
        if (firstIndex !== lastIndex) {
          isValid = false;
        }
      }
      return isValid;
    }

    function validatePanelName(row) {
      var result =
      {
        isSuccess: true,
        message: []
      };
      if (!row.entity.name) {
        result.message.push("Name cannot be empty.");
        result.isSuccess = false;
      }
      else {
        $scope.errors.panels = "";
      }
      return result;
    }

    function validatePanelDimension(row) {
      var result =
      {
        isSuccess: true,
        message: []
      };
      if (!row.entity.dimension) {
        result.message.push("Dimension cannot be empty.");
        result.isSuccess = false;
      }
      else {
        $scope.errors.panels = "";
      }
      return result;
    }

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

    function validateThirdPartyURLType(selecteValue, row, col) {
      var result =
      {
        isSuccess: true,
        message: []
      };
      if (!row.entity || !row.entity.urlType) {
        result.message.push(col + " cannot be empty.");
        result.isSuccess = false;
      }
      else {
        $scope.errors.adURLs = "";
      }
      return result;
    }

    function panelsValidationTest() {
      panelValidationResult.fields.push({'fieldName': 'name', 'value': "", message: 'This field can not be empty.'});
    }

    function thirdPartyUrlValidationTest() {
      $scope.requireValidationThirdParty();
      return thirdPartyUrlValidationResult.fields.length;
    }

    $scope.panelValidationHandler = function () {
      return panelValidationResult;
    };

    $scope.thirdPartyUrlValidationHandler = function () {
      return thirdPartyUrlValidationResult;
    };

    $scope.creativeAssetBaseValidationHandler = function () {
      return creativeAssetBaseValidationResult;
    };

    $scope.isScalableClick = function () {
      $scope.isAspectRatioDisabled = !$scope.ad.linearSettings.scalable;
      $scope.ad.linearSettings.maintainAspectRatio = $scope.ad.linearSettings.scalable;
    };
    $scope.skipEnabledClick = function () {
      $scope.controlStatus.skipDelayDisabled = !$scope.ad.linearSettings.skipEnabled;
    };
    $scope.autoExpandClick = function () {
      $scope.errors.autoExpand = "";
      $scope.controlStatus.panelFreqency = !$scope.ad.panelsSettings.autoExpandDefaultPanel;
      if ($scope.ad.panelsSettings.defaultPanelFrequency != "UNLIMITED") {
        $scope.ad.panelsSettings.isPanelFrequencyEnabled = true;
      }
    };
    $scope.autoExpandDefaultPanel = function () {
      sizeCalculation();
    };

    $scope.requireValidationThirdParty = function () {
      //find the required columns in your column definitions
      var requiredCols = _.where($scope.gridColumns.ThirdPartyColumns, function (col) {
        return typeof col.isRequired != "undefined" && col.isRequired;
      });
      //find the empty data fields in your data and push an required error message to the cell
      for (var index = 0; index < $scope.ad.adURLs.length; index++) {
        var item = $scope.ad.adURLs[index];
        if (item) {
          for (var j = 0; j < requiredCols.length; j++) {
            var col = requiredCols[j];
            if (col.field === "urlType" && !item[col.field]) {
              thirdPartyUrlValidationResult.fields.push({'fieldName': col.field, 'value': item[col.field], message: 'Can not be empty'});
            }
            else if (!item[col.field]) {
              thirdPartyUrlValidationResult.fields.push({'fieldName': col.field, 'value': item[col.field], message: 'Enter valid URL'})
            }
          }
        }
      }
      //if there are validation results call the generic validation handler to return validation results to mm-grid
      if (thirdPartyUrlValidationResult.fields.length > 0)
        $scope.thirdPartyUrlValidationHandler();
    };

    var entityWatcher = $scope.$watch('$parent.mainEntity', function (newValue, oldValue) {
      if ((newValue != oldValue || $scope.isEntral) && (!$scope.selectedAds || $scope.selectedAds.length < 2)) {
        updateState();
      }
    });

    $scope.$on('$destroy', function () {
      $scope.ad = null;
      if (entityWatcher) entityWatcher();
      if ($scope.panelAssetsIds) {
        $scope.panelAssetsIds.length = 0
      }
      if ($scope.additionalAssetAssetsIds) {
        $scope.additionalAssetAssetsIds.length = 0
      }
      if (assets) {
        assets.length = 0
      }
      $scope.stopTranscodeStatusPicker();
    });

    $scope.onChange = function (validatorName) {
      $scope.errors[validatorName] = "";
      switch (validatorName) {
        case 'adName':
          if ($scope.ad && $scope.ad.name.length > 3) {
            var copyAd = mmRest.EC2Restangular.copy($scope.ad);
            removeDurationMinusSign(copyAd.linears);
            removeDurationMinusSign($scope.ad.companions);
            removeDurationMinusSign($scope.ad.additionalAssets);
            EC2Restangular.all('ads/validateAdNameUniqueness').post(copyAd).then(function () {
              $scope.$root.isDirtyEntity = true;
            }, adNameError);
          }
      }
    };

    $scope.adVariantStatus = function () {
      if (($scope.ad.selectedAdditionalAssets && $scope.ad.selectedAdditionalAssets.length > 0 ) ||
          ($scope.variants && $scope.variants.additionalAssets && $scope.variants.additionalAssets.length > 0)){
        $scope.gridActions.additionalAssetsGridButtonActions[1].isDisable = false;
      }
      else {
        $scope.gridActions.additionalAssetsGridButtonActions[1].isDisable = true;
      }
    }

    var transcodeStop;
    var sampleList;
    var transcodeIds;
    $scope.transcodeStatusPicker = function () {
      if (angular.isDefined(transcodeStop)) return;

      transcodeStop = $interval(function () {
        console.log('Interval TranscodeStatusPicker')
        if ($scope.ad &&
            ($scope.ad.adFormat === "INSTREAM_AD" ||
                $scope.ad.adFormat === "INSTREAM_INTERACTIVE_AD" ||
                $scope.ad.adFormat === "INSTREAM_ENHANCED_AD")) {
          if (transcodeIds && _.every(transcodeIds, {complete: 1})) { // stop if all transcode completed (success or fail)
            $scope.stopTranscodeStatusPicker();
          }
          var intervalTranscodeIds = [];
          if ($scope.tabsFocused.linears) {
            if ($scope.ad.masterAdId != '') {
              sampleList = $scope.variants.linears
            }
            else {
              sampleList = $scope.ad.linears
            }
          }
          else if ($scope.tabsFocused.additionalAssets) {
            sampleList = $scope.variants.additionalAssets
          }
          else {
            $scope.stopTranscodeStatusPicker();
          }
          if (sampleList) {
            transcodeIds = transcodeIds || [];
            for (var i = 0; i < sampleList.length; i++) {
              if (sampleList[i].transcodeJobID && !_.contains(intervalTranscodeIds, sampleList[i].transcodeJobID)) {
                var transcodeExec = EC2Restangular.one('mediaPrep/transcodeRequest', sampleList[i].transcodeJobID);
                if(!_.find(transcodeIds,{'transcodeId':sampleList[i].transcodeJobID})){
                  transcodeIds.push({transcodeId: sampleList[i].transcodeJobID, complete: 0});
                }
                intervalTranscodeIds.push(sampleList[i].transcodeJobID);
                transcodeExec.get().then(transcodeSuccess, function (error) {
                  console.log(error)
                });
              }}}}
        else {
          $scope.stopTranscodeStatusPicker();
        }
      }, 5000);
    };

    function transcodeSuccess(transcode) {
      var assets = _.filter(sampleList, 'transcodeJobID', transcode.id);
      var trancodeItem = _.find(transcodeIds, {'transcodeId': transcode.id});
      trancodeItem.complete = transcode.status === "COMPLETE" || transcode.status === "FAILED" ? 1 : 0;
      for (var i = 0; i < assets.length; i++) {
        if (trancodeItem.complete) {
          assets[i]['transcoding'][1].field = '';
        }
        else {
          assets[i]['transcoding'][1].field = transcode.overallProgress + '%';
        }
      }

    }

    $scope.stopTranscodeStatusPicker = function () {
      if (angular.isDefined(transcodeStop)) {
        $interval.cancel(transcodeStop);
        transcodeStop = undefined;
      }
    };

    $scope.adRemainingClick = function(){
      $scope.adRemaining.blooo = 1;
      //var inStreamBl = adBlFactory.getAdBl($scope.ad.adFormat);
      //inStreamBl.setVastVariableValue($scope.ad.templateData.vastVariables, 'standardAdRemaining', $scope.adRemaining.val);
    }

    $scope.deleteSources = function () {
      var deferred = $q.defer();
      var modalInstance = $modal.open({
        templateUrl: './infra/views/mmConfirmDiscardChanges.html',
        controller: 'mmConfimDiscardChangesCtrl',
        scope: $scope,
        resolve: {
          headerText: function () {
            return "Delete Source";
          },
          bodyMessage: function () {
            return "Auto transcode process is in progress. Video file variants will be removed from placements ads as well. Do you want to continue?"
          },
          ok: function () {
            return "Ok"
          },
          cancel: function () {
            return "Cancel"
          }
        }
      });
      modalInstance.result.then(function () {
        $scope.isDiscardModalOpen = false;
        removeItemFromGrid($scope.ad.linears, $scope.ad.selectedLinears);
        deferred.resolve();
      }, function () {
        $scope.isDiscardModalOpen = false;
        deferred.reject();
      });

      return deferred.promise;
    }
  }]);
