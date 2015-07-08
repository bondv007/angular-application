'use strict';

app.controller('testCtrl', ['$scope', '$stateParams', 'EC2Restangular', '$state','$filter', function ($scope, $stateParams, EC2Restangular, $state,$filter) {
	$scope.scrollerItems = [];
	var year = 2000 + Math.floor((Math.random() * 10) + 1);
	var month = Math.floor((Math.random() * 8) + 1);

	var status = ['Live', 'Idle', 'Not Started', 'In Progress'];
	var agencies = ['Initiative', 'Media Kitchen', 'OMD', 'Agency'];
	var campAdvertisers = ['Kia', 'Goldman Saches', 'Levies', 'Toyota'];

	for (var i = 1; i <= 200000; i++) {
		var rand1 = Math.floor((Math.random() * 4));
		var rand3 = Math.floor((Math.random() * 4));
		var rand4 = Math.floor((Math.random() * 4));

		var day = Math.floor((Math.random() * 20) + 1);
		var startDate = new Date(year, month, day);
		var endDate = new Date(year, month, day + 3);
		$scope.scrollerItems.push({id: i, name: 'Placement_' + i, startDate: startDate.toLocaleDateString(), endDate: endDate.toLocaleDateString(), status: status[rand1], agency: agencies[rand3], advertiser: campAdvertisers[rand4]});
	}

    console.log("initialized test controller");
    var dataObj = {};
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