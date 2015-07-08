/**
 * Created by yoav.karpeles on 24/3/2014.
 */

'use strict';

app.controller('advertiserCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {
	$scope.type = 'advertiser';
	$scope.entityId = $stateParams.advertiserId;
	$scope.entityActions = [
		{
			name: 'Tags',
			actions: [
				{ name: 'Excel', func: func1, nodes: [
					{name: 'Import', func: func1, nodes: []},
					{name: 'Export', func: func1, nodes: []}
				]
				},
				{ name: 'Add new Advertiser', func: func1, nodes: []}
			],
			views: [
				{name: 'Account Advertiser', ref: '.account_advertiser', nodes: []}
			] }
	];

	function func1() {
		alert('liron');
	}
}]);