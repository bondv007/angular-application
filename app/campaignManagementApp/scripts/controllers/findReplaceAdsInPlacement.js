/**
 * Created by ahmad.alinat on 12/3/2014.
 */
'use strict';

app.controller('findReplaceAdsInPlacementCtrl', ['$scope', '$modalInstance',
  'assetsLibraryService', 'mmAlertService', 'ads', 'placements', '$filter', 'findReplaceAdsInDGsService', 'findReplaceAdsInPlacementService', 'placementsAds', 'enums',
  function ($scope, $modalInstance, assetsLibraryService, mmAlertService, ads, placements, $filter, findReplaceAdsInDGsService, findReplaceAdsInPlacementService, placementsAds, enums) {

    $scope.ads = ads;
    $scope.placements = placements;
    $scope.placementsAds = placementsAds;
    $scope.selectedItemsSwapAd = [];
    $scope.selectedItemsWithAd = [];
    $scope.selectedItemsInPlacement = [];

    loadSwapAdGrid();
    function loadSwapAdGrid() {
      $scope.SwapAdItems = [];
      $scope.AdColumns = findReplaceAdsInDGsService.initAdsGridColumns();
      $scope.SwapAdItems = getAttachedAds();
    }

    function getAdFormatName(adFormat) {
      for (var i = 0; i < enums.adFormats.length; i++) {
        if (enums.adFormats[i].id == adFormat)
          return enums.adFormats[i].name;
      }
    }

    function getAttachedAds() {
      var attachedAds = [];
      for (var i = 0; i < $scope.ads.length; i++) {
        if ($filter('filter')($scope.placementsAds, {  masterAdId: $scope.ads[i].id}).length > 0)
          if ($filter('filter')(attachedAds, { masterAdId: $scope.ads[i].id}).length == 0) {
            var ad = {};
            ad.id = ads[i].id;
            ad.name = ads[i].name;
            ad.adFormat = getAdFormatName(ads[i].adFormat);
            ad.dimensions = assetsLibraryService.getAssetDimension(ads[i].defaultImage);
            ad.defaultImage = ads[i].defaultImage;
            attachedAds.push(ad);
          }
      }
      return attachedAds;
    }

    function getPlacements(swapAdId) {
      var nonEmptyPlacements = [];
      for (var i = 0; i < $scope.placements.length; i++) {
        var ads = $filter('filter')($scope.placementsAds, {placementId: $scope.placements[i].id});
        if (ads.length > 0) {
          if ($filter('filter')(ads, {masterAdId: swapAdId}).length > 0)
            if ($filter('filter')(nonEmptyPlacements, {placementId: $scope.placements[i].id}).length == 0) {
              var placement = {};
              placement.id = $scope.placements[i].id;
              placement.name = $scope.placements[i].name;
              console.log($scope.placements[i].bannerSize != "undefined");
              placement.dimensions = typeof($scope.placements[i].bannerSize) != "undefined" ? $scope.placements[i].bannerSize.width + "X" + $scope.placements[i].bannerSize.height : "";
              placement.placementType = $scope.placements[i].placementType;
              nonEmptyPlacements.push(placement);
            }
        }
      }
      return nonEmptyPlacements;
    }

    function loadWithAdGrid(exceptId) {
      $scope.WithAdItems = [];
      var withAds = [];
      for (var i = 0; i < $scope.ads.length; i++) {
        if ($scope.ads[i].id != exceptId) {
          var ad = {};
          ad.id = ads[i].id;
          ad.name = ads[i].name;
          ad.adFormat = getAdFormatName(ads[i].adFormat);
          ad.dimensions = assetsLibraryService.getAssetDimension(ads[i].defaultImage);
          ad.defaultImage = ads[i].defaultImage;
          withAds.push(ad);
        }

      }
      $scope.WithAdItems = withAds;
    }

    function loadPlacementsGrid(swapAdId) {
      $scope.InPlacementItems = [];
      $scope.PlacementColumns = findReplaceAdsInPlacementService.initPlacementGridColumns();
      $scope.InPlacementItems = findReplaceAdsInPlacementService.fillPlacementsGrid(getPlacements(swapAdId));
    }

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
    $scope.ReplaceAdsButtonClick = function () {
      if (!findReplaceAdsInPlacementService.validateBeforeSave(
          $scope.selectedItemsSwapAd, $scope.selectedItemsWithAd, $scope.selectedItemsInPlacement)) {
        mmAlertService.addError($filter("translate")("please fill all the required data"));
        return false;
      }
      var placements = [];
      for (var i = 0; i < $scope.selectedItemsInPlacement.length; i++) {
        var placement = {
          id: $scope.selectedItemsInPlacement[i].id,
          containerId: null
        };
        placements.push(placement);
      }
      findReplaceAdsInPlacementService.swapAdsInPlacements($scope.selectedItemsSwapAd[0].id, $scope.selectedItemsWithAd[0].id, placements,$modalInstance);
    }
    $scope.wizardSteps = [
      {
        text: $filter("translate")("Swap Ad"),
        templatePath: "campaignManagementApp/views/deliveryGroup/SwapAdsInDG/SwapAd.html",
        next: {
          onClick: function () {
            if ($scope.selectedItemsSwapAd.length == 0) {
              mmAlertService.addError($filter("translate")("please select master ad"));
              return false;
            }
            loadWithAdGrid($scope.selectedItemsSwapAd[0].id);
            return true;
          }
        },
        cancel: {
          onClick: $scope.cancel
        }
      },
      {
        text: $filter("translate")("With Ad"),
        next: {
          onClick: function () {
            if ($scope.selectedItemsSwapAd.length == 0 || $scope.selectedItemsWithAd.length == 0) {
              mmAlertService.addError($filter("translate")("please select master ads"));
              return false;
            }
            //display ad names in the third step
            $scope.swapad = $scope.selectedItemsSwapAd[0].name;
            $scope.withad = $scope.selectedItemsWithAd[0].name;

            loadPlacementsGrid($scope.selectedItemsSwapAd[0].id);
            return true;
          }
        },
        templatePath: "campaignManagementApp/views/deliveryGroup/SwapAdsInDG/WithAd.html",
        cancel: {
          onClick: $scope.cancel
        }
      },
      {
        text: $filter("translate")("In Placement"),
        onClick: function () {

          return true;
        },
        templatePath: "campaignManagementApp/views/placement/findReplace/InPlacement.html",
        cancel: {
          onClick: $scope.cancel
        },
        done: {
          name: $filter("translate")("Replace"),
          onClick: $scope.ReplaceAdsButtonClick
        }
      }
    ];

  }]);
