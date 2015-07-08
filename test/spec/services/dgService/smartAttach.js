/**
* Created by ofir.fridman on 9/16/14.
*/
'use strict';
describe('Service: smartAttach', function () {

	// load the controller's module
	beforeEach(module('MediaMindApp'));

	// instantiate service
	var smartAttach;
	beforeEach(inject(function (_smartAttachAdsToDgs_) {
		smartAttach = _smartAttachAdsToDgs_;
	}));

	it('should test the service smartAttach is up', function () {
		expect(!!smartAttach).toBe(true);
	});

	it('test function isScheduledSwap when val = "ScheduledSwap" ',function(){
		expect(smartAttach.isScheduledSwap("ScheduledSwap")).toBe(true);
	});

	it('test function isScheduledSwap when val = "ScheduledSwap" ',function(){
		expect(smartAttach.isScheduledSwap("TEST")).toBe(false);
	});


});