/**
 * Created by ahmad.alinat on 12/1/2014.
 */
'use strict';

app.controller('findReplaceAdsInDGCtrl', ['$scope', '$modalInstance',
  'adService', 'mmAlertService', 'ads', 'dgs', '$filter', 'findReplaceAdsInDGsService',
  function ($scope, $modalInstance, adService, mmAlertService, ads, dgs, $filter, findReplaceAdsInDGsService) {
    $scope.ads = ads;
    $scope.dgs = dgs;
    $scope.selectedItemsSwapAd = [];
    $scope.selectedItemsWithAd = [];
    $scope.selectedItemsInDG = [];
    $scope.filterToolTip = "You can filter your search criteria according to any of the columns, for example, ad name, ID, or dimensions";

    loadGrids();

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    function initGridsColumns() {
      $scope.AdColumns = findReplaceAdsInDGsService.initAdsGridColumns();
      $scope.DGColumns = findReplaceAdsInDGsService.initDeliveryGroupsGridColumns();
    }

    function adExists(ads, id) {
      return $filter('filter')(ads, {id: id}).length > 0;
    }

    function reloadGrids(exceptAd) {
      if (adExists($scope.WithAdItems, $scope.selectedItemsSwapAd[0].id)) {
        var items = findReplaceAdsInDGsService.fillAdsGrids($scope.ads, $scope.SwapAdItems, exceptAd);
        $scope.WithAdItems = items.WithAdItems;
      }
    }

    function findAdContainerId(DGContainerId, AdId) {
      var id = "";
      var subGroups = [];
      for (var i = 0; i < $scope.attachedDGs.length; i++) {
        if (typeof($scope.attachedDGs[i].rootContainer) == "undefined")
          subGroups.push($scope.attachedDGs[i]);
      }
      var dgs = $filter('filter')(subGroups, {containerId: DGContainerId});
      var ids = $filter('filter')(dgs[0].subContainers, {masterAdId: AdId});
      if (ids.length > 0) {
        return ids[0].id;
      }
      return id;
    }

    function loadGrids() {
      $scope.SwapAdItems = [];
      $scope.WithAdItems = [];
      $scope.InDGItems = [];
      initGridsColumns();
      var attachedItems = findReplaceAdsInDGsService.filterAttachedAds($scope.ads, $scope.dgs);
      var items = findReplaceAdsInDGsService.fillAdsGrids($scope.ads, attachedItems.attachedAds, null);
      $scope.SwapAdItems = items.SwapAdItems;
      $scope.WithAdItems = items.WithAdItems;
      $scope.attachedDGs = attachedItems.attachedDGs;
    }

    $scope.swap = function () {
      if (!findReplaceAdsInDGsService.validateBeforeSave($scope.selectedItemsSwapAd, $scope.selectedItemsWithAd, $scope.selectedItemsInDG)) {
        mmAlertService.addError("At least one delivery group must be selected.");
        return false;
      }
      var dgs = [];
      for (var i = 0; i < $scope.selectedItemsInDG.length; i++) {
        if ($scope.selectedItemsInDG[i].hierarchy == "Subgroup") {
          var dg = {
            id: $scope.selectedItemsInDG[i].id,
            containerId: findAdContainerId($scope.selectedItemsInDG[i].containerId, $scope.selectedItemsSwapAd[0].id)
          };
        } else {
          var dg = {
            id: $scope.selectedItemsInDG[i].id,
            containerId: ""
          };
        }

        dgs.push(dg);
      }
      findReplaceAdsInDGsService.swapAdsInDGS($scope.selectedItemsSwapAd[0].id, $scope.selectedItemsWithAd[0].id, dgs, $modalInstance);
    }

    function onClickStep2() {
      if ($scope.selectedItemsSwapAd.length == 0) {
        mmAlertService.addError("Please select a master ad.");
        return false;
      }
      mmAlertService.closeError();
      reloadGrids($scope.selectedItemsSwapAd[0]);
      return true;
    }

    function onClickStep3() {
      if ($scope.selectedItemsSwapAd.length == 0 || $scope.selectedItemsWithAd.length == 0) {
        mmAlertService.addError("Please select the master ads that you want to replace.");
        return false;
      }
      mmAlertService.closeError();
      $scope.swapad = $scope.selectedItemsSwapAd[0].name;
      $scope.withad = $scope.selectedItemsWithAd[0].name;
      var dgs = findReplaceAdsInDGsService.filterDgsAttachedToAd($scope.dgs, $scope.selectedItemsSwapAd[0]);
      if ($scope.InDGItems.length == 0) {
        $scope.InDGItems = findReplaceAdsInDGsService.fillDeliveryGroupsGrid(dgs);
      }

      return true;
    }

    var selectedItemsSwapAdWatcher = $scope.$watch('selectedItemsSwapAd.length', function (newValue, oldValue) {
      if (newValue != oldValue) {
        $scope.wizardSteps[0].next = {disable: null};
        $scope.wizardSteps[0].next.disable = newValue < 1;
      }
    });

    var selectedItemsWithAdWatcher = $scope.$watch('selectedItemsWithAd.length', function (newValue, oldValue) {
      if (newValue != oldValue) {
        $scope.wizardSteps[1].next.disable = newValue < 1;
      }
    });

    var selectedItemsWithAdWatcher = $scope.$watch('selectedItemsInDG.length', function (newValue, oldValue) {
      if (newValue != oldValue) {
        $scope.wizardSteps[2].done.disable = newValue < 1;
      }
    });

    $scope.wizardSteps = [
      {
        text: "Replace Delivery Group Master Ad",
        templatePath: "campaignManagementApp/views/deliveryGroup/SwapAdsInDG/SwapAd.html",
        next: {
          onClick: onClickStep2,
          disable:true
        },
        cancel: {
          onClick: $scope.cancel
        }
      },
      {
        text: "With Campaign Master Ad",
        onClick: onClickStep2,
        next: {
          onClick: onClickStep3,
          disable:true
        },
        templatePath: "campaignManagementApp/views/deliveryGroup/SwapAdsInDG/WithAd.html",
        cancel: {
          onClick: $scope.cancel
        }
      },
      {
        text: "In Delivery Groups",
        onClick: onClickStep3,
        templatePath: "campaignManagementApp/views/deliveryGroup/SwapAdsInDG/InDG.html",
        cancel: {
          onClick: $scope.cancel
        },
        done: {
          name: "Replace",
          onClick: $scope.swap,
          disable:true
        }
      }
    ];

    $scope.$on("$destroy", function () {
      if (selectedItemsSwapAdWatcher) {
        selectedItemsSwapAdWatcher();
      }
      if (selectedItemsWithAdWatcher) {
        selectedItemsWithAdWatcher();
      }
    });
  }]);
