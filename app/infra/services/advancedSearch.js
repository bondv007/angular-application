/**
 * Created by liron.tagger on 11/3/13.
 */
app.service('advancedSearchService', function searchService() {
	var campaigns = [];
	var placements = [];
	var ads = [];

	fillSearchData();

	return {
		getCampaigns: function (searchTerm) {
			return campaigns;
		},
		getPlacements: function (searchTerm) {
			return placements
		},
		getAds: function (searchTerm) {
			return ads;
		},
		campaignFilters: function () {
			return getFiltersForArray(campaigns);
		},
		placementFilters: function () {
			return getFiltersForArray(placements);
		},
		adFilters: function () {
			return getFiltersForArray(ads);
		}
	}

	function getFiltersForArray(dataArray) {
		var filters = {};

		var numberOfCampaigns = dataArray.length;
		if (numberOfCampaigns > 1) {
			for (var propertyName in dataArray[0]) {
				if (propertyName != 'id' && propertyName != 'name' && propertyName != 'type' && propertyName != 'campaignID' && propertyName != 'placementID') {
					filters[propertyName] = {filterName: propertyName, values: {}};
				}
			}
			for (var i = 0; i < numberOfCampaigns; i++) {
				var entity = dataArray[i];
				for (var propName in filters) {
					var entityValue = entity[propName];
					if (filters[propName].values[entityValue] === undefined) {
						filters[propName].values[entityValue] = {valueName: entityValue, values: []};
					}

					filters[propName].values[entityValue].values.push(entity.id);
				}
			}
		}
//        if (numberOfCampaigns > 1){
//            for(var propertyName in dataArray[0]) {
//                if (propertyName != 'id' && propertyName != 'name') {
//                    filters[propertyName] = {};
//                }
//            }
//            for (var i = 0; i < numberOfCampaigns; i++){
//                var entity = dataArray[i];
//                for(var propName in filters) {
//                    var entityValue = entity[propName];
//                    if (filters[propName][entityValue] === undefined) {
//                        filters[propName][entityValue] = [];
//                    }
//
//                    filters[propName][entityValue].push(entity.id);
//                }
//            }
//        }

		return filters;
	}

	function fillSearchData() {
		var campStatus = ['Live', 'Idle', 'Not Started', 'In Progress'];
		var campCreationDate = ['Today', 'Last Week', 'Last Month', 'Last Year'];
		var campAgencies = ['Initiative', 'Media Kitchen', 'OMD', 'Agency'];

		var campAdvertisers = ['Kia', 'Goldman Saches', 'Levies', 'Toyota'];
		var adStatus = ['Active', 'NotActive', 'Approved', 'Attached'];
		var adFormat = ['Expanded Banner', 'Rich Media Banner', 'In-Stream Video', 'Take-Over'];

		var adDimenssions = ['300X250', '160X600', '336X850', '400X400'];

		var numOfEntities = 100;
		for (var i = 0; i < numOfEntities; i++) {
			var rand1 = Math.floor((Math.random() * 4));
			var rand2 = Math.floor((Math.random() * 4));
			var rand3 = Math.floor((Math.random() * 4));
			var rand4 = Math.floor((Math.random() * 4));

			campaigns.push({id: i, name: 'Campaign_' + i, type: 'Campaign', status: campStatus[rand1], creationDate: campCreationDate[rand2], agency: campAgencies[rand3], advertiser: campAdvertisers[rand4]});
			placements.push({id: i, name: 'Placement_' + i, type: 'Placement', campaignID: Math.floor((Math.random() * 100)), status: campStatus[rand1], creationDate: campCreationDate[rand2], agency: campAgencies[rand3], advertiser: campAdvertisers[rand4]});
			ads.push({id: i, name: 'Ad_' + i, placementID: Math.floor((Math.random() * 100)), type: 'Ad', status: adStatus[rand1], adFormat: adFormat[rand3], adDimenssions: adDimenssions[rand4]});
		}
	}
});
