/**
 * Created by roi.levy on 11/24/14.
 */
'use strict';
/**
 * Created by eran.nachum on 2/13/14.
 */

app.service('creativeJsonObjects', ['enums', 'creativeConsts', '$stateParams', 'mmUtils', 'assetsLibraryService','inStreamTemplatesJson',
  function (enums, creativeConsts, $stateParams, mmUtils, assetsLibraryService, inStreamTemplatesJson) {

    var createNewAd = function (adFormatId, accountId) {
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
        "size": asset.formatContext.fileSize,
        "duration": asset.formatContext.duration,
        "mediaType": asset.mediaType,
        "dimensions": asset.dimension ? asset.dimension : assetsLibraryService.getAssetDimension(asset),
        "thumbnailUrl": thumbnail,
        "archiveManifest": asset.archiveManifest,
        "width": asset.width,
        "height": asset.height,
        "parsedFileSize": assetsLibraryService.parseSizeFromBytes(asset.formatContext.fileSize)
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
            ad.duration = asset.formatContext.duration;
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

    function setTemplateData(ad){
      if(ad && !ad.templateData) {
        ad.templateData = inStreamTemplatesJson.createTemplateData();
        ad.templateData.vastVariables.push(
          {
            type: "VastVariable",
            name: "standardAdRemaining",
            value: false
          });
      }
    }


    return {
      createNewAd: createNewAd,
      createAdAssetFromAsset: createAdAssetFromAsset,
      createPanelFromAsset: createPanelFromAsset,
      createInStreamAdFromAsset: createInStreamAdFromAsset,
      setTemplateData: setTemplateData
    }
  }]);
