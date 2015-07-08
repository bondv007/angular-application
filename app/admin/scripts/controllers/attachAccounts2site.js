/**
 * Created by yoav.karpeles on 3/10/14.
 */

'use strict';

app.controller('attachAccounts2siteCtrl',
	['$scope', 'EC2Restangular', 'enums', '$modalInstance', 'site', 'accounts', 'mmAlertService', '$timeout',
		function ($scope, EC2Restangular, enums, $modalInstance, site, accounts, mmAlertService, $timeout) {
			$scope.site = site;
			$scope.accounts = accounts;
			$scope.newAccount = {};
			$scope.createNewAccount = false;
			$scope.isRequired = false;
			$scope.isEditMode = false;
			$scope.selectedAccounts = {ids: []}
			$scope.accountStatuses = enums.accountStatus;
			$scope.externalId = {};
			$scope.labelWidth = 80;
			//custom classes
			$scope.layoutType="custom";
			$scope.outerControlClass="col-lg-12";
			$scope.labelLayoutClass="col-lg-4";
			$scope.controlLayoutClass="col-lg-8";
			$scope.validation = {};
			$scope.miniSection = true;

			if($scope.site.relations == null){
				console.error('Relation object is null for site id: ' + $scope.site.id);
				mmAlertService.addError('Save', 'Cannot attach accounts to this site.');
				$modalInstance.close();
				return;
			} else {
				if($scope.site.relations.accountIds == null){
					$scope.site.relations.accountIds = [];
				}
				$scope.selectedAccounts.ids = $scope.site.relations.accountIds.slice();
			}

			$scope.newAccount.status = enums.accountStatus.getName("Enabled");
			initialExternalId();

			$scope.toggleAccount = function(b) {
				$timeout(function(){
					$scope.createNewAccount = b;
				}, 50);
			};

			$scope.cancel = function () {
				$modalInstance.dismiss('cancel');
			};

			$scope.attach = function() {
				$scope.createNewAccount ? attachNew() : attachExisting();
			};

			function attachNew() {
				if (saveValidation()){
					// Create a new account
					return accounts.ec2Restangular.post(
						{
							type: enums.type.getId("account"),
							name: $scope.newAccount.name,
							status: $scope.newAccount.status,
							externalId: $scope.externalId
						}
					).then(function (data) {
							if (!data.hasOwnProperty('id')) {
								console.error('The server returned an object other than account. Data: ' + data);
								mmAlertService.addError('Save', 'Creating the new account failed');
								$modalInstance.close();
								return;
							}
							// If the new account was created successfully, update the account relations.
							$scope.site.relations.accountIds.push(data.id);
							return saveSiteRelations();
						}, function () {
							console.log("ERROR");
							mmAlertService.addError('Save', 'Creating the new account failed');
							$modalInstance.close();
						});
				}
			}

			function attachExisting() {
				$scope.site.relations.accountIds = [];
				for(var i = 0; i < $scope.selectedAccounts.ids.length; i++){
					if($scope.site.relations.accountIds.indexOf($scope.selectedAccounts.ids[i]) < 0){
						$scope.site.relations.accountIds.push($scope.selectedAccounts.ids[i]);
					}
				}
				return saveSiteRelations();
			}

			$scope.$watch('updateCounter', function(newVal){
				if(newVal == 0){
					mmAlertService.addSuccess('Save', 'You successfully attached accounts to the site');
					$modalInstance.close();
				}
			});

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

			function saveSiteRelations(){
				return EC2Restangular.one('siterelations', $scope.site.relations.id)
					.customPUT({entities: [$scope.site.relations]})
					.then(function (data) {
						$scope.$root.mmIsPageDirty = 0;
						$scope.showSPinner = false;
						mmAlertService.addSuccess('Save', 'You successfully attached accounts to the site');
						$modalInstance.close();
					}, processError);
			}

			//validation using mm-error directive
			function saveValidation() {
				var isValid = true;
				$scope.validation = {};

				isValid = $scope.externalId.externalIdValidation();

				if($scope.newAccount.name === undefined || $scope.newAccount.name === null || $scope.newAccount.name.length <= 2){
					$scope.validation.name = "Please enter a name longer than 2 characters";
					isValid = false;
				}

				if($scope.newAccount.status === undefined || $scope.newAccount.status === null){
					$scope.validation.status = "Please select status";
					isValid = false;
				}

				if(isValid){
					$scope.validation = {};
				}
				return isValid;
			}

			$scope.onNameChanged = function(){
				$scope.validation.name = '';
			}

			$scope.onStatusSelected = function(){
				$scope.validation.status = '';
			}

			function initialExternalId(){
				$scope.externalId = {
					entityType: null,
					id: null
				}
			}

		}]);