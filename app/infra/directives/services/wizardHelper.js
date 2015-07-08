/**
 * Created by Ofir.Fridman on 10/13/14.
 */
'use strict';

app.service('wizardHelper', [function () {
	var back = {name: "back"};
	var next = {name: "next"};
	var done = {name: "done"};
	var cancel = {name: "cancel"};
	var buttonsName = {back: back.name, next: next.name, done: done.name, cancel: cancel.name};
	var backButton = {name: back.name, isLeftIcon: true, cssIconName: back.name, display: false, disable: false, confirmStepFunc: null};
	var nextButton = {name: next.name, isLeftIcon: false, cssIconName: next.name, isPrimary: true, display: true, disable: false, confirmStepFunc: null};
	var doneButton = {name: done.name, isPrimary: true, display: false, disable: false};
	var cancelButton = {name: cancel.name, display: true, disable: false};
	var buttons = [backButton, nextButton, doneButton, cancelButton];
	var mapNameButtonToIndex = null;

	back.index = getButtonsIndexByName(back.name);
	next.index = getButtonsIndexByName(next.name);
	done.index = getButtonsIndexByName(done.name);
	cancel.index = getButtonsIndexByName(cancel.name);
	function getButtonsIndexByName(name) {
		if (!mapNameButtonToIndex) {
			mapNameButtonToIndex = {};
			for (var i = 0; i < buttons.length; i++) {
				mapNameButtonToIndex[buttons[i].name] = i;
			}
		}
		return mapNameButtonToIndex[name.trim().toLowerCase()];
	}

	function isLastStep(wizardSteps, currentStep) {
		return wizardSteps.length - 1 == currentStep.index;
	}

	function isFirstStep(currentStep) {
		return currentStep.index == 0;
	}

	function isButtonNameExist(step, buttonName) {
		return !!step && !!step[buttonName] && !_.isEmpty(step[buttonName].name) && !_.isEmpty(step[buttonName].name.trim());
	}

	function isButtonContainDisableKey(step, buttonName) {
		return step[buttonName] && step[buttonName].disable != undefined && step[buttonName].disable != null;
	}

	function isNextButtonDisable(step, buttonName) {
		return isButtonContainDisableKey(step, buttonName) && step[buttonName].disable;
	}

	function isButtonContainDisplayKey(step, buttonName) {
		return step[buttonName] && step[buttonName].display != undefined && step[buttonName].display != null;
	}

	function executeApiButtonFunction(button) {
		return button && _.isFunction(button.onClick);
	}

	function executeApiStepFunction(step) {
		return step && _.isFunction(step.onClick);
	}

	function isBackButtonDisable(wizardStep) {
		return wizardStep.back && wizardStep.back.disable == true;
	}

    function isBackActionNeedConfirm(wizardStep) {
       return wizardStep.back && wizardStep.back.confirmStepFunc && typeof(wizardStep.back.confirmStepFunc) == "function";
    }

    function backActionConfirmFunc(wizardStep) {
        return wizardStep.back.confirmStepFunc;
    }

	return {
		buttons: buttons,
		buttonsName: buttonsName,
		back: back,
		next: next,
		done: done,
		cancel: cancel,
		isLastStep: isLastStep,
		isFirstStep: isFirstStep,
		isButtonNameExist: isButtonNameExist,
		isButtonContainDisableKey: isButtonContainDisableKey,
		isNextButtonDisable: isNextButtonDisable,
		executeApiButtonFunction: executeApiButtonFunction,
		isButtonContainDisplayKey: isButtonContainDisplayKey,
		executeApiStepFunction: executeApiStepFunction,
		isBackButtonDisable: isBackButtonDisable,
        isBackActionNeedConfirm: isBackActionNeedConfirm,
        backActionConfirmFunc: backActionConfirmFunc
	};
}]);