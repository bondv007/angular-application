/**
 * Created by rotem.perets on 2/8/15.
 */
app.directive( 'deleteDecisionDiagramTemplate', [ 'appService', 'strategies', 'csb', 'mmModal', 'decisionTreeService',
  function( appService, strategies, csb, mmModal, decisionTreeService ) {

    return {
      restrict: 'A',
      scope: {
        diagramId: '=',
        templates: '='
      },
      link: function( scope, element, attrs ) {

        element.bind( 'click', function() {

          scope.error = null;

          scope.modalInstance = mmModal.open({
            templateUrl: './csbApp/app/directives/views/leftPanel/modal-delete-decision-diagram-template.html',
            scope: scope,
            title: "Delete template",
            modalWidth: 550,
            bodyHeight: 120,
            confirmButton: { name: "Delete", funcName: "delete", hide: false, isPrimary: true},
            discardButton: { name: "Cancel", funcName: "modalInstance.dismiss"}
          });

          scope.delete = function() {
            strategies.deleteStrategy( scope.diagramId ).then(function( response ) {
              // splice it out of the list
              angular.forEach( scope.templates, function( template, i ) {
                if ( template.id == scope.diagramId ) {
                  scope.templates.splice( i, 1 );
                }
              });

              // if it's the same one we have selected
              if ( appService.selectedStrategy && scope.diagramId == appService.selectedStrategy.id ) {
                decisionTreeService.decisions = [];
                appService.selectedStrategy = null;
                csb.params.advertiserName = null;
                csb.params.advertiserID = null;
                csb.params.diagramID = null;
              }
              scope.modalInstance.dismiss();
            }, function( error) {
              scope.error = error;
              scope.modalInstance.dismiss();
            });
          }
        });
      }
    }
  }
]);
