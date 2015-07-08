/**
 * Created by Cathy Winsor on 3/28/14.
 */
'use strict';

app.controller('cathyCtrl', ['$scope', '$state', function ($scope, $state) {
    console.log("initialized test controller - mine");
    var cathyObj = {};
    $scope.name = 'Cathy';
    $scope.phones = [
        {'name': 'Nexus S',
            'snippet': 'Fast just got faster with Nexus S.'},
        {'name': 'Motorola XOOM™ with Wi-Fi',
            'snippet': 'The Next, Next Generation tablet.'},
        {'name': 'MOTOROLA XOOM™',
            'snippet': 'The Next, Next Generation tablet.'}
    ];

}]);