/**
 * Created by atd.
 */
'use strict';

app.controller('sitesectionEditCtrl', ['$scope', '$state', '$stateParams', 'mmRest', '$q', 'mmAlertService', 'enums', 'adminUtils', '$timeout', 'siteService', '$modalInstance', 'entity',
	function ($scope, $state, $stateParams, mmRest, $q, mmAlertService, enums, adminUtils, $timeout, siteService, $modalInstance, entity) {

		var site = null,
			togglesName = {settings : 'settings'},
			tabsName = ['tagSettings', 'adDelivery'];

		$scope.isEditMode = !!$stateParams.sitesectionId || !!$scope.isEntral;
		$scope.isInContext = false;
		$scope.validation = {};
		$scope.labelWidth = 140;
		$scope.type = 'sitesection';
		$scope.validation = {name: ""};
		$scope.pageReady = false;
		$scope.$root.mmIsPageDirty = 0;
		$scope.isModal = false;
		$scope.togglesStatus = {settings: true};
		$scope.tabHandler = {};

		$scope.httpTypes = enums.httpTypes;

		var watcher1 = $scope.$watch('$parent.mainEntity', updateState);
		var watcher2 = $scope.$watch('$scope.sites', updateState);

		if(!_.isUndefined($scope.entityLayoutInfraButtons)){
			$scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: updateState, ref: null, nodes: []};
			$scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: save, ref: null, nodes: [],isPrimary:true};
		}

		initialize();

		function initialize(){
			//is Modal
			if(!_.isNull(entity)){
				$scope.isModal = true;
				$scope.sites = entity.sites;
				$scope.siteId = entity.siteId;
				if(_.isUndefined($scope.sites.getById($scope.siteId))){
					mmRest.siteGlobal($scope.siteId).get().then(function(data){
						site = data;
						$scope.siteName = site.name;
					});
				}else{
					$scope.siteName = $scope.sites.getById($scope.siteId).name;
				}
			}else{
				setTabHandler();
				setValidationObj();
				$scope.siteId = $scope.contextData.key == 'siteId' ? $scope.contextData.contextEntityId : undefined;
				$scope.isInContext =  $scope.contextData.isInContext;
				//not in context - get all sites
				if(!$scope.isInContext && !$scope.isEditMode) {
					mmRest.sites.getList().then(function(data){
						$scope.sites = $scope.sites || data;
						if($scope.sites.getById($scope.siteId)){
							$scope.siteName = $scope.sites.getById($scope.siteId).name;
						}
					}, processError);
				}
			}
		}

		function updateState() {
			if ($scope.$parent.mainEntity != null && $scope.isEditMode) {
				setTabHandler();
				setValidationObj();
				$scope.sitesection = $scope.$parent.mainEntity;
				$scope.editObject = mmRest.EC2Restangular.copy($scope.$parent.mainEntity);
				//changed minZIndex to be string
				if($scope.editObject.minZIndex){
					$scope.editObject.minZIndex = $scope.editObject.minZIndex.toString();
				}
				mmRest.site($scope.editObject.siteId).get().then(function(data){
					site = data;
					$scope.siteName = site.name;
					$scope.pageReady = $scope.sites != null;
				});
				$scope.pageReady = $scope.editObject != null && $scope.sites != null;
			} else {
				$scope.editObject = {
					name: null,
					type: "SiteSection",
					siteId: $scope.siteId || null,
					url: "",
					protocol: 'HTTP',
					minZIndex: 0
				};
				$scope.sitesection = null;
				if($scope.isInContext){
					mmRest.site($scope.siteId).get().then(function(data){
						site = data;
						$scope.editObject.protocol = site.siteTagSettings.protocol;
						$scope.editObject.minZIndex = site.siteAdDelivery.minZIndex;
						$scope.siteName = site.name;
						$scope.pageReady = $scope.sites != null;
					});
				}
			}
		}

		function setTabHandler(){
			$scope.tabHandler = adminUtils.validations.setTabHandler(togglesName.settings, tabsName, 'tagSettings');
		}

		function setValidationObj(){
			$scope.validation = {settings : {tagSettings : {}, adDelivery: {}}};
		}

		function processError(error) {
			console.log('ohh no!');
			console.log(error);
			$scope.showSPinner = false;
			if (error.data.error === undefined) {
				mmAlertService.addError("Server error. Please try again later.");
			} else {
				mmAlertService.addError(error.data.error, false);
			}
		}

		//validation using mm-error directive
		function saveValidation() {
			var deferred = $q.defer();
			var isValid = true;
			adminUtils.validations.url($scope.editObject.url).then(function(urlValidObj){
        $scope.editObject.url = urlValidObj.httpUrl;

				if(!urlValidObj.isValid){
					$scope.validation.url = urlValidObj.msg;
					isValid = false;
				}
				if ($scope.editObject.name === undefined || $scope.editObject.name === null || $scope.editObject.name.length <= 1) {
					$scope.validation.name = "Please enter a name longer than 1 characters";
					isValid = false;
				}
				if ($scope.editObject.siteId === undefined || $scope.editObject.siteId === null) {
					$scope.validation.site = "Please select a site";
					isValid = false;
				}

				if (_.isUndefined($scope.editObject.minZIndex) || _.isNull($scope.editObject.minZIndex) || !regIsNumber($scope.editObject.minZIndex)) {
					$scope.validation.settings.adDelivery.minZIndex = "Invalid z index. Only numbers accepted";
					$scope.togglesStatus.settings = true;
					$scope.tabHandler.settings.adDelivery.isValid = false;
					isValid = false;
				}
				deferred.resolve(isValid);
			},function(error){
				deferred.reject(error);
			});

			return deferred.promise;
		}

		function save() {
			saveValidation().then(function (isValid){
				if (isValid) {
					if($scope.isEditMode){
						return $scope.editObject.put().then(
							function(data){
								$scope.$root.mmIsPageDirty = 0;
								$scope.$parent.mainEntity = data;
								$scope.showSPinner = false;
								mmAlertService.addSuccess('You successfully updated the site section.');
								return data;
							},
							function(error){
								adminUtils.alerts.error(error);
							});
					} else {
						return mmRest.siteSections.post($scope.editObject).then(
							function(data){
								$scope.$root.mmIsPageDirty = 0;
								$scope.editObject = data;
								mmAlertService.addSuccess('You successfully created the site section.');
								if($scope.isModal){
									$modalInstance.close($scope.editObject);
								}
								else if (!!$scope.isEntral) {
									$scope.$parent.mainEntity = $scope.editObject;
									return data;
								} else {
									$state.go("spa.sitesection.sitesectionEdit", {sitesectionId: data.id}, {location : "replace"});
								}
							},
							function(error){
								adminUtils.alerts.error(error);
							});
					}
				}
			},function(error){
        adminUtils.alerts.error(error);
			});
		}

		function regIsNumber(fData){
			var reg = /^\s*?\d+\s*$/;
			if(_.isEmpty(fData)) return true;
			return String(fData).search(reg) != -1
		}

		$scope.onSectionNameSelected = function(){
			$scope.validation.name = '';
		};

		$scope.onSiteSelected = function(){
			$scope.validation.site = '';
		};

		$scope.onUrlTextChanged = function(){
			$scope.validation.url = '';
		};
		$scope.onNewEntitySave = function(){
			save();
		};

		$scope.onNewEntityCancel = function(){
			$modalInstance.dismiss('cancel');
		};

		$scope.onMinimumZIndexChanged = function(){
			$timeout(function() {
				if (siteService.zIndexValidation($scope.validation.settings.adDelivery, $scope.editObject.minZIndex,
					$scope.tabHandler.settings.adDelivery)) {
					if(siteService.isTabValid($scope.validation.settings.adDelivery)){
						$scope.tabHandler.settings.adDelivery.isValid = true;
					}
				}
			},50);
		};

		$scope.$on('$destroy', function() {
			if (watcher1) watcher1();
			if (watcher2) watcher2();
		});
	}]);
