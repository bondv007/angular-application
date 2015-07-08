/**
 * Created by rotem.perets on 5/28/14.
 */
'use strict';

app.controller('brandEditCtrl', ['$scope', '$rootScope', 'mmAlertService', 'EC2Restangular', '$q', 'enums', '$state',
	function ($scope, $rootScope, mmAlertService, EC2Restangular, $q, enums, $state) {
		$scope.labelWidth = 135;
		$scope.validation = {};
		$scope.error = {name: ""};
		$scope.pageReady = false;
		$scope.$watch('$parent.mainEntity', updateState);
		$scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: rollback, ref: null, nodes: []}
		$scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: save, ref: null, nodes: [],isPrimary:true}
		$scope.verticals = enums.verticals;
		$scope.isEditMode = true;
		$scope.isRequired = false;
		$scope.initialLoad = true;
		$rootScope.mmIsPageDirty = 0;
		$scope.listItems = [];
		$scope.selectedEditItem = {};
		$scope.hasAccessToParent = false;
		$scope.parentDataType = "Brand";
		$scope.childDataType = "BrandAdvertiserAccount";
		$scope.parentDataPath = "brands";
		$scope.childDataPath = "brandadvertiseraccounts";
		$scope.miniSection = false;

		var serverAdvertiser = EC2Restangular.all('advertisers');
		serverAdvertiser.getList().then(function(data){
			$scope.advertisers = data;
		}, processError);

		function processError(error) {
			console.log('ohh no!');
			console.log(error);
			if (error.data.error === undefined) {
				mmAlertService.addError("Message", "Server error. Please try again later.", false);
			} else {
				mmAlertService.addError("Message", error.data.error, false);
			}
		}

		function saveValidation() {
			var isValid = true;
			$scope.validation = {};

			isValid = $scope.externalId.externalIdValidation();

			if($scope.editObject.name === undefined || $scope.editObject.name === null || $scope.editObject.name.length <= 2){
				$scope.validation.name = "Please enter a name longer than 2 characters";
				isValid = false;
			}
			if($scope.entityRoot){
				if($scope.editObject.advertiserId === undefined || $scope.editObject.advertiserId === null){
					$scope.validation.advertiser = "Please select an advertiser";
					isValid = false;
				}
			}
			if($scope.editObject.vertical === undefined || $scope.editObject.vertical === null){
				$scope.validation.vertical = "Please select vertical";
				isValid = false;
			}

			if(isValid){
				$scope.validation = {};
			}
			return isValid;
		}

		function brandNameValidation() {
			var valid = true;
			$scope.brandNameError = {text: ''};
			if ($scope.editObject.name === null || $scope.editObject.name === '') {
				$scope.brandNameError = {text: 'Brand name is required'};
				valid = false;
			}
			return valid;
		}

		function brandDisplayNameValidation() {
			var valid = true;
			$scope.brandDisplayNameError = {text: ''};
			if ($scope.editObject.name === null || $scope.editObject.name === '') {
				$scope.brandDisplayNameError = {text: 'Brand display name is required'};
				valid = false;
			}
			return valid;
		}

		function advertiserValidation() {
			var valid = true;
			$scope.advertiserNameError = {text: ''};
			if ($scope.editObject.advertiserId === undefined || $scope.editObject.advertiserId === null || $scope.editObject.advertiserId === "") {
				$scope.advertiserNameError = {text: 'Advertiser is required'};
				valid = false;
			}
			return valid;
		}

		$scope.onBrandNameChange = function(){
			$scope.validation.name = '';
		}

		$scope.onVerticalSelected = function(){
			$scope.validation.vertical = '';
		}

		function save() {
			if (saveValidation()) {
				if ($scope.isEditMode === true) {
					var serverSave = {};
					if ($scope.editObject.type === $scope.parentDataType) serverSave = EC2Restangular.one($scope.parentDataPath, $scope.editObject.id);
					else serverSave = EC2Restangular.one($scope.childDataPath, $scope.editObject.id);
					return serverSave.customPUT({entities: [$scope.editObject]}).then(function(data){
						$rootScope.mmIsPageDirty = 0;
						resetlistItems($scope.editObject);
						if ($scope.$parent.mainEntity.id === data.id) $scope.$parent.mainEntity = data;
						if ($scope.editObject.type == $scope.parentDataType) $scope.parentName = $scope.editObject.name;
						$scope.originalCopy = EC2Restangular.copy($scope.editObject);
						$scope.showSPinner = false;
						mmAlertService.addSuccess('Save', 'You successfully updated the item');
						return data;
					}, processError);
				} else {
					return EC2Restangular.all($scope.parentDataPath).post($scope.editObject).then(function (data) {
						$rootScope.mmIsPageDirty = 0;
						$scope.isEditMode = false;
						mmAlertService.addSuccess('Save', 'You successfully created the item');
						if ($scope.$parent.isEntral) {
							$scope.$parent.mainEntity = data;
							return data;
						} else {
							$state.go("spa.brand.brandEdit", {brandId: data.id}, {location: "replace"});
						}
					}, processError);
				}
			}
		}

		function resetlistItems(data){
			for (var i = 0; i < $scope.listItems.length; i++){
				if ($scope.listItems[i].id === data.id) {
					if (data.type === $scope.childDataType) data._displayName = data.id + " - " + data.name;
					$scope.listItems[i] = data;
					$scope.selectedEditItem = data;
				}
			}
		}

		function rollback(){
			$scope.editObject = EC2Restangular.copy($scope.originalCopy);
			$scope.externalId = $scope.editObject.externalId;
		}

		function updateState() {
			if ($scope.$parent.mainEntity != null) {
				$scope.isEditMode = true;
				$scope.editObject = EC2Restangular.copy($scope.$parent.mainEntity);
				loadAdvertiserData($scope.$parent.mainEntity.advertiserId)
				if ($scope.initialLoad){
					$scope.originalCopy = EC2Restangular.copy($scope.$parent.mainEntity);
					$scope.initialLoad = false;
				}
				if($scope.advertisers !== undefined){
					$scope.advertiserName = $scope.advertisers.getById($scope.editObject.advertiserId).name;
				}
				loadBrandList();

				$scope.entityRoot = $scope.editObject.type === $scope.parentDataType ? true : false;
				setLabelWidth();

				if ($scope.editObject.vertical != null) {
					$scope.selection = $scope.editObject.vertical;
				}
				$scope.pageReady = $scope.editObject != null;

				initialExternalId();

			} else {
				$scope.isEditMode = false;
				$scope.entityRoot = true;
				$scope.editObject = {
					name: "",
					vertical: null,
					type: $scope.parentDataType
				};

				if(!!$scope.parentSelectedItem){
					$scope.editObject.advertiserId = $scope.parentSelectedItem.id;
					loadAdvertiserData($scope.editObject.advertiserId);
				}
				initialExternalId();
				$scope.objectModel = $scope.editObject;
				$scope.pageReady = true;
			}
		}

		function loadAdvertiserData(advertiserId){
			EC2Restangular.one('advertisers', advertiserId).get().then(function(data){
				if(data !== undefined){
					$scope.advertiserName = data.name;
					$scope.editObject.vertical = (!!$scope.editObject.vertical || $scope.editObject.vertical === null) ? data.vertical : $scope.editObject.vertical;
				}
			}, processError);
		}

		function setLabelWidth(){
			if($scope.entityRoot){
				$scope.labelWidth = 135;
			} else {
				$scope.labelWidth = 150;
			}
		}

		$scope.updateSelectedItem = function(){
			$scope.editObject = EC2Restangular.copy($scope.selectedEditItem);
			$scope.originalCopy = EC2Restangular.copy($scope.selectedEditItem);

			initialExternalId();

			if ($scope.editObject.type === $scope.parentDataType) $scope.entityRoot = true;
			else $scope.entityRoot = false;
			if (!$scope.hasAccessToParent) $scope.parentName = $scope.editObject.name;
			setLabelWidth();
		}

		function loadBrandList(){
			if ($scope.listItems.length > 0) return;

			var brandId = $scope.editObject.type === $scope.childDataType ? $scope.editObject.brandId : $scope.editObject.id;

			if ($scope.$parent.mainEntity.type === $scope.parentDataType) {
				//use brand and associated brand advertiser accounts from mainEntity
				$scope.hasAccessToParent = true;
				$scope.parentName = $scope.$parent.mainEntity.name;
				$scope.editObject._displayName = "main";
				$scope.selectedEditItem = $scope.editObject;
				$scope.parentName = $scope.editObject.name;
				$scope.advertiserId = $scope.editObject.advertiserId;
				$scope.listItems.push($scope.editObject);
				if ($scope.$parent.mainEntity.brandAdvertiserAccounts) {
					for (var i = 0; i < $scope.$parent.mainEntity.brandAdvertiserAccounts.length; i++){
						$scope.$parent.mainEntity.brandAdvertiserAccounts[i]._displayName = $scope.$parent.mainEntity.brandAdvertiserAccounts[i].id + " - " + $scope.$parent.mainEntity.brandAdvertiserAccounts[i].name;
						$scope.listItems.push($scope.$parent.mainEntity.brandAdvertiserAccounts[i]);
					}
				}
			}
			else if ($scope.$parent.mainEntity.type === $scope.childDataType) {
				//try to get the parent brand
				var parent = EC2Restangular.one($scope.parentDataPath, brandId);
				parent.get().then(
					function (data) {
						$scope.hasAccessToParent = true;
						$scope.parentName = data.name;
						$scope.advertiserId = data.advertiserId;
						data._displayName = "main";
						$scope.listItems.push(data);
					},
					function (response){
						console.log("error getting parent", response); //TODO: check if access restricted or server error
					});
				//get any additional brand advertiser accounts the user has access to for this brand
				var children = EC2Restangular.all($scope.childDataPath);
				children.getList().then(function(data){
					for (var i = 0; i < data.length; i++){
						if (data[i].brandId === brandId) {
							data[i]._displayName = data[i].id + " - " + data[i].name;
							$scope.listItems.push(data[i]);
							if ($scope.editObject.id === data[i].id) $scope.selectedEditItem = data[i];
							if (!$scope.hasAccessToParent) $scope.parentName = $scope.editObject.name;
						}
					}
				}, processError);
			}

		}

		$scope.advertiserChange = function(){
			if(!!$scope.editObject && !!$scope.advertisers && $scope.editObject.advertiserId !== null){
				var adv = $scope.advertisers.getById($scope.editObject.advertiserId);
				if(adv !== undefined){
					$scope.editObject.vertical = adv.vertical;
				}
			}

			$scope.validation.advertiser = '';
		}

		function initialExternalId(){
			if(_.isUndefined($scope.editObject.externalId) ||_.isNull($scope.editObject.externalId)){
				$scope.editObject.externalId = {
					entityType: null,
					id: null
				}
			}
			//add reference to the external id object that is bound to the control model
			$scope.externalId = $scope.externalId || {};
			$scope.externalId = $scope.editObject.externalId;
		}
	}]);