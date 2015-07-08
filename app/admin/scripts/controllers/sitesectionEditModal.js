/**
 * Created by atd.
 */
'use strict';

app.controller('sitesectionEditModalCtrl', ['$scope', 'EC2Restangular', '$state', 'mmAlertService', '$modalInstance', 'entity',
	function ($scope, EC2Restangular, $state, mmAlertService, $modalInstance, entity) {
		$scope.placement = entity.placement;
		$scope.sites = entity.sites;
		$scope.validation = {};
		var serverSitesections = EC2Restangular.all("sitesection");
		$scope.type = 'sitesection';
		$scope.validation = {name: ""};
		$scope.pageReady = false;
		$scope.$watch('$parent.mainEntity', updateState);
		$scope.$watch('$scope.sites', updateState);
		//TODO how to understand if it's central context or modal context
		if(!_.isUndefined($scope.$parent.isEntral)){
			$scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: updateState, ref: null, nodes: []};
			$scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: save, ref: null, nodes: [],isPrimary:true};
		}

		$scope.isEditMode = true;
		$scope.$root.mmIsPageDirty = 0;

		var serverSite = EC2Restangular.all('sites');
		serverSite.getList().then(function(data){
			$scope.sites = $scope.sites || data;
		}, processError);

		function updateState() {
			if ($scope.$parent.mainEntity != null) {
				if($scope.sitesectionId === undefined){
					$scope.sitesectionId = $scope.$parent.mainEntity.id;
				}
				$scope.isEditMode = true;
				$scope.sitesection = $scope.$parent.mainEntity;
				$scope.sitesectionEdit = EC2Restangular.copy($scope.$parent.mainEntity);
				$scope.pageReady = $scope.sitesectionEdit != null && $scope.sites != null;
			} else {
				$scope.isEditMode = false;
				$scope.sitesection = null;
				$scope.sitesectionEdit = {
					name: null,
					type: "SiteSection",
					siteId: null,
					url: ""
				};
        if(!!$scope.parentSelectedItem){
          $scope.sitesectionEdit.siteId = $scope.parentSelectedItem.id;
        }

				if(!_.isUndefined($scope.placement) && !_.isNull($scope.placement.siteId) && !_.isEmpty($scope.placement.siteId)){
					$scope.sitesectionEdit.siteId = $scope.placement.siteId;
				}

				$scope.pageReady = $scope.sites != null;;
			}
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
      if($scope.sitesectionEdit.name === undefined || $scope.sitesectionEdit.name === null || $scope.sitesectionEdit.name.length <= 2){
        $scope.validation.name = "Please enter a name longer than 2 characters";
        isValid = false;
      }
      if($scope.sitesectionEdit.siteId === undefined || $scope.sitesectionEdit.siteId === null){
        $scope.validation.site = "Please select a site";
        isValid = false;
      }

			if(!urlValidation()){
				isValid = false;
				$scope.validation.url = $scope.urlError.text;
			}

      return isValid;
    }

		function sitesectionNameValidation() {
			var valid = true;
			$scope.sitesectionNameError = {text: ''};
			if ($scope.sitesectionEdit.name === null || $scope.sitesectionEdit.name === "") {
				$scope.sitesectionNameError = {text: 'Sitesection name is required'};
				valid = false;
			}
			return valid;
		}

		function siteNameValidation() {
			var valid = true;
			$scope.siteNameError = {text: ''};
			if ($scope.sitesectionEdit.siteId === null || $scope.sitesectionEdit.siteId === "") {
				$scope.siteNameError = {text: 'Site name is required'};
				valid = false;
			}
			return valid;
		}

		function urlValidation() {
			var valid = true;
			$scope.urlError = {text: ''};
			if ($scope.sitesectionEdit.url !== null && $scope.sitesectionEdit.url !== "") {
				var validUrl = /^(http|https):\/\/[^ "]+$/;
				if (!validUrl.test($scope.sitesectionEdit.url)) {
					$scope.urlError = {text: 'Invalid url format.'};
					valid = false;
				}
			}
			return valid;
		}

		function save() {
			if (saveValidation()) {
				if($scope.isEditMode){
					return $scope.sitesectionEdit.put().then(
						function(data){
							$scope.$root.mmIsPageDirty = 0;
							$scope.$parent.mainEntity = data;
							$scope.showSPinner = false;
							mmAlertService.addSuccess('Save', 'You successfully updated the site section.');
							return data;
						},
						function(error){
							mmAlertService.addError('Save', 'Updating the site section has failed');
							processError(error);
						});
				} else {
					return serverSitesections.post($scope.sitesectionEdit).then(
						function(data){
							$scope.$root.mmIsPageDirty = 0;
							$scope.isEditMode = true;
							$scope.sitesectionEdit = data;
							mmAlertService.addSuccess('Save', 'You successfully created the site section.');
							if(_.isUndefined($scope.$parent.isEntral)){
								$modalInstance.close($scope.sitesectionEdit);
							}
							else if ($scope.$parent.isEntral) {
								$scope.$parent.mainEntity = $scope.sitesectionEdit;
                return data;
							} else {
							  $state.go("spa.sitesection.sitesectionEdit", {sitesectionId: data.id});
							}
						},
						function(error){
							mmAlertService.addError('Save', 'Updating the site section has failed');
							processError(error);
						});
				}
			}
		}

		$scope.onSectionNameSelected = function(){
			$scope.validation.name = '';
		}

		$scope.onSiteSelected = function(){
			$scope.validation.site = '';
		}

		$scope.onUrlTextChanged = function(){
			$scope.validation.url = '';
		}

		$scope.isModal = !$scope.$parent.isEntral ? true : false;

		$scope.onModalNewSiteSectionSaveBtnClicked = function(){
			save();
		}

		$scope.onModalNewSiteSectionCancelBtnClicked = function(){
			$modalInstance.dismiss('cancel');
		}

    $scope.onNewEntitySave = function(){
      save();
    }

    $scope.onNewEntityCancel = function(){
      $modalInstance.dismiss('cancel');
    }

	}]);
