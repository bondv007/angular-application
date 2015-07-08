/**
 * Created by rotem.perets on 2/8/15.
 */
app.directive( 'updateDecisionDiagramTemplate', [ 'appService', 'strategies', 'csb', 'mmModal',
  function( appService, strategies, csb, mmModal ) {

    return {
      restrict: 'A',
      scope: {
        templates: '=',
        setStrategyVars: '&'
      },
      link: function( scope, element, attrs ) {

        element.bind( 'click', function() {
          scope.modalInstance = mmModal.open({
            templateUrl: './csbApp/app/directives/views/header/modal-update-diagram.html',
            scope: scope,
            title: "Save your template",
            modalWidth: 550,
            bodyHeight: 120,
            confirmButton: { name: "Save", funcName: "update", hide: false, isPrimary: true},
            discardButton: { name: "Cancel", funcName: "modalInstance.dismiss"}
          });

          scope.templateName = csb.params.diagramName;
        });

        scope.update = function() {
          strategies.updateStrategy().then(function( response ) {
            angular.forEach( scope.templates, function( template, i ) {
              if ( template.id == response.id ) {
                scope.templates[i] = response;
              }
            });

            scope.setStrategyVars({ data: response });
            scope.modalInstance.dismiss();

          }, function( error ) {
            scope.errorText = error;
          });
        };
      }
    }
  }
]);