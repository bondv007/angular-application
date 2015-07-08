'use strict';

app.service('placementService', ['EC2Restangular', function (EC2Restangular) {
	var serverPlacements = EC2Restangular.all('placements');

	return {
		getPlacements: function (campaignId) {
			if (campaignId) {
				return serverPlacements.getList({campaignId: campaignId});
			}
			else {
				return serverPlacements.getList();
			}
		},

		getPlacementById: function (id) {
			var index = _.findIndex(placements, function(p) {
				return p.id === id;
			});
			if (index > -1) {
				return placements[index];
			}

			return null
		},
		createPlacement: function (placement) {
			serverPlacements.post(placement).then(function (data) {
				placements.push(data);
			}, function (response) {
				console.log('ohh no!');
				console.log(response);
			});
		},
		deletePlacement: function (placement) {
			placement.remove().then(function () {
				placements = _.without(placements, placement);
			}, function (response) {
				console.log('ohh no!');
				console.log(response);
			});
		},
		updatePlacement: function (placement) {
			var index = _.findIndex(placements, function(p) {
				return p.id === placement.id;
			});
			if (index > -1) {
				placement.put().then(function (data) {
					placements[index] = data;
				}, function (response) {
					console.log('ohh no!');
					console.log(response);
				});
			}
		},

		savePlacement: function (placement) {
			placements[placement.id] = placement;
		},
		getPlacementsByMemberValue: function (memberName, memberValue) {
			var list = [];
			for (var i = 0; i < placements.length; i++) {
				if (placements[i][memberName] === memberValue) {
					list.push(placements[i]);
				}
			}

			return list;
		}
	};
}]);
