'use strict';

app.controller('campaignEditCtrl1', ['$scope', '$stateParams', 'EC2Restangular', '$state', '$filter', 'mmAlertService',
	function ($scope, $stateParams, EC2Restangular, $state, $filter, mmAlertService) {
		var serverCampaigns = EC2Restangular.all('campaigns');
		$scope.advertiser;
    $scope.showSPinner = false;
    $scope.campaignId = $stateParams.campaignId;
		if ($scope.entityLayoutInfraButtons){
			$scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: cancel, ref: null, nodes: []}
			$scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: save, ref: null, nodes: []}
		}

		if ($scope.campaignId == null || $scope.campaignId <= 0) {
			$scope.campaign = {
            name: "",
            status: "1",
            type: "Campaign"
        }
    }
    else {
        $scope.showSPinner = true;
        serverCampaigns.get($scope.campaignId).then(getData, processError);
    }

		function save() {
			if ($scope.campaign.id === undefined) {
				serverCampaigns.post($scope.campaign).then(processData, processError);
			} else {
				$scope.campaign.put().then(processData, processError);
			}
		}

		function cancel() {
			changeView('spa.campaignList');
		}

		$scope.duplicate = function () {
			$scope.master = angular.copy($scope.campaign);
        $scope.master.id = undefined;
        serverCampaigns.post($scope.master).then(processData, processError);
        changeView('spa.campaignList');
    };

    $scope.delete = function () {

        $scope.campaign.remove();
        changeView('spa.campaignList');
    };

    function changeView(view) {
        $state.go(view);
    }

    function getData(data) {
        $scope.campaign = data;
        $scope.showSPinner = false;
    }

    function processError(error) {
        console.log('ohh no!');
        console.log(error);
        $scope.showSPinner = false;
        if (error.data.error === undefined) {
          mmAlertService.addError("Server error. Please try again later.");
				} else {
          mmAlertService.addError(error.data.error);
				}
    }

    function processData(data) {
        getData(data);
      mmAlertService.addSuccess("Campaign has been saved successfully.");
		}


  $scope.statuses = [
    {value: "1", text: 'Not Started'},
    {value: "2", text: 'Started'},
    {value: "3", text: 'Idle'},
    {value: "4", text: 'Stopped'}
  ];

  $scope.showStatus = function() {
    if ($scope.campaign){
      var selected = $filter('filter')($scope.statuses, {value: $scope.campaign.status});
      return ($scope.campaign.status && selected.length) ? selected[0].text : 'Not set';
    }
  };

}]);