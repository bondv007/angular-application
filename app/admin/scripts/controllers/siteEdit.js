'use strict';
/**
 * Created by liad.ron on 02/05/14.
 */
app.controller('siteEditCtrl', ['$rootScope', '$scope', '$stateParams', 'entityMetaData', 'mmRest', 'mmAlertService', 'mmModal',
	'$state', 'enums', 'siteService','$timeout', 'validationHelper', 'mmUtils', 'adminUtils', '$filter', '$q',
	function ($rootScope, $scope, $stateParams, entityMetaData, mmRest, mmAlertService, mmModal, $state, enums, siteService, $timeout, validationHelper, mmUtils, adminUtils, $filter, $q) {

		var togglesName = {settings : 'settings', account : 'accounts', contacts : 'contacts'},
			tabsName = ['tagSettings', 'trackingTargeting', 'adDelivery', 'privacy', 'inStream'],
			bustingTokensMap = {},
			newContact = {};

		$scope.isEditMode = !!$stateParams.siteId || !!$scope.isEntral;
		$scope.isRequired = true;
		$scope.validation = {};
		$scope.labelWidth = 240;
		$scope.contacts = {columns : [], gridButtonActions : [], selectedItems : [], errorHandler : contactsErrorHandler, invalidContacts : {isSuccess: true, fields: []}};
		$scope.settings = {inStream : {gridButtonActions : [], selectedItems : [], columns : []}, tagSettings : {}, adDelivery : {}};
		$scope.togglesStatus = {settings: true, accounts: false, contacts: false, video : true, mobile : true, trackingPlacement : true, accountsConnection : false};
		$scope.tabHandler = {};
		$scope.externalId = {};
		$scope.accounts = [];
		$scope.filter = {accountId: ""};
		$scope.accountIds = [];
		$scope.isModalOpen = false;
		$scope.permissions = {common: {externalId : {view: false, edit : false}}};

		$scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: rollback, ref: null, nodes: []};
		$scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: save, ref: null, nodes: [],isPrimary:true};

		$scope.tagTypes = enums.defaultTagTypes;
		//$scope.adClientVersions = enums.adClientVersions;
		$scope.httpTypes = enums.httpTypes;
		$scope.trackingTagTypes = enums.trackingTabType;
		$scope.bustingTokens = enums.cacheBustingTokenTypes;
		$scope.inAppSDKs = enums.inAppSDKs;
		$scope.GMTOffset = enums.GMTOffset;

		var watcher = $scope.$watch('$parent.mainEntity', function (newValue, oldValue) {
			updateState();
		});

		initialize();

		$scope.onCreateIFrameSupporteToggle = function(){
			//TODO check if necessary
			if(_.isNull($scope.editObject.siteTagSettings.tagTypes)) {
				$scope.editObject.siteTagSettings.tagTypes = ['AutoDetect'];
			}

			if(!$scope.editObject.siteTagSettings.createIFrameSupported){
				if(_.findIndex($scope.tagTypes, {id: 'CreateIFrame'}) != -1){
					$scope.tagTypes.pop();
					var createIframIndx = $scope.editObject.siteTagSettings.tagTypes.indexOf('CreateIFrame');
					if(createIframIndx != -1){
						$scope.editObject.siteTagSettings.tagTypes.splice(createIframIndx, 1);
					}
				}
			}else{
				if($scope.editObject.siteTagSettings.tagTypes.indexOf('CreateIFrame') == -1)
					$scope.tagTypes.push({"id" : 'CreateIFrame', "name" : 'Create iFrame'});
			}
		};

		function initialize(){
			setTabHandler();
			setValidationObj();
			initSettings();
			initContacts();
			initAccountsConnection();
		}

		function updateState() {
			$rootScope.mmIsPageDirty = false;
			if ($scope.$parent.mainEntity != null && $scope.isEditMode) {
				setTabHandler();
				setValidationObj();
				setGridsData();
				$scope.editObject = mmRest.EC2Restangular.copy($scope.$parent.mainEntity);
				adminUtils.externalId.init($scope.editObject, $scope.externalId);
				dataManipulation();
				$scope.originalCopy = mmRest.EC2Restangular.copy($scope.editObject);
        adminUtils.permissions.checkOnNewModeCommon(entityMetaData['site'].type, $scope.permissions.common);
			}
			else if(!$scope.isEditMode){
				$scope.editObject = $scope.editObject || mmRest.EC2Restangular.copy(entityMetaData["site"].defaultJson);
				adminUtils.externalId.init($scope.editObject, $scope.externalId);
				$scope.onCreateIFrameSupporteToggle();
				$scope.originalCopy = mmRest.EC2Restangular.copy($scope.editObject);
        adminUtils.permissions.checkOnNewModeCommon(entityMetaData['site'].type, $scope.permissions.common);
			}
		}

		function save() {
			if (saveValidation()) {
				preSaveManipulation();
				if($scope.isEditMode){
					var siteServerPutOperation = mmRest.EC2Restangular.one("sites", $scope.editObject.id);
					return siteServerPutOperation.customPUT({entities: [$scope.editObject]}).then(function(data){
					//return $scope.editObject.put().then(function(data) {
							$scope.showSPinner = false;
							mmAlertService.addSuccess('Site ' + $scope.editObject.name + ' was successfully updated');
							return data;
						},
						function(error){
							processError(error);
						});
				} else {
					$scope.editObject.status = 'Enabled';
					return mmRest.sites.post($scope.editObject).then(
						function(data) {
							$scope.showSPinner = false;
							var sref = "spa.site.siteNew({siteId:'" + "'})";
							mmAlertService.addSuccess('Site ' + $scope.editObject.name + ' was successfully created', sref, 'Create another site');
							if (!$scope.isEntral) $state.go("spa.site.siteEdit", {siteId: data.id}, {location: "replace"});
							else return data;
						},
						function(error){
							processError(error);
						});
				}
			}
		}

		function saveValidation() {
			var isValid = true;
			setValidationObj();
			//external id directive validation
			var validExternalId = $scope.externalId.externalIdValidation();
			if(!validExternalId) isValid = false;

			if(_.isUndefined($scope.editObject.name) || _.isNull($scope.editObject.name) || $scope.editObject.name.length <= 1){
				$scope.validation.name = "Please enter a name longer than 1 characters";
				isValid = false;
			}

			//site settings validation
			var validSettings = siteService.settingsValidation($scope.editObject, $scope.validation.settings, $scope.togglesStatus, 'settings', $scope.tabHandler);
			if(!validSettings) isValid = false;

			//site contacts validation
			var validContacts = siteService.contactsValidation($scope.editObject.siteContacts.siteContacts, $scope.contacts.invalidContacts, $scope.togglesStatus, 'contacts', true);
			if(!validContacts) isValid = false;

			if(isValid) setValidationObj();
			return isValid;
		}

		function rollback(){
			$scope.editObject = mmRest.EC2Restangular.copy($scope.originalCopy);
			adminUtils.externalId.init($scope.editObject, $scope.externalId);
			setTabHandler();
			setValidationObj();
			setGridsData();
		}

		/****************************************************************
		 ***********************   HELPER FUNC   *************************
		 *****************************************************************/

		function initSettings()	{
			siteService.setInstreamColumnsDefinition($scope.settings.inStream.columns);
			siteService.setInstreamButtonsDefinition($scope.settings.inStream.gridButtonActions, {new : adInStreamRule, edit : editRule, delete : deleteRule});

//			$scope.settings.adDelivery.adClientVersions = [];
//			var tabIndex = 7;
//			$scope.adClientVersions.forEach(function(val, key){
//				$scope.settings.adDelivery.adClientVersions[key] = {id : val.id, name : val.name, state : false, tabIndex : key + tabIndex};
//				if(key == 0){
//					$scope.settings.adDelivery.adClientVersions[key].caption = "Ad Client - Supported Versions";
//				}
//			});
			setBustingTokenMap();
		}

		function initAccountsConnection(){
			mmRest.accounts.all('global').getList().then(function (data) {
				$scope.accounts = data;
				$scope.accountsOrig = data;
			}, processError);
		}

		function initContacts(){
			siteService.setContactsButtonsDefinition($scope.contacts.gridButtonActions, {new : addNewContact, remove : deleteContacts});
			//setTimeout(function(){
				//$scope.contacts.columns = $scope.contacts.columns ? $scope.contacts.columns.lengtt = 0 : [];
				siteService.setContactsColumnDefinition($scope.contacts.columns, {onCellChanged: onContactsCellChanged, emailValidation: onEmailChangeDoValidation});
			//},1000);
		}


		function setTabHandler(){
			$scope.tabHandler = adminUtils.validations.setTabHandler(togglesName.settings, tabsName, 'tagSettings');
		}

		function setValidationObj(){
			$scope.validation = {settings : {tagSettings : {}, trackingTargeting: {}, adDelivery: {}, privacy: {}}, contacts : {}};
		}

		function setGridsData(){
			$scope.settings.inStream.selectedItems.length = 0;
			$scope.contacts.selectedItems.length = 0;
			$scope.contacts.invalidContacts.isSuccess = true;
			$scope.contacts.invalidContacts.fields.length = 0;
		}

		function setBustingTokenMap(){
			var tokens = ['[timestamp]', '%%RANDOM%%', '_ADTIME_', '{random}', '', '%n', '+Ads_Timestamp+', '%%REALRAND%%', '%time%', '%UNIQUE%'];
			$scope.bustingTokens.forEach(function(token, index){
				bustingTokensMap[token.id] = tokens[index];
			});
		}

//		function getAdClientVersions() {
//			if (!_.isUndefined($scope.editObject.siteAdDelivery.adClientVersions) && !_.isNull($scope.editObject.siteAdDelivery.adClientVersions)) {
//				for (var i = 0; i < $scope.editObject.siteAdDelivery.adClientVersions.length; i++) {
//					_.where($scope.settings.adDelivery.adClientVersions, {id : $scope.editObject.siteAdDelivery.adClientVersions[i]}).state = true;
//				}
//			}
//		}

		function dataManipulation(){

			//set setting section templates (default section)
			setSettingSectionsTemplates();

			//set contacts default template
			if(_.isNull($scope.editObject.siteContacts)){
				$scope.editObject['siteContacts'] = {
					type: "SiteContacts",
						clientRefId: null,
						relationsBag: null,
						siteContacts: [],
						uiPermissions: null,
						version: null
				}
			}

			//create account ids array for the select list
			$scope.accountIds.length = 0;
			if($scope.editObject.siteAccounts){
				$scope.editObject.siteAccounts.forEach(function(account){
					$scope.accountIds.push(account.accountId);
				});
			}
			//changed minZIndex to be string
			if($scope.editObject.siteAdDelivery && $scope.editObject.siteAdDelivery.minZIndex){
				$scope.editObject.siteAdDelivery.minZIndex = $scope.editObject.siteAdDelivery.minZIndex.toString();
			}

			//set the CreateIFrame values
			$scope.onCreateIFrameSupporteToggle();

			//get all ad client version and set them to the bounded array
			//getAdClientVersions();

			//get all section to have to section name in the in stream data template
			if($scope.editObject.siteTemplateData){
				for(var k = 0 ; k < $scope.editObject.siteTemplateData.length ; k++){
					var templateData = $scope.editObject.siteTemplateData[k];
					if(_.isNull(templateData.sectionId)){
						if(templateData.templateId){
							$scope.editObject.siteTemplateData[k].sectionName = 'All';
						}
					}else{
						if(!_.isUndefined(templateData.sectionId)){
							setSectionName(templateData);
						}
					}
				}
			}
		}

		function preSaveManipulation(){
//			$scope.editObject.siteAdDelivery.adClientVersions.length = 0;
//			$scope.settings.adDelivery.adClientVersions.forEach(function(val){
//				if (val.state){
//					$scope.editObject.siteAdDelivery.adClientVersions.push(val.id);
//				}
//			});

			if(_.isNull($scope.editObject.siteAccounts)){
				$scope.editObject.siteAccounts = [];
			}
			$scope.editObject.siteAccounts.length = 0;
			$scope.accountIds.forEach(function(id){
				$scope.editObject.siteAccounts.push({type : 'SiteAccount', accountId : id});
			});
		}

		function setSettingSectionsTemplates(){
			if(_.isNull($scope.editObject.siteTagSettings)){
				$scope.editObject['siteTagSettings'] = {
					"type": "SiteTagSettings",
					protocol: 'HTTP',
					createIFrameSupported: false,
					tagTypes: ['AutoDetect'],
					clearEscapingOfNoscriptTag: false,
					referringURLToken: '',
					trackingTagType: 'Script',
					impressionTrackerResponse: false
				};
			}
			if(_.isNull($scope.editObject.siteTrackingAndTargeting)){
				$scope.editObject['siteTrackingAndTargeting'] = {
					type: "SiteTrackingAndTargeting",
					customPublisherParameter: '',
					collectKeywordsData: false,
					delimiterSiteKeywords: '',
					lineId: '',
					cacheBustingToken: {
						type: "CacheBustingToken",
						adServer: 'CustomToken',
						tokenString: ''
					},
					impressionTrackingToken: '',
					clickTrackingToken: ''
				};
			}
			if(_.isNull($scope.editObject.siteAdDelivery)){
				$scope.editObject['siteAdDelivery'] = {
					type: "SiteAdDelivery",
					avoidDocumentWrite: false,
					minZIndex: '0',
					addinEyeFileLocation: '',
					disableAdsAutoExpand: false,
					enableCORSResponseHeaders: true,
					filterUnknownUserAgentCalls: true,
					//adClientVersions: [],
					playerSupportsVPAID: false,
					inAppSDK: 'None'
				};
			}
			if(_.isNull($scope.editObject.sitePrivacy)){
				$scope.editObject['sitePrivacy'] = {
					type: "SitePrivacy",
					coppaCompliantSite: false,
					disableCookies: false
				};
			}
		}

		function processError(error) {
			console.log('ohh no!');
			console.log(error);
			$scope.showSPinner = false;
			if (error && error.data){
				if(!error.data.error) {
					mmAlertService.addError("Server error. Please try again later.");
				} else {
					mmAlertService.addError(error.data.error);
				}
			}else{
				mmAlertService.addError("Server error. Please try again later.");
			}
		}

		function setSectionName(templateData){
			mmRest.siteSection(templateData.sectionId).get().then(function(section){
				templateData.sectionName = section.name;
			});
		}


		function onContactsCellChanged(col, value, colIndex, fieldName, row) {
			$scope.$root.isDirtyEntity = true;
			var result = siteService.onContactsCellChanged(col, value, colIndex, fieldName, row, $scope.editObject.siteContacts.siteContacts);
			siteService.contactsValidation($scope.editObject.siteContacts.siteContacts, $scope.contacts.invalidContacts, $scope.togglesStatus, 'contacts', false);
			return result;
		}

		function onEmailChangeDoValidation(row){
			$scope.$root.isDirtyEntity = true;
			var result = {isSuccess : true, message : ''};
			result = siteService.onEmailChangeDoValidation(row, result, $scope.editObject.siteContacts.siteContacts);
			return result;
		}

		function addNewContact() {
			$scope.$root.isDirtyEntity = true;
			newContact = siteService.getNewContactObj();
			newContact.clientRefId = mmUtils.clientIdGenerator.next();
			$scope.editObject.siteContacts.siteContacts.push(newContact);
			//select new row
			newContact.fieldName = 'clientRefId';
			newContact.value = newContact.clientRefId;
			$scope.selectNewRowHandler();//make row selection
		}

		function deleteContacts() {
			$scope.$root.isDirtyEntity = true;
			siteService.deleteContacts($scope.contacts.selectedItems, $scope.editObject.siteContacts.siteContacts);
			$scope.contacts.gridButtonActions[1].isDisable = true;
			siteService.contactsValidation($scope.editObject.siteContacts.siteContacts, $scope.contacts.invalidContacts, $scope.togglesStatus, 'contacts', false);
		}

		function contactsErrorHandler () {
			return $scope.contacts.invalidContacts;
		}


		function adInStreamRule(){
			if ($scope.isModalOpen) {
				return;
			}
			$scope.isModalOpen = true;
			$scope.$root.isDirtyEntity = true;

			var modalInstance = mmModal.open({
				templateUrl: './configurationManagementApp/views/inStreamTemplates/inStreamRule.html',
				controller: 'inStreamRuleCtrl',
				title: "New In-Stream Rule",
				modalWidth: 800,
				bodyHeight: 400,
				resolve: {
					siteId: function () {
						return $scope.editObject.id;
					},
					templateData: function(){
						return null;
					}
				},
				confirmButton: { name: "Apply", funcName: "apply", hide: false, isPrimary: true},
				discardButton: { name: "Cancel", funcName: "cancel"}
			});

			modalInstance.result.then(function (newRule) {
				var existingSectionRule = _.find($scope.editObject.siteTemplateData, {'sectionId' : newRule.sectionId});
				if(!existingSectionRule){
					if(newRule.sectionId == -1) newRule.sectionId = null;
					if(!$scope.editObject.siteTemplateData) $scope.editObject.siteTemplateData = [];
					$scope.editObject.siteTemplateData.push(newRule);
				}
				else{
					var	alertInstance = mmModal.openAlertModal('Override rule', 'Section already has a rule do you want to override it?' );
					alertInstance.result.then(function(){
						overrideRule(existingSectionRule, newRule);
					});
				}
				$scope.isModalOpen = false;
			}, function () {
				$scope.isModalOpen = false;
			});
		}

		function editRule(){
			if ($scope.isModalOpen || $scope.settings.inStream.selectedItems.length < 1) {
				return;
			}
			$scope.isModalOpen = true;
			$scope.$root.isDirtyEntity = true;
			var ruleBeforeEdit = $scope.settings.inStream.selectedItems[0];
			var modalInstance = mmModal.open({
				templateUrl: './configurationManagementApp/views/inStreamTemplates/inStreamRule.html',
				controller: 'inStreamRuleCtrl',
				title: "Edit In-Stream Rule",
				modalWidth: 800,
				bodyHeight: 400,
				resolve: {
					siteId: function () {
						return $scope.editObject.id;
					},
					templateData: function(){
						return mmRest.EC2Restangular.copy($scope.settings.inStream.selectedItems[0]);
					}
				},
				confirmButton: { name: "Apply", funcName: "apply", hide: false, isPrimary: true},
				discardButton: { name: "Cancel", funcName: "cancel"}
			});

			modalInstance.result.then(function (editRule) {
				if(ruleBeforeEdit.sectionId !== editRule.sectionId){
					var existingSectionRule = _.find($scope.editObject.siteTemplateData, {'sectionId' : editRule.sectionId});
					if(existingSectionRule){
						var	alertInstance = mmModal.openAlertModal('Override rule', 'Section already has a rule do you want to override it?');
						alertInstance.result.then(function(){
							deleteRule(ruleBeforeEdit);
							overrideRule(ruleBeforeEdit, editRule);
						});
					}
					else{
						overrideRule(ruleBeforeEdit, editRule);
					}
				}
				else{
					overrideRule(ruleBeforeEdit, editRule);
				}
				$scope.isModalOpen = false;
			}, function () {
				$scope.isModalOpen = false;
			});
		}

		function deleteRule(selected){
			$scope.$root.isDirtyEntity = true;
			var selectedItem = selected ? selected : $scope.editObject.siteTemplateData[0];
			for (var i = $scope.editObject.siteTemplateData.length - 1; i >=0; i--) {
				var rule = $scope.editObject.siteTemplateData[i];
				if(selectedItem.sectionId === rule.sectionId){
					$scope.editObject.siteTemplateData.splice(i,1);
					$scope.settings.inStream.selectedItems.splice(0,1);
					break;
				}
			}
		}

		function overrideRule(obj, source){
			if(!obj || !source){
				return;
			}
			for(var prop in source){
				obj[prop] = source[prop];
			}
		}


		$scope.onVastVarRowSelected = function(){
			if($scope.settings.inStream.selectedItems.length > 0){
				$scope.settings.inStream.gridButtonActions[1].isDisable = false;
				$scope.settings.inStream.gridButtonActions[2].isDisable = false;
			}
			else{
				$scope.settings.inStream.gridButtonActions[1].isDisable = true;
				$scope.settings.inStream.gridButtonActions[2].isDisable = true;
			}
		};

		$scope.filterDataModel = function(){
			$scope.accounts = $filter('filter')($scope.accountsOrig, $scope.filter.accountId);
		};

		$scope.selectNewRowHandler = function () {
			var rows = [];
			rows.push(newContact);
			return rows;
		};

		$scope.onNameChanged = function(){
			if($scope.editObject.name.length > 1)
				$scope.validation.name = '';
			else
				$scope.validation.name = "Please enter a name longer than 1 characters";
		};

		$scope.onProtocolSelected = function(){
			$scope.validation.settings.tagSettings.protocol = '';
			if(siteService.isTabValid($scope.validation.settings.tagSettings)){
				$scope.tabHandler.settings.tagSettings.isValid = true;
			}
		};

		$scope.onTagTypesSelected = function(){
			$scope.validation.settings.tagSettings.tagType = '';
			if(siteService.isTabValid($scope.validation.settings.tagSettings)){
				$scope.tabHandler.settings.tagSettings.isValid = true;
			}
		};

		$scope.onCacheBustingTokenSelected = function(){
			$scope.editObject.siteTrackingAndTargeting.cacheBustingToken.tokenString =
				bustingTokensMap[$scope.editObject.siteTrackingAndTargeting.cacheBustingToken.adServer];
			$scope.onCacheBustingTokenChanged();
		};

		$scope.onCacheBustingTokenChanged = function(){
			$scope.validation.settings.trackingTargeting.cacheBustingToken = '';
			if(siteService.isTabValid($scope.validation.settings.trackingTargeting)){
				$scope.tabHandler.settings.trackingTargeting.isValid = true;
			}
		};

		$scope.onMinimumZIndexChanged = function(){
			$timeout(function() {
				if (siteService.zIndexValidation($scope.validation.settings.adDelivery, $scope.editObject.siteAdDelivery.minZIndex,
					$scope.tabHandler.settings.adDelivery)) {
					if(siteService.isTabValid($scope.validation.settings.adDelivery)){
						$scope.tabHandler.settings.adDelivery.isValid = true;
					}
				}
			},50);
		};

		$scope.afterSelectionChanged = function () {
			$scope.contacts.gridButtonActions[1].isDisable = !($scope.contacts.selectedItems.length !== 0);
		};

		$scope.createNewAccountModal = function (){
			if ($scope.isModalOpen) {
				return;
			}
			$scope.isModalOpen = true;

			var modalInstance = mmModal.open({
				templateUrl: 'admin/views/account/accountEdit.html',
				controller: 'accountEditCtrl',
				title: "Create New Account",
				modalWidth: 650,
				bodyHeight: 300,
				confirmButton: { name: "Save", funcName: "onNewEntitySave", hide: false, isPrimary: true},
				discardButton: { name: "Cancel", funcName: "onNewEntityCancel"}
			});
			modalInstance.result.then(function (newAccount) {
				$scope.accountsOrig.push({id: newAccount.id, name: newAccount.name});
				$scope.filterDataModel();
				$scope.accountIds.push(newAccount.id);
				$scope.editObject.siteAccounts.push({type: "SiteAccount", accountId: newAccount.id});
				$scope.isModalOpen = false;
			}, function () {
				$scope.isModalOpen = false;
			});
		};

		$scope.$on('$destroy', function() {
			if (watcher) watcher();
			if($scope.accounts) $scope.accounts.length = 0;
			if($scope.accountsOrig) $scope.accountsOrig.length = 0;
		});
	}]);
