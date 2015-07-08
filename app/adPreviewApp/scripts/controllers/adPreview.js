'use strict';
app.controller('adPreviewCtrl', ['$scope', '$rootScope', '$modal', '$stateParams', '$location', 'Restangular', 'EC2Restangular', 'EC2AMSRestangular', '$filter', '$state', '$timeout',
  'mmModal', 'adService', 'configuration', 'enums', 'mmAlertService', '$sce', '$window', 'monitorService', 'adPreviewService', 'adBlFactory', 'assetsLibraryService',
  function ($scope, $rootScope, $modal, $stateParams, $location, Restangular, EC2Restangular, EC2AMSRestangular, $filter, $state, $timeout, mmModal, adService, configuration, enums, mmAlertService, $sce, $window, monitorService, adPreviewService, adBlFactory, assetsLibraryService) {

    var serverAds = EC2Restangular.all('ads');
    var serverAssets = EC2Restangular.all('assetMgmt');
    var serverTags = EC2Restangular.all('assetMgmt/metadatatags');
    var serverSearchAssets = EC2AMSRestangular.all('assetMgmt/search');
    var serverGetFolders = EC2Restangular.all('assetMgmt/folders');
    var oneMB = 1048576;
    var oneKB = 1024;
    var assets = [];
    var colorKey = $stateParams.adId + "_color";
    $scope.adId = $stateParams.adId;
    $scope.ad = {};

    $scope.isAdPreview = true;
    $scope.monitorEvents = [];
    $scope.selectedAsset = {};
    $scope.selectedInteraction = {};
    $scope.tags = [];
    $scope.defaultColor = "white";
    $scope.mdx2SessionId = $stateParams.sid;
    $scope.isMDX2 = ($stateParams.mdx2 == 'true') ? true : false;
    $scope.filteredData = [];
    $scope.showAllAdsLink = true;

    $scope.showAllAdsLink = adPreviewService.getAllAdsLinkState();

    window.scopeToShare = $scope;
    //This object is used to resolve the prototypal inheritance problems.
    $scope.adPreviewCommonModel = {
      showTagSection: false,
      url: "",
      showLoadedTab: false,
      showAllTab: true,
      isDebugClicked: true,
      previewLink: "",
      currentlySetColor: monitorService.getData("currentlySetColor") ? monitorService.getData("currentlySetColor"): $scope.defaultColor,
      searchColor: "",
      selectedBackgroundColor: $scope.defaultColor,
      previousBgColor: null,
      bgImageUrl: monitorService.getData("bgImageUrl") ? monitorService.getData("bgImageUrl"): "",
      isBackgroundImage: false,
      uploadBackground: function () {
        if (typeof this.selectedBackgroundColor != "object")
          return false;
        var color = this.selectedBackgroundColor.toHexString();
        var colors = _.pluck($scope.colors, 'color');
        var index = colors.indexOf(color);

        if (index <= -1) {
          $scope.colors.push(getColorObj(color));
          for ( var i = 0; i < $scope.colors.length; i++ ) {
            if ( $scope.colors[i].color == color )
              $scope.colors[i].isSelected = true;
            else
              $scope.colors[i].isSelected = false;
          }
          monitorService.setData(colorKey, $scope.colors);
        }
        else {
          colors.splice(index, 1);
        }
      },
      applyBackground: function () {

        if ( $scope.adPreviewCommonModel.bgImageUrl.length > 0 )
          this.isBackgroundImage = true;
        else
          this.isBackgroundImage = false;
        this.previousBgColor = this.currentlySetColor;
        this.currentlySetColor = this.selectedBackgroundColor;
        monitorService.setData("currentlySetColor", this.currentlySetColor);
      },
      enableDrag: false,
      searchTag: "",
      showButtons: false,
      showFilters: false,
      showAssetTabs: false,
      filteredAssets: [],
      showTestSiteDialog: false,
      showShareItemDialog: false,
      showBackgroundColorDialog: false,
      showApplyBackgroundColorDialog: false
    };

    $scope.$watch("adPreviewCommonModel.selectedBackgroundColor", function (nv, ov) {
      if (typeof nv != "undefined") {
        $scope.adPreviewCommonModel.uploadBackground();
      }
    });

    $scope.searchFilters = [
      {name: "All", isSelected: true},
      {name: "InteractionName", isSelected: false},
      {name: "AdPart", isSelected: false},
      {name: "Parameters", isSelected: false}
    ];
    console.log($location.search());
    var defaultColors = ["white", "black", "grey", "transparent"];
    var storedNonImageBackgrounds = _.reject(monitorService.getData("colors"), function(col) {
      return col.isEditable && col.isImage;
    });
    $scope.colors = storedNonImageBackgrounds ? storedNonImageBackgrounds : [];

    //for upload background images
    $scope.foldersData = [];
    $scope.data = [];

    $scope.openDefaultAccordion = function () {
      $('.tileContainer').toggleClass('slide-left');
      $scope.adPreviewCommonModel.isDebugClicked = !$scope.adPreviewCommonModel.isDebugClicked;
    };

    var getColorObj = function (color) {
      var obj = {
        color: color,
        isSelected: false,
        isImage: false,
        title: color,
        isEditable: false,
        isEditMode: false,
        imgUrl: "",
        toggle: function () {
          obj.isSelected = !obj.isSelected;
          if (obj.isSelected)
            obj.unSelectOthers();
        },
        unSelectOthers: function () {
          for( var k = 0; k < $scope.colors.length; k++ ) {
            if ($scope.colors[k].color != obj.color) {
              $scope.colors[k].isSelected = false;
            }
          }
        }
      }

      if ( defaultColors.indexOf(color) == -1 ) {
        obj.isEditable = true;
        obj.isEdiMode = true;
      }
      return obj;
    };

    if ( !monitorService.getData("colors") ) {
      for( var k = 0; k < defaultColors.length; k++ ) {
        if ( defaultColors[k] == "transparent" ) {
          defaultColors[k] = "url('/ignoreImages/transparent.png') repeat";
          var colorObject = getColorObj(defaultColors[k]);
          colorObject.title = "transparent";
          colorObject.isImage = true;
          colorObject.imgUrl = "./images/transparent.jpeg";
        } else {
          var colorObject = getColorObj(defaultColors[k]);
        }
        if ( k == 0 )
          colorObject.isSelected = true;
        $scope.colors.push(colorObject);

      }
      monitorService.setData("colors", $scope.colors);
    }



    if (!$scope.isMDX2) addBackgroundImagesToColors();

   /* var mockMDX2Ads = adPreviewService.fetchMockAds();
    var mockTags = adPreviewService.fetchMockTags();
    var mockAssetObj = adPreviewService.fetchMockAsset();

    var mockAd = {"itemType": 0, "id": "22805056", "name": "EnterpriseIT970x90", "metadataTags": [
      {"type": "APIMetadataTag", "id": "HRA0HU", "tagType": "SYSTEM", "name": "Sys Tag 2", "color": "blue"}
    ], "width": 970, "height": 90, "defaultImage": "https://secure-ds.serving-sys.com/BurstingRes/Site-845/Thumbnails/thumb_59179a96-cd88-441b-afe9-e4181c101d7b.jpeg", "displayTag": "<script type='text/javascript' src='http://bs.preview.serving-sys.com/BurstingPipe/adServer.bs?cn=rsb&amp;c=28&amp;pli=&amp;PluID=0&amp;pr=1&amp;ai=22805056&amp;w=970&amp;h=90&amp;ord=&amp;p=&amp;npu=$$$$&amp;ncu=$$$$'></script>", "additionalMetadata": {"adType": "PoliteBanner", "size": "135"}};
*/
    $scope.divHeight = $(window).height() - 150;

    function fetchAd() {

        var getAds;
        var postBody;
        if ($scope.adId != undefined) {
          if (!$scope.isMDX2) {
            getAds = EC2Restangular.all('assetMgmt/previewshares/adsByAdIds/' + $scope.mdx2SessionId + '/' + $scope.isMDX2);
            postBody = $scope.adId;
          }
          else {
            getAds = EC2AMSRestangular.all('mdx2AdsByAdIds/');
            var adIds = [];
            adIds.push($scope.adId);
            postBody = {AdsIDs: adIds};
          }
        }
        $scope.adWidth = "";
        $scope.adHeight = "";
        $scope.adDefaultImage = "";
        if (!$scope.isMDX2) {
          serverAds.one($scope.adId).get().then(function (result) {
            if (result.adFormat != "INSTREAM_AD" && result.adFormat != "INSTREAM_INTERACTIVE_AD" && result.adFormat != "INSTREAM_AD" && result.adFormat != "INSTREAM_ENHANCED_AD") {
              $scope.adWidth = result.width ? result.width: result.defaultImage.width; //result.defaultImage.width;
              $scope.adHeight = result.height ? result.height : result.defaultImage.height; //result.defaultImage.height;
              $scope.adDefaultImage = result.defaultImage.thumbnailUrl;
            }
            else {
              $scope.adWidth = result.linears[0].width;
              $scope.adHeight = result.linears[0].height;
              $scope.adDefaultImage = result.linears[0].thumbnailUrl;
              serverAssets.get(result.linears[0].assetId).then(function (asset) {
                if (asset && asset.thumbnails && asset.thumbnails.length > 0) {
                  $scope.adDefaultImage = asset.thumbnails[0].url;
                }

                $scope.showSpinner = false;
              }, function (error) {
                processError(error);
              });
            }
            $scope.serverAd = result;
            getAds.customPOST(postBody).then(function (result) {
              $scope.ad = result;
              attachTagsToAd();
              convertPreviewItemsToAdModel(result);
              attachCustomPropertiesToAdObject();
              getCanvasMargins();
              $scope.showSpinner = false;
            }, function (error) {
              processError(error);
            });
          }, function (error) {
            processError(error);
          });
        }
        else {
          var mdx2Headers = { 'Content-Type': 'application/json; charset=utf-8', SessionID: $scope.mdx2SessionId };
          getAds.post(postBody, {}, mdx2Headers).then(function (result) {
            if (result.ResponseStatus != 1) {
              processError("An error occurred retrieving your ad. Please try again later.");
              return false;
            }
            $scope.ad = result;
            convertMDX2AdsResponseToAdModel(result);
          }, function (error) {
            processError(error);
          });
        }

    };

    fetchAd();

    function convertMDX2AdsResponseToAdModel(response) {
      var items = response.AdsInfoList;
      for (var i = 0; i < items.length; i++) {
        var model = {
          type: items[i].AdType,
          id: items[i].AdId,
          name: items[i].AdName,
          adFormat: items[i].AdType,
          size: items[i].AdSizeInBytes,
          pricingSize: items[i].AdSizeInBytes,
          overallSize: items[i].AdSizeInBytes,
          initialSize: items[i].AdSizeInBytes,
          clickthrough: "",
          masterAdId: items[i].AdId,
          segment: "",
          defaultImage: {
            asset: {
              dimensions: "",
              url: ""
            }
          },
          displayTag: items[i].AdTag,
          tags: [],
          width: 0,
          height: 0,
          flashVersion: "",
          asVersion: ""
        }
        //set dimensions
        if (model.displayTag.indexOf("width=") > 0 && model.displayTag.indexOf("height=") > 0) {
          var width = model.displayTag.substring(model.displayTag.indexOf("width=") + 6);
          width = width.substring(0, width.indexOf(" "));
          var height = model.displayTag.substring(model.displayTag.indexOf("height=") + 7);
          height = height.substring(0, height.indexOf(">"));
          model.defaultImage.asset.dimensions = width + "X" + height;
          model.width = width;
          model.height = height;
        }
        //set default image
        if (model.displayTag.indexOf("<img src=\"") > 0) {
          var defaultImg = model.displayTag.substring(model.displayTag.indexOf("<img src=\"") + 10);
          defaultImg = defaultImg.substring(0, defaultImg.indexOf("\""));
          model.defaultImage.asset.url = defaultImg;
        }

        if (model.displayTag.substring(0, 4) == 'http') { //instream, extract props from vast
          var finalTagUrl = model.displayTag;
          if (window.location.protocol == 'https:') finalTagUrl = finalTagUrl.replace('http', 'https');
          var getTagCode = Restangular.oneUrl('routeName', finalTagUrl);
          getTagCode.get().then(function (result) {
            var rAdId = result.substring(result.indexOf("AdID=\"") + 6);
            rAdId = rAdId.substring(0, rAdId.indexOf("\""));
            var rDefaultImg = result.substring(result.indexOf("=\"image/"));
            rDefaultImg = rDefaultImg.substring(rDefaultImg.indexOf("CDATA") + 6);
            rDefaultImg = rDefaultImg.substring(0, rDefaultImg.indexOf("]"));
            var rHeight = result.substring(result.indexOf("height=\"") + 8);
            rHeight = rHeight.substring(0, rHeight.indexOf("\""));
            var rWidth = result.substring(result.indexOf("width=\"") + 7);
            rWidth = rWidth.substring(0, rWidth.indexOf("\""));

            if (rDefaultImg.substring(0, 4) == 'http') {
              model.defaultImage.asset.url = rDefaultImg;
              model.image = rDefaultImg;
            }
            model.defaultImage.asset.dimensions = rWidth + "X" + rHeight;
            model.dimension = rWidth + "X" + rHeight;
            model.imageHeight = rHeight;
            model.height = rHeight;
            model.imageWidth = rWidth;
            model.width = rWidth;
            model.displayTag = "/player/views/instream-player.html?preroll=" + encodeURIComponent(model.displayTag) + "&midroll=&postroll=&overlay=&player-type=as3&width=" + rWidth + "&height=" + rHeight + "&controls=below&auto-start=false&script-access=always&wmode=opaque";
			      $scope.ad = model;
            attachCustomPropertiesToAdObject();
            getCanvasMargins();
            $scope.showSpinner = false;
          }, function (error) {
            processError(error);
          });
        }
        else if (model.displayTag.replace(/^\s+|\s+$/g, '').substring(0, 4) == '<scr') { //not instream, fix ad tag script
          //var scriptUrl = model.displayTag.replace(/^\s+|\s+$/g, '').replace("<script src=\"","").split("\"></script>");
          //var finalScriptUrl = scriptUrl[0];
          var finalScriptUrl = model.displayTag;
          if (window.location.protocol == 'https:') finalScriptUrl = finalScriptUrl.replace('http', 'https');
          model.displayTag = "/csbPreviewApp/views/adLoader.html?" + finalScriptUrl.split('script').join('scr||ipt');
 		      $scope.ad = model;
          attachCustomPropertiesToAdObject();
          getCanvasMargins();
        }
      }
    }

    function convertPreviewItemsToAdModel(items) {
      for (var i = 0; i < items.length; i++) {
        if (!$scope.isMDX2) {
          items[i].width = $scope.adWidth;
          items[i].height = $scope.adHeight;
          items[i].defaultImage = $scope.adDefaultImage;
          /*if (items[i].additionalMetadata.adType != "InStreamAd")
            items[i].displayTag = "<script src='http://" + items[i].displayTag.split("[WIDTH]").join(items[i].width).split("[HEIGHT]").join(items[i].height) + "'></script>";
          else*/ items[i].displayTag = '';
        }
        var model = {
          type: items[i].additionalMetadata.adType,
          id: items[i].id,
          name: items[i].name,
          adFormatStore: $scope.serverAd.adFormat,
          adFormat: items[i].additionalMetadata.adType,
          size: items[i].additionalMetadata.size,
          clickthrough: items[i].additionalMetadata.clickThrough,
          masterAdId: items[i].additionalMetadata.masterAdId,
          segment: items[i].additionalMetadata.segment,
          defaultImage: {
            asset: {
              dimensions: items[i].width + "X" + items[i].height,
              url: items[i].defaultImage
            }
          },
          displayTag: items[i].displayTag,
          tags: [],
          additionalMetadata: items[i].additionalMetadata,
          width: items[i].width,
          height: items[i].height,
          pricingSize: adPreviewService.parseSizeFromBytes($scope.serverAd.pricingSize),
          overallSize: adPreviewService.parseSizeFromBytes($scope.serverAd.overallSize),
          initialSize: adPreviewService.parseSizeFromBytes($scope.serverAd.initialSize),
          accountId: $scope.serverAd.accountId,
          accountName: $scope.serverAd.accountName,
          campaignId: $scope.serverAd.campaignId != undefined ? $scope.serverAd.campaignId : '',
          campaignName: $scope.serverAd.adAssignmentData.campaignName != '' ? $scope.serverAd.adAssignmentData.campaignName : 'Unassigned',
          advertiserName: $scope.serverAd.adAssignmentData.advertiserName != '' ? $scope.serverAd.adAssignmentData.advertiserName : 'Unassigned',
          placementName: $scope.serverAd.placementName != undefined ? $scope.serverAd.placementName : '',
          flashVersion: $scope.serverAd.minFlashVersion != undefined ? $scope.serverAd.minFlashVersion : '',
          asVersion: $scope.serverAd.asVersion != undefined ? $scope.serverAd.asVersion : '',
          status: $scope.serverAd.adStatus != undefined ? $scope.serverAd.adStatus : ''
        }
        if (items[i].metadataTags != undefined) {
          for (var j = 0; j < items[i].metadataTags.length; j++) {
            var tag = {
              id: items[i].metadataTags[j].id,
              tagName: items[i].metadataTags[j].name,
              tagColor: items[i].metadataTags[j].color,
              toolTip: items[i].metadataTags[j].name,
              isColorTag: false,
              isClicked: false,
              isSelected: false,
              clearOrHighlightTags: function (items) {
                this.isClicked = !this.isClicked;
                console.log("clicked", this.isClicked);
                $scope.searchCriteria.search = this.isClicked ? this.tagName : '';
              },
              toggleClick: function () {
                this.isClicked = !this.isClicked;
              }
            }
            model.tags.push(tag);
          }
        }
        $scope.ad = model;

        var postBody = [];
        postBody.push($scope.ad.id)
        var getDisplayTag = EC2Restangular.all('ads/previewTag/');
        getDisplayTag.post(postBody).then(function (result) {
          $scope.ad.displayTag = result[0].scriptTag;
          if (result[0].scriptTag.length > 0){
            var finalScriptUrl = $scope.ad.displayTag;
            if (window.location.protocol == 'https:' && finalScriptUrl.indexOf("https") < 0) finalScriptUrl = finalScriptUrl.replace('http', 'https');
            $scope.ad.displayTag = "/csbPreviewApp/views/adLoader.html?" + finalScriptUrl.split('script').join('scr||ipt');
          }
          else { //in-stream
            $scope.ad.displayTag = $sce.trustAsResourceUrl("/player/views/instream-player.html?preroll=" + encodeURIComponent(result[0].noScriptTag) + "&midroll=&postroll=&overlay=&player-type=as3&width=" + $scope.ad.width + "&height=" + $scope.ad.height + "&controls=below&auto-start=false&script-access=always&wmode=opaque");
          }
        }, function (error) {
          processError(error);
        });
      }
    }

    $scope.loadAssetDetails = function (asset) {
      $scope.selectedAsset = asset;
    };

    $scope.loadInteractionDetails = function (interaction) {
      $scope.selectedInteraction = interaction;

    };

    function attachCustomPropertiesToAdObject() {
      try {
        var additionalAdProperties = new additionalAdProp();
        _.extend(true, $scope.ad, additionalAdProperties);
      }
      catch (error) {
        console.log("Error : attachCustomPropertiesToAdObject : ", error);
      }
    }

    function additionalAdProp() {
      try {

          $scope.ad.image = $scope.ad.defaultImage.asset.url;
          $scope.ad.adType = $scope.ad.adFormatStore ? enums.adFormats.getName($scope.ad.adFormatStore) : $scope.ad.adFormat;
          if ($scope.ad.additionalMetadata == undefined) $scope.ad.additionalMetadata = {};
          $scope.ad.additionalMetadata.size = adPreviewService.parseSizeFromBytes($scope.ad.additionalMetadata.size ? $scope.ad.additionalMetadata.size : $scope.ad.size);
          $scope.ad.dimension = $scope.ad.defaultImage.asset.dimensions;
          $scope.ad.imageHeight = $scope.ad.height;
          $scope.ad.imageWidth = $scope.ad.width;

          if (!$scope.isMDX2) {
            $scope.ad.placement = $scope.ad.placement ? enums.placementStatuses.getName($scope.ad.placement.id) : '';
            $scope.ad.defaultImage = {
              asset: {
                dimensions: $scope.ad.width + "X" + $scope.ad.height,
                url: $scope.ad.defaultImage
              }
            };
            var assetIds = [];
            if ($scope.serverAd.defaultImage != undefined) assetIds.push($scope.serverAd.defaultImage.assetId);
            if ($scope.serverAd.banner != undefined) assetIds.push($scope.serverAd.banner.assetId);
            if ($scope.serverAd.preloadBanner != undefined) assetIds.push($scope.serverAd.preloadBanner.assetId);
            if ($scope.serverAd.html5 != undefined) assetIds.push($scope.serverAd.html5.assetId);
            if ($scope.serverAd.linears != undefined) {
              for (var i = 0; i < $scope.serverAd.linears.length; i++) {
                assetIds.push($scope.serverAd.linears[i].assetId);
              }
            }
            if ($scope.serverAd.companions != undefined) {
              for (var i = 0; i < $scope.serverAd.companions.length; i++) {
                assetIds.push($scope.serverAd.companions.assetId);
              }
            }

            if ($scope.serverAd.additionalAssets != undefined) {
              for (var i = 0; i < $scope.serverAd.additionalAssets.length; i++) {
                assetIds.push($scope.serverAd.additionalAssets[i].assetId);
              }
            }
            for (var i = 0; i < assetIds.length; i++) {
              serverAssets.get(assetIds[i]).then(function (asset) {
                asset.size = adPreviewService.parseSizeFromBytes(asset.formatContext.fileSize);
                asset.dimension = asset.width + "X" + asset.height;
                if (!_.has($scope.ad, 'additionalAssets'))
                  $scope.ad.additionalAssets = [];
                $scope.ad.additionalAssets.push(asset);
              }, function (error) {
                processError(error);
              });
            }
          }

      }
      catch (error) {
        console.log("Error : additionalAdProp : ", error);
      }
    };

    function getCanvasMargins() {
      var divWidth = getContainerWidth();
      $scope.marginLeft = (divWidth - $scope.ad.width) / 2 + "px";
      $scope.marginTop = 0 - ($scope.ad.height / 2) + "px";
    }

    function processError(error) {
      $scope.showSpinner = false;
      if (error.data == undefined || error.data.error == undefined) {
        mmAlertService.addError(error);
      } else {
        mmAlertService.addError(error.data.error);
      }
    }

    function attachTagsToAd() {
      if ($scope.ad.metadataTags != undefined) {
        for (var j = 0; j < $scope.ad.metadataTags.length; j++) {
          var tag = {
            id: $scope.ad.metadataTags[j].id,
            tagName: $scope.ad.metadataTags[j].name,
            tagColor: $scope.ad.metadataTags[j].color,
            toolTip: $scope.ad.metadataTags[j].name,
            isColorTag: false,
            isClicked: false,
            isSelected: false,
            clearOrHighlightTags: function (items) {
              this.isClicked = !this.isClicked;
              $scope.searchCriteria.search = this.isClicked ? this.tagName : '';
            },
            toggleClick: function () {
              this.isClicked = !this.isClicked;
            }
          }
          if (typeof $scope.ad.tags == "undefined")
            $scope.ad.tags = [];
          $scope.ad.tags.push(tag);
        }
      }
    };

    $scope.renderAdForPlay = function () {
      if ($scope.ad != null && $scope.ad != undefined)
        return $sce.trustAsHtml($scope.ad.displayTag);
    };

    $scope.redirectToAllAds = function () {
      var storeCSBPreviewAdIds = adPreviewService.getStoredAdIds();
      var storeCSBPreviewViewBy = adPreviewService.getStoredViewBy();
      //window.location.href = "/#/preview/"+storeCSBPreviewViewBy+"?adids=" + storeCSBPreviewAdIds;
      window.location.href = "/#/preview/"+storeCSBPreviewViewBy;
    };

    $scope.emailAddress = "sizmek@example.com";
    $scope.emailSubject = "sharing url";

    $scope.sendEmail = function () {
      window.location.href = 'mailto:' + $scope.emailAddress + '?subject=' + $scope.emailSubject + '&body=' + emailBody() + '';
    };

    function emailBody() {
      var newLine = '%0D%0A';
      var firstLine = '';
      var body = '';
      var shareCount = 1;
      body = body + 'Name: ' + $scope.ad.name + newLine + 'ID: ' + $scope.ad.id + newLine + 'Size: ' + $scope.ad.size + newLine + 'Type: ' + $scope.ad.type + newLine;
      if ($scope.ad.tags != undefined && $scope.ad.tags.length > 0) {
        body = body + '*' + newLine;
        for (var i = 0; i < $scope.ad.tags.length; i++) {
          body = body + $scope.ad.tags[i].tagName + newLine;
        }
      }
      body = body + '-------------' + newLine;
      firstLine = 'Sharing ' + shareCount + ' ad(s): ' + $rootScope.previewLink;
      return encodeURIComponent(firstLine) + newLine + newLine + body;
    };

    function getTag(serverTag) {
      var tag = {
        id: serverTag.id,
        tagName: serverTag.name,
        tagColor: serverTag.color,
        toolTip: serverTag.name,
        isColorTag: true,
        isClicked: false,
        isSelected: false,
        clearOrHighlightTags: function (items) {
          this.isClicked = !this.isClicked;
          $scope.searchCriteria.search = this.isClicked ? this.tagName : '';
        },
        toggleClick: function () {
          tag.isClicked = !tag.isClicked;
        }
      };
      return tag;
    };


    $scope.clearUrlField = function () {
      $scope.adPreviewCommonModel.url = "";
      angular.element(".backstretch").remove();
    };

    var elementContainer = ".tileContainer";
    $scope.downloadBackgroundUrlContent = function () {
      angular.element(".backstretch").remove();
      if (!$scope.adPreviewCommonModel.url.match(/^http([s]?):\/\/.*/)) {
        $scope.adPreviewCommonModel.url = "http://" + $scope.adPreviewCommonModel.url;
      }
      $(elementContainer).backstretch([
        $scope.adPreviewCommonModel.url
      ], {
        isImage: false
      });
      $timeout(function () {
        $(".backstretch").css("z-index", "0");
        $scope.adjustSidebarHeight();
      }, 5000);
    };
    $scope.clearBackgroundUrlContent = function () {
      angular.element(".backstretch").remove();
      $scope.adPreviewCommonModel.url = "";
      $scope.adPreviewCommonModel.showTestSiteDialog = false;
    };

    var win;
    var isOpen = false;
    $scope.openSeparateWindow = function () {
      if (!isOpen) {
        win = $window.open('#/adDetails/' + $scope.adId + "/" + true, "MsgWindow", "width=1000, height=480");
        $scope.adPreviewCommonModel.isDebugClicked = false;
        $('.tileContainer').toggleClass('slide-left');
      } else {
        win.close();
      }
      isOpen = !isOpen;
    };

    $scope.test = function () {
    }
    var storedTime = new Date();
    $scope.$watch('monitorEvents', function () {
      var patt = new RegExp("automatic");
      for( var k = 0; k < $scope.monitorEvents.length; k++ ) {
        $scope.monitorEvents[k].user = false;   //user
        if (typeof  $scope.monitorEvents[k].time == "undefined" || $scope.monitorEvents[k].time == "") {
          var relativeTime = Math.abs(storedTime - new Date());
          $scope.monitorEvents[k].time = $filter('date')(adPreviewService.milliSecondsToTime(relativeTime), "hh:mm:ss");
        }
        if (typeof  $scope.monitorEvents[k].action == "undefined" || $scope.monitorEvents[k].action == "") {
          $scope.monitorEvents[k].user = patt.test($scope.monitorEvents[k].action);   //automatic
        }
      }
      storeInLocalStorage();
      applyFilters();
      if ($scope.monitorEvents.length == 1) {
        $scope.selectedInteraction = $scope.filteredData[0];      //init im details section
      }
    }, true);

    var keyInitials = "ad-events";

    function storeInLocalStorage() {
      if (typeof $scope.monitorEvents != "undefined") {
        var sharedData = [];
        for( var k = 0; k < $scope.monitorEvents.length; k++ ) {
          var d = {
            command: $scope.monitorEvents[k].command,
            action: $scope.monitorEvents[k].action,
            part: $scope.monitorEvents[k].part,
            args: $scope.monitorEvents[k].args,
            time: $scope.monitorEvents[k].time,
            adName: $scope.ad.name,
            number: $scope.monitorEvents[k].number,
            user: $scope.monitorEvents[k].user
          }
          sharedData.push(d);
          $scope.filteredData.push(d);
        }
        monitorService.setData(keyInitials + $scope.adId, sharedData);
      }
    };

    $scope.searchCriteria = {searchText: '', searchAsset: ''};

    $scope.selectedFilter = "All";

    $scope.setSearchFilter = function (filter) {
      clearAllActions(filter);
      filter.isSelected = !filter.isSelected;
      $scope.selectedFilter = filter.name;
      applyFilters();
    };

    var getFilteredProperty = function () {
      switch ($scope.selectedFilter) {
        case "All":
          return "undefined";
        case "InteractionName":
          return "action";
        case "AdPart":
          return "part";
        case "Parameters":
          return "args";
      }
    };

    $scope.$watch("searchCriteria.searchText", function (newVal, oldVal) {
      applyFilters();
    }, true);

    function clearAllActions(filter) {
      var actions = [];
      var isNull = _.isNull(filter);
      if (!isNull) {
        actions = _.where($scope.searchFilters, function (act) {
          return act.name != filter.name;
        })
      }
      else {
        actions = $scope.searchFilters;
      }
      for( var k = 0; k < actions.length; k++ ) {
        actions[k].isSelected = false;
      }

      if (isNull) {
        var act = _.find(actions, function (ac) {
          return ac.name.toLowerCase() == "all";
        });
        if (act) {
          act.isSelected = true;
        }
      }
    };

    function applyFilters() {
      var predicate = {};
      var prop = getFilteredProperty();
      predicate[prop] = $scope.searchCriteria.searchText;
      var parsedEvents = [];
      for( var k = 0; k < $scope.monitorEvents.length; k++ ) {
        var d = {
          command: $scope.monitorEvents[k].command,
          action: $scope.monitorEvents[k].action,
          part: $scope.monitorEvents[k].part,
          args: $scope.monitorEvents[k].args,
          time: $scope.monitorEvents[k].time,
          number: $scope.monitorEvents[k].number,
          user: $scope.monitorEvents[k].user
        }
        parsedEvents.push(d);
      }
      var data = $filter("genericSearchFilter")(parsedEvents, predicate, false);
      $scope.filteredData = angular.copy(data);
      if (!$scope.$$phase)
        $scope.$apply();
    };

    $scope.$on("syncMonitorData", function () {
      var sharedData = monitorService.getData(keyInitials + $scope.adId);
      if (sharedData == null)
        $scope.clearInteractions();
    });

    $scope.redirectToSingleAssetView = function () {
      adPreviewService.putDisplayTag($scope.ad.displayTag);
      $state.go('assetPreview', {adId: $scope.adId, sid: $stateParams.sid, mdx2: $stateParams.mdx2, assetId: $scope.selectedAsset.assetId});
    };

    $scope.loadAsset = function (isPrev) {
      var asset = null;
      var ind = 0;
      if ($scope.selectedAsset) {
        var index = _.findIndex($scope.adPreviewCommonModel.filteredAssets, function (d) {
          return $scope.selectedAsset.id == d.id;
        });
        console.log("index", index);
        if (index > -1) {
          ind = isPrev ? index - 1 : index + 1;
        }
        if (ind < 0)
          ind = 0;
      }
      asset = findByIndex.call($scope.adPreviewCommonModel.filteredAssets, ind);
      if (asset != null) {
        $scope.selectedAsset = asset;
      }
    };

    $scope.loadIM = function (isPrev) {
      var im = null;
      var ind = 0;
      if ($scope.selectedInteraction) {
        var index = _.findIndex($scope.filteredData, function (d) {
          return $scope.selectedInteraction.number == d.number;
        });
        console.log("index", index);
        if (index > -1) {
          ind = isPrev ? index - 1 : index + 1;
        }
        if (ind < 0)
          ind = 0;
      }
      im = findByIndex.call($scope.filteredData, ind);
      if (im != null) {
        $scope.selectedInteraction = im;
      }
    };

    var findByIndex = function (index) {
      var obj = null;
      if (index > -1) {
        for (var i = 0; i < this.length; i++) {
          if (i == index) {
            obj = this[i];
            break;
          }
        }
      }
      return obj;
    };

    $scope.getTextToCopy = function () {
      return $scope.adPreviewCommonModel.previewLink;
    }


    function getContainerWidth() {
      return _.parseInt($(window).width());
    }

    function getContainerHeight() {
      return _.parseInt($(document).height()) - 36;
    }

    $scope.containerHeight = getContainerHeight();
    $(window).resize(function () {
      $scope.containerHeight = getContainerHeight();
      $scope.adjustSidebarHeight();
      console.info("$scope.containerHeight", $scope.containerHeight);
      if (!$scope.$$phase)
        $scope.$apply();
    });

    function findElements(width, height, element) {
      console.log("element", element);
      console.log("width height", width, height);
      var results = [];
      var items = $(element).children();
      console.log("items : ", items);
      var length = items.length;
      for (var i = 0; i < length; i++) {
        var childElement = items[i];
        if (childElement.offsetWidth >= width && childElement.offsetHeight >= height) {
          results.push(childElement);
          results = results.concat(findElements(width, height, childElement));
        }
      }
      return results;
    }


    function fetchTags() {
      $scope.showSpinner = false;
      serverTags.getList(filter).then(function (result) {
        $scope.tags = result;
        $scope.showSpinner = false;
        prepareSytemTags();
      }, function (error) {
        //on error load dummy tags.
        /*$scope.tags = mockTags;
        prepareSytemTags();*/
        processError(error);
      });
    }

    function prepareSytemTags() {
      for (var index = 0; index < $scope.tags.length; index++) {
        $scope.systemTags.push(getTag($scope.tags[index]));
      }
    };

    $scope.showGeneralSection = true;
    $scope.showInteractionMonitor = false;
    $scope.showAsset = false;

    $scope.sectionType = {general: 1, interactionMonitor: 2, asset: 3};

    $scope.manageSideBar = function (sectionType, value) {
      switch (sectionType) {
        case 1:
          $scope.showGeneralSection = !value;
          if ($scope.showGeneralSection) {
            $scope.showInteractionMonitor = false;
            $scope.showAsset = false;
          }
          break;
        case 2:
          $scope.showInteractionMonitor = !value;
          if ($scope.showInteractionMonitor) {
            $scope.showGeneralSection = false;
            $scope.showAsset = false;
          }
          break;
        case 3:
          $scope.showAsset = !value;
          if ($scope.showAsset) {

            if ( $scope.adPreviewCommonModel.filteredAssets.length > 0 ) {
              $scope.selectedAsset = $scope.adPreviewCommonModel.filteredAssets[0];
            }
            $scope.showGeneralSection = false;
            $scope.showInteractionMonitor = false;
          }
          break;
      }

      if (!$scope.$$phase)
        $scope.$apply();
    };

    $scope.getFileTypeIcon = function (asset) {
      //var type = asset.mediaType.toLowerCase();
      return assetsLibraryService.getFileTypeIcon(asset.mediaType);
    };

    $scope.clearInteractions = function () {
      $scope.monitorEvents = [];
      storedTime = new Date();
    };

    $scope.maxTagOnHeader = 2;

    function getAdditionalAssetDetails() {
      if ($scope.ad.additionalAssets && $scope.ad.additionalAssets.length > 0) {
        for (var i = 0; i < $scope.ad.additionalAssets.length; i++) {
          if ($scope.ad.additionalAssets[i] != undefined) {
            serverAssets.get($scope.ad.additionalAssets[i].assetId).then(function (asset) {
              for (var j = 0; j < $scope.ad.additionalAssets.length; j++) {
                if (parseInt($scope.ad.additionalAssets[j].assetId) == asset.id) {
                  var additionalAsset = $scope.ad.additionalAssets[j];
                  additionalAsset.asset = asset;
                  additionalAsset.asset.dimensions = assetsLibraryService.getAssetDimension(asset);
                  if (asset.formatContext.fileSize) {
                    additionalAsset.size = asset.formatContext.fileSize;
                    additionalAsset.asset.formatContext.parsedFileSize = adPreviewService.parseSizeFromBytes(asset.formatContext.fileSize);
                  }
                  $scope.additionalAssetAssetsIds.push(asset.id);
//											fillAssetsOnPage(asset.id, asset);
                }
              }
            })
          }
        }
      }
    }

    //share modal controller
    $rootScope.previewLink = "hglkjsdfhkjh";
    $scope.showPreviewShareDialog = function () {
      var modalInstance = $modal.open({
        templateUrl: './csbPreviewApp/views/shareModal.html',
        backdrop: 'static',
        controller: 'shareModalCtrl'
      });
    };
    $rootScope.isLinkGenerated = false;
    $rootScope.accessPassword = "";
    $rootScope.shareinfo = {password: ''};
    $rootScope.generateLink = function () {
      console.log("generate preview link");
      //TODO add link generation code for adPreview
    };

    $scope.showUploadModal = function() {

      if ($scope.isModalOpen) {
        return;
      }
      $scope.isModalOpen = true;
      $scope.selectedFolder = {id: "", name: "Preview Background Images"};
      $rootScope.selectedDestinationFolder = "Preview Background Images";
      var adDetails = adService.getAdDetailsForUpload(true, false, null, null, null);   //single file upload
      $scope.showSelectTab = false;

      var modalInstance = $modal.open({
        templateUrl: './adManagementApp/views/uploadAsset.html',
        controller: 'uploadAssetCtrl',
        windowClass: 'upload-newux',
        backdrop: 'static',
        scope: $scope,
        resolve: {
          adDetailsForUpload: function () {
            return adDetails;
          }
        }
      });
      modalInstance.result.then(function (item) {
        console.log("item to set background modal", item);
        $scope.isModalOpen = false;

        if ( item.thumbnails.length > 0 && item.title ) {
          var colorObject = getColorObj("url('" + item.thumbnails[0].url + "') no-repeat scroll center top / cover transparent", item.title);
          colorObject.title = item.title;
          colorObject.isImage = true;
          colorObject.imgUrl = item.thumbnails[0].url;
          colorObject.isSelected = true;
          $scope.adPreviewCommonModel.bgImageUrl = item.thumbnails[0].url;
          for ( var k =0; k < $scope.colors.length; k++ ) {
            $scope.colors[k].isSelected = false;
          }
          $scope.colors.push(colorObject);
          $scope.adPreviewCommonModel.selectedBackgroundColor = colorObject.color;
          monitorService.setData("colors", $scope.colors);
          $timeout(function(){
            $scope.$digest();
          });
        } else {
          mmAlertService.addError("No image selected", "");
        }
      }, function () {
        $scope.isModalOpen = false;
      });
    };

    function extendFolderProperties(folder) {
      var viewModel = {
        parent: folder.parentId == null ? "#" : folder.parentId,
        text: folder.name,
        dimensions: "",
        displayFileSize: "",
        isChecked: false,
        title: folder.name,
        mediaType: "FOLDER",
        parentFolderName: folder.name,
        type: folder.folderType == null ? "DEFAULT" : folder.folderType,
        toggleCheckState: function () {
          this.isChecked = !this.isChecked;
        }
      };
      _.extend(folder, viewModel);
      return folder;
    }

    function createBackgroundFolder() {


      //TODO: integrate webservice to create new folder

      var newFolder = extendFolderProperties(newFolder);
      $scope.foldersData.push(newFolder);
      $scope.selectedParentId = newFolder.id;
      return newFolder;
    }

    $scope.removeColor = function(color) {
      var allColors = _.filter($scope.colors, function(item) {
        return item.title != color.title;
      });
      $scope.colors = allColors;
      monitorService.setData("colors", $scope.colors);
    }

    function addBackgroundImagesToColors() {

      serverGetFolders.getList().then(function (result) {
        var bgImageFolder = _.filter(result, function(d,i) {
          return d.name == 'Preview Background Images';
        });

        if ( bgImageFolder.length > 0) {
          var bckgrndSearchBody = {"searchText": "*", "page": 1, "itemsPerPage": "100", "indexVersion": 1, "assetType": "source", "currentVersion": true, "fieldTerms": {"mediaType": ["image"], "businessMetadata.folderId": [bgImageFolder[0].id]}};
          serverSearchAssets.post(bckgrndSearchBody).then(function (data) {
            if (data.entity && data.entity.length > 0) {
              var backgroundImages = data.entity;
                for (var i = 0; i < backgroundImages.length; i++) {
                  if (backgroundImages[i].thumbnails.length > 0 && backgroundImages[i].title) {
                    var colorObject = getColorObj("url('" + backgroundImages[i].thumbnails[0].url + "') no-repeat scroll center top / cover transparent", backgroundImages[i].title);
                    colorObject.title = backgroundImages[i].title;
                    $scope.colors.push(colorObject);
                  }
                }
            }
          }, function (error) {
            mmAlertService.addWarning("Unable to retrieve background images.");
          });
        }
      }, function (error) {
        mmAlertService.addWarning("Unable to retrieve background image folder.");
        //console.log("Unable to retrieve background images.", error);
      });
    }

    $scope.setBackground = function() {
      $scope.adPreviewCommonModel.previousBgColor = null;
      $scope.adPreviewCommonModel.showApplyBackgroundColorDialog=false;
      $scope.adPreviewCommonModel.enableDrag=false;
      $scope.adPreviewCommonModel.showBackgroundColorDialog = true;
    }

    $scope.clearBackground = function() {
      $scope.adPreviewCommonModel.currentlySetColor = $scope.defaultColor;
      $scope.adPreviewCommonModel.showApplyBackgroundColorDialog = false;
      $scope.adPreviewCommonModel.enableDrag=false;
      $scope.adPreviewCommonModel.previousBgColor = null;
    }

    $scope.closeBgToolbar = function() {
      if ( $scope.adPreviewCommonModel.previousBgColor != null)
        $scope.adPreviewCommonModel.currentlySetColor = $scope.adPreviewCommonModel.previousBgColor;
      $scope.adPreviewCommonModel.showApplyBackgroundColorDialog=false;
      $scope.adPreviewCommonModel.enableDrag=false;
      $scope.adPreviewCommonModel.previousBgColor = null;
    }

    $scope.adjustSidebarHeight = function() {
      var windowHeight = window.innerHeight;
      angular.element(".AdPreviewOpt #accordion .panel-collapse").css({ "height": (windowHeight - 162) + "px"});
      angular.element(".AdPreviewOpt #accordion .panel-body").css({ "height": (windowHeight - 162) + "px", "max-height": (windowHeight - 162) + "px"});
      angular.element("#myFrame").height(windowHeight - 58);
      angular.element(".AdPreviewOpt .user-list").css({ "height": ((windowHeight - 310)/2) + "px"});
      angular.element(".AdPreviewOpt .addside-option .additional-info .bottom-list").css({ "height": ((windowHeight - 308)/2) + "px"});
      angular.element(".AdPreviewOpt .addside-option .interation-monitor .user-list").css({ "height": ((windowHeight - 318)/2) + "px"});
      angular.element(".AdPreviewOpt .addside-option .interation-monitor .additional-info .bottom-list").css({ "height": ((windowHeight - 270)/2) + "px"});
    }

    $scope.adjustSidebarHeight();

    $scope.applyColorBackground = function() {
      $scope.clearUrlField();
      $scope.adPreviewCommonModel.applyBackground();
      $scope.adPreviewCommonModel.showBackgroundColorDialog=false;
      $scope.adPreviewCommonModel.showApplyBackgroundColorDialog=true;
    }

    $scope.selectBg = function(color) {
      $scope.adPreviewCommonModel.selectedBackgroundColor=color.color;
      color.toggle();
      if ( color.isImage ) {
        $scope.adPreviewCommonModel.bgImageUrl = color.imgUrl;
        monitorService.setData("bgImageUrl", $scope.adPreviewCommonModel.bgImageUrl);
      } else {
        $scope.adPreviewCommonModel.bgImageUrl = "";
        monitorService.setData("bgImageUrl", "");
      }
    }

  }
]).directive('focus', function ($timeout) {
  return function (scope, elem, attrs) {
    var elemToClick = attrs.clickElemId;
    $("#" + elemToClick).click(function () {
      $timeout(function () {
        console.log("elem[0]", elem[0]);
        elem[0].focus();
      }, 0, false);
    });
  };
}).directive('pickColor', function () {
    return {
      require: 'ngModel',
      link: function ($scope, $element, attrs, $ngModel) {

        var $input = $element;
  
        function setViewValue(color) {
          $ngModel.$setViewValue(color);
        }

        var onChange = function (color) {
          $scope.$apply(function () {
            setViewValue(color);

          });
        };
        var onToggle = function () {
          $input.spectrum('toggle');
          return false;
        };
        var options = angular.extend({
          color: $ngModel.$viewValue,
          change: onChange
        }, $scope.$eval(attrs.options));

        if (attrs.triggerId) {
          angular.element(document.body).on('click', '#' + attrs.triggerId, onToggle);
        }

        $ngModel.$render = function () {
          $input.spectrum('set', $ngModel.$viewValue || '');
        };

        if (options.color) {
          $input.spectrum('set', options.color || '');
          setViewValue(options.color);
        }

        $input.spectrum(options);

        $scope.$on('$destroy', function () {
          angular.element(document.body).off('click', '#' + attrs.triggerId, onToggle);
          $input.spectrum('destroy');
        });
      }
    };
  });
;