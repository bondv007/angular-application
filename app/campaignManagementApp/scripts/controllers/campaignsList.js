'use strict';

app.controller('campaignsListCtrl', ['$scope', 'EC2Restangular', function ($scope, EC2Restangular) {
	var serverCampaigns = EC2Restangular.all('campaigns');
	var serverAccounts = EC2Restangular.all('accounts');

	$scope.showSPinner = true;
	$scope.accounts = [];
	$scope.campaigns = [];
	$scope.newCampaign = {
		name: "",
		accountId: null,
		accountName: '',
		startDate: '2014-01-19', //new Date().toLocaleDateString(),
		endDate: '2014-01-20', //new Date().toLocaleDateString(),
		type: 'Search', //display, search
		advertiserName: '',
		isAlive: true,
		status: 'not started' //not started, started, stopped
	};
	$scope.accountId2accountIndex = {};
	$scope.orderObj = 'id';

	serverCampaigns.getList().then(function (all) {
		$scope.campaigns = all;
		$scope.showSPinner = false;
	}, function (response) {
		console.log(response);
	});

	serverAccounts.getList().then(function (all) {
		$scope.accounts = all;

		if (all.length > 0) {
			$scope.newCampaign.accountId = all[0].id;
		}
		$scope.accountId2accountIndex = {};
		_.each(all, function (item, index) {
			$scope.accountId2accountIndex[item.id] = index;
		});
		$scope.showSPinner = false;
	}, function (response) {
		console.log(response);
	});

	$scope.getAccountById = function (id) {
		var index = $scope.accountId2accountIndex[id];
		if (index === undefined) {
			return {name: "- " + id + " -"};
		}
		return $scope.accounts[index];
	};

	$scope.createCampaign = function () {
		serverCampaigns.post($scope.newCampaign).then(function (data) {
			$scope.campaigns.push(data);
			$scope.newCampaign.name = '';
		}, function (response) {
			$scope.campaigns.push($scope.newCampaign);
			console.log(response);
		});
	};

	$scope.closeNewCampaign = function () {
		$scope.newCampaign.name = '';
	};

	$scope.deleteCampaign = function (camp) {
		camp.remove().then(function () {
			$scope.campaigns = _.without($scope.campaigns, camp);
		}, function (response) {
			console.log(response);
		});
	};
	$scope.orderBy = function (orderBy) {
		if ($scope.orderObj === orderBy) {
			$scope.reversed = !$scope.reversed;
		}
		else {
			$scope.orderObj = orderBy;
			$scope.reversed = false;
		}
	};

	$scope.campaignsOrderBy = function (campaign) {
		if ($scope.orderObj === 'accountName') {
			return $scope.getAccountById(campaign.accountId).name;
		}
		return campaign[$scope.orderObj];
	};

	$scope.checkAccount = function (data, id) {
		if ($scope.accountId2accountIndex[data] === undefined) {
			return "Please select existing account";
		}
		var camp = _.findWhere($scope.campaigns, {'id': id});
		camp.accountId = data;
		camp.put();
		//TODO: handle server errors
		return true;
	};

	$scope.checkName = function (data, id) {
		if (data.length < 3 || data.length > 20) {
			return "name must be between 3 to 20 characters";
		}
		var camp = _.findWhere($scope.campaigns, {'id': id});
		camp.name = data;
		camp.put();
		//TODO: handle server errors
		return true;
	};

	$scope.checkAccountName = function(data, id) {
		var camp = _.findWhere($scope.campaigns, {'id': id});
		camp.accountName = data;
		camp.put();
		return true;
	};
	$scope.checkAdvertiserName = function(data, id) {
		var camp = _.findWhere($scope.campaigns, {'id': id});
		camp.advertiserName = data;
		camp.put();
		return true;
	};
	$scope.checkDate = function(data, id, isStartDate){
		var camp = _.findWhere($scope.campaigns, {'id': id});
		if (isStartDate) {
			camp.startDate = data;
		}
		else {
			camp.endDate = data;
		}

		camp.put();
		return true;
	}
}]);
