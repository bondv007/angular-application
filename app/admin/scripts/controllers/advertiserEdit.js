/**
 * Created by rotem.perets on 5/28/14.
 */
'use strict';

app.controller('advertiserEditCtrl', ['$scope', '$rootScope', 'mmAlertService', 'EC2Restangular', '$q', 'enums', '$state', 'contactsService',
	function ($scope, $rootScope, mmAlertService, EC2Restangular, $q, enums, $state, contactsService) {
		$scope.labelWidth = 125;
		$scope.validation = {};
		$scope.entityRoot = true;
		$scope.error = {name: ""};
		$scope.pageReady = false;
		$scope.isRequired = false;
		$scope.$watch('$parent.mainEntity', updateState);
		$scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: rollback, ref: null, nodes: []}
		$scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: save, ref: null, nodes: [],isPrimary:true}
		$scope.verticals = enums.verticals;
		$scope.isEditMode = true;
		$scope.initialLoad = true;
		$rootScope.mmIsPageDirty = 0;
		$scope.listItems = [];
		$scope.selectedEditItem = {};
		$scope.hasAccessToParent = false;
		$scope.parentDataType = "Advertiser";
		$scope.childDataType = "AdvertiserAccount";
		$scope.parentDataPath = "advertisers";
		$scope.childDataPath = "advertiseraccounts";
		$scope.advertiserStatuses = enums.advertiserStatus;
		$scope.miniSection = false;

		//Contacts attr
		$scope.isAccountAdvertiserEntity = false;
		$scope.editContacts = {};
		$scope.invalidContacts = {};

		function processError(error) {
			console.log('ohh no!');
			console.log(error);
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

			//external id directive validation
			isValid = $scope.externalId.externalIdValidation();

			if($scope.editObject.name === undefined || $scope.editObject.name === null || $scope.editObject.name.length <= 2){
				$scope.validation.name = "Please enter a name longer than 2 characters";
				isValid = false;
			}
			if($scope.editObject.status === undefined || $scope.editObject.status === null){
				$scope.validation.status = "Please select status";
				isValid = false;
			}
			if($scope.editObject.vertical === undefined || $scope.editObject.vertical === null){
				$scope.validation.vertical = "Please select vertical";
				isValid = false;
			}

			//contacts validation
			var contactsValidationObj = contactsService.preSaveValidation($scope.invalidContacts);
			if(!contactsValidationObj.isValid){
				isValid = false;
				mmAlertService.addError(contactsValidationObj.invalidContactsName);
			}

			if(isValid){
				$scope.validation = {};
			}
			return isValid;
		}

		$scope.onNameChange = function(){
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
						contactsService.saveContacts($scope.editObject.id ,$scope.editContacts).then(function(contacts) {
							$scope.showSPinner = false;
							if ($scope.$parent.mainEntity.id === data.id) $scope.$parent.mainEntity = data;
							if ($scope.editObject.type == $scope.parentDataType) $scope.parentName = $scope.editObject.name;
							mmAlertService.addSuccess('Save', 'You successfully updated the item');
							return contacts;
						},function(error){
							processError(error);
						});
						return data;
					}, function(error){
						processError(error);
					});
				} else {
					return EC2Restangular.all($scope.parentDataPath).post($scope.editObject).then(function (data) {
						$rootScope.mmIsPageDirty = 0;
						contactsService.saveContacts($scope.editObject.id ,$scope.editContacts).then(function(contacts) {
							$scope.showSPinner = false;
							mmAlertService.addSuccess('Save', 'You successfully created the advertiser');
							if ($scope.isEntral) {
								$scope.$parent.mainEntity = data;
								return contacts;
							} else {
								$state.go("spa.advertiser.advertiserEdit", {advertiserId: data.id}, {location: "replace"});
							}
						},function(error){
							processError(error);
						});
						return data;
					}, function(error){
						processError(error);
					});
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
			$rootScope.mmIsPageDirty = 0;
			if ($scope.$parent.mainEntity != null) {
				$scope.isEditMode = true;

				//if it is AA entity, display the contacts section
				if(_.isEqual($scope.$parent.mainEntity.type, "AdvertiserAccount")){
					$scope.isAccountAdvertiserEntity = true;
				}

				initialExternalId();

				$scope.editObject = EC2Restangular.copy($scope.$parent.mainEntity);
				if ($scope.initialLoad){
					$scope.originalCopy = EC2Restangular.copy($scope.$parent.mainEntity);
					$scope.initialLoad = false;
				}

				loadAdvertiserList();

				$scope.entityRoot = ($scope.editObject.type === $scope.parentDataType);
				setLabelWidth();

				if ($scope.editObject.vertical != null) {
					$scope.selection = $scope.editObject.vertical;
				}
				$scope.pageReady = $scope.editObject != null;

			} else {
				$scope.isEditMode = false;
				$scope.advertiser = null;
				$scope.entityRoot = true;
				$scope.editObject = {
					name: null,
					vertical: null,
					type: $scope.parentDataType,
					status: enums.advertiserStatus.getName("Enabled")
				};

				$scope.objectModel = $scope.editObject;
				$scope.pageReady = true;
				initialExternalId();
			}
		}

		function setLabelWidth(){
			if($scope.entityRoot){
				$scope.labelWidth = 135;
			} else {
				$scope.labelWidth = 175;
			}
		}

		$scope.updateSelectedItem = function(){
			$scope.editObject = EC2Restangular.copy($scope.selectedEditItem);
			$scope.externalId = $scope.editObject.externalId;
			$scope.originalCopy = EC2Restangular.copy($scope.selectedEditItem);
			$scope.entityRoot = ($scope.editObject.type === $scope.parentDataType);
			setLabelWidth();

			if (!$scope.hasAccessToParent) {
				$scope.parentName = $scope.editObject.name;
			}
		}

		function loadAdvertiserList(){
			if ($scope.listItems.length > 0) return;

			var advertiserId = $scope.editObject.type === $scope.childDataType ? $scope.editObject.advertiserId : $scope.editObject.id;

			if ($scope.$parent.mainEntity.type === $scope.parentDataType) {
				//use advertiser and associated advertiser accounts from mainEntity
				$scope.hasAccessToParent = true;
				$scope.parentName = $scope.$parent.mainEntity.name;
				$scope.editObject._displayName = "main";
				$scope.selectedEditItem = $scope.editObject;
				$scope.parentName = $scope.editObject.name;
				$scope.editObject.externalId = $scope.$parent.mainEntity.externalId || initialExternalId();
				$scope.externalId = $scope.editObject.externalId;
				$scope.listItems.push($scope.editObject);
				if ($scope.$parent.mainEntity.advertiserAccounts) {
					for (var i = 0; i < $scope.$parent.mainEntity.advertiserAccounts.length; i++){
						$scope.$parent.mainEntity.advertiserAccounts[i]._displayName = $scope.$parent.mainEntity.advertiserAccounts[i].id + " - " + $scope.$parent.mainEntity.advertiserAccounts[i].name;
						$scope.listItems.push($scope.$parent.mainEntity.advertiserAccounts[i]);
					}
				}
			}
			else if ($scope.$parent.mainEntity.type === $scope.childDataType) {
				//try to get the parent advertiser
				var parent = EC2Restangular.one($scope.parentDataPath, advertiserId);
				parent.get().then(
					function (data) {
						$scope.hasAccessToParent = true;
						$scope.parentName = data.name;
						data._displayName = "main";
						initialExternalId();
						$scope.listItems.push(data);
					},
					function (response){
						console.log("error getting parent", response); //TODO: check if access restricted or server error
					});
				//get any additional advertiser accounts the user has access to for this advertiser
				var children = EC2Restangular.all($scope.childDataPath);
				children.getList().then(function(data){
					for (var i = 0; i < data.length; i++){
						if (data[i].advertiserId === advertiserId) {
							data[i]._displayName = data[i].id + " - " + data[i].name;
							//TODO external id initialization ?
							$scope.listItems.push(data[i]);
							if ($scope.editObject.id === data[i].id) $scope.selectedEditItem = data[i];
							if (!$scope.hasAccessToParent) $scope.parentName = $scope.editObject.name;
						}
					}
				}, processError);
			}
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