/**
 * Created by yoav.karpeles on 3/10/14.
 */

'use strict';

app.controller('attachSites2accountCtrl',
  ['$scope', 'EC2Restangular', 'enums', '$modalInstance', 'account', 'sites', 'mmAlertService', '$timeout',
  function ($scope, EC2Restangular, enums, $modalInstance, account, sites, mmAlertService, $timeout) {
    $scope.account = account;
    $scope.sites = sites._orig;
    $scope.siteID2accID = sites._siteID2accID;
    $scope.newSite = {};
    $scope.createNewSite = false;
		$scope.isRequired = false;
		$scope.isEditMode = false;
    $scope.siteStatuses = enums.siteStatuses;
    $scope.selectedSites = {ids:[], origIds: []};
		$scope.externalId = {};
		$scope.validation = {};
		$scope.labelWidth = 80;
		//custom classes
		$scope.layoutType="custom";
		$scope.outerControlClass="col-lg-12";
		$scope.labelLayoutClass="col-lg-4";
		$scope.controlLayoutClass="col-lg-8";
		$scope.miniSection = true;

    for(var i = 0; i < $scope.sites.length; i++){
      if($scope.siteID2accID[$scope.sites[i].id][$scope.account.id] !== undefined){
        $scope.selectedSites.ids.push($scope.sites[i].id);
        $scope.selectedSites.origIds.push($scope.sites[i].id);
      }
    }

		$scope.newSite.status = enums.siteStatuses.getName("Enabled");
		initialExternalId();

    $scope.toggleSite = function(b) {
      $timeout(function(){
        $scope.createNewSite = b;
      }, 50);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.attach = function() {
      $scope.createNewSite ? attachNew() : attachExisting();
    };

    function attachNew() {
      // Create a new site
      if(saveValidation()) {
				return sites.ec2Restangular.post(
					{
						type: enums.type.getId("site"),
						name: $scope.newSite.name,
						status: $scope.newSite.status,
						externalId: $scope.externalId
					}
				).then(function (data) {
						if (!data.hasOwnProperty('id')) {
							console.error('The server returned an object other than site. Data: ' + data);
							mmAlertService.addError('Save', 'Creating the new site failed');
							$modalInstance.close();
							return;
						}

						EC2Restangular.all('sites').get(data.id).then(function (site) {
							if (!site.hasOwnProperty('relations')) {
								console.error('The server returned an object other than site. Data: ' + site);
								mmAlertService.addError('Save', 'Creating the new site failed');
								$modalInstance.close();
								return;
							}

							if (site.relations.accountIds == null) {
								site.relations.accountIds = [];
							}
							site.relations.accountIds.push($scope.account.id);
							return EC2Restangular.one('siterelations', site.relations.id)
								.customPUT({entities: [site.relations]})
								.then(function (data) {
									$scope.$root.mmIsPageDirty = 0;
									$scope.showSPinner = false;
									mmAlertService.addSuccess('Save', 'You successfully attached sites to the account');
									$modalInstance.close();
								}, processError);
						}, processError);
					}, function () {
						console.log("ERROR");
						mmAlertService.addError('Save', 'Creating the new site failed');
						$modalInstance.close();
					});
			}
    }

    function attachExisting() {
      var siteRelationsToUpdate = [];
      for (var i = 0; i < $scope.sites.length; i++) {
        if($scope.selectedSites.ids.indexOf($scope.sites[i].id) > -1) {
          if($scope.selectedSites.origIds.indexOf($scope.sites[i].id) < 0){
            //add to relation
            if($scope.sites[i].relations == null){
              console.error('Relation object is null for site id: ' + $scope.sites[i].id);
              mmAlertService.addError('Save', 'Attaching sites to account failed');
              $modalInstance.close();
              return;
            } else{
              if($scope.sites[i].relations.accountIds == null){
                $scope.sites[i].relations.accountIds = [];
              }
              if($scope.sites[i].relations.accountIds.indexOf($scope.account.id) < 0){
                $scope.sites[i].relations.accountIds.push($scope.account.id);
                siteRelationsToUpdate.push($scope.sites[i].relations);
              }
            }
          }
        } else if($scope.selectedSites.origIds.indexOf($scope.sites[i].id) > -1) {
            //remove from relations
          if($scope.sites[i].relations.accountIds.indexOf($scope.account.id) > -1){
            $scope.sites[i].relations.accountIds.splice($scope.sites[i].relations.accountIds.indexOf($scope.account.id), 1);
            siteRelationsToUpdate.push($scope.sites[i].relations);
          }
        }
      }

      $scope.updateCounter = siteRelationsToUpdate.length;
      for (var i = 0; i < siteRelationsToUpdate.length; i++) {
        var siteRelationToUpdate = EC2Restangular.one('siterelations',siteRelationsToUpdate[i].id);
        siteRelationToUpdate.customPUT({entities: [siteRelationsToUpdate[i]]}).then(function(data){
          $scope.updateCounter--;
        }, processError);
      }
    }

    $scope.$watch('updateCounter', function(newVal){
      if(newVal == 0){
        mmAlertService.addSuccess('Save', 'You successfully attached sites to the account');
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

		function saveSiteAccounts(siteAccounts){
			return EC2Restangular.all('siteaccounts').post({entities: siteAccounts}).then(function () {
				mmAlertService.addSuccess('Save', 'You successfully attached sites to the account');
				$modalInstance.close();
			}, function () {
				console.log("ERROR");
				mmAlertService.addError('Save', 'Attaching sites to account failed');
				$modalInstance.close();
			});
		}

		//validation using mm-error directive
		function saveValidation() {
			var isValid = true;
			$scope.validation = {};

			isValid = $scope.externalId.externalIdValidation();

			if($scope.newSite.name === undefined || $scope.newSite.name === null || $scope.newSite.name.length <= 2){
				$scope.validation.name = "Please enter a name longer than 2 characters";
				isValid = false;
			}
			if($scope.newSite.status === undefined || $scope.newSite.status === null){
				$scope.validation.status = "Please select status";
				isValid = false;
			}

			if(isValid){
				$scope.validation = {};
			}
			return isValid;
		}

		//on changed events to removed the validation error messages (temporary until infra solution will be add)
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
