/**
 * Created by Ofir.Fridman on 8/24/14.
 */
'use strict';

app.controller('externalSiteContactCtrl', ['$scope', '$modalInstance', 'enums', 'siteContactsGrid', 'mmAlertService', 'validationHelper', 'selectedSiteContacts',
	function ($scope, $modalInstance, enums, siteContactsGrid, mmAlertService, validationHelper, selectedSiteContacts) {
		$scope.externalContact = (selectedSiteContacts) ? selectedSiteContacts : siteContactsGrid.getNewContactObj(true);
		$scope.role = enums.siteContactsRole;
		initErrors();
		$scope.addExternalContact = function () {

			if (validation()) {
				mmAlertService.closeError();
				$modalInstance.close($scope.externalContact);
			} else {
				mmAlertService.addError("Please fix the errors below.");
			}
		};
		$scope.cancel = function () {
			mmAlertService.closeError();
			$modalInstance.dismiss('cancel');
		};

		function initErrors() {
			$scope.roleError = {text: ""};
			$scope.nameError = {text: ""};
			$scope.emailError = {text: ""};
		}

		function validation() {
			var valid = true;
			if (!roleValidation())
				valid = false;
			if (!nameValidation())
				valid = false;
			if (!emailValidation())
				valid = false;
			return valid;
		}

		function roleValidation() {
			var valid = true;
			var value = $scope.externalContact.role;
			if (!validationHelper.requiredValidation({value: value, error: $scope.roleError, fieldName: "Role"})) {
				valid = false;
			}
			return valid;
		}

		function nameValidation() {
			var valid = true;
			var value = $scope.externalContact.name;
			if (!validationHelper.requiredValidation({value: value, error: $scope.nameError, fieldName: "Full Name"})) {
				valid = false;
			}
			return valid;
		}

		function emailValidation() {
			var valid = true;
			var value = $scope.externalContact.email;
			if (!validationHelper.requiredValidation({value: value, error: $scope.emailError, fieldName: "Email"})) {
				valid = false;
			}
			else if (!validationHelper.isValidEmailFormat({value: value, error: $scope.emailError})) {
				valid = false;
			}
			return valid;
		}
	}]);


