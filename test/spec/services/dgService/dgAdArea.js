/**
 * Created by Ofir.Fridman on 8/12/14.
 */
'use strict';

describe('Service: dgAdArea', function () {

	// load the controller's module
	beforeEach(module('MediaMindApp'));

	// instantiate service
	var dgAdArea , dgConstants;
	beforeEach(inject(function (_dgAdArea_, _dgConstants_) {
		dgAdArea = _dgAdArea_;
		dgConstants = _dgConstants_;
	}));

	it('should test the service dgAdArea is up', function () {
		expect(!!dgAdArea).toBe(true);
	});

	it('should test the service dgConstants is up', function () {
		expect(!!dgConstants).toBe(true);
	});

	it('test selectAllSubGroupChildAndSubChild function select sub group should select child and sub child where all child and sub child are not selected', function () {
		var selectedSubGroup = dgJson().selectedSubGroupWithUnSelectedChild[0];
		dgAdArea.selectAllSubGroupChildAndSubChild(selectedSubGroup);
		expect(dgUnitTestHelper(dgConstants).isAllChildAndSubChildSelected(selectedSubGroup)).toBe(true);
		//Now all sub child are selected lets pass the json to the tested function and check it still keep all sub child selected
		dgAdArea.selectAllSubGroupChildAndSubChild(selectedSubGroup);
		expect(dgUnitTestHelper(dgConstants).isAllChildAndSubChildSelected(selectedSubGroup)).toBe(true);

	});

	it('test selectAllSubGroupChildAndSubChild function un select sub group should un select child and sub child where all child and sub child are selected', function () {
		var unSelectedSubGroup = dgJson().unSelectedSubGroupWithSelectedChild[0];
		dgAdArea.selectAllSubGroupChildAndSubChild(unSelectedSubGroup);
		expect(dgUnitTestHelper(dgConstants).isAllChildAndSubChildUnSelected(unSelectedSubGroup)).toBe(true);
		//Now all sub child not selected lets pass the json to the tested function and check it still keep all sub child un selected
		dgAdArea.selectAllSubGroupChildAndSubChild(unSelectedSubGroup);
		expect(dgUnitTestHelper(dgConstants).isAllChildAndSubChildUnSelected(unSelectedSubGroup)).toBe(true);
	});
});


