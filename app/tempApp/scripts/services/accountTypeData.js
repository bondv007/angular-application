'use strict';

app.factory('accountTypeData', function () {
	return {
		type: [
			{'id': 1, 'name': 'Agency'},
			{'id': 2, 'name': 'Site'},
			{'id': 4, 'name': 'Creative Shop'},
			{'id': 8, 'name': 'Advertiser'}
		]
	};
});