/**
 * Created by liad.ron on 10/2/2014.
 */

'use strict';

app.directive('mmContacts', [function () {
		return {
			restrict: 'EA',
			scope: {
				mmModel: "=",
				mmError: "=",
				mmAccountId: "=",
				mmIsEditMode: "=?",
				mmDisplaySizmek: "=",
				mmDisplayMedia: "=",
				mmDisplayCreative: "=",
				mmDisplaySite: "=",
				mmEditSite: "=",
				mmToggleExpanded: "=?",
				mmTabHandler: "=",
				mmContactsTabError: "=",
				mmIsCampaign: "@",
        mmIsAccount: "@"
			},
			templateUrl: 'admin/views/contacts/contacts.html',
			controller: ['$rootScope', '$scope', '$element', 'EC2Restangular', 'contactsService', 'enums', '$q', 'mmAlertService', '$timeout', 'mmUtils', 'mmModal',
				function ($rootScope, $scope, $element, EC2Restangular, contactsService, enums, $q, mmAlertService, $timeout, mmUtils, mmModal) {
					var isGridLoading = true,
						columnObj = {},
						isSelectCreativeModalOpen = false,
						isInitDefaultContactsNeeded = false,
						cellErrorObj = {type : '', fieldName : '', msg : ''},
						newContact = {},
						defaultContactsTypes = {
							sizmek: enums.defaultContactsTypes.getName("SIZMEK"),
							media: enums.defaultContactsTypes.getName("MEDIA"),
							creative: enums.defaultContactsTypes.getName("CREATIVE"),
							site: enums.defaultContactsTypes.getName("SITE")};


					$scope.tabsHandler = $scope.mmTabHandler;
					$scope.creativeAgenciesMiniSectionStatus = true;
					$scope.labelWidth = 104;
					$scope.clientRefIdDefaultContactsIndex = {};//TODO not in use, can be remove?
					$scope.contactsGridButtonActions = {};
					$scope.mmError = $scope.mmError || {};
					$scope.mmModelGrid = {};
					$scope.sizmekGlobalContacts = [];
					$scope.sizmekGlobalContactsIndex = {};
					$scope.mediaGlobalContacts = [];
					$scope.siteContacts = [];
					$scope.sites = [];
					$scope.siteContactsIndex = {};
					$scope.accountsUsersIndex = {};//global contacts for media + creative contacts
					$scope.creativeAccounts = [];//for the modal select creative account using

					$scope.creativeDefaultContactsByAccountIndex = {};//Creative contacts ordered by creative accounts hierarchy
					$scope.creativeDefaultContactsByAccountIndex.accounts = [];
					$scope.focusCreativeAgency = {accountId: ''};
					$scope.addCreativeAgencyLinkText = "+ Add Creative Manager";

					var watcher = $scope.$watchGroup(['mmModel', 'mmAccountId'], function (newValue, oldValue) {
						var newModel = newValue[0],
							oldModel = oldValue[0],
							newAccountId = newValue[1],
							oldAccountId = oldValue[1];
						isInitDefaultContactsNeeded = false;
						//use case 1: model changed (get global contacts + init media default contacts)
						if (newModel != oldModel || !!$scope.$parent.isEntral) {
							if (_.isEqual(newModel, oldModel) && newAccountId != oldAccountId)
								isInitDefaultContactsNeeded = true;
							initMedia();
							initSizmek();
							initCreative();
							if (!!$scope.mmDisplaySite) initSite();
						}
						//use case 2: account changed (get global contacts
						else if (newAccountId != oldAccountId) {
							if (oldAccountId) isInitDefaultContactsNeeded = true;
							initMedia();
						}
						if (newAccountId) {
							if(!_.isEmpty($scope.contactsGridButtonActions[defaultContactsTypes.media]))
								$scope.contactsGridButtonActions[defaultContactsTypes.media][0].isDisable = false;
						}
					});

					var eventListener = $scope.$on('mmContactsValidation', function (event, data) {
						if (typeof(data.type) == "string") {
							if(data.type == 'creativeManagerContacts'){
								$scope.$broadcast('mmCreativeValidation', {});
							}else{
								if ($scope.mmError[data.type] && $scope.mmError[data.type].contacts.length > 0) {
									contactsService.updateValidationHandler($scope.mmError[data.type], data.type, true);
								}
							}
						}
					});

					eventListener = $scope.$on('mmTabValidation', function (event, data) {
						if(contactsService.isCreativeContactsValid($scope.mmError[data.type], $scope.mmModel.creativeAccounts))
							$scope.mmContactsTabError[data.type] = true;
						else
							$scope.mmContactsTabError[data.type] = false;
					});

          eventListener = $scope.$on('mmTabHandlerChanged', function (event, data) {
            initGridsButtons();
          });


          $scope.sizmekErrorMsgHandler = function () {
						return $scope.mmError.sizmekContacts.validationResult;
					};

					$scope.mediaErrorMsgHandler = function () {
						return $scope.mmError.campaignManagerContacts.validationResult;
					};

					$scope.siteErrorMsgHandler = function () {
						return $scope.mmError.siteContacts.validationResult;
					};

					initialize();

					/******************** INITIALIZATION ********************/

					function initialize() {
						initGridsButtons();
						initTabHandler();
						initGridModel();
						initGridsColumns();
						initError();
					}

					function initGridModel() {
						for (var type in defaultContactsTypes) {
							if(type != 'creative'){
								$scope.mmModelGrid[defaultContactsTypes[type]] = {};
								$scope.mmModelGrid[defaultContactsTypes[type]].selectedItems = [];
								$scope.mmModelGrid[defaultContactsTypes[type]].errorHandler = $scope.tabsHandler[defaultContactsTypes[type]].errorHandlerFunc;
							}
						}
						;
					}

					function initError() {
						for (var type in defaultContactsTypes) {
							$scope.mmError[defaultContactsTypes[type]] = {};
							if(type != 'creative') {
								$scope.mmError[defaultContactsTypes[type]].contacts = [];
								$scope.mmError[defaultContactsTypes[type]].validationResult = {isSuccess: true, fields: []};
							}
						}
					}

					function initTabHandler() {
						var initObj = {
							sizmekContacts: {init: initSizmek, error: $scope.sizmekErrorMsgHandler},
							campaignManagerContacts: {init: initMedia, error: $scope.mediaErrorMsgHandler},
							creativeManagerContacts: {init: initCreative},
							siteContacts: {init: initSite, error: $scope.siteErrorMsgHandler}};
						for (var type in defaultContactsTypes) {
							$scope.tabsHandler[defaultContactsTypes[type]].isInitialize = false;
							$scope.tabsHandler[defaultContactsTypes[type]].initializeFunc = initObj[defaultContactsTypes[type]].init;
							if(type != 'creative') {
								$scope.tabsHandler[defaultContactsTypes[type]].errorHandlerFunc = initObj[defaultContactsTypes[type]].error;
							}
						}
					}

					function initSizmek() {
						if ($scope.tabsHandler[defaultContactsTypes.sizmek].isInitialize) {
							setDefaultContacts(defaultContactsTypes.sizmek, $scope.mmModel[defaultContactsTypes.sizmek]);
							setGridListDataArray(defaultContactsTypes.sizmek);
						} else {
							$scope.tabsHandler[defaultContactsTypes.sizmek].isInitialize = true;
							var promises = contactsService.getGlobalSizmekContacts();
              $q.all(promises).then(function (results) {
                $scope.sizmekGlobalContactsIndex = {
                  "SalesManager": results[0],
                  "ClientServicesManager": results[1],
                  "CreativeServicesSpecialist": results[1]
                };
								setDefaultContacts(defaultContactsTypes.sizmek, $scope.mmModel[defaultContactsTypes.sizmek]);
								setGridListDataArray(defaultContactsTypes.sizmek);
							}, function (error) {
								$scope.tabsHandler[defaultContactsTypes.sizmek].isInitialize = false;
								processError(error);
							});
						}
					}

					function initMedia() {
						initMediaGlobalContacts().then(function () {
							initMediaDefaultContacts();
						}, function (error) {
							processError(error);
						})
					}

					function initCreative() {
						if ($scope.creativeDefaultContactsByAccountIndex.accounts) $scope.creativeDefaultContactsByAccountIndex.accounts.length = 0;
						var accountIds = [];
						$scope.mmModel.creativeAccounts.forEach(function (account) {
							if (!$scope.accountsUsersIndex[account.accountId]) {
								$scope.accountsUsersIndex[account.accountId] = [];
								accountIds.push(account.accountId);
							}
							else if (_.isEmpty($scope.accountsUsersIndex[account.accountId])) {
								accountIds.push(account.accountId);
							}
						});
						if (accountIds.length > 0) {
							//get all global contacts of the mmModel creative accounts
							contactsService.getAccountsGlobalContacts(accountIds).then(function (data) {
								indexGlobalConacts(accountIds, data);
								setDefaultContacts(defaultContactsTypes.creative, $scope.mmModel[defaultContactsTypes.creative]);
							}, function (error) {
								processError(error);
							});
						}
						indexCretiveDefaultContactsByAccoutId();
						$scope.tabsHandler[defaultContactsTypes.creative].isInitialize = true;
						if ($scope.creativeAccounts.length == 0) {
							contactsService.getAllAccounts('CreativeManager').then(function (accounts) {
								$scope.creativeAccounts = accounts;
							});
						}
					}

					function initSite() {
						//get sites contacts
						if (_.isUndefined($scope.mmModel[defaultContactsTypes.site])) return;

						contactsService.getSitesAndSiteContacts($scope.mmModel[defaultContactsTypes.site]).then(function (sitesObj) {
							if (sitesObj.sites.length > 0 && !_.isEmpty($scope.contactsGridButtonActions[defaultContactsTypes.site]))
								$scope.contactsGridButtonActions[defaultContactsTypes.site][0].isDisable = false;
							$scope.siteContactsIndex = sitesObj.siteContactsIndex;
							setSites(sitesObj.sites);
							setSiteContacts(sitesObj.contacts);
							setDefaultContacts(defaultContactsTypes.site, $scope.mmModel[defaultContactsTypes.site]);
							setGridListDataArray(defaultContactsTypes.site);
							$scope.tabsHandler[defaultContactsTypes.site].isInitialize = true;
						}, function (error) {
							processError(error);
						});
					}

					function initGridsButtons() {
						$scope.contactsGridButtonActions = getGridsButtons();
					}

					function initGridsColumns() {
						columnObj = getColumnObj();
						$scope.columns = contactsService.getAllGridsColumnsDefinition(columnObj);
					}

					function initMediaGlobalContacts() {
						var deferred = $q.defer();
						if (!$scope.accountsUsersIndex[$scope.mmAccountId]) {
							$scope.accountsUsersIndex[$scope.mmAccountId] = [];
							var accountIds = [];
							accountIds.push($scope.mmAccountId);
							contactsService.getAccountsGlobalContacts(accountIds).then(function (data) {
								indexGlobalConacts(accountIds, data);
								setMediaGloabContacts(data[$scope.mmAccountId]);
								deferred.resolve();
							}, function () {
								deferred.reject();
							});
						} else {
							setMediaGloabContacts($scope.accountsUsersIndex[$scope.mmAccountId]);
							deferred.resolve();
						}
						return deferred.promise;
					}

					function initMediaDefaultContacts() {
						if (isInitDefaultContactsNeeded) {
							$scope.mmModel[defaultContactsTypes.media].length = 0;
							$scope.mmError[defaultContactsTypes.media].contacts.lenght = 0;
						}
						setDefaultContacts(defaultContactsTypes.media, $scope.mmModel[defaultContactsTypes.media]);
						if($scope.tabsHandler)
							$scope.tabsHandler[defaultContactsTypes.media].isInitialize = true;
					}

					/************************ INDEXING ************************/

					function indexGlobalConacts(accountIds, newGlobalConacts) {
						accountIds.forEach(function (accountId) {
							for (var i = 0; i < newGlobalConacts[accountId].length; i++) {
								if($scope.accountsUsersIndex){
									$scope.accountsUsersIndex[accountId].push(newGlobalConacts[accountId][i]);
								}
							}
						});
					}

					function indexDefaultContactsByClientRefId(contactsType, contacts) {
						for (var i = 0; i < contacts.length; i++) {
							var contact = contacts[i];
							contact["clientType"] = contactsType;
							$scope.clientRefIdDefaultContactsIndex[contact.clientRefId] = contact;
						}
					}

					function addDefaultContactToClientRefdIdIndex(contactsType, contact) {
						contact.clientType = contactsType;
						$scope.clientRefIdDefaultContactsIndex[contact.clientRefId] = contact;
					}

					function indexCretiveDefaultContactsByAccoutId() {
						//set object to each creative account
						for (var k = 0; k < $scope.mmModel.creativeAccounts.length; k++) {
							var accountId = $scope.mmModel.creativeAccounts[k].accountId;
							$scope.mmError[defaultContactsTypes.creative][accountId] = {};
							$scope.creativeDefaultContactsByAccountIndex.accounts.push({id: accountId, contacts: [],
								gridSelectedItems: [], numberFilteredItems: 0, mmError : $scope.mmError[defaultContactsTypes.creative][accountId]});
						}
						//set contacts under its account
						$scope.mmModel[defaultContactsTypes.creative].forEach(function (contact) {
							var account = _.find($scope.creativeDefaultContactsByAccountIndex.accounts, {id: contact.accountId});
							if (!_.isUndefined(account)) {
								account.contacts.push(contact);
							}
						});
					}

					/************ EVENTS HANDLER (ON CELLS CHANGED) *************/

					function onCellChanged(col, valueId, colIndex, fieldName, row, selectedItem) {
						var type = getCurrentSelectedTabType();
						var globalContacts = $scope.accountsUsersIndex[$scope.mmAccountId];
						if (type == defaultContactsTypes.site) globalContacts = $scope.siteContacts;
						cellErrorObj = contactsService.onCellChanged(type, fieldName, row, selectedItem, $scope.mmModel[type], $scope.mmError[type], globalContacts, $scope.siteContactsIndex, $scope.sizmekGlobalContactsIndex[selectedItem.id]);
						tabValidation(type);
						contactsService.updateValidationHandler($scope.mmError[type], type, false);
						return valueId;
					}

					//function to be called on cell changed and will be display error message only on duplicate row on the name col only
					function displayErrorMsg() {
						var result = {isSuccess: true, message: cellErrorObj.msg};
						if (!_.isEmpty(cellErrorObj.msg) && cellErrorObj.fieldName == 'name'){
							result.isSuccess = false;
						}
						return result;
					}

					$scope.afterSelectionChanged = function () {
						var selectedItems = $scope.mmModelGrid[getCurrentSelectedTabType()].selectedItems;
						if (!_.isEmpty($scope.contactsGridButtonActions[getCurrentSelectedTabType()])){
							$scope.contactsGridButtonActions[getCurrentSelectedTabType()][1].isDisable = !(selectedItems.length !== 0);
							$scope.$root.isDirtyEntity = true;
						}
					};

					$scope.onTabSelected = function () {
						$timeout(function () {
							var selectedTab = $scope.tabsHandler[getCurrentSelectedTabType()];
							if (!selectedTab.isInitialize && !_.isUndefined($scope.mmModel)) {
								selectedTab.initializeFunc();
							}
						}, 50);
					};

					$scope.onAddNewCreativeAgencyBtnClicked = function () {
						selectCreaticveAgencyModal();
					};

					$scope.onRemoveAgencyClicked = function () {
						//remove account id from creative mmModel
						_.remove($scope.mmModel.creativeAccounts, function (account) {
							return _.isEqual(account.accountId, $scope.focusCreativeAgency.accountId)
						});

						//remove creative account from the hierarchy model
						_.remove($scope.creativeDefaultContactsByAccountIndex.accounts, function (account) {
							return _.isEqual(account.id, $scope.focusCreativeAgency.accountId)
						});

						//remove creative contacts from the mmModel
						_.remove($scope.mmModel[defaultContactsTypes.creative], function (contact) {
							return _.isEqual(contact.accountId, $scope.focusCreativeAgency.accountId)
						});

						//remove contacts from mmError.creativeManagerContacts
						delete $scope.mmError[defaultContactsTypes.creative][$scope.focusCreativeAgency.accountId];

						if(contactsService.isCreativeContactsValid($scope.mmError[defaultContactsTypes.creative], $scope.mmModel.creativeAccounts))
							$scope.mmContactsTabError[defaultContactsTypes.creative] = true;
						else
							$scope.mmContactsTabError[defaultContactsTypes.creative] = false;

						$scope.$root.isDirtyEntity = true;
					};

					/************************ GRID ACTIONS ************************/

					$scope.selectNewRowHandler = function () {
						var rows = [];
						rows.push(newContact);
						return rows;
					};

					function createNewContact() {
						$scope.$root.isDirtyEntity = true;
						var accountId = 0;
						if (!_.isUndefined($scope.mmAccountId) && !_.isNull($scope.mmAccountId)) {
							accountId = $scope.mmAccountId;
						}
						var contactObj = {
							type: getCurrentSelectedTabType(),
							clientRefId: mmUtils.clientIdGenerator.next(),
							accountId: accountId
						};
						newContact = contactsService.getNewContactObj(contactObj);
						$scope.mmModel[contactObj.type].push(newContact);
						contactsService.addErrorMessagesToGrid(newContact, "please select value", $scope.mmError[contactObj.type], contactObj.type, 'missing');
						addDefaultContactToClientRefdIdIndex(contactObj.type, newContact);
						tabValidation(getCurrentSelectedTabType());

						//select new row
						newContact.fieldName = 'clientRefId';
						newContact.value = newContact.clientRefId;
						$scope.selectNewRowHandler();//make row selection
					}

					function deleteContacts() {
						$scope.$root.isDirtyEntity = true;
						var type = getCurrentSelectedTabType();
						//remove all invalid object in mmError that being deleted
						$scope.mmModelGrid[type].selectedItems.forEach(function (contact) {
							removeErrorObj(type, contact.clientRefId);
						});
						contactsService.deleteContacts($scope.mmModelGrid[type].selectedItems, $scope.mmModel[type]);
						contactsService.contactsValidation($scope.mmModel[type], $scope.mmError[type], type);
						if(!_.isEmpty($scope.contactsGridButtonActions[getCurrentSelectedTabType()])){
							$scope.contactsGridButtonActions[getCurrentSelectedTabType()][1].isDisable = true;
						}
						tabValidation(type);
						contactsService.updateValidationHandler($scope.mmError[type], type, false);
					}

					/********************* HELPERS FUNCTIONS **********************/

					function setMediaGloabContacts(globalContacts) {
						$scope.mediaGlobalContacts.length = 0;
						if (globalContacts) {
							for (var i = 0; i < globalContacts.length; i++) {
								$scope.mediaGlobalContacts.push(globalContacts[i]);
							}

              EC2Restangular.addPagingFunctionality($scope.mediaGlobalContacts, globalContacts);
						}
					}

					function setDefaultContacts(type, defaultContacts) {
						makeContactsManipulation(type, defaultContacts);
						indexDefaultContactsByClientRefId(type, $scope.mmModel[type]);
					}

					function setSiteContacts(siteContacts) {
						siteContacts.forEach(function (contact) {
							$scope.siteContacts.push(contact);
						});

            EC2Restangular.addPagingFunctionality($scope.siteContacts, siteContacts);
					}

					function setSites(sites) {
						sites.forEach(function (site) {
							$scope.sites.push(site);
						});

            EC2Restangular.addPagingFunctionality($scope.sites, sites);
					}

					function setGridListDataArray(type) {
						switch (type) {
							case 'sizmekContacts':
								setSizmekGridListDataArray();
								break;
							case 'siteContacts':
								setSiteGridListDataArray();
								break;
						}
					}

					function setSizmekGridListDataArray() {
						$scope.mmModel[defaultContactsTypes.sizmek].forEach(function (contact) {
							contact.gridListDataArray.length = 0;
							if (!_.isUndefined($scope.sizmekGlobalContactsIndex[contact.campaignRole])) {
								$scope.sizmekGlobalContactsIndex[contact.campaignRole].forEach(function (sizmekContact) {
									contact.gridListDataArray.push(sizmekContact);
								});

                EC2Restangular.addPagingFunctionality(contact.gridListDataArray, $scope.sizmekGlobalContactsIndex[contact.campaignRole]);
							}
						});
					}

					function setSiteGridListDataArray() {
						$scope.mmModel[defaultContactsTypes.site].forEach(function (contact) {
							contact.gridListDataArray = $scope.siteContactsIndex[contact.siteId];
						});
					}

					function tabValidation(type) {
						if ($scope.mmError[type]){
							if($scope.mmError[type].contacts.length > 0) {
								$scope.mmContactsTabError[type] = false;
							} else {
								$scope.mmContactsTabError[type] = true;
							}
						}
					}

					function makeContactsManipulation(contactsType, contacts) {
						contacts.forEach(function (contact) {
							contactManipulation(contactsType, contact, contact.accountId);
						});
						//add ClientRefId to all DefaultContacts (in case DefaultContacts doesn't contain one already)
						setClientRefIdToContacts(contacts);
						//$rootScope.isDirtyEntity = false;
					}

					function contactManipulation(contactsType, contact, accountId) {
						switch (contactsType) {
							case defaultContactsTypes.sizmek:
								contact.name = contact.contactId;
								contact.contactName = contactsService.getContactName($scope.sizmekGlobalContacts, "id", contact.contactId);
								contact.isValid = true;
								contact.gridListDataArray = [];
								break;
							case defaultContactsTypes.media:
								contact.name = contact.contactId;
								contact.contactName = contactsService.getContactName($scope.accountsUsersIndex[$scope.mmAccountId], "id", contact.contactId);
								contact.isValid = true;
								break;
							case defaultContactsTypes.creative:
								contact.name = contact.contactId;
								contact.contactName = contactsService.getContactName($scope.accountsUsersIndex[accountId], "id", contact.contactId);
								contact.isValid = true;
								break;
							case defaultContactsTypes.site:
								contact.siteName = contact.siteId;
								contact.name = contact.contactId;
								contact.contactName = contactsService.getContactName($scope.siteContacts, "id", contact.contactId);
								contact.isValid = true;
								break;
						}
					}

					function selectCreaticveAgencyModal() {
						if (isSelectCreativeModalOpen) {
							return;
						}
						isSelectCreativeModalOpen = true;

						var modalInstance = mmModal.open({
							templateUrl: './admin/views/creativeAccountSelector.html',
							controller: 'creativeAccountSelectorCtrl',
							title: "Select Creative Manager Account",
							modalWidth: 470,
							bodyHeight: 370,
							confirmButton: { name: "Save", funcName: "onModalSaveBtnClicked", hide: false, isPrimary: true},
							discardButton: { name: "Cancel", funcName: "onModalCancelBtnClicked"},
							resolve: {
								accounts: function () {
									return $scope.creativeAccounts;
								}
							}
						});
						modalInstance.result.then(function (account) {
							if (account) {
								if (_.isEqual(_.findIndex($scope.creativeDefaultContactsByAccountIndex.accounts, {id: account.id}), -1)) {
									$scope.mmError[defaultContactsTypes.creative][account.id] = {};
									$scope.creativeDefaultContactsByAccountIndex.accounts.push({id: account.id, contacts: [], gridSelectedItems: [], numberFilteredItems: 0, mmError : $scope.mmError[defaultContactsTypes.creative][account.id]});
									$scope.mmModel.creativeAccounts.push({accountId: account.id, primaryCreative: false});
								}
								//creative agency is already exist, duplication not allowed
								else {
									mmAlertService.addError("Can't create Creative Manager account, account is already exist");
								}
								isSelectCreativeModalOpen = false;
								$scope.$root.isDirtyEntity = true;
							}
						}, function () {
							isSelectCreativeModalOpen = false;
						});
					}

					function getGridsButtons() {
						var disableAddBtn = true;
						if (!_.isUndefined($scope.mmAccountId) && !_.isNull($scope.mmAccountId)) {
							disableAddBtn = false;
						}
						var gridsBtn = {};
						gridsBtn[defaultContactsTypes.sizmek] = [];
						if($scope.tabsHandler.sizmekContacts.permission){
							gridsBtn[defaultContactsTypes.sizmek].push(
								{name: "Add", func: createNewContact, isDisable: false},
								{name: "Remove", func: deleteContacts, isDisable: true});
						}

						gridsBtn[defaultContactsTypes.media] = [];
						if($scope.tabsHandler.campaignManagerContacts.permission){
							gridsBtn[defaultContactsTypes.media].push(
								{name: "Add", func: createNewContact, isDisable: disableAddBtn},
								{name: "Remove", func: deleteContacts, isDisable: true});
						}

						gridsBtn[defaultContactsTypes.site] = [];
						if($scope.tabsHandler.siteContacts.permission && $scope.mmEditSite){
							gridsBtn[defaultContactsTypes.site].push(
								{name: "Add", func: createNewContact, isDisable: true},
								{name: "Remove", func: deleteContacts, isDisable: true});
						}
						return gridsBtn;
					}

					function getColumnObj() {
						var columnObj = {};
						columnObj[defaultContactsTypes.sizmek] = {onCellChanged: onCellChanged, displayErrorMsg: displayErrorMsg};
						columnObj[defaultContactsTypes.media] = {onCellChanged: onCellChanged, contacts: $scope.mediaGlobalContacts, displayErrorMsg: displayErrorMsg};
						columnObj[defaultContactsTypes.site] = {onCellChanged: onCellChanged, sites: $scope.sites, isEdit: $scope.mmEditSite, displayErrorMsg: displayErrorMsg};
						return columnObj;
					}

					function removeErrorObj(type, clientRefId) {
						_.remove($scope.mmError[type].contacts, function (errorObj) {
							return _.isEqual(errorObj.clientRefId, clientRefId);
						});
					}

					function setClientRefIdToContacts(contacts) {
						mmUtils.clientIdGenerator.populateArray(contacts);
					}

					function getCurrentSelectedTabType() {
						if(!$scope.tabsHandler) {
							return defaultContactsTypes.sizmek;
						}

						if ($scope.tabsHandler[defaultContactsTypes.sizmek].isActive) {
							return defaultContactsTypes.sizmek;
						} else if ($scope.tabsHandler[defaultContactsTypes.media].isActive) {
							return defaultContactsTypes.media;
						} else if ($scope.tabsHandler[defaultContactsTypes.creative].isActive) {
							return defaultContactsTypes.creative;
						} else if ($scope.tabsHandler[defaultContactsTypes.site].isActive) {
							return defaultContactsTypes.site;
						}
					}

					function processError(error) {
						console.log('ohh no!');
						console.log(error);
						$scope.showSPinner = false;
						if (error && error.data) {
							if (!error.data.error) {
								mmAlertService.addError("Server error. Please try again later.");
							} else {
								mmAlertService.addError(error.data.error);
							}
						} else {
							mmAlertService.addError("Server error. Please try again later.");
						}
					}

					$scope.$on('$destroy', function () {
						if (watcher) watcher();
						if (eventListener) eventListener();

						$scope.tabsHandler = null;
						$scope.contactsGridButtonActions = null;
						$scope.mmError = null;
						if ($scope.mmModel) {
							if ($scope.mmModel.sizmekContacts) $scope.mmModel.sizmekContacts.length = 0;
							if ($scope.mmModel.campaignManagerContacts) $scope.mmModel.campaignManagerContacts.length = 0;
							if ($scope.mmModel.creativeManagerContacts) $scope.mmModel.creativeManagerContacts.length = 0;
							if ($scope.mmModel.siteContacts) $scope.mmModel.siteContacts.length = 0;
							$scope.mmModel.creativeAccounts = {};
						}
						$scope.mmModelGrid = null;
						$scope.columns = null;
						$scope.creativeAccounts = [];
						$scope.mediaGlobalContacts = [];
						$scope.sizmekGlobalContacts = [];
						$scope.accountsUsersIndex = null;
						$scope.siteContactsIndex = null;
						$scope.siteContacts = [];
						$scope.sites = [];
						$scope.clientRefIdDefaultContactsIndex = null;
						$scope.creativeDefaultContactsByAccountIndex = null;
						$scope.focusCreativeAgency = null;
						$scope.addCreativeAgencyLinkText = null;
					});
				}]
		}
	}]
);
