/**
 * Created by rotem.perets on 2/11/15.
 *
 * This factory holds all the common logic previously held by the header directives (mdx2).
 * we call it from both header directives (mdx2) and entity layout buttons (mdx3)
 */
app.factory('headerService', ['csb', '$state', 'modalFactory', 'decisionTreeService', 'appService', 'mmModal', 'pdf',
  function (csb, $state, modalFactory, decisionTreeService, appService, mmModal, pdf) {
    var pub = {};

    pub.goToServingStrategy = function () {
      if (!angular.equals(angular.copy(decisionTreeService.original), angular.copy(decisionTreeService.decisions))) {
        modalFactory.showPrompt('Warning', 'You need to save your campaign before switching to the Serving Strategy page.', { showCancelButton: false });
        return false;
      }

      else if (!appService.csbData.targetAudienceIDs.length) {
        modalFactory.showPrompt('Warning', 'You need to save your template to a campaign before switching to the Serving Strategy page.', { showCancelButton: false });
        return false;
      }

      if (csb.config.env == 'mdx2') {
        var stateParamsObject = {
          DecisionDiagramID: csb.params.diagramID,
          SessionID: csb.params.sessionID,
          AccountID: csb.params.accountID,
          UserID: csb.params.userID,
          EnvID: csb.config.envID
        }
        csb.config.shouldShowDiagram = false;
        $state.go('csb-trafficking', stateParamsObject);
      }
      else {
        var stateParamsObject = {
          diagramID: csb.params.diagramID,
          campaignId: csb.params.campaignID
        }
        $state.go('spa.campaign.servingStrategies', stateParamsObject);
      }
    }

    pub.shareUrl = function(scope){
      scope.modalInstance = mmModal.open({
        templateUrl: './csbApp/app/views/ui/modal-share-url.html',
        scope: scope,
        title: "Share the URL",
        modalWidth: 550,
        bodyHeight: 120,
        discardButton: { name: "Close", funcName: "modalInstance.dismiss"}
      });

      // create the URL and assign it to a scope variable
      // second argument of $state.href is for passing path/param variables
      // only passing diagram ID because the EnvID is saved in $state and doesn't change after loading application
      // NOTE: creating 2 different objects to be passed as second argument
      // MDX2 expects to be passed 'DecisionDiagramID' through params
      // MDX3 expects to be passed 'diagramID' through the path
      // ( see differences in route.js )
      var shareParams;
      if ( csb.config.env == 'mdx2' ) {
        shareParams = {
          DecisionDiagramID: csb.params.diagramID,
          EnvID: csb.config.envID
        };
      }
      else{
        shareParams = {
          diagramID: csb.params.diagramID
        };
      }

      scope.shareUrl = $state.href( 'csb-share', shareParams , { absolute: true } );
    }

    pub.exportToPdf = function(scope){
      // only doing this if there some actual content on the page
      if ( !decisionTreeService.decisions.length ) {
        return false;
      }

      // create the modal object to hold the data
      scope.modalData = {
        title: 'Converting your PDF...',
        showExportButton: false
      };

      scope.modalInstance = mmModal.open({
        templateUrl: './csbApp/app/views/ui/modal-pdf.html',
        scope: scope,
        title: scope.modalData.title,
        modalWidth: 550,
        bodyHeight: 170,
        confirmButton: { name: "Download the PDF", funcName: "openPDF", hide: 'modalData.url == undefined', isPrimary: true},
        discardButton: { name: "Close", funcName: "modalInstance.dismiss"}
      });

      scope.openPDF = function() {
        window.open( scope.modalData.url, '_blank' , '' );
        scope.modalInstance.dismiss();
      };

      var data = {
        advertiser: csb.params.advertiserName,
        campaign: csb.params.campaignName,
        html: $('#decision-tree').html()
      }

      // function to generate the PDF
      pdf.exportPDF( data ).then(
          function( url ) {
            scope.modalData.title = "PDF converted"
            scope.modalData.url = url;
            scope.modalData.showExportButton = true;
          },
          function( error ) {
            scope.error = error;
          }
      );
    }

    return pub;
  }]);
