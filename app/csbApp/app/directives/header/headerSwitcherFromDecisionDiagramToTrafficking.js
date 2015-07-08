app.directive('headerSwitcherFromDecisionDiagramToTrafficking', [ 'csb', '$state', 'modalFactory', 'segmentsFactory', 'decisionTreeService',
    function( csb, $state, modalFactory, segmentsFactory, decisionTreeService ) {

        return {
            restrict: 'A',
            scope: {},
            link: function( scope, element, attrs ) {

                element.bind( 'click', function(event) {

                    // copying first before comparing so that it strips out any angular hash keys
                    var equal = angular.equals( angular.copy(decisionTreeService.original), angular.copy(decisionTreeService.decisions) );

                    if (!equal) {

                         modalFactory.showPrompt('Warning', "You need to save your campaign before switching to the Serving Strategy page", {
                             showCancelButton: false
                         });

                         return false;
                    }
                    else{
                        $state.go('csb-trafficking', { diagramID: csb.params.diagramID, EnvID: csb.config.envId });
                    }

                });
            }
        };

    }
]);