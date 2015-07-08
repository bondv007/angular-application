'use strict';

app.controller('accountEditModalCtrl', ['$scope', '$rootScope', '$state', 'enums', '$stateParams', 'mmRest', 'mmAlertService', '$modalInstance',
	function ($scope, $rootScope, $state, enums, $stateParams, mmRest, mmAlertService, $modalInstance) {
		//$rootScope.mmIsPageDirty = 0;
		$scope.validation = {};
		$scope.accountId = $stateParams.accountId;
		$scope.pageReady = false;
		$scope.isEditMode = true;
		$scope.isRequired = false;
    if(!_.isUndefined($scope.$parent.isEntral)){
      $scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: updateState, ref: null, nodes: []};
      $scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: save, ref: null, nodes: [],isPrimary:true};
    }
		$scope.validation = {};
		$scope.labelWidth = 125;
		$scope.miniSection = false;

		$scope.showSPinner = true;
		if($scope.accountId !== undefined && $scope.accountId !== null && $scope.accountId.length > 0){
      mmRest.accounts.get($scope.accountId).then(
				function(data) {
					$scope.$parent.mainEntity = data;
					$scope.showSPinner = false;
				},
				processError);
		} else {
			updateState();
		}

		$scope.$watch('$parent.mainEntity', function (newValue, oldValue) {
			if (newValue != oldValue || oldValue == null || $scope.isEntral) {
				updateState();
			}
		});

		function updateState() {
			//$rootScope.mmIsPageDirty = 0;
			if ($scope.$parent.mainEntity != null) {
				$scope.isEditMode = true;
				$scope.accountEdit = $scope.$parent.mainEntity;
			} else {
				$scope.isEditMode = false;
				$scope.accountEdit = {
					name: null,
					status: "Enabled", //TODO: remove status when server side is done
					type: "Account"
				};
			}

			initialExternalId();
			$scope.pageReady = $scope.accountEdit != null;
		}

		function initialExternalId(){
			if(_.isUndefined($scope.accountEdit.externalId) ||_.isNull($scope.accountEdit.externalId)){
				$scope.accountEdit.externalId = {
					entityType: null,
					id: null
				}
			}
			//add reference to the external id object that is bound to the control model
			$scope.externalId = $scope.externalId || {};
			$scope.externalId = $scope.accountEdit.externalId;
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

		function cancel() {
			updateState();
		}

		function save() {
			if (saveValidation()) {
				return mmRest.accounts.post($scope.accountEdit).then(
          function(data){
            //$rootScope.mmIsPageDirty = 0;
            $scope.$parent.mainEntity = data;
            $scope.showSPinner = false;
            mmAlertService.addSuccess('Save', 'You successfully updated the account');
            $modalInstance.close(data);
          },
          function(error){
            mmAlertService.addError('Save', 'Updating the account has failed');
            processError(error);
          });
			}
		}

		$scope.onNameChange = function(){
			$scope.validation.name = '';
		}

		function saveValidation() {
			var isValid = true;
			$scope.validation = {};

			//external id directive validation
			isValid = $scope.externalId.externalIdValidation();

			if($scope.accountEdit.name === undefined || $scope.accountEdit.name === null || $scope.accountEdit.name.length <= 2){
				$scope.validation.name = "Please enter a name longer than 2 characters";
				isValid = false;
			}
			if(isValid){
				$scope.validation = {};
			}
			return isValid;
		}

    $scope.onNewEntitySave = function(){
      save();
    }

    $scope.onNewEntityCancel = function(){
      $modalInstance.dismiss('cancel');
    }
	}]);
