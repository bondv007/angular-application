/**
 * Created by atdg on 6/3/2014.
 */


'use strict';

app.controller('siteCtrl', ['$scope', '$stateParams', '$rootScope', 'EC2Restangular', 'mmMessages', '$state', 'editConfig',
	function ($scope, $stateParams, $rootScope, EC2Restangular, mmMessages, $state, editConfig) {
	var siteUrl = "sites";
	$scope.type = "Site";
	$scope.hideGoTo = true;
	$scope.entityId = $stateParams.itemId;
	$scope.entityActions = [
		{
			name: 'settings',
			actions: [
				{name: 'Duplicate', func: '', nodes: []},
				{name: 'Delete', func: deleteSite},
				{name: 'Archive', func: '', nodes: []},
				{name: 'History', func: '', nodes: []}
			]
		}
	];

	EC2Restangular.one(siteUrl, $stateParams.itemId).get().then(function (site) {
		$scope.type = "Site : " + site.id + " | " + site.name;
	}, processError);

	function deleteSite() {
		EC2Restangular.one(siteUrl, $stateParams.itemId).remove().then(function () {
			$state.go("spa.sitesList");
		}, processError)
	}

	function processError(error) {
		console.log('ohh no!');
		console.log(error);
		if (error.data.error === undefined) {
			mmMessages.addError("Message", "Server error. Please try again later.", false);
		} else {
			mmMessages.addError("Message", error.data.error, false);
		}
	}
}]);
