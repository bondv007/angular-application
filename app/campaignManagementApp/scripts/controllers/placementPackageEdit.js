'use strict';

app.controller('placementPackageEditCtrl', ['$scope', '$stateParams', 'mmRest', '$state', '$modal', '$filter',
  'mmAlertService','enums','entityMetaData','validationHelper','mmModal','entity', 'servingAndCostService', '$modalInstance',
	function ($scope, $stateParams, mmRest, $state, $modal, $filter,  mmAlertService, enums, entityMetaData, validationHelper, mmModal, entity, servingAndCostService, $modalInstance) {
        $scope.isEditMode = !!$stateParams.packageId || !!$scope.isEntral;

		var serverPlacementsPackages = mmRest.placementPackages;
		var serverCampaigns = mmRest.campaigns;
    var validationResult = {
      isSuccess: true,
      fields: []
    };
		$scope.labelWidth = 135;
    $scope.isModal = false;
    $scope.selected = { servingAndCosts: [] };
    $scope.servingAndCostDisplay = true;
    $scope.campaignName = '';
    $scope.toggle = true;
    $scope.placementPackageId = $stateParams.packageId ? $stateParams.packageId : $scope.$parent.entityId;
    $scope.campaignId = $stateParams.campaignId;
    $scope.newMode = false; // Default is edit

    function initError(){
      $scope.packageNameError = {text: ''};
      $scope.packageSiteError = {text:''};
      $scope.packageBookedImpressionError = {text:''};
    }
		initError();

    if ($scope.isEditMode) {
      serverPlacementsPackages.get($scope.placementPackageId).then(getData, processError);
    }
    else {
      $scope.editObject = _.cloneDeep(getDummyPackage());
      servingAndCostService.init($scope);
      $scope.newMode = true;
    }

    function getData(data) {
      // Clean dirty after getting new data
      var updatedData = (data[0]) ? data[0]: data;
      $scope.editObject = updatedData;
      $scope.editObject = _.defaults($scope.editObject,$scope.dummyPackage); // Add undefined fields
      $scope.originalCopy = mmRest.EC2Restangular.copy($scope.editObject);
      servingAndCostService.init($scope);
      return updatedData;
    }

    if ($scope.campaignId) {
			serverCampaigns.get($scope.campaignId).then(
				function(data) {
					$scope.campaignName = data.name + " (" + $scope.campaignId + ")";
				},
				function(error) {
					$scope.campaignName = "";
				});
		}
    if(!_.isNull(entity)) {
      $scope.isModal = true;
    }

  (function initButtons(){
      if(!_.isUndefined($scope.entityLayoutInfraButtons)) {
        $scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: discard, ref: null, nodes: []}
        $scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: save, isPrimary: true, ref: null, nodes: []}
      }
		})();

    $scope.onNewEntitySave = function(){
      save();
    }

    $scope.onNewEntityCancel = function(){
      $modalInstance.dismiss('cancel');
    }

		function save() {
      servingAndCostService.tempSetServingAndCostData();
			if (saveValidation())

        // In case of modal
        if($scope.isModal){
          return serverPlacementsPackages.post($scope.editObject).then(processCreatePackage, processCreatePackageError)
        }

        // In case of a page
				if (!$scope.editObject.id) {
					return serverPlacementsPackages.post($scope.editObject).then(processData, processError);
				}
        else {
					return $scope.editObject.put().then(processData, processError);
				}
		};

    function processCreatePackage(data){
      $scope.editObject = data;
      mmAlertService.addSuccess('Successfully created a site package.');
      $modalInstance.close($scope.editObject);
    }

    function processCreatePackageError(){
      mmAlertService.addError($filter("translate")("Please fix the errors below."));
    }

		function discard() {
      if ($scope.isEditMode) {
        $scope.editObject = mmRest.EC2Restangular.copy($scope.originalCopy);
      } else {
        $scope.editObject = _.cloneDeep(getDummyPackage());
      }
      servingAndCostService.init($scope);
      $scope.validation = {};
		}

		function processData(data) {
			mmAlertService.addSuccess(("Package has been saved successfully."));
			return getData(data);
		}

		function processError(error) {
			console.log(error);
			if (error.data && error.data.error === undefined) {
				mmAlertService.addError("Server error. Please try again later.");
			}
			else {
				mmAlertService.addError(error.data.error);
			}
			return error;
		}

		// Get enums values
		$scope.costModels = enums.packageCostModels;
		$scope.servingCompleteMethods = enums.hardStop;
		$scope.costActionTypes = enums.packageCostActionTypes;

		// Default entity
		function getDummyPackage () {
			var dummyPackage = entityMetaData.placementPackage.defaultJson;
			dummyPackage.campaignId = $scope.campaignId;

			return dummyPackage;
		}

		var watcher = $scope.$watch('$parent.mainEntity', function (newValue, oldValue) {
            if($scope.isEditMode){
                if (newValue != oldValue) {
                    $scope.editObject = newValue;
                    $scope.newMode = false;
                }
                else if (!$scope.editObject && newValue){
                    $scope.editObject = newValue;
                    $scope.newMode = false;
                }
            }
			else {
				$scope.editObject = _.cloneDeep(getDummyPackage());
				$scope.newMode = true;
			}
      servingAndCostService.init($scope);
		});

		// Package Validation
		function saveValidation() {
			var valid = true;
			if (!packageNameValidation())
				valid = false;
			if (!packageSiteValidation())
				valid = false;
      if(!servingAndCostService.validate()){
        valid = false;
      }

			return valid;
		}

		function packageNameValidation() {
			var value = $scope.editObject.name;

      var requiredValidation = validationHelper.requiredValidation({value: value, error: $scope.packageNameError, fieldName: $filter("translate")("Package Name")});
      var maxLengthValidation = validationHelper.maxLengthValidation({value: value, error: $scope.packageNameError, fieldName: $filter("translate")("Package Name"), maxLength: 100});
      return requiredValidation & maxLengthValidation;
		}

		function packageSiteValidation() {
			var value = $scope.editObject.siteId;
			return validationHelper.requiredValidation({value: value, error: $scope.packageSiteError, fieldName: $filter("translate")("Site")});
		}

		function packageBookedImpresssionValidation() {
			var value = $scope.editObject.mediaServingData.units;
			return validationHelper.isPositiveInteger({value: value, error: $scope.packageBookedImpressionError, fieldName: $filter("translate")("Booked Impressions")});
		}

		// End package validation


    //$scope.canChangeSite = function(){
    //  if (!$scope.isEditMode) {
    //    return true
    //  }
		//
    //  return false;
    //}

		$scope.$on('$destroy', function() {
			if (watcher){
				watcher();
			}
			cleanScopeParams();
		});
		function cleanScopeParams(){
			$scope.editObject = null;

			$scope.costModels = null;
			$scope.servingCompleteMethods = null;
			$scope.costActionTypes = null;
		}
	}]);
