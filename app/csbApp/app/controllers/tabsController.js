/**
 * Created by Axel.Martínez on 8/19/14.
 */

app.controller( 'TabsCtrl', [ '$scope',
    function( $scope ) {

        $scope.tabs = {
            'decisionDiagram': { title:'Decision Diagram'},
            'trafficking': { title:'Trafficking'}
        };

    }
]);