app.directive('decisionNotAvailable', [ 'decisionTreeService',
    function( decisionTreeService ) {

        return {
            restrict: 'A',
            templateUrl: 'csbApp/app/directives/views/decisionNotAvailable.html',
            scope: {
                decision: '=',
                decisionType: '@',
                closePanel: '&'
            },
            link: function( scope, element, attrs ) {

                scope.deleteDecision = function() {
                    decisionTreeService.deleteDecision( scope.decision );
                    scope.closePanel();
                }

            }
        }

    }
]);