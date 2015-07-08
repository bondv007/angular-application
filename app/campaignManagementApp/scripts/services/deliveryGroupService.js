'use strict';

app.service('deliveryGroupService', ['EC2Restangular', function (EC2Restangular) {
	//var serverDeliveryGroups = EC2Restangular.all('deliveryGroups');

	var deliveryGroups = [];

//	serverCampaigns.getList().then(function (campaigns) {
//		$scope.centralList = campaigns;
//		$scope.showSpinner = false;
//	}, function (response) {
//		console.log('ohh no!');
//		console.log(response);
//	});

	var adStatus = ['Active', 'NotActive', 'Approved', 'Attached'];

	var numOfEntities = 100;
	for (var i = 0; i < numOfEntities; i++) {
		var rand1 = Math.floor((Math.random() * 4));

		deliveryGroups.push({id: i, name: 'DeliveryGroup_' + i, adsIds: [Math.floor((Math.random() * 100))], type: 'Delivery Group', status: adStatus[rand1]});
	}

	return {
		getDeliveryGroups: function () {
			return deliveryGroups;
		},

		getDeliveryGroupById: function (id) {
			for (var i = 0; i < deliveryGroups.length; i++) {
				if (deliveryGroups[i].id === id) {
					return deliveryGroups[i];
				}
			}

			return null;
		},
		saveDeliveryGroup: function (deliveryGroup) {
			deliveryGroups[deliveryGroup.id] = deliveryGroup;
		},
		getDeliveryGroupsByMemberValue: function (memberName, memberValue) {
			var list = [];
			for (var i = 0; i < deliveryGroups.length; i++) {
				if (deliveryGroups[i][memberName] === memberValue) {
					list.push(deliveryGroups[i]);
				}
			}

			return list;
		}
	};
}]);
