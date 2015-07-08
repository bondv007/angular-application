/**
 * Created by ofir.fridman on 9/21/14.
 */
'use strict';
describe('Service: adsToPlacement', function () {

	// load the controller's module
	beforeEach(module('MediaMindApp'));

	// instantiate service
	var adsToPlacement;
	beforeEach(inject(function (_adsToPlacement_) {
		adsToPlacement = _adsToPlacement_;
	}));

	var _unitTestHelper = null;
	beforeEach(function () {
		_unitTestHelper = _unitTestHelper || unitTestHelper();
	});


	it('should test the service adsToPlacement is up', function () {
		expect(!!adsToPlacement).toBe(true);
	});

	it('check getColumnNames function return the expected columns and values', function () {
		var expectedColumns = [
			{name: 'Placement id'},
			{name: 'Placement Name'},
			{name: 'Size'},
			{name: 'Type'},
			{isCheckbox: true},
			{name: 'Master Ad id'},
			{name: 'Master Ad Name'}
		];

		var actualColumns = adsToPlacement.getColumnNames();
		for (var i = 0; i < actualColumns.length; i++) {
			var actualColumn = actualColumns[i];
			var expectedColumn = expectedColumns[i];
			for (var key in actualColumn) {
				expect(actualColumn[key]).toBe(expectedColumn[key]);
			}
		}
	});

	it('check function isAllAdsSelected return isAllSelected = true and isAtListOneAdSelected = true', function () {
		var gridData = [
			{adsToAttach: [
				{isSelected: true},
				{isSelected: true},
				{isSelected: true}
			]},
			{adsToAttach: [
				{isSelected: true},
				{isSelected: true},
				{isSelected: true}
			]},
			{adsToAttach: [
				{isSelected: true},
				{isSelected: true},
				{isSelected: true}
			]}
		];
		var resObj = adsToPlacement.isAllAdsSelected(gridData);
		expect(resObj.isAllSelected).toBe(true);
		expect(resObj.isAtListOneAdSelected).toBe(true);
	});

	it('check function isAllAdsSelected return isAllSelected = false and isAtListOneAdSelected = true', function () {
		var gridData = [
			{adsToAttach: [
				{isSelected: false},
				{isSelected: false},
				{isSelected: false}
			]},
			{adsToAttach: [
				{isSelected: false},
				{isSelected: false},
				{isSelected: false}
			]},
			{adsToAttach: [
				{isSelected: false},
				{isSelected: false},
				{isSelected: true}
			]}
		];
		var resObj = adsToPlacement.isAllAdsSelected(gridData);
		console.log(resObj.isAllSelected);
		expect(false).toBe(false);
		expect(resObj.isAtListOneAdSelected).toBe(true);
	});

	it('check function isAllAdsSelected return isAllSelected = false and isAtListOneAdSelected = false', function () {
		var gridData = [
			{adsToAttach: [
				{isSelected: false},
				{isSelected: false},
				{isSelected: false}
			]},
			{adsToAttach: [
				{isSelected: false},
				{isSelected: false},
				{isSelected: false}
			]},
			{adsToAttach: [
				{isSelected: false},
				{isSelected: false},
				{isSelected: false}
			]}
		];
		var resObj = adsToPlacement.isAllAdsSelected(gridData);
		expect(resObj.isAllSelected).toBe(false);
		expect(resObj.isAtListOneAdSelected).toBe(false);
	});

	it('check getPlacementsWithSelectedAds function return 0 placements', function () {
		var placementsWithAds = [
			{id: 1, adsToAttach: [
				{isSelected: false},
				{isSelected: false},
				{isSelected: false}
			]},
			{id: 2, adsToAttach: [
				{isSelected: false},
				{isSelected: false},
				{isSelected: false}
			]},
			{id: 3, adsToAttach: [
				{isSelected: false},
				{isSelected: false},
				{isSelected: false}
			]}
		];
		var placements = adsToPlacement.privateFunctionsTest.getPlacementsWithSelectedAds(placementsWithAds);
		expect(placements.length).toBe(0);
	});

	it('check getPlacementsWithSelectedAds function return all placements and the expected ads', function () {
		var placementsWithAds = [
			{id: 1, adsToAttach: [
				{id: 1, isSelected: true},
				{id: 2,isSelected: false},
				{id: 3,isSelected: false}
			]},
			{id: 2, adsToAttach: [
				{id: 1,isSelected: false},
				{id: 2,isSelected: true},
				{id: 3,isSelected: false}
			]},
			{id: 3, adsToAttach: [
				{id: 1,isSelected: false},
				{id: 2,isSelected: false},
				{id: 3,isSelected: true}
			]}
		];
		var placements = adsToPlacement.privateFunctionsTest.getPlacementsWithSelectedAds(placementsWithAds);
		expect(placements[0].id).toBe(1);
		expect(placements[0].adsToAttach[0].id).toBe(1);
		expect(placements[0].adsToAttach.length).toBe(1);
		expect(placements[1].id).toBe(2);
		expect(placements[1].adsToAttach[0].id).toBe(2);
		expect(placements[1].adsToAttach.length).toBe(1);
		expect(placements[2].id).toBe(3);
		expect(placements[2].adsToAttach[0].id).toBe(3);
		expect(placements[2].adsToAttach.length).toBe(1);
	});

	it('check getPlacementsWithSelectedAds function return some of the placements', function () {
		var placementsWithAds = [
			{id: 1, adsToAttach: [
				{id: 1,isSelected: true},
				{id: 2,isSelected: false},
				{id: 3,isSelected: false}
			]},
			{id: 2, adsToAttach: [
				{id: 1,isSelected: false},
				{id: 2,isSelected: false},
				{id: 3,isSelected: false}
			]},
			{id: 3, adsToAttach: [
				{id: 1,isSelected: false},
				{id: 2,isSelected: true},
				{id: 3,isSelected: true}
			]}
		];
		var placements = adsToPlacement.privateFunctionsTest.getPlacementsWithSelectedAds(placementsWithAds);
		expect(placements[0].id).toBe(1);
		expect(placements[0].adsToAttach[0].id).toBe(1);
		expect(placements[0].adsToAttach.length).toBe(1);
		expect(placements[1].id).toBe(3);
		expect(placements[1].adsToAttach[0].id).toBe(2);
		expect(placements[1].adsToAttach[1].id).toBe(3);
		expect(placements[1].adsToAttach.length).toBe(2);
		expect(placements.length).toBe(2);
	});

});
