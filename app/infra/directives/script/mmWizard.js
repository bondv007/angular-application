/**
 * Created by Ofir.Fridman on 10/8/14.
 */
'use strict';
app.directive('mmWizard', [ function () {
	return {
		restrict: 'E',

		templateUrl: 'infra/directives/views/template/wizard.html',
		controller: ['$scope', 'wizardHelper', '$modal', '$q',function ($scope, wizardHelper, $modal, $q) {
			angular.element('.mmmodal-body').css({'overflow': "hidden"});
			angular.element('.modal-footer').hide();
			$scope.buttons = wizardHelper.buttons;
			var buttonsName = wizardHelper.buttonsName;
			var cloneWizardSteps = angular.copy($scope.wizardSteps);
			var _disablePreviousSteps = false;
			$scope.isDisplaySteps = $scope.isDisplaySteps != false ;
			$scope.buttons[wizardHelper.back.index].onClick = backClick;
			$scope.buttons[wizardHelper.next.index].onClick = nextClick;
			$scope.buttons[wizardHelper.done.index].onClick = doneClick;
			$scope.buttons[wizardHelper.cancel.index].onClick = cancelClick;
			$scope.currentStep = {index: 0};
			$scope.onButtonClick = function (button) {
				if (!button.disable) {
          if(button.name && button.name === 'back'){
            var isNeedConfirmStep = wizardHelper.isBackActionNeedConfirm($scope.wizardSteps[$scope.currentStep.index]);
            var confirmStepFunc = null;
              if(isNeedConfirmStep){
                  confirmStepFunc = wizardHelper.backActionConfirmFunc($scope.wizardSteps[$scope.currentStep.index]);
              }
              button.onClick(confirmStepFunc);
          }
          else{
            button.onClick();
          }
				}
			};
			$scope.onStepClick = function (clickStepIndex) {
				var isClickStepIsCurrentStep = $scope.currentStep.index == clickStepIndex;
				if (!getStepByIndex(clickStepIndex).disable && !isClickStepIsCurrentStep) {
					var moveToStep =	executeApiStepAction(clickStepIndex);
					if(moveToStep != false){
						$scope.currentStep = {index: clickStepIndex};
						modifyButtons();
					}
				}
			};

			modifyButtons();

			function nextClick() {
				var goNext = executeApiButtonAction(buttonsName.next);
				if(goNext != false){
					updateStepIndex(1);
					modifyButtons();
				}
			}

      function backClick(confirmStepFunc) {

        if(typeof (confirmStepFunc) == "function"){
          confirmStepFunc().then(function(){
              var goBack = executeApiButtonAction(buttonsName.back);
              if(goBack != false){
                updateStepIndex(-1);
                modifyButtons();
              }
            }, function(){}
          );
        }
        else{
          var goBack = executeApiButtonAction(buttonsName.back);
          if(goBack != false){
            updateStepIndex(-1);
            modifyButtons();
          }
        }
			}

			function doneClick() {
				executeApiButtonAction(buttonsName.done);
			}

			function cancelClick() {
				executeApiButtonAction(buttonsName.cancel);
			}

			function executeApiButtonAction(buttonsName) {
				var button = getCurrentStep()[buttonsName];
				var goNext = true;
				if (wizardHelper.executeApiButtonFunction(button)) {
					goNext = button.onClick($scope.currentStep);
				}
				return goNext;
			}

			function executeApiStepAction(clickStepIndex) {
				var step = getStepByIndex(clickStepIndex);
				var moveToStep = true;
				if (wizardHelper.executeApiStepFunction(step)) {
					var data = {currentStep: $scope.currentStep, clickStepIndex: clickStepIndex};
					moveToStep = step.onClick(data);
				}
				return moveToStep;
			}

			function modifyButtons() {
				disableNextSteps();
				$scope.buttons[wizardHelper.back.index].display = !wizardHelper.isFirstStep($scope.currentStep);

				if (!wizardHelper.isLastStep($scope.wizardSteps, $scope.currentStep)) {
					$scope.buttons[wizardHelper.next.index].display = true;
					$scope.buttons[wizardHelper.done.index].display = false;
				}else{
					$scope.buttons[wizardHelper.next.index].display = false;
					$scope.buttons[wizardHelper.done.index].display = true;
				}

				if ($scope.wizardSteps && getCurrentStep()) {
					var step = getCurrentStep();
					modifyButtonsName(step);
					modifyButtonsDisable(step);
					modifyButtonsDisplay(step);
				}
			}

			function modifyButtonsName(step) {
				$scope.buttons[wizardHelper.back.index].name = (wizardHelper.isButtonNameExist(step, buttonsName.back)) ? getCurrentStep().back.name : buttonsName.back;
				$scope.buttons[wizardHelper.next.index].name = (wizardHelper.isButtonNameExist(step, buttonsName.next)) ? getCurrentStep().next.name : buttonsName.next;
				$scope.buttons[wizardHelper.done.index].name = (wizardHelper.isButtonNameExist(step, buttonsName.done)) ? getCurrentStep().done.name : buttonsName.done;
				$scope.buttons[wizardHelper.cancel.index].name = (wizardHelper.isButtonNameExist(step, buttonsName.cancel)) ? getCurrentStep().cancel.name : buttonsName.cancel;
			}

			function modifyButtonsDisable(step) {
				$scope.buttons[wizardHelper.back.index].disable = (wizardHelper.isButtonContainDisableKey(step, buttonsName.back)) ? getCurrentStep().back.disable : false;
				$scope.buttons[wizardHelper.next.index].disable = (wizardHelper.isButtonContainDisableKey(step, buttonsName.next)) ? getCurrentStep().next.disable : false;
				$scope.buttons[wizardHelper.done.index].disable = (wizardHelper.isButtonContainDisableKey(step, buttonsName.done)) ? getCurrentStep().done.disable : false;
				$scope.buttons[wizardHelper.cancel.index].disable = (wizardHelper.isButtonContainDisableKey(step, buttonsName.cancel)) ? getCurrentStep().cancel.disable : false;
			}

			function modifyButtonsDisplay(step) {
				if ($scope.isMovingForwardOnly) {
					$scope.buttons[wizardHelper.back.index].display = false;
					disablePreviousSteps();
				}
				else if(_disablePreviousSteps ||wizardHelper.isBackButtonDisable($scope.wizardSteps[$scope.currentStep.index])){
					_disablePreviousSteps = true;
					disablePreviousSteps();
				}
				$scope.buttons[wizardHelper.cancel.index].display = (wizardHelper.isButtonContainDisplayKey(step, buttonsName.cancel)) ? getCurrentStep().cancel.display : true;
			}

			function disablePreviousSteps() {
				for (var i = 0; i < $scope.currentStep.index; i++) {
					$scope.wizardSteps[i].disable = true;
				}
			}

			function getCurrentStep() {
				return getStepByIndex($scope.currentStep.index);
			}

			function getStepByIndex(stepIndex) {
				return $scope.wizardSteps[stepIndex];
			}

			function updateStepIndex(value){
				$scope.currentStep.index = $scope.currentStep.index + value;
			}

			function disableNextSteps() {
				var isNextButtonDisable =  wizardHelper.isNextButtonDisable(getCurrentStep(), buttonsName.next);
				for (var i = 0; i < $scope.wizardSteps.length; i++) {
					if(!cloneWizardSteps[i].disable){
						$scope.wizardSteps[i].disable = (i > $scope.currentStep.index + 1);
					}
					if(isNextButtonDisable && i > $scope.currentStep.index){
						$scope.wizardSteps[i].disable = true;
					}
				}
			}

			$scope.$watch('wizardSteps', function() {
				modifyButtons();
			},true);
		}]
	}
}]
);