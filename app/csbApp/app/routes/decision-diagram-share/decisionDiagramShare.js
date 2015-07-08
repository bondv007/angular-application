app.controller('decisionDiagramShare', [ '$scope', '$stateParams', 'csbInit', 'csb', 'appService', 'strategies', 'decisionTreeService', '$translate',
  function ($scope, $stateParams, csbInit, csb, appService, strategies, decisionTreeService, $translate) {
    $scope.shareMode = true;
    csbInit.initShare($stateParams);

    $translate.use('english').then(function () {
      $scope.currentLanguage = $translate.use();
    });

    if (csb.params.diagramID) {
      strategies.getStrategyPreview(csb.params.diagramID).then(
          function (response) {
            $scope.setStrategyVars(response);
          }
      );
    }

    $scope.setStrategyVars = function (data) {

      // set all the params from the diagram
      appService.selectedStrategy = data;
      decisionTreeService.decisions = data.diagram.diagram;
      appService.csbData.notes = data.diagram.notes;
      appService.csbData.textBoxes = data.diagram.textBoxes;
      appService.csbData.arrows = data.diagram.arrows;
      appService.csbData.targetAudienceIDs = data.template ? [] : data.targetAudiences;
      csb.params.advertiserID = data.advertiserId;
      csb.params.advertiserName = data.advertiserName;
      csb.params.campaignId = data.campaignId;
      csb.params.campaignName = data.campaignName;
      csb.params.diagramID = data.id;
      csb.params.diagramName = data.decisionDiagramName;
      // copy it so we can compare if there were any changes later
      angular.copy(decisionTreeService.decisions, decisionTreeService.original);

    };

  }
]);
