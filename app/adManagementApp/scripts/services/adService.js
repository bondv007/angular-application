'use strict';
/**
 * Created by eran.nachum on 2/13/14.
 */

app.service('adService', ['EC2Restangular', 'EC2AMSRestangular', '$q', 'enums', 'creativeConsts', 'mmModal', '$state', '$stateParams', 'mmUtils', 'configuration', 'mmAlertService', 'assetsLibraryService',
  function (EC2Restangular, EC2AMSRestangular, $q, enums, creativeConsts, mmModal, $state, $stateParams, mmUtils, configuration, mmAlertService, assetsLibraryService) {
    var serverCampaigns = EC2Restangular.all('campaigns');
    var serverAccounts = EC2Restangular.all('accounts/global');
    var serverSearchAssets = EC2AMSRestangular.all('assetMgmt/search');
    var serverGetFolders = EC2Restangular.all('assetMgmt/folders');
    var positionType = ['Banner Relative(px)', 'Page Relative(%)', 'Page Relative(px)'];
    var retraction = ['Never', 'Mouse off Ad', 'Mouse off Panel'];
    var adDimensions = ['300X250', '160X600', '336X850', '400X400'];
    //all sizes in bytes
    var maxDefaultImageSize = 112640;
    var maxStandardBannerSize = 112640;
    var maxPoliteBannerSize = 10526720;
    var maxPolitePreLoadBannerSize = 112640;
    var maxExpandableBannerSize = 10526720;
    var maxExpandablePanelSize = 10526720;
    var maxAdditionalAssetsSize = 10526720;
    var defaultImageFormatType = [
      {"type": "JPG"},
      {"type": "JPEG"},
      {"type": "GIF "},
      {"type": "PNG" }
    ]
    var bannerFormatType = [
      {"type": "SWF", "version": 8}
    ]
    var preloadBannerFormatType = [
      {"type": "SWF", "version": 8}
    ]
    var panelFormatType = [
      {"type": "SWF", "version": 8}
    ]
    var requiredFormatsByAdType = {"STANDARD_BANNER_AD": ['defaultImage'],
      "EXPANDABLE_BANNER_AD": ['defaultImage', 'banner'],
      "SINGLE_EXPANDABLE_BANNER_AD": ['defaultImage', 'banner'],
      "PUSHDOWN_BANNER_AD": ['defaultImage', 'banner'],
      "ENHANCED_STANDARD_BANNER_AD": ['defaultImage'],
      "RICH_MEDIA_BANNER_AD": ['defaultImage'],
      "FLOATING_AD": ['banner'],
      "HTML5_RICH_MEDIA_BANNER_AD": ['defaultImage', 'html5'],
      "HTML5_EXPANDABLE_BANNER_AD": ['defaultImage', 'html5'],
      "HTML5_SINGLE_EXPANDABLE_BANNER_AD": ['defaultImage', 'html5']};
    var inStreamType = ["INSTREAM_AD", "INSTREAM_INTERACTIVE_AD", "INSTREAM_ENHANCED_AD"];

    var adServiceUrl = "ads";
    var assetServiceUrl = 'ads/assets';
    var postAssetMetaDataUrl = 'FE_FEMediaPrep/updateMetadataByCorrelationId/';

    var multipleTypeSupport = [
      {type: 'panel', property: 'assetId', values: ['name']},
      {type: 'additionalAsset', property: 'assetId', values: ['name']}
    ];

    var createAdListFilter = function (adType, campaignId, masterAdId) {
      var filterArr = [];
      if (campaignId) {
        filterArr.push({key: 'campaignId', value: campaignId});
      }
      filterArr.push({key: 'adType', value: adType});
      return filterArr;
    }

    var createFolderFromAsset = function (asset, type) {
      var deferred = $q.defer();
      if(!asset.id) {
        getFolderData(asset).then(function (response) {
          var folderAssets = {
            "type": type || 'AdAssetFolder',
            "assetName": response.name,
            "assetId": response.id
          };
          getAllHtml5assets(folderAssets.assetId).then(function (response) {
            folderAssets.archiveManifest = response;
            deferred.resolve(folderAssets);
          });
        }, function (error) {
        mmAlertService.addError('Unable to retrieve assets.');
        deferred.reject(error);
      });
      }
     else {
        var folderAssets = {
          "type": type || 'AdAssetFolder',
          "assetName": asset.text,
          "assetId": asset.id
        }
        deferred.resolve(folderAssets);
      }
    return deferred.promise;
    }
    var createAdAssetFromAsset = function (asset, type) {
      if (!asset) {
        return null;
      }

      var type = type || "AdAsset";
      var thumbnail = '';
      if (asset.mediaType === creativeConsts.mediaType.image || asset.mediaType === creativeConsts.mediaType.archive) {
        thumbnail = asset.thumbnails[0].url;
      }
      return{
        "type": type,
        "id": "",
        "assetId": asset.id,
        "assetName": asset.assetCode,
        "size": asset.formatContext ? asset.formatContext.fileSize : '',
        "duration": asset.formatContext ? asset.formatContext.duration : '',
        "mediaType": asset.mediaType,
        "dimensions": asset.dimension ? asset.dimension :  assetsLibraryService.getAssetDimension(asset),
        "thumbnailUrl": thumbnail,
        "archiveManifest": asset.archiveManifest,
        "width": asset.width,
        "height": asset.height,
        "parsedFileSize": asset.formatContext ? assetsLibraryService.parseSizeFromBytes(asset.formatContext.fileSize): ''
      }
    }
    var calculateOnlyMaxSizeOfList = function (ad, list, priceAssetArr, overallSizeAssetArr) {
      if (list && list.length > 0) {
        var max = 0;
        var asset = {};
        for (var i = list.length - 1; i >= 0; i--) {
          var size = list[i].size ? list[i].size : list[i].formatContext && list[i].formatContext.fileSize ? list[i].formatContext.fileSize : 0; //support also folders.
          if (size) {
            if (max < size) {
              max = size
              asset = list[i];
            }
            calculateSize(ad, list[i], false, priceAssetArr, overallSizeAssetArr);
          }
        }
        ;
        if (max > 0) {
          calculateSize(ad, asset, true, priceAssetArr, overallSizeAssetArr);
        }
      }
    }

    var calculateSize = function (ad, assetNew, calcPriceSize, priceAssetArr, overallSizeAssetArr) {
      if (assetNew && assetNew.assetId !== '') {
        if (calcPriceSize && priceAssetArr.indexOf(assetNew.assetId) == -1) {
          ad.pricingSize += assetNew.formatContext ? assetNew.formatContext.fileSize : assetNew.size;
          priceAssetArr.push(assetNew.assetId);
        }
        if (overallSizeAssetArr.indexOf(assetNew.assetId) == -1) {
          ad.overallSize += assetNew.formatContext ? assetNew.formatContext.fileSize : assetNew.size;
        }
        overallSizeAssetArr.push(assetNew.assetId);
      }
    }

    var createPanelFromAsset = function (asset) {
      var panel = createAdAssetFromAsset(asset, "Panel");
      if (panel) {
        panel.name = '';
        panel.defaultPanel = false;
        panel.positionX = 0;
        panel.positionY = 0;
        panel.positionType = "BANNER_RELATIVE";
        panel.autoExpand = false;
        panel.delayedExpansion = false;
        panel.retraction = "NEVER";
        panel.transparent = true;
        panel.isNew = true;
      }
      return panel;
    }
    var createInStreamAdFromAsset = function (asset, type) {
      var ad = createAdAssetFromAsset(asset, type);
      switch (type) {
        case "Linear":
          if (ad) {
            ad.vpaid = asset.swfContext ? true : false;
            ad.duration = asset.formatContext ? asset.formatContext.duration : '';
          }

          break;
        case "NonLinear":
          break;
        case "Companion":
          break;
        case "AdvancedCompanion":
          break;
      }
      return ad;
    }
    var sendAdToQA = function (scope, selectedItems) {

      if (scope.isModalOpen) {
        return;
      }

      if (!selectedItems || selectedItems.length == 0) {
        mmAlertService.addError("No ads selected");
        return;
      }
      else {
        var foundCampaign = null;
        var isValid = true;
        for (var i = 0; i < selectedItems.length; i++) {
          var item = selectedItems[i];
          if (!foundCampaign) {
            if (item.campaignId) {
              foundCampaign = item.campaignId;
            }
            else {
              foundCampaign = 0;
            }
          }
          else if ((item.campaignId && foundCampaign != item.campaignId) || (!item.campaignId && foundCampaign != 0)) {
            mmAlertService.addError("Its possible to send multiple ads just from same campaign");
            isValid = false;
            return;
          }
        }
      }
      if (!isValid) {
        return
      }
      scope.selectedItems = selectedItems;
      scope.isModalOpen = true;

      var modalInstance = mmModal.open({
        templateUrl: './adManagementApp/views/submitAdsToQA.html',
        controller: 'submitAdsToQACtrl',
        title: "Submit Ads to QA",
        //smallTitle: "Master Ad ID: " + $stateParams.adId,ad
        modalWidth: 950,
        bodyHeight: 500,
        confirmButton: { name: "Submit", funcName: "submit", hide: false, isPrimary: true},
        discardButton: { name: "Cancel", funcName: "cancel" },
        resolve: {
          ads: function () {
            return  [scope.selectedItems];
          }
        }
      });

      modalInstance.result.then(function (ad) {
        scope.isModalOpen = false;
        //TODO - refresh
      }, function () {
        scope.isModalOpen = false;
      });

    }

    var duplicateAds = function (adIds) {
      var deferred = $q.defer();

      if (!adIds || adIds.length < 1) {
        deferred.reject("No ads selected");
      }
      else {
        EC2Restangular.all('ads/duplicate').post(adIds).then(function (response) {
              deferred.resolve(response);
            },
            function (error) {
              deferred.reject(error);
            });
      }
      return deferred.promise;
    }
    var gotoFactory = function (accountId, userId, lanuguage, ads) {
      var mdxNxt = '?Mdx-next=true';
      var accountId = '&AccountId=' + accountId;
      var userId = '&UserId=' + userId;
      var lanuguage = '&lang=' + lanuguage;
      var params = [
        'height=' + screen.height,
        'width=' + screen.width,
        'directories=no',
        'titlebar=no',
        'toolbar=no',
        'location=no',
        'status=no',
        'menubar=no',
        'fullscreen=yes' // only works in IE, but here for completeness
      ].join(',');
      var url = '/HTML5Factory/';
      if (ads && ads.length > 0) {
        var adIds = '&AdId=' + _.pluck(ads, 'id');
        url = url + mdxNxt + accountId + userId + lanuguage + adIds;
      }
      else {
        url = url + mdxNxt + accountId + userId + lanuguage;
      }
      var win = window.open(url, '', params);
      win.focus();
    };

    var getAllHtml5assets = function (folderId) {
      var deferred = $q.defer();
      var pageSearchBody = {
        "searchText": "*",
        "page": 1,
        "itemsPerPage": 100,
        "indexVersion": 1,
        "assetType": "source",
        "currentVersion": true,
        "fieldTerms": {"mediaType": ["all"], "businessMetadata.folderId": [folderId]},
        "folderRecursion": true
      };
      serverSearchAssets.post(pageSearchBody).then(function (data) {
        var folderAssets = [];
        if (data.entity != null) {
          for (var k = 0; k < data.entity.length; k++) {
            assetsLibraryService.extendAssetProperties(data.entity[k]);
            folderAssets.push({assetId: data.entity[k].assetId,
              name: data.entity[k].fileName,
              thumbnail: data.entity[k].thumbnail,
              dimensions: data.entity[k].dimensions,
              parsedFileSize: data.entity[k].displayFileSize,
              formatContext: {fileSize: data.entity[k].formatContext.fileSize}});
          }
        }
        deferred.resolve(folderAssets);
      }, function (error) {
        mmAlertService.addError('Unable to retrieve assets.');
        deferred.reject(error);
      });
      return deferred.promise;
    }
    var getFolderData = function(folderId){
      var deferred = $q.defer();
      serverGetFolders.get(folderId).then(function (folder) {
      deferred.resolve(folder);
    }, function (error) {
      mmAlertService.addError('Unable to retrieve folder.');
      deferred.reject(error);
    });
    return deferred.promise;
    }

    var validateAdsNameUnique = function(ads){
      var deferred = $q.defer();
      EC2Restangular.all('ads/validateAdNameUniqueness').post(ads).then(function (result) {
        deferred.resolve(result);
      }, function(errors){
        deferred.reject(errors.data.error);
      });
      return deferred.promise;
    }
    function addNewMasterAd() {
      $state.go('spa.ad.adEdit', {adId: '',adIds:'' });
    }

    function changeView(view) {
      $state.go(view.ref, {adId: $state.params.adId});
    }

    function func1() {
      alert('To Do');
    }

    function deleteAds(ads) {
      var adIds = [];
      for (var i = 0; i < ads.length; i++) {
       adIds.push(ads[i].id);
       }
      return deleteAdIDs(adIds);
    }

    function deleteAdIDs(adIds) {
      var deferred = $q.defer();
      EC2Restangular.all(adServiceUrl).customPOST(adIds, 'delete').then(function (ads) {
        deferred.resolve(ads);
      }, function (response) {
        deferred.reject(response);
      });
      return deferred.promise;
    }
    return {

      getAds: function () {
        var deferred = $q.defer();
        var serverEntity = EC2Restangular.all(metaData.restPath);
        return EC2Restangular.all(adServiceUrl).getList().then(function (all) {
          deferred.resolve(all);
        }, function (response) {
          deferred.reject(response);
        });
        return deferred.promise;
      },
      getAdById: function (id) {
        var deferred = $q.defer();
        EC2Restangular.one(adServiceUrl, id).get().then(function (ad) {

          deferred.resolve(ad);
        }, function (response) {
          deferred.reject(response);
        });
        return deferred.promise;
      },
      saveAd: function (ad) {
        var deferred = $q.defer();
        EC2Restangular.all(adServiceUrl).post(ad).then(function (data) {
              deferred.resolve(ad);
            },
            function (response) {
              deferred.reject(response);
            });
        return deferred.promise;
      },
      deleteAds: deleteAds,
      deleteAdIDs: deleteAdIDs,
      duplicateAds: duplicateAds,
      getAssets: function () {
        var deferred = $q.defer();
        EC2Restangular.all(assetServiceUrl).getList().then(function (all) {
          deferred.resolve(all);
        }, function (response) {
          deferred.reject(response);
        });
        return deferred.promise;
      },
      getAssetById: function (id) {
        var deferred = $q.defer();
        EC2Restangular.one(assetServiceUrl, id).get().then(function (asset) {

          deferred.resolve(asset);
        }, function (response) {
          deferred.reject(response);
        });
        return deferred.promise;
      },
      saveAsset: function (asset) {
        var deferred = $q.defer();
        EC2Restangular.all(assetServiceUrl).post(asset).then(function (data) {
              deferred.resolve(asset);
            },
            function (response) {
              deferred.reject(response);
            });
        return deferred.promise;
      },
      deleteAsset: function (asset) {
        var deferred = $q.defer();
        EC2Restangular.one(assetServiceUrl, asset.id).remove().then(function () {
          deferred.resolve(asset);
        }, function (response) {
          deferred.reject(response);
        });
        return deferred.promise;
      },
      getMaxDefaultImageSize: function () {
        return maxDefaultImageSize
      },
      getMaxStandardBannerSize: function () {
        return maxStandardBannerSize
      },
      getMaxPoliteBannerSize: function () {
        return maxPoliteBannerSize
      },
      getMaxPolitePreLoadBannerSize: function () {
        return maxPolitePreLoadBannerSize
      },
      getMaxExpandableBannerSize: function () {
        return maxExpandableBannerSize
      },
      getMaxExpandablePanelSize: function () {
        return maxExpandablePanelSize
      },
      getMaxAdditionalAssetsSize: function () {
        return maxAdditionalAssetsSize
      },
      getDefaultImageFormatType: function () {
        return defaultImageFormatType
      },
      getBannerFormatType: function () {
        return bannerFormatType
      },
      getPreloadBannerFormatType: function () {
        return preloadBannerFormatType
      },
      getPanelFormatType: function () {
        return panelFormatType;
      },
      getRequiredFormatsByAdType: function () {
        return requiredFormatsByAdType;
      },
      getInStreamType: function () {
        return inStreamType;
      },
      getselectTrueFalseListdataArray: function () {
        return selectTrueFalseListdataArray;
      },
      createNewAd: function (adFormatId, accountId) {
        var adFormat = enums.adFormats.getObject(adFormatId);
        var campaignId = "";
        if ($stateParams.campaignId) {
          campaignId = $stateParams.campaignId;
        }
        var newAd = {
          "type": adFormat.type,
          "id": "",
          "name": "",
          "masterAdId": "",
          "isChanged": false,
          "adStatus": "NEW",
          "adFormat": adFormatId,
          "accountId": accountId,
          "advertiserId": "",
          "campaignId": campaignId,
          "placementId": null,
          "createdBy": null,
          "createdOn": null,
          "lastUpdateBy": null,
          "lastUpdateOn": null,
          "overallSize": null,
          "pricingSize": null,
          "downloadMode": null,
          "mainClickthrough": {
            "type": "MainClickthrough",
            "url": "",
            "targetWindowType": "NEW",
            "showAddressBar": true,
            "showMenuBar": true,
            "closeAllAdParts": false
          },
          "defaultImage": {
            "type": "AdAsset",
            "assetId": ""
          },
          "defaultImageClickthrough": {
            "type": "MainClickthrough",
            "url": "",
            "targetWindowType": "NEW",
            "showAddressBar": true,
            "showMenuBar": true,
            "closeAllAdParts": false
          },
          "banner": null,
          "tooltip": "",
          "changed": false,
          "panelsAppearance": true,
          "preloadPanels": false,
          "videoStartOn": "userStart",
          "preloadBanner": null,
          "panels": [],
          "additionalAssets": [],
          "customInteractions": []
        };

        mmUtils.clientIdGenerator.populateEntity(newAd);
        return newAd;
      },
      createFolderFromAsset: createFolderFromAsset,
      createAdAssetFromAsset: createAdAssetFromAsset,
      createPanelFromAsset: createPanelFromAsset,
      createInStreamAdFromAsset: createInStreamAdFromAsset,
      calculateSize: calculateSize,
      calculateOnlyMaxSizeOfList: calculateOnlyMaxSizeOfList,
      fillFormat: function (ad) {
        var format = _.findWhere(enums.adFormats, {'id': ad.adFormat});
        ad.adFormatName = format ? format.name : console.log('Format ' + ad.adFormat + ' Not Found'), '';
      },
      fillStatus: function (ad) {
        var status = _.findWhere(enums.adStatuses, {'id': ad.adStatus});
        ad.adStatusName = status ? status.name : console.log('Status ' + ad.adStatus + ' Not Found'), '';
      },
      fillAccount: function (ad, ads) {
        if (ad.accountId && !ad.accountName) {
          serverAccounts.get(ad.accountId).then(function (account) {
            var filteredAds = _.filter(ads, {'accountId': account.id});
            if (filteredAds) {
              _.each(filteredAds, function (item) {
                item.accountName = account.name
              })
            }
          }, {})
        }
      },
      fillCampaign: function (ad, ads) {
        if (ad.campaignId && !ad.campaignName) {
          serverCampaigns.get(ad.campaignId).then(function (campaign) {
            var filteredAds = _.filter(ads, {'campaignId': campaign.id});
            if (filteredAds) {
              _.each(filteredAds, function (item) {
                item.campaignName = campaign.name
              })
            }
          }, {})
        }
      },
      createAdListFilter: createAdListFilter,
      sendAdToQA: sendAdToQA,
      toggleAllExpansions: function (row, col, action, items) {
        var openPanelRow = _.findWhere(items, {showChild: true});
        if (openPanelRow === undefined) {
          //nothing opened
          row.entity.showChild = !row.entity.showChild;
        } else if (openPanelRow != undefined && row.entity.showChild) {
          row.entity.showChild = !row.entity.showChild;
        } else if (openPanelRow != undefined && !row.entity.showChild) {
          row.entity.showChild = !row.entity.showChild;
          openPanelRow.showChild = false;
        }
      },
      gotoFactory: gotoFactory,
      getAdDetailsForUpload: function (isSingleFileUpload, showSelectTab, selectedCreativeType, adFormat, campaignId) {
        var adDetailsForUpload = {};
        adDetailsForUpload['campaignId'] = campaignId;
        adDetailsForUpload['isSingleFileUpload'] = isSingleFileUpload;
        adDetailsForUpload['showSelectTab'] = showSelectTab;
        adDetailsForUpload['selectedCreativeType'] = selectedCreativeType;
        adDetailsForUpload['adFormat'] = adFormat;
        //adDetailsForUpload['showUploadTab'] = showUploadTab;
        return adDetailsForUpload;
      },
      getAllHtml5assets: getAllHtml5assets,
      validateAdsNameUnique: validateAdsNameUnique,
      addNewMasterAd: addNewMasterAd

    }
  }]);
