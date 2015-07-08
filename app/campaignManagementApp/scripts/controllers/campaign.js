/**
 * Created by liron.tagger on 2/10/14.
 */
'use strict';

app.controller('campaignCtrl', ['$scope', '$stateParams','$state', function ($scope, $stateParams,$state) {
	$scope.type = 'campaign';
	$scope.entityId = $stateParams.campaignId;
	$scope.entityActions = [
		{
			name: 'Media plan',
			actions: [
				{ name: 'Excel', func: func1, nodes: [
						{name: 'Import', func: func1, nodes: []},
						{name: 'Export', func: func1, nodes: []}
					]
				},
			{ name: 'Add new placement', func: addNewPlacement, nodes: []}
		], views: [
			{name: 'View Media Plan', ref: '.campaignCentral.placementEdit', nodes: []},
            {name: 'Manage Packages', ref: '.packages.packageEdit', nodes: []}
		] },
		{ name: 'Ads', actions: [
			{name: 'Import /assign', func: func1, nodes: []},
			{name: 'Add new ad', func: func1, nodes: [
				{name: 'Add new ad', func: addNewMasterAd, nodes: []},
				{name: 'Create from bundle', func: func1, nodes: []},
				{name: 'Mass create standard banner', func: func1, nodes: []},
				{name: 'Mass create enhanced standard banner', func: func1, nodes: []},
				{name: 'Design new video ad', func: func1, nodes: []},
				{name: 'Design new HTML ad', func: func1, nodes: []}
			]}
		], views: [
			{name: 'View master ads',  ref: '.', nodes: []},
			{name: 'View placement ads',  ref: '.', nodes: []}
		] },
		{ name: 'Delivery Group', actions: [
			{name: 'New Delivery Group', func: addDeliveryGroup, nodes: []},
			{name: 'Bulk create Delivery Group', func: func1, nodes: []},
			{name: 'Prioritizing Target Audience', func: func1, nodes: []}
		], views: [
			{name: 'View Delivery Groups',  ref: '.deliveryGroups.deliveryGroupEdit', nodes: []}
		] },
		{ name: 'Attachment', actions: [
			{name: 'Ads to DG', func: func1, nodes: []},
			{name: 'Rule base attachment', func: func1, nodes: []},
			{name: 'Attachment Excel', func: func1, nodes: [
				{name: 'Import', func: func1, nodes: []},
				{name: 'Export', func: func1, nodes: []}
			]}
		], views: [
			{name: 'Attach Ads to placements', ref: '.attachmentCentral', nodes: []},
			{name: 'Attach DG to placements',  ref: '.placementDeliveryGroup',  nodes: []},
			{name: 'View attached ads',  ref: '.', nodes: []}
		] },
		{ name: 'URLs', actions: [
			{name: 'Assign URLs to ad copies', func: func1, nodes: []},
			{name: 'Add new URL', func: func1, nodes: []},
			{name: 'enable URL tokens', func: func1, nodes: []},
			{name: 'Safe count/ Vizu integration', func: func1, nodes: []}
		], views: [
			{name: 'View URLs',  ref: '.', nodes: []}
		] },
		{ name: 'Tags', actions: [
			{name: 'Publish to site', func: func1, nodes: []},
			{name: 'Placement tags', func: func1, nodes: []}
		], views: [] },
		{ name: 'IO', actions: [
			{name: 'Sign IO', func: func1, nodes: []},
			{name: 'Generate IO', func: func1, nodes: []}
		], views: [
			{name: 'View IOs', ref: '.', nodes: []}
		] }
	];

	function func1() {
		alert('liron');
	}

    function addNewMasterAd(){
        $state.go('spa.ad.adEdit');
    }
	function addNewPlacement(){
			$state.go('spa.placement.placementEdit');
	}

	function addDeliveryGroup(){
			$state.go('spa.deliveryGroup.deliveryGroupEdit');
	}
}]);
