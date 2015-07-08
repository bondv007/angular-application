/**
 * Created by ahmad.alinat on 12/3/2014.
 */
'use strict';
app.service('findReplaceAdsInDGsService', ['mmAlertService', 'assetsLibraryService', '$filter', 'EC2Restangular', 'enums', 'dgHelper', '$rootScope', 'dgConstants',
  function (mmAlertService, assetsLibraryService, $filter, EC2Restangular, enums, dgHelper, $rootScope, dgConstants) {

    function initAdsGridColumns() {
      return [
        {field: 'id', displayName: $filter("translate")('Master Ad ID')},
        {field: 'name', displayName: $filter("translate")('Master Ad Name')},
        {field: 'dimensions', displayName: $filter("translate")('Dimensions')},
        {field: 'adFormat', displayName: $filter("translate")('Ad Format')}
      ];
    }

    function initDeliveryGroupsGridColumns() {
      return [
        {field: 'id', displayName: $filter("translate")('Delivery Group ID')},
        {field: 'name', displayName: $filter("translate")('Delivery Group Name')},
        {field: 'hierarchy', displayName: $filter("translate")('Hierarchy')},
        {field: 'rotation', displayName: $filter("translate")('Rotation Value')}
      ];
    }

    function getMasterAdById(ads, MasterAdId) {
      for (var i = 0; i < ads.length; i++) {
        if (ads[i].id == MasterAdId)
          return ads[i];
      }
      return -1;
    }

    function validateBeforeSwap(selectedItemsSwapAd, selectedItemsWithAd, selectedItemsInDG) {
      return (
      selectedItemsSwapAd.length == 1 && selectedItemsWithAd.length == 1 && selectedItemsInDG.length >= 1 &&
      selectedItemsSwapAd[0].id != selectedItemsWithAd[0].id
      );

    }

    function fillAdsGrids(AllAds, ads, exceptAd) {

      var SwapAdItems = [];
      var WithAdItems = [];

      if (ads.length > 0) {
        for (var i = 0; i < ads.length; i++) {
          var ad = {};
          ad.id = ads[i].id;
          ad.name = ads[i].name;
          ad.adFormat = dgHelper.getUiAdFormat(ads[i].adFormat);
          ad.dimensions = assetsLibraryService.getAssetDimension(ads[i].defaultImage);
          ad.defaultImage = ads[i].defaultImage;
          SwapAdItems.push(ad);
        }
      }
      if (AllAds.length > 0) {
        for (var i = 0; i < AllAds.length; i++) {
          var ad = {};
          ad.id = AllAds[i].id;
          ad.name = AllAds[i].name;
          ad.adFormat = dgHelper.getUiAdFormat(AllAds[i].adFormat);
          ad.dimensions = assetsLibraryService.getAssetDimension(AllAds[i].defaultImage);
          ad.defaultImage = AllAds[i].defaultImage;
          if (exceptAd == null || exceptAd.id != ad.id)
            WithAdItems.push(ad);
        }
      }
      return {
        SwapAdItems: SwapAdItems,
        WithAdItems: WithAdItems
      }
    }

    function getDgs(dgs, ads, attachedDgs, attachedAds) {
      var deliveryGroupAds = [];
      findAllDgs(dgs, ads, attachedDgs, deliveryGroupAds, -1);
      for (var i = 0; i < deliveryGroupAds.length; i++) {
        if (!IsDuplicateAd(attachedAds, deliveryGroupAds[i].masterAdId)) {
          var ad = getMasterAdById(ads, deliveryGroupAds[i].masterAdId);
          if (ad != -1)
            attachedAds.push(ad);
        }
      }
    }

    function callFindAllDgs(dgs, ads, attachedDgs, deliveryGroupAds, DeliveryGroupId) {
      findAllDgs(dgs, ads, attachedDgs, deliveryGroupAds, DeliveryGroupId);
    }

    function IsAttachedDeliveryGroup(deliveryGroup) {
      if (deliveryGroup.type == "AdContainer")
        return deliveryGroup.subContainers.length > 0;
      else if (deliveryGroup.type == "DeliveryGroup")
        return deliveryGroup.rootContainer.subContainers.length > 0;

      return false;
    }

    function isAttachedAd(obj) {
      return (typeof(obj.subContainers) == "undefined" || obj.subContainers.length == 0) && obj.type == "DeliveryGroupAd";
    }

    function IsDuplicateAd(attachedAds, masterAdId) {

      return $filter('filter')(attachedAds, {id: masterAdId}).length > 0;
    }

    function IsDuplicatedDeliveryGroup(attachedDgs, dg) {
      return $filter('filter')(attachedDgs, {id: dg.id}).length > 0;
    }

    function findAllDgs(dgs, ads, attachedDgs, deliveryGroupAds, DeliveryGroupId) {

      for (var i = 0; i < dgs.length; i++) {
        if (dgs[i].rootContainer) {
          var dg = fillDgObject(dgs[i]);
          if (!IsDuplicatedDeliveryGroup(attachedDgs, dg) && IsAttachedDeliveryGroup(dg))
            attachedDgs.push(dg);
          callFindAllDgs(dgs[i].rootContainer.subContainers, ads, attachedDgs, deliveryGroupAds, dgs[i].id);
        }
        else {
          if (!isAttachedAd(dgs[i])) {
            if (IsAttachedDeliveryGroup(dgs[i])) {
              var dg = fillDgObject(dgs[i]);
              dg.containerId = DeliveryGroupId;
              if (!IsDuplicatedDeliveryGroup(attachedDgs, dg))
                attachedDgs.push(dg);
              callFindAllDgs(dgs[i].subContainers, ads, attachedDgs, deliveryGroupAds, dgs[i].id);
            }
          }
          else {
            if (dgs[i].type == "DeliveryGroupAd") {
              deliveryGroupAds.push(dgs[i]);
            }
          }
        }
      }
    }

    function callFindAdDgs(dgs, ad, attachedDgs, DeliveryGroupId, dgName) {
      findAdDgs(dgs, ad, attachedDgs, DeliveryGroupId, dgName);
    }

    function IsDeliveryGroupHasAd(subContainers, ad) {

      if (subContainers.length > 0) {
        for (var i = 0; i < subContainers.length; i++) {
          if (subContainers[i].type == "DeliveryGroupAd" && subContainers[i].masterAdId == ad.id) {
            return true;
          }
        }
      }
      return false;
    }

    function findAdDgs(dgs, ad, attachedDgs, DeliveryGroupId, dgName) {
      for (var i = 0; i < dgs.length; i++) {
        if (typeof(dgs[i].rootContainer) != "undefined") {
          if (IsAttachedDeliveryGroup(dgs[i])) {
            var dg = fillDgObject(dgs[i]);
            if (!IsDuplicatedDeliveryGroup(attachedDgs, dg))
              if (IsDeliveryGroupHasAd(dgs[i].rootContainer.subContainers, ad))
                attachedDgs.push(dg);
          }
          callFindAdDgs(dgs[i].rootContainer.subContainers, ad, attachedDgs, dgs[i].id, dgs[i].name);
        } else {
          if (IsAttachedDeliveryGroup(dgs[i])) {
            var dg = fillDgObject(dgs[i]);
            dg.containerId = dgs[i].id;
            dg.id = DeliveryGroupId;
            dg.name = dgName;
            if (!IsDuplicatedDeliveryGroup(attachedDgs, dg))
              if (IsDeliveryGroupHasAd(dgs[i].subContainers, ad) && DeliveryGroupId != -1)
                attachedDgs.push(dg);
            callFindAdDgs(dgs[i].subContainers, ad, attachedDgs, dgs[i].id, dgs[i].name);
          }
        }
      }
    }

    function fillAdObject(Ad) {
      var ad = [];
      ad = Ad;
      return ad;
    }

    function fillDgObject(deliveryGroup) {
      var dg = [];
      dg = deliveryGroup;
      return dg;
    }

    function filterAttachedAds(ads, dgs) {
      var attachedAds = [];
      var attachedDGs = [];
      getDgs(dgs, ads, attachedDGs, attachedAds);
      return {
        attachedAds: attachedAds,
        attachedDGs: attachedDGs
      }
    }

    function swapAdsInDGS(masterAdIdToReplace, masterAdIdToSet, dgs, $modalInstance) {
      var dgsParam = [];
      for (var i = 0; i < dgs.length; i++) {
        var p = {
          type: "APIDeliveryGroupReplacementData",
          deliveryGroupId: dgs[i].id,
          containerId: typeof(dgs[i].containerId) == "undefined" ? "" : dgs[i].containerId
        };
        dgsParam.push(p);
      }
      var params = [
        {
          type: "SearchAndReplaceAdsInDGRequest",
          masterAdIdToReplace: masterAdIdToReplace,
          masterAdIdToSet: masterAdIdToSet,
          replacementData: dgsParam
        }
      ];
      var service = EC2Restangular.all('deliveryGroups/searchAndReplaceAds');
      service.customPUT(params).then(function (dgs) {
        $rootScope.$broadcast(dgConstants.dgBroadcastAction.replaceAdsInDgs, dgs);
        mmAlertService.addSuccess($filter("translate")("ads has been replaced successfully."));
        $modalInstance.close();
      }, function (error) {
        if (error.data.error === undefined) {
          mmAlertService.addError($filter("translate")("Server error. Please try again later"));
          return false;
        } else {
          mmAlertService.addError(error.data.error);
          return false;
        }
      });
    }

    function validateBeforeSave(selectedSwapAd, selectedWithAd, selectedDGs) {
      return selectedSwapAd.length == 1 && selectedWithAd.length == 1 && selectedDGs.length > 0;
    }

    function fillDeliveryGroupsGrid(dgs) {
      var InDGItems = [];
      if (dgs.length > 0) {
        for (var i = 0; i < dgs.length; i++) {
          var dg = {};
          dg.id = dgs[i].id;
          dg.name = dgs[i].name;
          if (typeof (dgs[i].rootContainer) == "undefined") {
            dg.hierarchy = "Subgroup";
            dg.containerId = dgs[i].containerId;
            dg.rotation = dgs[i].rotationSetting.weight;
          } else {
            dg.hierarchy = "Root";
            dg.rotation = dgs[i].rootContainer.subContainers.length > 0 ? dgs[i].rootContainer.subContainers[0].rotationSetting.weight : "--";
          }

          InDGItems.push(dg);
        }
      }
      return InDGItems;
    }

    function filterDgsAttachedToAd(dgs, Withad) {
      var adDgs = [];
      findAdDgs(dgs, Withad, adDgs, -1);
      return adDgs;
    }

    return {
      initAdsGridColumns: initAdsGridColumns,
      initDeliveryGroupsGridColumns: initDeliveryGroupsGridColumns,
      getMasterAdById: getMasterAdById,
      fillDeliveryGroupsGrid: fillDeliveryGroupsGrid,
      fillAdsGrids: fillAdsGrids,
      filterAttachedAds: filterAttachedAds,
      validateBeforeSwap: validateBeforeSwap,
      swapAdsInDGS: swapAdsInDGS,
      IsDuplicateAd: IsDuplicateAd,
      validateBeforeSave: validateBeforeSave,
      filterDgsAttachedToAd: filterDgsAttachedToAd
    }
  }]);
