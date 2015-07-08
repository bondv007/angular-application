app.controller('decisionDiagram',
    [ '$scope', '$q', 'csb', 'appService', 'strategies', 'decisionTreeService', 'mmModal', 'campaigns',
      '$timeout', 'panelFactory', 'headerService', 'saveDecisionDiagramService', '$stateParams', '$window',
      function ($scope, $q, csb, appService, strategies, decisionTreeService, mmModal, campaigns,
                $timeout, panelFactory, headerService, saveDecisionDiagramService, $stateParams, $window) {

        csb.config.shouldShowDiagram = true;
        if (csb.config.env == 'mdx3') {
          $scope.templateMenuHeight = {'height':$window.innerHeight - 570 + 'px'};
          // in mdx3 if there is not strategy id in the URL we clear the decisions object
          // this is used when navigating back in the browser for Edit to New
          if (!$stateParams.strategyId) {
            decisionTreeService.clearSelectedDecision();
            decisionTreeService.decisions.length = 0;
          };
          var saveNodes = [
            {
              func: saveAsTemplate,
              name: 'Save Template As',
              description: ''
            },
            {
              func: saveToCampaign,
              name: 'Save To Campaign',
              description: ''
            }
          ];
          var shareNodes = [
            {
              func: exportToPdf,
              name: 'Export to PDF',
              description: ' '
            },
            {
              func: shareUrl,
              name: 'Share URL',
              description: ''
            },
            {
              func: exportToThirdParty,
              name: 'Export to 3rd party',
              description: ' '
            }
          ];
          $scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: rollback, ref: null, nodes: []};
          $scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: '', ref: null, nodes: saveNodes, isPrimary: true};
          $scope.entityLayoutAdditionalInfraButtons.push({name: 'share', func: '', ref: null, nodes: shareNodes, isPrimary: false});
          function rollback() {
          }

          function saveAsTemplate() {
            saveDecisionDiagramService.saveToTemplate($scope);
          }

          function saveToCampaign() {
            saveDecisionDiagramService.saveToCampaign($scope);
          }

          function shareUrl() {
            headerService.shareUrl($scope);
          }

          function exportToPdf() {
            headerService.exportToPdf($scope);
          }

          function exportToThirdParty(){

          }
        } else { // mdx2
          $scope.templateMenuHeight = {'height':$window.innerHeight - 500 + 'px'};
        }

        // bind auth to entire view so I can use it anywhere
        $scope.csb = csb;
        $scope.decisionTreeService = decisionTreeService;
        $scope.appService = appService;
        $scope.panelFactory = panelFactory;
        $scope.activePage = 'decisionDiagram';

        // create an object to hold dd info
        // TODO: don't think we use this anymore.. check
        $scope.decisionDiagram = {};

        // only get the diagram if diagram is defined otherwise it's a blank canvas
        if (csb.params.diagramID) {
          strategies.getStrategy(csb.params.diagramID).then(
              function (response) {
                $scope.setStrategyVars(response);
                decisionTreeService.buildAudienceSegmentsFromDiagram();
              }
          );
        } else if(csb.params.campaignID){
          campaigns.getCampaignById(csb.params.campaignID).then(
            function(response){
              if(csb.config.env == 'mdx3'){
                csb.params.advertiserID = response.relationBag.parents.advertiser.id;
                csb.params.advertiserName = response.relationBag.parents.advertiser.name;
                csb.params.campaignID = response.id;
                csb.params.campaignName = response.name;
              } else {
                csb.params.advertiserID = response.advertiserId;
                csb.params.advertiserName = response.advertiserName;
                csb.params.campaignID = response.campaignId;
                csb.params.campaignName = response.campaignName;
              }
            }
          );
        }

        // get the templates if we have an account id.. which we always have but checking anyways
        if (csb.params.accountID) {
          strategies.getStrategyTemplates(csb.params.accountID).then(
              function (response) {
                $scope.templates = response;
              }
          );
        }

        /**
         * Sets the template selected as the diagrams template
         * @param selectedTemplate
         */
        $scope.setTemplateAsModel = function (selectedTemplate) {
          $scope.acceptTemplateModelChange = function () {
            $scope.setStrategyVars(angular.copy(selectedTemplate));
            // hiding the panel so that it doesn't stick to the last decision
            panelFactory.showPanelUI = false;
            $scope.modalInstance.dismiss();
          }

          if(angular.equals(decisionTreeService.original, decisionTreeService.decisions)){
            $scope.acceptTemplateModelChange();
          } else {
            $scope.modalInstance = mmModal.open({
              templateUrl: './csbApp/app/routes/views/modal-set-template.html',
              scope: $scope,
              title: "Loading a new template",
              modalWidth: 550,
              bodyHeight: 80,
              confirmButton: { name: "Load new template", funcName: "acceptTemplateModelChange", hide: false, isPrimary: true},
              discardButton: { name: "Cancel", funcName: "modalInstance.dismiss"}
            });
          }
        };

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
      }
    ]);

