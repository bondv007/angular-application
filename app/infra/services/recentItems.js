/**
 * Created by liron.tagger on 11/12/13.
 */
app.service('recentItemsService', function searchService() {
	return {
		recentlyViewedItems: [
			{name: 'Placement_1', href: '#/spa/editPlacement/1', type: 'Placements', isPinned: false},
			{name: 'Placement_2', href: '#/spa/editPlacement/2', type: 'Placements', isPinned: true},
			{name: 'Placement_3', href: '#/spa/editPlacement/3', type: 'Placements', isPinned: false},
			{name: 'Campaign List', href: '#/spa/campaignList', type: 'Campaigns', isPinned: true},
			{name: 'Campaign_1', href: '#/spa/campaignsCentral/1', type: 'Campaigns', isPinned: true},
			{name: 'Campaign_2', href: '#/spa/campaignsCentral/2', type: 'Campaigns', isPinned: false},
			{name: 'Ad_1', href: '', type: 'Ads', isPinned: false},
			{name: 'Ad_2', href: '', type: 'Ads', isPinned: false},
			{name: 'Account_1', href: '', type: 'Accounts', isPinned: false},
			{name: 'Account_2', href: '', type: 'Accounts', isPinned: true},
			{name: 'User_1', href: '', type: 'Users', isPinned: false}
		]
	}
});
