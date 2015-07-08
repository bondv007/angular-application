'use strict';

app.factory('campaignsData', function () {
	return {
		type: [
			{'id': 0, 'name': 'A'},
			{'id': 1, 'name': 'WTF'},
			{'id': 2, 'name': 'C'},
			{'id': 3, 'name': 'D'}
		],

		campaigns: [
			{id: 1, name: 'name of campaign 1', type: 0},
			{id: 2, name: 'name of campaign 2', type: 0},
			{id: 3, name: 'name of campaign 3', type: 0}
		]
	};
});