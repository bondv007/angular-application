/**
 * Created by Ofir.Fridman on 10/21/14.
 */
'use strict';
describe('Service: wizardHelper', function () {

	// load the controller's module
	beforeEach(module('MediaMindApp'));

	// instantiate service
	var wizardHelper;
	beforeEach(inject(function (_wizardHelper_) {
		wizardHelper = _wizardHelper_;
	}));

	it('should test the service wizardHelper is up', function () {
		expect(!!wizardHelper).toBe(true);
	});

	//region isLastStep
	it('should test the isLastStep when wizardSteps.length = 1 and currentStep.index = 0', function () {
		var wizardSteps = [1];
		expect(wizardHelper.isLastStep(wizardSteps,getCurrentStep(0))).toBe(true);
	});

	it('should test the isLastStep when wizardSteps.length = 1 and currentStep.index = 1', function () {
		var wizardSteps = [1];
		expect(wizardHelper.isLastStep(wizardSteps,getCurrentStep(1))).toBe(false);
	});

	it('should test the isLastStep when wizardSteps.length = 2 and currentStep.index = 1', function () {
		var wizardSteps = [1,2];
		expect(wizardHelper.isLastStep(wizardSteps,getCurrentStep(1))).toBe(true);
	});

	it('should test the isLastStep when wizardSteps.length = 2 and currentStep.index = 0 and currentStep.index = 2', function () {
		var wizardSteps = [1,2];
		expect(wizardHelper.isLastStep(wizardSteps,getCurrentStep(0))).toBe(false);
		expect(wizardHelper.isLastStep(wizardSteps,getCurrentStep(2))).toBe(false);
	});
	//endregion

	//region isFirstStep
	it('should test isFirstStep when currentStep = 0', function () {
		expect(wizardHelper.isFirstStep(getCurrentStep(0))).toBe(true);
	});

	it('should test isFirstStep when currentStep = 1', function () {
		expect(wizardHelper.isFirstStep(getCurrentStep(1))).toBe(false);
	});

	it('should test isFirstStep when currentStep = 1', function () {
		expect(wizardHelper.isFirstStep(getCurrentStep(-1))).toBe(false);
	});
	//endregion

	//region isButtonNameExist
	it('should test the isButtonNameExist when it exist', function () {
		var step = {back:{name:"back2"}};
		var buttonName = "back";
		expect(wizardHelper.isButtonNameExist(step,buttonName)).toBe(true);
	});

	it('should test the isButtonNameExist when not exist', function () {
		var step = {back:{name:null}};
		var buttonName = "back";
		expect(wizardHelper.isButtonNameExist(step,buttonName)).toBe(false);

		step = {back:{name:""}};
		expect(wizardHelper.isButtonNameExist(step,buttonName)).toBe(false);

		step = {back:{name:" "}};
		expect(wizardHelper.isButtonNameExist(step,buttonName)).toBe(false);

		step = {back:{text:""}};
		expect(wizardHelper.isButtonNameExist(step,buttonName)).toBe(false);

		step = {back:{}};
		expect(wizardHelper.isButtonNameExist(step,buttonName)).toBe(false);

		step = {};
		expect(wizardHelper.isButtonNameExist(step,buttonName)).toBe(false);

		step = null;
		expect(wizardHelper.isButtonNameExist(step,buttonName)).toBe(false);

		step = undefined;
		expect(wizardHelper.isButtonNameExist(step,buttonName)).toBe(false);

	});
	//endregion

	function getCurrentStep(index) {
		return {index: index};
	}
});