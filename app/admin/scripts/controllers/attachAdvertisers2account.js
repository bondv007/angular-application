/**
 * Created by yoav.karpeles on 3/10/14.
 */

'use strict';

app.controller('attachAdvertisers2accountCtrl',
	['$scope', 'EC2Restangular', 'enums', '$modalInstance', 'account', 'advertisers', 'mmAlertService', '$timeout',
		function ($scope, EC2Restangular, enums, $modalInstance, account, advertisers, mmAlertService, $timeout) {
			$scope.account = account;
			$scope.advertisers = advertisers._orig;
			$scope.advID2accID = advertisers._advID2accID;
			$scope.newAdv = {};
			$scope.createNewAdv = false;
			$scope.verticals = enums.verticals;
			$scope.advertiserStatuses = enums.advertiserStatus;
			$scope.selectedAdvertisers = {ids:[], origIds: []};
			$scope.isRequired = false;
			$scope.isEditMode = false;
			$scope.labelWidth = 130;
			$scope.externalId = {};
			$scope.validation = {};
			//custom classes
			$scope.miniSection = true;

			for(var i = 0; i < $scope.advertisers.length; i++){
				if($scope.advID2accID[$scope.advertisers[i].id][$scope.account.id]!==undefined){
					$scope.selectedAdvertisers.ids.push($scope.advertisers[i].id);
					$scope.selectedAdvertisers.origIds.push($scope.advertisers[i].id);
				}
			}

			initialExternalId();

			$scope.toggleAdv = function(b) {
				$timeout(function(){
					$scope.createNewAdv = b;
				}, 50);
			};

			$scope.cancel = function () {
				$modalInstance.dismiss('cancel');
			};

			$scope.attach = function() {
				$scope.createNewAdv ? attachNew() : attachExisting();
			};

			function attachNew() {
				// Create a new advertiser
				if(saveValidation()) {
					return advertisers.ec2Restangular.post(
						{
							type: enums.type.getId("advertiser"),
							name: $scope.newAdv.name,
							vertical: $scope.newAdv.vertical,
							status: $scope.newAdv.status,
							externalId: $scope.externalId || initialExternalId()
						}
					).then(function (data) {
							if (!data.hasOwnProperty('id')) {
								console.error('The server returned an object other than advertiser. Data: ' + data);
								mmAlertService.addError('Save', 'Creating the new advertiser failed');
								$modalInstance.close();
								return;
							}
							// If the new advertiser was created successfully, create a new advertiser account.
							saveAdvertiserAccounts([
								{
									type: enums.type.getId("advertiserAccount"),
									accountId: $scope.account.id,
									advertiserId: data.id,
									name: data.name + ' - ' + $scope.account.name,
									externalId: data.externalId || initialExternalId()
								}
							]);
						}, function (error) {
							console.log("ERROR");
							processError(error);
							mmAlertService.addError('Save', 'Creating the new advertiser failed');
							$modalInstance.close();
						});
				}
			}

			function attachExisting() {
				var elements = [];
				for (var i = 0; i < $scope.advertisers.length; i++) {
					if ($scope.selectedAdvertisers.ids.indexOf($scope.advertisers[i].id) > -1) {
						if($scope.selectedAdvertisers.origIds.indexOf($scope.advertisers[i].id) < 0){
							elements.push({
								type: enums.type.getId("advertiserAccount"),
								accountId: $scope.account.id,
								advertiserId: $scope.advertisers[i].id,
								name: $scope.advertisers[i].name + ' - ' + $scope.account.name,
								externalId: $scope.externalId || initialExternalId()
							});
						}
					}
				}

				if (elements.length > 0) {
					saveAdvertiserAccounts(elements);
				}
			}

			function saveAdvertiserAccounts(advertiserAccounts) {
					return EC2Restangular.all('advertiseraccounts').post({entities: advertiserAccounts}).then(function () {
						mmAlertService.addSuccess('Save', 'You successfully attach advertisers to the account');
						$modalInstance.close();
					}, function (error) {
						console.log("ERROR");
						processError(error);
						mmAlertService.addError('Save', 'Attaching advertisers to account failed');
						$modalInstance.close();
					});
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

			//validation using mm-error directive
			function saveValidation() {
				var isValid = true;
				$scope.validation = {};

				isValid = $scope.externalId.externalIdValidation();

				if($scope.newAdv.name === undefined || $scope.newAdv.name === null || $scope.newAdv.name.length <= 2){
					$scope.validation.name = "Please enter a name longer than 2 characters";
					isValid = false;
				}
				if($scope.newAdv.vertical === undefined || $scope.newAdv.vertical === null){
					$scope.validation.vertical = "Please select status";
					isValid = false;
				}
				if($scope.newAdv.status === undefined || $scope.newAdv.status === null){
					$scope.validation.status = "Please select vertical";
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

			$scope.onVerticalSelected = function(){
				$scope.validation.vertical = '';
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
