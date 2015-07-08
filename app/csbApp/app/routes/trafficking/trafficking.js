'use strict';
app.controller('trafficking', ['$scope', 'csb', 'decisionTreeService', 'panelFactory', 'segmentsFactory', 'appService',
  '$timeout', 'mmAlertService', '$translate', 'dgConstants', 'traffickingConst', 'strategies', 'traffickingService', '$state', '$filter',
  function ($scope, csb, decisionTreeService, panelFactory, segmentsFactory, appService, $timeout,
            mmAlertService, $translate, dgConstants, traffickingConst, strategies, traffickingService, $state, $filter) {
    // bind auth to entire view so I can use it anywhere
    $scope.dgs = [];
    $scope.isMM2 = traffickingService.isMM2();
    $scope.filter = {funnel: '', dgs: ''};
    $scope.appService = appService;
    $scope.csb = csb;
    $scope.activePage = traffickingConst.strTrafficking;
    $scope.masterAds = [];
    $scope.ads = {open: false};
    $scope.adDataObject = [
      {
        type: 'traffickingAd',
        centralActions: [],
        dataManipulator: setAds,
        isDraggable: true,
        hideAddButton: true,
        visibleColumns: [0, 1, 2, 5],
        filters: [
          {key: "adType", value: "MasterAd"}
        ]
      }
    ];
    $scope.funnelButtons = [
      {name: traffickingConst.strStrategy, display: !$scope.isMM2, func: openStrategy, id: "csb_strategy_button"},
      {name: traffickingConst.strReplaceAd, display: !$scope.isMM2, func: traffickingService.replaceAdsInDG, id: "csb_replace_ad_button"},
      {name: traffickingConst.strAssign, display: !$scope.isMM2, func: assignAdsToDgs, disable: true, id: "csb_assign_button"}
    ];
    $scope.funnel = {isTargetAudienceSelected: false};

    $translate.use('english').then(function () {
      $scope.currentLanguage = $translate.use();
    });

    function assignAdsToDgs() {
      var selectedMasterAds = $filter('filter')($scope.adDataObject[0].centralList, {isSelected: true});
      $scope.$broadcast(dgConstants.dgBroadcastAction.assignAdsToDgs, selectedMasterAds);
      traffickingService.disableButton($scope.funnelButtons, traffickingConst.strAssign);
    }

    function setAds(masterAds) {
      $scope.masterAds = angular.copy(masterAds);
    }

    function openStrategy() {
      if (csb.params.diagramID) {
        $state.go('spa.strategy.strategyEdit', {'strategyId': csb.params.diagramID});
      }
      else {
        $state.go('spa.strategy.strategyNew', {'campaignId': csb.params.campaignID});
      }
    }

    // only get the diagram if diagram is defined otherwise it's a blank canvas
    if (csb.params.diagramID) {
      $scope.collapsible = {open: true};
      strategies.getStrategy(csb.params.diagramID).then(
        function (response) {

          $scope.setStrategyVars(response);

          //only now we can set the entity ID
          $scope.entityId = csb.params.campaignID;

          strategies.getFunnelPriorities().then(function (result) {
            appService.csbData.targetAudienceIDs = result["targetAudienceList"];
          });
        }
      );
    }
    else {
      $scope.collapsible = {open: false};
      appService.csbData.targetAudienceIDs = [];
    }

    $scope.setStrategyVars = function (data) {

      // set all the params from the diagram
      appService.selectedStrategy = data;
      decisionTreeService.decisions = data.diagram.diagram;
      appService.csbData.notes = data.diagram.notes;
      appService.csbData.textBoxes = data.diagram.textBoxes;
      appService.csbData.arrows = data.diagram.arrows;
      appService.csbData.targetAudienceIDs = data.template ? [] : data.diagram.targetAudiences;
      csb.params.advertiserID = data.advertiserId;
      csb.params.advertiserName = data.advertiserName;
      csb.params.campaignID = data.campaignId;
      csb.params.campaignName = data.campaignName;
      csb.params.diagramID = data.id;
      csb.params.diagramName = data.decisionDiagramName;
      // copy it so we can compare if there were any changes later
      angular.copy(decisionTreeService.decisions, decisionTreeService.original);
    };

    var segmentSelectedInFunnelView = $scope.$root.$on(traffickingConst.traffickingBroadcastAction.onSelectedTargetAudience, function (event, selectedTargetAudience) {
      $scope.funnel.isTargetAudienceSelected = true;
      if ($scope.dgsDirectiveLoaded) {
        $scope.$broadcast(dgConstants.dgsBroadcastAction.targetAudienceSelected, selectedTargetAudience);
      }
      else {
        $timeout(function () {
          $scope.$broadcast(dgConstants.dgsBroadcastAction.targetAudienceSelected, selectedTargetAudience);
        }, 1000);
      }
    });

    var dgsDirectiveLoaded = $scope.$on(dgConstants.dgsBroadcastAction.dgsDirectiveLoaded, function () {
      $scope.dgsDirectiveLoaded = true;
    });

    var timer = $timeout(function () {
      $scope.$root.$broadcast('funnelView.hideLoading');
    }, 500);

    var selectedAdWatcher = $scope.$watch('adDataObject[0].selectedItems.length', function (newSelectedAds, oldSelectedAds) {
      if (newSelectedAds != oldSelectedAds) {
        traffickingService.disableEnableAssignButton($scope.funnelButtons, newSelectedAds, $scope.dgs);
      }
    });

    var dgOrAdSelected = $scope.$on(dgConstants.dgBroadcastAction.dgSelected, function () {
      var newSelectedAds = $scope.adDataObject[0].selectedItems.length;
      traffickingService.disableEnableAssignButton($scope.funnelButtons, newSelectedAds, $scope.dgs);
    });

    $scope.$on('$destroy', function () {
      if (segmentSelectedInFunnelView) {
        segmentSelectedInFunnelView();
      }
      if (timer) {
        $timeout.cancel(timer);
      }
      if (dgOrAdSelected) {
        dgOrAdSelected();
      }
      if (selectedAdWatcher) {
        selectedAdWatcher();
      }
      if (dgsDirectiveLoaded) {
        dgsDirectiveLoaded();
      }
    });
  }
]);
