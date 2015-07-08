'use strict';
app.controller('csbAdPreviewCtrl', ['$scope', '$rootScope', '$modal', '$stateParams', '$location', '$q', 'Restangular', 'EC2Restangular', 'EC2AMSRestangular', '$filter', '$state', '$timeout', '$sce',
  'mmModal', 'adService', 'configuration', 'enums', 'mmAlertService', 'adPreviewService', 'assetsLibraryService', '$window',
  function ($scope, $rootScope, $modal, $stateParams, $location, $q, Restangular, EC2Restangular, EC2AMSRestangular, $filter, $state, $timeout, $sce, mmModal, adService, configuration, enums, mmAlertService, adPreviewService, assetsLibraryService, $window) {

    var serverAds = EC2Restangular.all('ads');
    var serverAssets = EC2Restangular.all('assetMgmt');
    var serverTags = EC2Restangular.all('assetMgmt/metadatatags');
    var filter = {from: 0, max: 50};
    var xOffset = 30;
    var yOffset = 15;
    var noOfPreDefinedSystemTags = 16;

    if ( typeof $scope.isChildView == "undefined" ) {
      $scope.isChildView = false;
    }

    var urlParams = $location.path().split("/");

    if ( !$scope.isChildView && typeof $scope.ads == "undefined" ) {
      $scope.ads = [];
      $scope.tags = [];
      $scope.showGridView = urlParams[2] == "gridView" || typeof urlParams[2] == "undefined" || urlParams[2] == "" ? true : false;
      $scope.showTileView = urlParams[2] == "tileView" ? true : false;
      $scope.showLiveView = urlParams[2] == "liveView" ? true : false;
      $scope.filtered = {filteredPlayingAds: [], filteredAds: [], selectedItems: []};

    } else {
      $scope.isChildView = true;

      var adDimensionGroup = adPreviewService.getStoredAdDimensionGroups();
      if ( adDimensionGroup.length > 0 ) {
        $scope.adDimensionGroups = adDimensionGroup;
        var totalShowing = 0;
        for ( var i = 0; i < $scope.adDimensionGroups.length; i++ ) {
          totalShowing += $scope.adDimensionGroups[i].count;
        }
        $scope.totalShowing = totalShowing;
      }
      if ( urlParams[2] == "liveView" && $scope.saveBackState == undefined) {
        $scope.saveBackState = adPreviewService.getStoredSaveBackState;
      }
    }

    $scope.viewBy = "gridView";
    if ( typeof urlParams[2] != "undefined" ) {
      $scope.viewBy = urlParams[2];
      if ($scope.viewBy == "gridView")  {
        $scope.saveBackState = "csbAdPreview.gridView";
      } else if ($scope.viewBy == "tileView") {
        $scope.saveBackState = "csbAdPreview.tileView";
      }
    }

    $scope.isMDX2 = $location.search().sid != undefined ? true : false;
    $scope.showSpinner = false;

    $scope.showSingleView = false;

    $scope.fromLiveView = false;

    $scope.showShareAdDialog = false;
    $scope.showSetupDialog = false;
    $scope.showBackgroundColorDiv = false;
    $scope.showBackgroundUrlDiv = false;
    $scope.showCommentsContainerOnSingleAd = false;
    $scope.showDetailsContainerOnSingleAd = false;
    $scope.showSetupDialogOnLiveView = false;
    $scope.showBackgroundColorDivOnLiveView = false;
    $scope.showShareAdDialogOnTileView = false;
    $scope.showShareAdDialogOnLiveView = false;
    $scope.search = "";
    $scope.thumbnailUrl = "";
    $scope.currentPage = 1;
    $scope.pageSize = 20;
    $scope.maxSize = 5;
    $scope.systemTags = [];
    $scope.maxTagOnHeader = 2;
    $scope.maxNoOfTagsInAd = 5;
    $scope.isSelectAll = false;
    $scope.isSelectAllOnLIveView = false;
    $scope.totalPlaying = 0;
    $rootScope.previewLink = "hglkjsdfhkjh";
    $scope.previewPassword = "";
    $scope.sharePass = "";
    $scope.emailSubject = "Shared Ads";
    $scope.emailAddress = "enter_email";
    $scope.selectedAd = {};

    $scope.backgroundColorClasses = ['bg-blue', 'bg-gray', 'bg-green', 'bg-sky-blue'];
    $scope.selectedColorClass = "";
    $scope.currentColorClass = $scope.backgroundColorClasses[3];
    $scope.searchActions = [
      {name: 'All', displayName: 'All', isSelected: true, isShow: false, show: show, hide: hide},
      {name: 'tags', displayName: 'Tags', isSelected: false, isShow: false, show: show, hide: hide},
      {name: 'name', displayName: 'Name', isSelected: false, isShow: false, show: show, hide: hide},
      {name: 'id', displayName: 'ID',isSelected: false, isShow: false, show: show, hide: hide},
      {name: 'adDimension', displayName: 'Dimension', isSelected: false, isShow: false, show: show, hide: hide},
      {name: 'adFormat', displayName: 'Format', isSelected: false, isShow: false, show: show, hide: hide}/*,
      {name: 'viewAdType', displayName: 'Format', isSelected: false, isShow: false, show: show, hide: hide}*/
    ];
    function hide() {
      this.isShow = false;
    };
    function show() {
      this.isShow = true;
    };
    $scope.selectedSearchActionOnTileView = "All";
    $scope.selectedSearchActionOnLiveView = "All";
    $scope.showPlayMode = true;
    $scope.searchCriteria = {searchLiveView: '', search: '', Id: '', name: '', adDimension: '', tags: ''};
    $scope.tagSaveMessage = '';
    $scope.isTagSaved = false;

    $scope.count = 0;
    $scope.selectedCountOnLiveView = 0;
    $scope.getHiddenAdsOnLiveViewCount = 0;
    $scope.mdx2SessionId = $location.search().sid;
    $scope.dgIds = $location.search().dgids;
    $scope.adIds = $location.search().adids || $location.search().adIds;
    $scope.shareId = $location.search().share;
    $scope.shareInputPassword = $location.search().p;

    $scope.isSuccessfullyLoggedIn = false;
    $scope.mdx3Ads = [];
    $scope.busy = false;

    $scope.currentUrl = "";
    $scope.isMDX2Share = false;
    $scope.generalErrorMsg = "Oops, an error occurred retrieving your ads. Please try again later.";

    $scope.chooseColor = function (colorClass) {
      $scope.selectedColorClass = colorClass;
    };

    $scope.clearSearchOnLiveView = function () {
      $scope.searchCriteria.searchLiveView = '';
    };

    $scope.clearSearch = function () {
      $scope.searchCriteria.search = '';
    };

    function getTag(serverTag) {
      var tag = {
        id: $scope.isMDX2 ? serverTag.ID : serverTag.id,
        tagName: $scope.isMDX2 ? serverTag.MetaDataTagName : serverTag.name,
        tagColor: $scope.isMDX2 ? serverTag.Color : serverTag.color,
        toolTip: $scope.isMDX2 ? serverTag.MetaDataTagName : serverTag.name,
        isColorTag: true,
        isClicked: false,
        isSelected: false,
        isChecked: false,
        addDeleteTagToAd: function (ad) {
          //reset new tag counter
          ad.newTagCounter = 0;
          var adTagIds = _.pluck(ad.tags, 'id');
          var indexOfTag = adTagIds.indexOf(tag.id);
          if (indexOfTag == -1) {
            if (ad.tags.length < $scope.maxNoOfTagsInAd) {
              ad.newTagCounter++;
              ad.tags.push(tag);
              if (!$scope.isMDX2) {
                $scope.tagSaveMessage = 'Saving...';
                var saveItemTag = EC2Restangular.all('assetMgmt/itemmetadatatags');
                var postBody = {itemId: ad.id, itemType: 'MDX2AD', tagId: tag.id};
                saveItemTag.customPOST(postBody).then(function (result) {
                }, function (error) {
                  processError("An error occurred while saving the tags.");
                });
              }
              else {
                $scope.tagSaveMessage = 'Saving...';
                var saveItemTag = EC2AMSRestangular.all('mdx2PreviewShare/MetaDataTagItem');
                var postBody = {MetaDataTagItem: {TagItemID: ad.id, MetaDataTagItemType: 'MDX2AD', MetaDataTagID: tag.id}};     //TODO change MetaDataTagItemType to numeric 0?
                saveItemTag.customPUT(postBody).then(function (result) {
                }, function (error) {
                  processError("An error occurred while saving the tags.");
                });
              }
              $scope.isTagSaved = true;
              $scope.tagSaveMessage = 'Changes saved';
            }
            else {
              mmAlertService.addError('You can add maximum of ' + $scope.maxNoOfTagsInAd + ' tags to an ad!', '');
              $scope.isTagSaved = false;
              $scope.tagSaveMessage = '';
            }
          }
          else if (indexOfTag > -1) {
            $scope.removeTag(ad, tag);
            if ($scope.isTagSaved)
              ad.tags.splice(indexOfTag, 1);
          }
        },
        clearOrHighlightTags: function (items) {
          this.isClicked = !this.isClicked;
          $scope.searchCriteria.search = this.isClicked ? this.tagName : '';
          clearOrHighlightSelectedTags($scope.ads, this.tagName, this.isClicked);
        },
        toggleClick: function () {
          tag.isClicked = !tag.isClicked;
        }
      };
      return tag;
    };

    $scope.toggleView = function (ad) {
      $scope.showSingleView = !$scope.showSingleView;
      if ($scope.showSingleView) {
        $scope.thumbnailUrl = $scope.getImage(ad);
        $scope.selectedAd = ad;
      }
    };

    $scope.searchByTag = function (tag) {
      $scope.searchCriteria.search = tag.isClicked ? tag.tagName : '';
      clearOrHighlightSelectedTags($scope.ads, tag.tagName, true);
    };

    $scope.searchByTagOnLiveView = function (tag) {
      $scope.searchCriteria.searchLiveView = tag.isClicked ? tag.tagName : '';
      clearOrHighlightSelectedTags($scope.filtered.filteredPlayingAds, tag.tagName, true);
    };

    $scope.toggleSharedAdDialog = function () {
      $scope.showShareAdDialog = !$scope.showShareAdDialog;
    };

    $scope.toggleSetupDialog = function () {
      $scope.showSetupDialog = !$scope.showSetupDialog;
      if (!$scope.showSetupDialog) {
        $scope.showBackgroundColorDiv = false;
        $scope.showBackgroundUrlDiv = false;
      }
    };

    $scope.toggleBackgroundColorDiv = function () {
      $scope.showBackgroundColorDiv = !$scope.showBackgroundColorDiv;
    };

    $scope.toggleBackgroundUrlDiv = function () {
      $scope.showBackgroundUrlDiv = !$scope.showBackgroundUrlDiv;
    };

    $scope.toggleCommentsContainerOnSingleAd = function () {
      $scope.showCommentsContainerOnSingleAd = !$scope.showCommentsContainerOnSingleAd;
    };

    $scope.toggleDetailsContainerOnSingleAd = function () {
      $scope.showDetailsContainerOnSingleAd = !$scope.showDetailsContainerOnSingleAd;
    };

    $scope.toggleBackgroundColorDivOnLiveView = function () {
      $scope.showBackgroundColorDivOnLiveView = !$scope.showBackgroundColorDivOnLiveView;
    };

    $scope.toggleSetupDialogOnLiveView = function () {
      $scope.showSetupDialogOnLiveView = !$scope.showSetupDialogOnLiveView;
      if (!$scope.showSetupDialog) {
        $scope.showBackgroundColorDivOnLiveView = false;
      }
    };

    $scope.toggleShareAdDialogOnTileView = function () {
      $scope.showShareAdDialogOnTileView = !$scope.showShareAdDialogOnTileView;
    };

    $scope.toggleShareAdDialogOnLiveView = function () {
      $scope.showShareAdDialogOnLiveView = !$scope.showShareAdDialogOnLiveView;
    };

    $scope.applyBackgroundColorOnLiveView = function () {
      $scope.currentColorClass = $scope.selectedColorClass;
      $scope.toggleSetupDialogOnLiveView();
    };

    $scope.redirectToLiveView = function (ad) {

      $scope.isRedirectByAppButton = true;
      $scope.showGridView = false;
      $scope.showTileView = false;
      $scope.showSingleView = false;
      $scope.showLiveView = true;
      clearAllActions(null);
      var ads = [];
      if (typeof ad != "undefined" && ad != null) {
        for (var index = 0; index < $scope.ads.length; index++) {
          var item = $scope.ads[index];
          if (item.isChecked)
            item.isChecked = false;
        }
        ad.isChecked = true;
        ads.push(ad);
      }

      ads = $scope.selectedAds();
      $scope.totalPlaying = (typeof ads != 'undefined' && ads.length > 0) ? ads.length : $scope.ads.length;
      $scope.searchCriteria.searchLiveView = $scope.searchCriteria.search;

      applyFilters();
      adPreviewService.putStoredAdDimensionGroups($scope.adDimensionGroups);
      $state.go("csbAdPreview.liveView", {adIds: $scope.adIds});
    };

    $scope.redirectToOriginalView = function () {
      if ($scope.saveBackState != undefined) {
        $state.go($scope.saveBackState, {adIds: $scope.adIds});
      } else {
        $state.go("csbAdPreview.gridView", {adIds: $scope.adIds});    //undefined if coming from adPreview
      }

    };

    $scope.$watch("searchCriteria.searchLiveView", function (newVal, oldVal) {
      if ( !$scope.isChildView )
        applyFilters();
      if (newVal == "undefined" || newVal == "") {
        clearOrHighlightSelectedTags($scope.filtered.filteredPlayingAds, null, false);
      }
    }, true);

    $scope.$watch("searchCriteria.search", function (newVal, oldVal) {
      applyFiltersOnGridPage();
      if (newVal == "undefined" || newVal == "") {
        clearOrHighlightSelectedTags($scope.ads, null, false);
      }
    }, true);

    $scope.calculateDivHeight = function (adGroup, ad) {
      return ad.playAd ? adGroup.height : _.parseInt(adGroup.height) + 68;
    }

    $scope.calculateLineHeight = function (adGroup, ad) {
      if (!ad.playAd) {
        return adGroup.height + "px";
      }
    }

    function unSelectAllSystemTags() {
      for (var index = 0; index < $scope.systemTags.length; index++) {
        var sysTag = $scope.systemTags[index];
        sysTag.isSelected = false;
      }
    };

    //Not using this method instead use 'addDeleteTagToAd'
    $scope.setAdTag = function (ad) {
      if (ad.selectedTags.length <= 0)
        return false;
      $scope.tagSaveMessage = 'Saving...';
      unSelectAllSystemTags();
      if (ad.tags.length < $scope.maxNoOfTagsInAd) {
        var adTagIds = _.pluck(ad.tags, 'id');
        _.forEach(ad.selectedTags, function (tag) {
          if (adTagIds.indexOf(tag.id) == -1) {
            ad.newTagCounter++;
            ad.tags.push(tag);

            if (!$scope.isMDX2) {
              var saveItemTag = EC2Restangular.all('assetMgmt/itemmetadatatags');
              var postBody = {itemId: ad.id, itemType: 'MDX2AD', tagId: tag.id};    //TODO change itemType to numeric 0?
              saveItemTag.customPOST(postBody).then(function (result) {
              }, function (error) {
                processError(error);
              });
            }
            else {
              var saveItemTag = EC2AMSRestangular.all('mdx2PreviewShare/MetaDataTagItem');
              var postBody = {MetaDataTagItem: {TagItemID: ad.id, MetaDataTagItemType: 'MDX2AD', MetaDataTagID: tag.id}};   //TODO change MetaDataTagItemType to numeric 0?
              saveItemTag.customPUT(postBody).then(function (result) {
              }, function (error) {
                processError(error);
              });
            }
            $scope.isTagSaved = true;
            $scope.tagSaveMessage = 'Changes saved';
          }
          else {
            $scope.isTagSaved = false;
            $scope.tagSaveMessage = '';
          }
        });
      }
      else {
        mmAlertService.addError('You can add maximum of ' + $scope.maxNoOfTagsInAd + ' tags to an ad!', '');
        $scope.isTagSaved = false;
        $scope.tagSaveMessage = '';
      }
    };

    $scope.removeTag = function (ad, tag) {
      if (ad.tags.length > 0) {
        var index = ad.tags.indexOf(tag);
        if (index != -1) {
          ad.tags.splice(index, 1);//TODO this line should be call on successfull deletion from server side.
          var deleteItemTag = EC2Restangular.all('assetMgmt/itemmetadatatags/' + ad.id + '/' + tag.id);
          deleteItemTag.customDELETE().then(function (result) {
          }, function (error) {
            processError(error);
          });
          $scope.isTagSaved = true;
          $scope.tagSaveMessage = 'Tag deleted successfully';
        }
      }
    }

    $rootScope.isLinkGenerated = false;
    $rootScope.accessPassword = "";

    $rootScope.shareinfo = {password: ''};
    $rootScope.generateLink = function () {

      if ( $rootScope.shareinfo.password.length > 0 && $rootScope.shareinfo.password.length < 6 ) {
        mmAlertService.addError("Password must be at least 6 characters.");
      } else {
        $rootScope.previewLink = configuration.ec2.split('rest').join('#') + 'preview';
        $rootScope.isLinkGenerated = true;
        var postBody = [];
        if (!$scope.isMDX2) {
          postBody = { name: 'shareLink', password: $rootScope.shareinfo.password, sharedItems: [] };
        }
        else {
          postBody = {PreviewShare: {PreviewShareName: "shareLink", Password: $rootScope.shareinfo.password, PreviewShareItemsList: []}};
        }
        var hasChecked = false;
        for (var index = 0; index < $scope.ads.length; index++) {
          if (($scope.ads[index].isChecked && !$scope.showLiveView) || ($scope.ads[index].isCheckedOnLiveView && $scope.showLiveView)) {
            hasChecked = true;
            break;
          }
        }
        for (var index = 0; index < $scope.ads.length; index++) {
          if (!hasChecked || (hasChecked && $scope.ads[index].isChecked && !$scope.showLiveView) || (hasChecked && $scope.ads[index].isCheckedOnLiveView && $scope.showLiveView)) {
            var sharedItem = {};
            if (!$scope.isMDX2) {
              sharedItem = {
                itemType: ($scope.isMDX2) ? 0 : 2,      //'MDX2AD' : 'MDX3AD
                id: $scope.ads[index].id
              };
              postBody.sharedItems.push(sharedItem);
            }
            else {
              sharedItem = {
                PreviewItemName: $scope.ads[index].name,
                Width: $scope.ads[index].imageWidth,
                DefaultImageUrl: $scope.ads[index].defaultImage.asset.url,
                DisplayTag: $scope.ads[index].displayTagOriginal ? $scope.ads[index].displayTagOriginal : $scope.ads[index].displayTag,
                Height: $scope.ads[index].imageHeight,
                AdditionalMetadataList: [
                  {"Key": "adFormat", "Value": $scope.ads[index].adFormat},
                  {"Key": "size", "Value": $scope.ads[index].size},
                  {"Key": "itemId", "Value": $scope.ads[index].id}
                ],
                MetadataTagInfoList: []
              };
              for (var i = 0; i < $scope.ads[index].tags.length; i++) {
                for (var j = 0; j < $scope.tags.length; j++) {
                  if ($scope.tags[j].ID == $scope.ads[index].tags[i].id) {
                    var mTag = {
                      Color: $scope.ads[index].tags[i].tagColor,
                      MetaDataTagName: $scope.ads[index].tags[i].tagName,
                      MetaDataTagType: 'SYSTEM',
                      MetaDataTagItemInfoList: [
                        {MetaDataTagItemType: $scope.ads[index].tags[i].tagType, TagItemID: $scope.ads[index].id}
                      ]
                    };
                    sharedItem.MetadataTagInfoList.push(mTag);
                  }
                }
              }
              postBody.PreviewShare.PreviewShareItemsList.push(sharedItem);
            }
          }
        }
        if (!$scope.isMDX2) {
          var saveShare = EC2Restangular.all('assetMgmt/previewshares/');
          saveShare.customPOST(postBody).then(function (result) {
            if (result.length > 0) {
              $rootScope.previewLink = $rootScope.previewLink + '?share=' + result[0].id;// + '&p=' + $rootScope.shareinfo.password;
              $rootScope.isLinkGenerated = true;
            } else {
              $rootScope.isLinkGenerated = false;
              mmAlertService.addError("An error occurred while saving your share.");
            }
          }, function (error) {
            $rootScope.isLinkGenerated = false;
            mmAlertService.addError("An error occurred while saving your share.");
            //processError("An error occurred while saving your share.");
          });
        }
        else {
          var saveShare = EC2AMSRestangular.all('mdx2PreviewShare/PreviewShare');
          saveShare.customPUT(postBody).then(function (result) {
            $rootScope.previewLink = $rootScope.previewLink + '?share=' + result.PreviewShareID + "&mdx2=true";// + '&p=' + $rootScope.shareinfo.password;
            $rootScope.isLinkGenerated = true;
          }, function (error) {
            $rootScope.isLinkGenerated = false;
            mmAlertService.addError("An error occurred while saving your share.");
          });
        }
      }

    };

    $scope.getImage = function (ad) {
      return ad.image;
    };

    var additionalAdProp = function (ad) {
      ad.showCommentBox = false;
      ad.showAdDetailBox = false;
      //properties for Grid view
      ad.showCommentBoxOnGridView = false;
      ad.isChecked = false;
      //properties for Live view
      ad.showCommentBoxOnLiveView = false;
      ad.isHide = false;
      ad.isCheckedOnLiveView = false;
      ad.showAdDetailBoxOnLiveView = false;
      ad.showAddTagContainer = false;
      ad.showMoreAction = false;
      ad.showMoreTagsContainer = false;
      ad.isCreateNewClicked = false;
      ad.playAd = true;
      ad.iconClass = "fa-plus";
      ad.maxTagToVisible = 2;
      ad.selectedTags = [];
      ad.newTagCounter = 0;
      ad.placement = ad.placement ? enums.placementStatuses.getName(ad.placement.id) : '';
      ad.assetDimension = ad.defaultImage.asset.dimensions;
      ad.image = ad.defaultImage.asset.url;
      ad.tagIds = function () {
        return _.pluck(ad.tags, 'id');
      };
      var dimensions = ad.assetDimension.split('X');
      if (typeof dimensions != "undefined" && dimensions.length > 1) {
        ad.imageHeight = _.parseInt(dimensions[1]);
        ad.imageWidth = _.parseInt(dimensions[0]);
        ad.scaledHeight = getScaledHeight(ad.imageWidth, ad.imageHeight);
      }
      else {
        ad.imageHeight = ad.scaledHeight = 0;
        ad.imageWidth = 0;
      }
      //add inline actions to dataset
      if (!$scope.isMDX2Share) {
        ad.actions = [
          {field: 'playButton', title: 'Play Ad', actionFieldType: enums.actionFieldType.getName("Button"), function: gridActionClick, showControl: true},
          {field: 'testButton', title: 'Test Ad', actionFieldType: enums.actionFieldType.getName("Button"), function: gridActionClick, showControl: !$scope.isMDX2Share }
        ]
      }
      else {
        ad.actions = [
          {field: 'playButton', title: 'Play Ad', actionFieldType: enums.actionFieldType.getName("Button"), function: gridActionClick, showControl: true}
        ]
      }
    };

    function getScaledHeight(imageWidth, imageHeight) {
      var scaledImageHeight = imageHeight;
      if (imageWidth > 240) {
        var widthRatio = imageWidth/240;
        scaledImageHeight = imageHeight/widthRatio;
      }
      if (scaledImageHeight > 216) {
        var heightRatio = scaledImageHeight/216;
        scaledImageHeight = scaledImageHeight/heightRatio;
      }
      return scaledImageHeight;
    }

    function getContainerHeight() {
      return _.parseInt($(window).height()) - 36;
    }

    $scope.containerHeight = getContainerHeight();

    $(window).resize(function () {
      $scope.containerHeight = getContainerHeight();
      $scope.$apply();
    });

    $scope.getHiddenAdsOnLiveView = function (adGroup) {
      $scope.getHiddenAdsOnLiveViewCount = _.filter(adGroup.ads, function (ad) {
        return ad.isHide;
      }).length;
      return $scope.getHiddenAdsOnLiveViewCount;
    };

    $scope.showHiddenAdsOnLiveView = function (adGroup) {
      var ads = _.filter(adGroup.ads, function (ad) {
        return ad.isHide;
      });
      for (var index = 0; index < ads.length; index++) {
        var ad = ads[index];
        ad.isHide = false;
      }
    };

    function clearAllActions(action) {
      var actions = [];
      var isNull = _.isNull(action);
      if (!isNull) {
        actions = _.where($scope.searchActions, function (act) {
          return act.name != action.name;
        })
      }
      else {
        actions = $scope.searchActions;
      }
      _.forEach(actions, function (obj) {
        obj.isSelected = false;
      });
      if (isNull) {
        var act = _.find(actions, function (ac) {
          return ac.name == "all";
        });
        if (act) {
          act.isSelected = true;
        }
      }
    };

    $scope.setSearchActionOnTileView = function (action) {
      clearAllActions(action);
      action.isSelected = !action.isSelected;
      $scope.selectedSearchActionOnTileView = action.displayName;
    };

    $scope.setSearchActionOnLiveView = function (action) {
      clearAllActions(action);
      action.isSelected = !action.isSelected;
      $scope.selectedSearchActionOnLiveView = action.displayName;
      applyFilters();
    };

    $scope.togglePlayAndImageMode = function () {
      $scope.showPlayMode = !$scope.showPlayMode;
      var ads = getFilteredAdsOnLiveView();
      for (var index = 0; index < ads.length; index++) {
        var ad = ads[index];
        ad.playAd = $scope.showPlayMode;
      }
    };

    $scope.refreshSingle = function (ad) {
      ad.playAd = true;
      $timeout(function() {
        /*if (ad.adFormat.toLowerCase().indexOf("instream") > -1) {
        var iframe = document.getElementById(ad.id + '_Instream');
        } else {
          var iframe = document.getElementById(ad.id + '_NotInstream');
        }*/
        var iframe = document.getElementById(ad.id);
        if (iframe) {
          //iframe.src = ad.displayTag;
          iframe.src = iframe.src;//Lets force the iframe to refresh.
          //iframe.contentWindow.location.reload();
        }
      },100);
    };

    $scope.replay = function () {
      try {
        var ads = getFilteredAdsOnLiveView();
        var selectedAds = _.filter(ads, function (ad) {
          return ad.isCheckedOnLiveView == true;
        });
        $scope.showPlayMode = true;
        if (ads.length == selectedAds.length || selectedAds.length == 0) {
          for (var index = 0; index < ads.length; index++) {
            var ad = ads[index];
            ad.playAd = $scope.showPlayMode;
          }
        } else {
          for (var index = 0; index < selectedAds.length; index++) {
            var ad = selectedAds[index];
            ad.playAd = $scope.showPlayMode;
          }
        }
        var replayedAds = selectedAds.length > 0 ? selectedAds : ads;
        /*angular.element("Iframe:visible").each(function (index, iframe) {
          if (_.some(replayedAds, function (ad) {
            return ad.id == iframe.id;
          })) {
            iframe.srcdoc = iframe.srcdoc;
          }
        });*/
      }
      catch (error) {
        console.log("error : $scope.replay : Error Trace : ", error);
      }
    };

    $scope.toggleCheckBoxesOnLiveView = function (adGroup) {
      adGroup.isSelectAllOnLIveView = !adGroup.isSelectAllOnLIveView;
      for (var index = 0; index < adGroup.ads.length; index++) {
        var ad = adGroup.ads[index];
        ad.isCheckedOnLiveView = adGroup.isSelectAllOnLIveView;
      }
    };

    $scope.selectedCheckBoxCountOnLiveView = function () {
      var adsOnLiveView = getFilteredAdsOnLiveView();
      var checkedChkBox = _.filter(adsOnLiveView, function (ad) {
        return ad.isCheckedOnLiveView == true;
      });
      //$scope.count = checkedChkBox.length;
      return $scope.selectedCountOnLiveView = checkedChkBox.length;

    };

    $scope.toggleAllCheckBoxesOnGridView = function () {
      $scope.isSelectAll = !$scope.isSelectAll;
      for (var index = 0; index < $scope.filtered.filteredAds.length; index++) {
        var ad = $scope.filtered.filteredAds[index];
        ad.isChecked = $scope.isSelectAll;
      }
    };

    $scope.selectedAds = function () {
      var ads = [];
      ads = _.filter($scope.filtered.filteredAds, function (ad) {
        return ad.isChecked;
      });
      return ads;
    };

    $scope.selectedCheckBoxCount = function () {
      var checkedChkBox = $scope.selectedAds();
      if (checkedChkBox) {
        $scope.count = checkedChkBox.length;
      }
      return $scope.count;
    };

    $rootScope.sendEmail = function () {
      window.location.href = 'mailto:' + $scope.emailAddress + '?subject=' + $scope.emailSubject + '&body=' + emailBody() + '';
    };

    $scope.showShareDialog = function () {
      var modalInstance = $modal.open({
        templateUrl: './csbPreviewApp/views/shareModal.html',
        backdrop: 'static',
        controller: 'shareModalCtrl',
        scope: $scope
      });
    };

    $scope.redirectToAdPreview = function (adId) {
      var sid = $scope.mdx2SessionId == undefined ? 'mdx3' : $scope.mdx2SessionId;
      adPreviewService.putStoredAdIds($scope.adIds, $scope.viewBy, $scope.saveBackState, $scope.adDimensionGroups);
      $state.go("adPreview", {adId: adId, sid: sid, mdx2: $scope.isMDX2});
    };

    function fetchTags() {
      $scope.showSpinner = true;


      if (!$scope.isMDX2) {
        serverTags.getList(filter).then(function (result) {
          $scope.tags = result;
          $scope.showSpinner = false;
          prepareSytemTags();
        }, function (error) {

          prepareSytemTags();
          processError("An error occurred while fetching the tags from the server.");
        });
      }
      else {
        var getTags = EC2AMSRestangular.all('mdx2PreviewShare/MetaDataTags/');
        getTags.customGET().then(function (result) {
          $scope.tags = result.MetaDataTagList;
          console.log(result);
          $scope.showSpinner = false;
          prepareSytemTags();
        }, function (error) {

          prepareSytemTags();
          processError("An error occurred while fetching the tags from the server.");
        });
      }
    }

    function fetchAds() {
      $scope.showSpinner = true;
      $scope.isSuccessfullyLoggedIn = true;
      var getAds;
      var postBody;
      var mdx2Headers = { 'Content-Type': 'application/json; charset=utf-8', SessionID: $scope.mdx2SessionId };
      if ($scope.adIds != undefined) {
        if (!$scope.isMDX2) {
          getAds = EC2Restangular.all('assetMgmt/previewshares/adsByAdIds/' + $scope.mdx2SessionId + '/' + $scope.isMDX2);
          postBody = $scope.adIds.split("|").join(" ");
        }
        else {
          getAds = EC2AMSRestangular.all('mdx2AdsByAdIds/');
          postBody = {AdsIDs: $scope.adIds.split("|")};
        }
      }
      else if ($scope.dgIds != undefined) {
        if (!$scope.isMDX2) {
          getAds = EC2Restangular.all('assetMgmt/previewshares/adsByDGIds/' + $scope.mdx2SessionId + '/' + $scope.isMDX2);
          postBody = $scope.dgIds.split("|").join(" ");
        }
        else {
          getAds = EC2AMSRestangular.all('mdx2AdsByDGIds/');
          postBody = {DeliveryGroupsIDs: $scope.dgIds.split("|")};
        }
      }
      if (typeof getAds != "undefined") {
        getAds.post(postBody, {}, mdx2Headers).then(function (result) {
          if (result != undefined) {
            var totalCount = result.length;
            if (!$scope.isMDX2) {
              var adCount = 0;
              for (var i = 0; i < result.length; i++) {
                serverAds.one(result[i].id).get().then(function (ad) {
                  adCount++;
                  $scope.mdx3Ads.push(ad);

                  if (adCount == totalCount) {
                    convertPreviewItemsToAdModel(result);
                    attachCustomPropertiesToAdObject();
                    applyFiltersOnGridPage();
                    $scope.showSpinner = false;
                    mmAlertService.addInfo("Successfully fetched the ads.");
                    if ($scope.isChildView && $scope.showLiveView) {
                      //getLiveAds();
                      applyFilters();
                      adPreviewService.putStoredAdDimensionGroups($scope.adDimensionGroups);
                    }

                  }
                  else if (totalCount > $scope.pageSize && adCount == $scope.pageSize) {
                    //prepare first 20 items($scope.pageSize==20)
                    convertPreviewItemsToAdModel(result.slice(0, $scope.pageSize));
                    attachCustomPropertiesToAdObject();
                    applyFiltersOnGridPage();
                    $scope.showSpinner = false;
                    mmAlertService.addInfo("Successfully fetched the ads.");
                    //now assign remaining items to result.
                    result = result.slice($scope.pageSize, result.length);
                  }
                }, function (error) {
                  adCount++;
                  processError($scope.generalErrorMsg);
                });
              }
            }
            else {
              if (result.ResponseStatus != 1) processError($scope.generalErrorMsg);
              else {
                if ($scope.adIds != undefined) convertMDX2AdsResponseToAdModel(result, "ads");
                else if ($scope.dgIds != undefined) convertMDX2AdsResponseToAdModel(result, "dgs");
                attachCustomPropertiesToAdObject();
                applyFiltersOnGridPage();
                $scope.showSpinner = false;
              }
            }
          } else {
            processError($scope.generalErrorMsg);
          }

        }, function (error) {
          processError("An error occurred while fetching the ads from the server.");
        });
      }
      else {

        processError("Oops, an error occurred retrieving your ads. Please verify that you have selected valid ads.");
      }

      $scope.updateSelectedAds();

    }

    function fetchShare() {
      $scope.isSuccessfullyLoggedIn = false;
      $scope.ads = [];
      $scope.showSpinner = true;
      $scope.isMDX2 = $location.search().mdx2 != undefined ? $location.search().mdx2 : false;
      var pass = $scope.shareInputPassword != undefined ? $scope.shareInputPassword : 'none';
      var getShare;
      if (!$scope.isMDX2) {
        getShare = EC2Restangular.all('assetMgmt/previewshares/' + $scope.shareId + '/' + pass + '/');
        getShare.customGET().then(function (result) {
          convertPreviewItemsToAdModel(result.sharedItems);
          attachCustomPropertiesToAdObject();
          applyFiltersOnGridPage();
          $scope.isSuccessfullyLoggedIn = true;
          $scope.showSpinner = false;
          $scope.closeLoginModal();

        }, function (error) {
          processError("An error occurred while getting the share ads from the server.");
          $scope.isSuccessfullyLoggedIn = false;
          showLoginModal();
        });
      }
      else {
        $scope.isMDX2Share = true;
        getShare = EC2AMSRestangular.all('mdx2PreviewShare/PreviewShare/');
        getShare.customPOST($scope.shareId).then(function (result) {
          convertMDX2PreviewItemsToAdModel(result.PreviewShare.PreviewShareItemsList);
          attachCustomPropertiesToAdObject();
          applyFiltersOnGridPage();
          if ((result.PreviewShare.Password != undefined && pass == result.PreviewShare.Password) || result.PreviewShare.Password == undefined || result.PreviewShare.Password.length <= 0) {
            $scope.isSuccessfullyLoggedIn = true;
            $scope.showSpinner = false;
            $scope.closeLoginModal();
          }
          else {
            $scope.isSuccessfullyLoggedIn = false;
            showLoginModal();
          }
        }, function (error) {
          processError("An error occurred while getting the share ads from the server.");
          $scope.isSuccessfullyLoggedIn = false;
          showLoginModal();
        });
      }
    }


    $scope.updateSelectedAds = function() {
      if ( $scope.viewBy == "liveView" ) {
        if ( typeof $scope.adIds != "undefined" ) {
          if ( $scope.ads.length > 0 ) {
            var initialAds = adPreviewService.getStoredAdDimensionGroups();

            if ( initialAds.length > 0 ) {
              for ( var i = 0; i < $scope.ads.length; i++ ) {
                for ( var j = 0; j < initialAds.length; j++  ) {
                  for ( var k = 0; k < initialAds[j].ads.length; k++ ) {
                    if ( $scope.ads[i].id == initialAds[j].ads[k].id ) {
                      $scope.ads[i].isChecked = true;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    //init data calls

    if ($scope.shareId == undefined){
      if ( $scope.ads.length == 0) {
        fetchTags();
        fetchAds();
      }
    } else {
      fetchShare();
    }

    function convertMDX2AdsResponseToAdModel(response, type) {
      var items = [];
      if (type == "ads") items = response.AdsInfoList;
      else if (type == "dgs") {
        for (var i = 0; i < response.PreviewDeliveryGroupsList.length; i++) {
          for (var j = 0; j < response.PreviewDeliveryGroupsList[i].PreviewAdsInfoList.length; j++) {
            items.push(response.PreviewDeliveryGroupsList[i].PreviewAdsInfoList[j]);
          }
        }
      }

      for (var i = 0; i < items.length; i++) {
        var model = {
          type: items[i].AdType,
          id: items[i].AdId,
          name: items[i].AdName,
          adFormat: items[i].AdType,
          viewAdType: items[i].AdType,
          size: assetsLibraryService.parseSizeFromBytes(items[i].AdSizeInBytes),  //items[i].AdSizeInBytes,
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
          tags: []
        }
        //set dimensions
        if (model.displayTag.indexOf("width=") > 0 && model.displayTag.indexOf("height=") > 0) {
          var width = model.displayTag.substring(model.displayTag.indexOf("width=") + 6);
          width = width.substring(0, width.indexOf(" "));
          var height = model.displayTag.substring(model.displayTag.indexOf("height=") + 7);
          height = height.substring(0, height.indexOf(">"));
          model.defaultImage.asset.dimensions = width + "X" + height;
        }
        //set default image
        if (model.displayTag.indexOf("<img src=\"") > 0) {
          var defaultImg = model.displayTag.substring(model.displayTag.indexOf("<img src=\"") + 10);
          defaultImg = defaultImg.substring(0, defaultImg.indexOf("\""));
          model.defaultImage.asset.url = defaultImg;
        }
        if (model.displayTag.substring(0, 4) == 'http') {
          var finalTagUrl = model.displayTag;
          if (window.location.protocol == 'https:') finalTagUrl = finalTagUrl.replace('http', 'https');
          var getTagCode = Restangular.oneUrl('routeName', finalTagUrl);
          getTagCode.get().then(function (result) {
            var rAdId = result.substring(result.indexOf("AdID=\"") + 6);
            rAdId = rAdId.substring(0, rAdId.indexOf("\""));
            var rDefaultImg = result.substring(result.indexOf("=\"image/"));
            rDefaultImg = rDefaultImg.substring(rDefaultImg.indexOf("CDATA") + 6);
            rDefaultImg = rDefaultImg.substring(0, rDefaultImg.indexOf("]"));
            if (rDefaultImg.substring(0, 4) != 'http') rDefaultImg = "/ignoreImages/video_reel_grey.jpg"
            var rHeight = result.substring(result.indexOf("height=\"") + 8);
            rHeight = rHeight.substring(0, rHeight.indexOf("\""));
            var rWidth = result.substring(result.indexOf("width=\"") + 7);
            rWidth = rWidth.substring(0, rWidth.indexOf("\""));
            for (var j = 0; j < $scope.ads.length; j++) {
              if ($scope.ads[j].id == rAdId) {
                if (rDefaultImg.substring(0, 4) == 'http' || rDefaultImg.substring(0, 1) == '/') {
                  $scope.ads[j].defaultImage.asset.url = rDefaultImg;
                  $scope.ads[j].image = rDefaultImg;
                }
                $scope.ads[j].defaultImage.asset.dimensions = rWidth + "X" + rHeight;
                $scope.ads[j].dimension = rWidth + "X" + rHeight;
                $scope.ads[j].imageHeight = rHeight;
                $scope.ads[j].imageWidth = rWidth;
                $scope.ads[j].displayTag = $sce.trustAsResourceUrl("/player/views/instream-player.html?preroll=" + encodeURIComponent($scope.ads[j].displayTag) + "&midroll=&postroll=&overlay=&player-type=as3&width=" + rWidth + "&height=" + rHeight + "&controls=below&auto-start=false&script-access=always&wmode=opaque");
                $scope.ads[j].displayTagOriginal = "/player/views/instream-player.html?preroll=" + encodeURIComponent($scope.ads[j].displayTag) + "&midroll=&postroll=&overlay=&player-type=as3&width=" + rWidth + "&height=" + rHeight + "&controls=below&auto-start=false&script-access=always&wmode=opaque";
              }
            }
          }, function (error) {
            processError("An error occurred while getting the ad display tag from the server.");
          });
        }
        else if (model.displayTag.replace(/^\s+|\s+$/g, '').substring(0, 4) == '<scr') {
          //var scriptUrl = model.displayTag.replace(/^\s+|\s+$/g, '').replace("<script src=\"","").split("\"></script>");
          //var finalScriptUrl = scriptUrl[0];
          var finalScriptUrl = model.displayTag;
          if (window.location.protocol == 'https:') finalScriptUrl = finalScriptUrl.replace('http', 'https');
          model.displayTag = "/csbPreviewApp/views/adLoader.html?" + finalScriptUrl.split('script').join('scr||ipt');
        }

        $scope.ads.push(model);
      }

      for (var i = 0; i < $scope.ads.length; i++) {
        var getTags = EC2AMSRestangular.all('mdx2PreviewShare/MetaDataTagItemsByTagItemID/');
        var postBody = "" + $scope.ads[i].id + "";
        getTags.customPOST(postBody).then(function (result) {
          if (result.MetaDataTagItemList != undefined && result.MetaDataTagItemList.length > 0) {
            for (var ti = 0; ti < result.MetaDataTagItemList.length; ti++) {
              for (var j = 0; j < $scope.tags.length; j++) {
                if (result.MetaDataTagItemList[ti].MetaDataTagID == $scope.tags[j].ID) {
                  var tag = {
                    id: $scope.tags[j].ID,
                    tagName: $scope.tags[j].MetaDataTagName,
                    tagColor: $scope.tags[j].Color,
                    toolTip: $scope.tags[j].MetaDataTagName,
                    isColorTag: false,
                    isClicked: false,
                    isSelected: false,
                    clearOrHighlightTags: function (items) {
                      this.isClicked = !this.isClicked;
                      $scope.searchCriteria.search = this.isClicked ? this.tagName : '';
                      clearOrHighlightSelectedTags($scope.ads, this.tagName, this.isClicked);
                    },
                    toggleClick: function () {
                      this.isClicked = !this.isClicked;
                    }
                  };
                  for (var a = 0; a < $scope.ads.length; a++) {
                    if ($scope.ads[a].id == result.MetaDataTagItemList[ti].TagItemID) {
                      $scope.ads[a].tags.push(tag);
                      break;
                    }
                  }
                }
              }
            }
          }
        }, function (error) {
          processError("An error occurred while getting the ad display tags from the server.");
        });
      }
    }

    function convertPreviewItemsToAdModel(items) {
      for (var i = 0; i < items.length; i++) {
        if (!$scope.isMDX2) {
          for (var j = 0; j < $scope.mdx3Ads.length; j++) {
            if (items[i].id == $scope.mdx3Ads[j].id) {
              items[i].viewAdType = enums.adFormats.getName($scope.mdx3Ads[j].adFormat);
              items[i].adWidth = $scope.mdx3Ads[j].width;
              items[i].adHeight = $scope.mdx3Ads[j].height;
              items[i].masterAdId = ($scope.mdx3Ads[j].placementId) ?  $scope.mdx3Ads[j].masterAdId : "";
              if ($scope.mdx3Ads[j].adFormat != "INSTREAM_AD"  && $scope.mdx3Ads[j].adFormat != "INSTREAM_INTERACTIVE_AD" && $scope.mdx3Ads[j].adFormat != "INSTREAM_AD" != "INSTREAM_ENHANCED_AD") {
                items[i].imageWidth = $scope.mdx3Ads[j].defaultImage.width;
                items[i].imageHeight = $scope.mdx3Ads[j].defaultImage.height;
                items[i].defaultImage = $scope.mdx3Ads[j].defaultImage.thumbnailUrl;
                items[i].displayTag = "<script src='http://" + items[i].displayTag.split("[WIDTH]").join(items[i].width).split("[HEIGHT]").join(items[i].height) + "'></script>";
                //items[i].clickthrough = $scope.mdx3Ads[j].mainClickthrough.url;
                items[i].clickthrough = ($scope.mdx3Ads[j].mainClickthrough) ? $scope.mdx3Ads[j].mainClickthrough.url : '';
              }
              else {
                items[i].imageWidth = $scope.mdx3Ads[j].linears[0].width;
                items[i].imageHeight = $scope.mdx3Ads[j].linears[0].height;
                items[i].defaultImage = $scope.mdx3Ads[j].linears[0].thumbnailUrl;
                items[i].clickthrough = '';
                var getAssetImage = EC2Restangular.all('assetMgmt/');
                getAssetImage.one($scope.mdx3Ads[j].linears[0].assetId).get().then(function (asset) {
                  if (asset.thumbnails && asset.thumbnails.length > 0) {
                    for (var k = 0; k < $scope.mdx3Ads.length; k++) {
                      if ($scope.mdx3Ads[k].linears && $scope.mdx3Ads[k].linears.length > 0 && $scope.mdx3Ads[k].linears[0].assetId == asset.assetId) {
                        for (var f = 0; f < $scope.ads.length; f++) {
                          if ($scope.ads[f].id == $scope.mdx3Ads[k].id) {
                            $scope.ads[f].defaultImage = asset.thumbnails[0].url;
                            if (asset.thumbnails[1])
                              $scope.ads[f].image = asset.thumbnails[1].url;
                          }
                        }
                      }
                    }
                  }
                }, function (error) {
                  processError("An error occurred while getting the ad assets from the server.");
                });
                items[i].displayTag = "http://" + items[i].displayTag.split("[WIDTH]").join(items[i].width).split("[HEIGHT]").join(items[i].height);
              }
              break;
            }
          }
        }
        var model = {
          type: items[i].additionalMetadata.adType,
          id: items[i].id,
          name: items[i].name,
          viewAdType: items[i].viewAdType,
          adFormat: items[i].additionalMetadata.adType,
          size: assetsLibraryService.parseSizeFromBytes(items[i].additionalMetadata.size), // items[i].additionalMetadata.size,
          /*clickthrough: items[i].additionalMetadata.clickThrough,*/
          clickthrough: items[i].clickthrough,
          masterAdId: items[i].masterAdId,
          segment: items[i].additionalMetadata.segment,
          adHeight: items[i].adHeight,
          adWidth:  items[i].adWidth,
          adDimension: items[i].adWidth + "X" + items[i].adHeight,
          defaultImage: {
            asset: {
              dimensions: items[i].imageWidth + "X" + items[i].imageHeight,
              url: items[i].defaultImage
            }
          },
          displayTag: items[i].displayTag,
          tags: []
        }
        items[i].displayTag = items[i].displayTag.split("http:").join("https:")
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
                $scope.searchCriteria.search = this.isClicked ? this.tagName : '';
                clearOrHighlightSelectedTags($scope.ads, this.tagName, this.isClicked);
              },
              toggleClick: function () {
                this.isClicked = !this.isClicked;
              }
            }
            model.tags.push(tag);
          }
        }
        $scope.ads.push(model);
      }


        for (var j = 0; j < $scope.ads.length; j++) {
          var postBody = [];
          postBody.push($scope.ads[j].id)
          var getDisplayTag = EC2Restangular.all('ads/previewTag/');
          getDisplayTag.post(postBody).then(function (result) {
            for (var a = 0; a < $scope.ads.length; a++) {
              if (result[0].noScriptTag && result[0].noScriptTag.indexOf(parseInt($scope.ads[a].id, 36)) > 0) {
                if (result[0].scriptTag.length > 0) {
                  $scope.ads[a].displayTag = result[0].scriptTag;
                  var finalScriptUrl = $scope.ads[a].displayTag;
                  if (window.location.protocol == 'https:' && finalScriptUrl.indexOf("https") < 0) finalScriptUrl = finalScriptUrl.replace('http', 'https');
                  $scope.ads[a].displayTag = "/csbPreviewApp/views/adLoader.html?" + finalScriptUrl.split('script').join('scr||ipt');
                }
                else { //in-stream
                  $scope.ads[a].displayTag = $sce.trustAsResourceUrl("/player/views/instream-player.html?preroll=" + encodeURIComponent(result[0].noScriptTag) + "&midroll=&postroll=&overlay=&player-type=as3&width=" + $scope.ads[a].imageWidth + "&height=" + $scope.ads[a].imageHeight + "&controls=below&auto-start=false&script-access=always&wmode=opaque");
                }
                break;
              }
            }
          }, function (error) {
            processError("An error occurred while getting the ad display tags from the server.");
          });
        }


    }

    function convertMDX2PreviewItemsToAdModel(items) {
      for (var i = 0; i < items.length; i++) {
        var model = {
          type: 'TBD',
          viewAdType: 'TBD',
          id: items[i].DefaultImageUrl.split('EyeblasterID='),
          name: items[i].PreviewItemName,
          adFormat: 'TBD',
          size: '',
          clickthrough: '',
          masterAdId: '',
          segment: '',
          defaultImage: {
            asset: {
              dimensions: items[i].Width + "X" + items[i].Height,
              url: items[i].DefaultImageUrl
            }
          },
          displayTag: items[i].DisplayTag,
          tags: []
        }
        for (var j = 0; j < items[i].AdditionalMetadataList.length; j++) {
          if (items[i].AdditionalMetadataList[j].Key == "adFormat") {
            model.type = model.viewAdType = items[i].AdditionalMetadataList[j].Value;
            model.adFormat = items[i].AdditionalMetadataList[j].Value;
          }
          else if (items[i].AdditionalMetadataList[j].Key == "size")
            model.size = items[i].AdditionalMetadataList[j].Value;
          else if (items[i].AdditionalMetadataList[j].Key == "itemId") {
            model.id = items[i].AdditionalMetadataList[j].Value;
          }
        }
        if (items[i].MetadataTagInfoList != undefined) {
          for (var j = 0; j < items[i].MetadataTagInfoList.length; j++) {
            var tag = {
              id: items[i].MetadataTagInfoList[j].ID,
              tagName: items[i].MetadataTagInfoList[j].MetaDataTagName,
              tagColor: items[i].MetadataTagInfoList[j].Color,
              toolTip: items[i].MetadataTagInfoList[j].MetaDataTagName,
              isColorTag: false,
              isClicked: false,
              isSelected: false,
              clearOrHighlightTags: function (items) {
                this.isClicked = !this.isClicked;
                $scope.searchCriteria.search = this.isClicked ? this.tagName : '';
                clearOrHighlightSelectedTags($scope.ads, this.tagName, this.isClicked);
              },
              toggleClick: function () {
                this.isClicked = !this.isClicked;
              }
            }
            model.tags.push(tag);
          }
        }
        $scope.ads.push(model);
      }
    }

    function attachCustomPropertiesToAdObject() {
      for (var index = 0; index < $scope.ads.length; index++) {
        var ad = $scope.ads[index];
        var additionalAdProperties = new additionalAdProp(ad);
        _.extend(true, ad, additionalAdProperties);
      }
    }

    function processError(error) {
      $scope.showSpinner = false;
      console.log("Error:", error);
      if (error.data === undefined || error.data.error === undefined) {
        mmAlertService.addError(error);
      } else {
        mmAlertService.addError(error.data.error);
      }
      /*$timeout(function() {
        //hack to force an apply and display the alert dialog; the dialog won't show without this (reason unknown)
      },10);*/
    }

    $scope.renderAdForPlay = function (id, width, height) {
      if ($scope.isMDX2) return renderAdForPlayMDX2(id, width, height);
      else return renderAdForPlayMDX2(id, width, height);
    }

    function clearOrHighlightSelectedTags(ads, tagName, isSelected) {
      var allTags = _.pluck(ads, 'tags')

      if (allTags) {
        var tags = [];
        var flattenTags = _.flatten(allTags);
        if (tagName != null) {
          var isAnyTagAlreadySelected = _.some(flattenTags, function (tag) {
            return tag.isClicked;
          });
          if (isAnyTagAlreadySelected) {
            //lets unselect those tags which are selected.
            var tagsToUnSelect = _.filter(flattenTags, function (tag) {
              return tag.isClicked;
            });
            for (var index = 0; index < tagsToUnSelect.length; index++) {
              tagsToUnSelect[index].isClicked = false;
            }
          }
          tags = _.filter(flattenTags, function (tag) {
            return  tag.tagName == tagName;
          });
        }
        else
          tags = flattenTags;
        if (tags) {
          for (var index = 0; index < tags.length; index++) {
            tags[index].isClicked = isSelected;
          }
        }
      }
    }

    function renderAdForPlayMDX3(id, width, height) {
      return $sce.trustAsHtml("<script src='http://192.168.4.169/Serving?c=28&cn=display&ai=1073745589&w=300&h=300&pr=1'></script>");
    }

    function renderAdForPlayMDX2(id, width, height) {
      for (var i = 0; i < $scope.ads.length; i++) {
        if ($scope.ads[i].id == id) {
          return $sce.trustAsHtml($scope.ads[i].displayTag);
        }
      }
    }

    $scope.renderAdForPlayMDX2Div = function (id, tag) {
      //console.log('rendering tag');
      $(document).ready(function () {
        $("#" + id).html(tag);
      });
    }

    function getFilteredAdsOnLiveView() {
      return $scope.filtered.filteredPlayingAds;
    };

    $scope.onPageSelect = function (page) {
      $scope.currentPage = page;
      applyFilters();
    };

    function prepareEqualityComparer(isLiveView) {
      var comparer = {};
      var searchAction = isLiveView ? $scope.selectedSearchActionOnLiveView : $scope.selectedSearchActionOnTileView;
      var searchActionToSave = "";
      var searchText = isLiveView ? $scope.searchCriteria.searchLiveView : $scope.searchCriteria.search;
      if (searchAction == "All") {
        _.forEach($scope.searchActions, function (x) {
          if (x.displayName != "All") {
            comparer[x.name] = searchText;
          }
        });
      } else {
        _.forEach($scope.searchActions, function (x) {
          if (x.displayName == searchAction) {
            comparer[x.name] = searchText;
          } else {
              x.show();
          }
        });
      }

      return comparer;
    };

    function applyFiltersOnGridPage() {
      $scope.filtered.filteredAds = $filter("genericSearchFilter")($scope.ads, prepareEqualityComparer(false), true);
    };

    /*$scope.$on("$locationChangeStart", function (event, next, current) {
      console.log("locationChangeStart - next, current", next, current);

      //handle browser back/forward buttons
      if (!$scope.isRedirectByAppButton) {
        if (next.indexOf("liveView") > 0) {
          $scope.redirectToLiveView();
        } else if (next.indexOf("gridView") > 0) {
          $scope.changeViews(true);
        } else if (next.indexOf("tileView") > 0) {
          $scope.changeViews(false);
        } else {
          $scope.changeViews(true);
        }
      }
      $scope.isRedirectByAppButton = false;
    }, true);
    */
    $scope.isRedirectByAppButton = false;
    $scope.changeViews = function (isGridView) {
      $scope.isRedirectByAppButton = true;
      $scope.showLiveView = false;
      $scope.saveBackState = (isGridView) ? "csbAdPreview.gridView" : "csbAdPreview.tileView";

      if ( $scope.isChildView )
        $scope.$parent.saveBackState = $scope.saveBackState;
      //$scope.searchCriteria.search = $scope.searchCriteria.searchLiveView;
      if (isGridView) {
        $scope.showGridView = true;
        $scope.showTileView = false;
        $scope.filtered.selectedItems = [];
        for (var index = 0; index < $scope.filtered.filteredAds.length; index++) {
          var ad = $scope.filtered.filteredAds[index];
          if (ad.isChecked) {
            $scope.filtered.selectedItems.push(ad);
          }
        }
        $state.go("csbAdPreview.gridView", {adIds: $scope.adIds});
      }
      else {
        pushSelectedAds();
        $scope.showGridView = false;
        $scope.showTileView = true;
        $state.go("csbAdPreview.tileView", {adIds: $scope.adIds});
      }
    };

    $scope.$watchCollection('filtered.selectedItems', function (newVal, oldVal) {
      if (newVal != "undefined" || newVal != "") {
          pushSelectedAds();
      }
    }, true);

    function pushSelectedAds() {

      if ($scope.filtered.selectedItems) {
        for (var index = 0; index < $scope.filtered.filteredAds.length; index++) {
          var ad = $scope.filtered.filteredAds[index];
          ad.isChecked = _.some($scope.filtered.selectedItems, function (item) {
            return item.id == ad.id;
          });
        }
      }
    };

    $scope.toggleDetailBoxes = function (ad, prop) {

      $window.onclick = null;
      for(var i = 0; i < $scope.adDimensionGroups.length; i++ ) {
        for(var j = 0; j < $scope.adDimensionGroups[i].ads.length; j++ ) {
          $scope.adDimensionGroups[i].ads[j][prop] = false;
          $scope.adDimensionGroups[i].ads[j]['showAddTagContainer'] = false;
          $scope.adDimensionGroups[i].ads[j]['showMoreAction'] = false;
        }
      }
      $scope.searchActionOnLiveView = false;
      ad[prop] = !ad[prop];

      if (ad[prop]) {
        $window.onclick = function (event) {
          ad[prop] = false;
          $timeout(function(){
            $scope.$apply();
          });
        };
      }
    };

    $scope.toggleShowMoreAction = function(ad, prop) {
      $window.onclick = null;
      for(var i = 0; i < $scope.adDimensionGroups.length; i++ ) {
        for(var j = 0; j < $scope.adDimensionGroups[i].ads.length; j++ ) {
          $scope.adDimensionGroups[i].ads[j][prop] = false;
          $scope.adDimensionGroups[i].ads[j]['showAdDetailBoxOnLiveView'] = false;
          $scope.adDimensionGroups[i].ads[j]['showAddTagContainer'] = false;
        }
      }
      $scope.searchActionOnLiveView = false;
      ad[prop] = !ad[prop];

      if (ad[prop]) {
        $window.onclick = function (event) {
          ad[prop] = false;
          $timeout(function(){
            $scope.$apply();
          });
        };
      }
    }

    $scope.hideAllPanels = function() {
      for(var i = 0; i < $scope.adDimensionGroups.length; i++ ) {
        for(var j = 0; j < $scope.adDimensionGroups[i].ads.length; j++ ) {
          $scope.adDimensionGroups[i].ads[j]['showAdDetailBoxOnLiveView'] = false;
          $scope.adDimensionGroups[i].ads[j]['showAddTagContainer'] = false;
          $scope.adDimensionGroups[i].ads[j]['showMoreAction'] = false;
        }
      }
    }

    $scope.columnDefs = [
      {field: 'image', displayName: 'Thumbnail', isColumnSort: false, width: 100, isColumnEdit: false, gridControlType: enums.gridControlType.getName("Image"), isPinned: false, enableDragDrop: false},
      {field: 'name', displayName: 'Ad Name', isColumnEdit: false, isShowToolTip: false, isPinned: false, gridControlType: enums.gridControlType.getName("TextBox")},
      {field: 'id', displayName: 'Ad ID', isColumnEdit: false, isShowToolTip: false, isPinned: false, gridControlType: enums.gridControlType.getName("TextBox")},
      {field: 'adDimension', displayName: 'Ad Dimensions', isColumnEdit: false, isShowToolTip: false, isPinned: false, gridControlType: enums.gridControlType.getName("TextBox")},
      {field: 'viewAdType', displayName: 'Ad Format', isColumnEdit: false, isShowToolTip: false, isPinned: false, gridControlType: enums.gridControlType.getName("TextBox")},
      {field: 'tags', displayName: 'Ad Tags', isColumnEdit: false, isShowToolTip: false, isPinned: false, cellTemplate: '<div>	<ul class="tags"><li class="tagFilter" ng-click="tag.clearOrHighlightTags(items)" ng-repeat="tag in row.entity[col.field]"><a data-ng-class="{active:tag.isClicked}" class="color-{{tag.tagColor}}"><i class="fa fa-tag"></i> {{tag.tagName}}</a></li></ul></div>'},
      {field: 'actions', displayName: 'Ad Actions', isColumnSort: false, width: 200, isColumnEdit: false, isShowToolTip: false, isPinned: false, gridControlType: enums.gridControlType.getName("Action")}
    ];

    $scope.isGridLoading = false;

    $scope.windowHeight = $(window).height() - 40;
    if ( !$scope.isChildView ) {
      $scope.adDimensionGroups = [];

    }

    function take(howMany) {
      var data = [];
      for (var index = 0; index < this.length; index++) {
        if (index >= this.length - howMany)break;
        data.push(this[index]);
      }
      return data;
    };

    $scope.currentLiveViewPage = 1;
    $scope.pageSizeLiveView = 10;

    $scope.loadMore = function () {
      $scope.currentLiveViewPage++;
      applyFilters();
    };

    function applyFilters() {

      var f1 = $filter("filterAdsOnLiveView")($scope.ads);
      $scope.filtered.filteredPlayingAds = $filter("genericSearchFilter")(f1, prepareEqualityComparer(true), true);

      var groupAdsByDimensions = _.groupBy($scope.filtered.filteredPlayingAds, 'adDimension');
      $scope.adDimensionGroups = [];
      var alreadyRenderedAdCount = ($scope.currentLiveViewPage - 1) * $scope.pageSizeLiveView;
      var totalTillNow = ($scope.currentLiveViewPage - 1) * $scope.pageSizeLiveView + $scope.pageSizeLiveView;
      var nowAddingInPipeLine = 0;
      var stopRendering = false;
      $scope.totalShowing = 0;
      _.map(groupAdsByDimensions, function (data, key) {
        if (stopRendering) return false;

        nowAddingInPipeLine += data.length;
        if (nowAddingInPipeLine > totalTillNow) {
          data = take.call(data, nowAddingInPipeLine - totalTillNow);
          stopRendering = true;
        }
        if (data.length <= 0) return false;
        var dimensions = key.split('X');
        if (typeof dimensions == "undefined" || dimensions.length != 2)return;
        var h = _.parseInt(dimensions[1]);
        var w = _.parseInt(dimensions[0]);
        var tileHeight = h + 27 + 48 + (2 * 10);
        var tileWidth = w + (2 * 35);
        $scope.totalShowing += data.length;
        var dataObj = {
          key: key,
          count: data.length,
          ads: data,
          isSelectAllOnLIveView: false,
          width: w,
          height: h,
          tileHeight: tileHeight,
          tileWidth: tileWidth > 145 ? tileWidth : 145,
          showZoomOptionsContainer: false,
          toggleZoomOptionsContainer: function () {
            this.showZoomOptionsContainer = !this.showZoomOptionsContainer;
          },
          calculateWidth: function () {
            return this.tileWidth - 178;
          }
        };
        $scope.adDimensionGroups.push(dataObj);
      });

    };

    function emailBody() {
      var newLine = '%0D%0A';
      var firstLine = '';
      var body = '';
      var shareCount = 0;
      var hasChecked = false;
      for (var index = 0; index < $scope.ads.length; index++) {
        if ($scope.ads[index].isChecked) {
          hasChecked = true;
          break;
        }
      }
      for (var index = 0; index < $scope.ads.length; index++) {
        if (!hasChecked || (hasChecked && $scope.ads[index].isChecked)) {
          shareCount++;
          body = body + 'Name: ' + $scope.ads[index].name + newLine + 'ID: ' + $scope.ads[index].id + newLine + 'Size: ' + $scope.ads[index].size + newLine + 'Type: ' + $scope.ads[index].type + newLine;
          if ($scope.ads[index].tags != undefined && $scope.ads[index].tags.length > 0) {
            body = body + '*' + newLine;
            for (var i = 0; i < $scope.ads[index].tags.length; i++) {
              body = body + $scope.ads[index].tags[i].tagName + newLine;
            }
          }
          body = body + '-------------' + newLine;
        }
      }
      firstLine = 'Sharing ' + shareCount + ' ads: ' + $rootScope.previewLink;
      return encodeURIComponent(firstLine) + newLine + newLine + body;
    };

    function prepareSytemTags() {
      for (var index = 0; index < $scope.tags.length; index++) {
        $scope.systemTags.push(getTag($scope.tags[index]));
      }
      $scope.showSpinner = false;
    };

    $scope.toggleAddTagContainer = function (ad) {

      $window.onclick = null;
      for(var i = 0; i < $scope.adDimensionGroups.length; i++ ) {
        for(var j = 0; j < $scope.adDimensionGroups[i].ads.length; j++ ) {
          $scope.adDimensionGroups[i].ads[j]['showAddTagContainer'] = false;
          $scope.adDimensionGroups[i].ads[j]['showAdDetailBoxOnLiveView'] = false;
          $scope.adDimensionGroups[i].ads[j]['showMoreAction'] = false;
        }
      }
      $scope.searchActionOnLiveView = false;
      ad.showAddTagContainer = !ad.showAddTagContainer;
      if (!ad.showAddTagContainer) return false;
      var tagIds = [];
      _.forEach($scope.ads, function (data, index) {
        if (data.id != ad.id)
          data.showAddTagContainer = false;
        else {
          tagIds = _.pluck(ad.tags, 'id');
        }
      });
      _.forEach($scope.systemTags, function (tag, index) {
        tag.isChecked = tagIds.indexOf(tag.id) == -1;
      });

      if ( ad['showAddTagContainer'] ) {
        $window.onclick = function (event) {
          ad['showAddTagContainer'] = false;
          $timeout(function(){
            $scope.$apply();
          });
        };
      }

    };

    function HighlightSelectedTags() {

    };

    $scope.loginCredentials = {password: ""};

    $scope.modalInstance = null;

    $scope.isModalAlreadyOpen = false;

    $scope.closeLoginModal = function () {
      if ($scope.modalInstance) $scope.modalInstance.close();
      $scope.isModalAlreadyOpen = false;
    };

    $scope.login = function () {
      $scope.shareInputPassword = $scope.loginCredentials.password;
      fetchShare();
    };

    $(window).on('scroll resize', function () {
      var header = $('.top-nav-bar');
      if ($(this).width() < header.data('min-width')) {
        header.css('left', -$(this).scrollLeft());
      } else {
        header.css('left', '');
      }
    });

    $timeout(function () {
      $('body').addClass('adds-pages-body');
    }, 100);

    function showLoginModal() {
      if ($scope.isModalAlreadyOpen)
        return false;
      $scope.modalInstance = $modal.open({
        templateUrl: './csbPreviewApp/views/login.html',
        backdrop: 'static',
        scope: $scope,
        windowClass: 'modalWidth protected-back'
      });
      $scope.isModalAlreadyOpen = true;
    }

    function gridActionClick(row, col, action) {

      var adItem = row.entity;
      if (action.field == 'playButton') {
        $scope.redirectToLiveView(adItem);
      } else if (action.field == 'testButton') {
        $scope.redirectToAdPreview(adItem.id);
      }
    }

    $scope.nextChunk = function () {
      //  optimization is required (load first 20 ads and then load the rest) → Get first 20 and when returned grab remaining items if > 20
      //	$scope.pageSize += 5;
      //	applyFiltersOnGridPage();
    };
    $scope.gridScrollHandler = function (gridId) {
      //	optimization is required (load first 20 ads and then load the rest) → Get first 20 and when returned grab remaining items if > 20
      //  $scope.nextChunk();
    }


  }
]).directive("scrollTop", function () {
  return function (scope, elem, attrs) {
    angular.element(document).ready(function () {
      window.scrollTo(0, 0);
    });
  }
  });