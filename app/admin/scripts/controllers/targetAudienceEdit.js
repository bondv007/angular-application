'use strict';
/**
 * Created by Liron.Tagger on 9/28/14.
 */

app.controller('targetAudienceEditCtrl', ['$scope', '$rootScope', '$state', 'enums', '$stateParams', 'EC2Restangular', 'mmAlertService',
	function ($scope, $rootScope, $state, enums, $stateParams, EC2Restangular, mmAlertService) {
		$scope.validation = {};
		$scope.labelWidth = 155;
		$scope.accountId = $stateParams.accountId;
		$scope.validation = {};
		$scope.isEditMode = true;

		$scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: updateState, ref: null, nodes: []};
		$scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: save, ref: null, nodes: [],isPrimary:true};

		var serverTargetAudiences = EC2Restangular.all('targetAudience');
		$scope.targetAudienceTypes = enums.targetAudienceTypes;

		$scope.$watch('$parent.mainEntity', function (newValue, oldValue) {
			if (newValue != oldValue || oldValue == null) {
				updateState();
			}
		});

		function updateState() {
			if ($scope.$parent.mainEntity != null) {
				$scope.isEditMode = true;
				$scope.targetAudience = $scope.$parent.mainEntity;
			}
			else {
				$scope.isEditMode = false;
				$scope.targetAudience = { name: null, type: "" };
			}
		}

		function save() {
			if (saveValidation()) {
				if($scope.isEditMode){
					return $scope.targetAudience.put().then(
						function(data){
							$scope.$parent.mainEntity = data;
							mmAlertService.addSuccess('Save', 'You successfully updated the account');
							return data;
						},
						function(error){
							mmAlertService.addError('Save', 'Updating the account has failed');
							processError(error);
						});
				}
				else {
					return serverTargetAudiences.post($scope.accountEdit).then(function(data){
						$scope.$parent.mainEntity = data;
						mmAlertService.addSuccess('Save', 'You successfully updated the account');
						if($scope.isEntral == false){
							$state.go("spa.targetAudience.targetAudienceEdit", {serverTargetAudienceId: data.id});
							return {};
						} else {
							return data;
						}
					},
					function(error){
						mmAlertService.addError('Save', 'Updating the account has failed');
						processError(error);
					});
				}
			}
		}

		$scope.onNameChange = function(){
			$scope.validation.name = '';
		}

		function saveValidation() {
			var isValid = true;
			$scope.validation = {};
			if($scope.targetAudience.name === undefined || $scope.targetAudience.name === null || $scope.targetAudience.name.length <= 2){
				$scope.validation.name = "Please enter a name longer than 2 characters";
				isValid = false;
			}
			if(isValid){
				$scope.validation = {};
			}

			return isValid;
		}

		function processError(error) {
			console.log('ohh no!');
			console.log(error);
			$scope.showSPinner = false;
			if (error.data.error === undefined) {
				mmAlertService.addError("Message", "Server error. Please try again later.", false);
			} else {
				mmAlertService.addError("Message", error.data.error, false);
			}
		}

	}]);
