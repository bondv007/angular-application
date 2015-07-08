/**
 * Created by liad.ron on 10/2/2014.
 */

'use strict';

app.service('contactsService', ['enums', 'mmRest', '$q', '$filter', function (enums, mmRest, $q, $filter) {

	/************************ GRIDS ************************/

	function getAllGridsColumnsDefinition(columnObj){
		var columns = {};
		columns.sizmek = getGridColumnDefinition(columnObj, enums.defaultContactsTypes.getName("SIZMEK"));
		columns.media = getGridColumnDefinition(columnObj, enums.defaultContactsTypes.getName("MEDIA"));
		columns.site = getGridColumnDefinition(columnObj, enums.defaultContactsTypes.getName("SITE"));

		return columns;
	}

	function getGridColumnDefinition(columnObj, contactsType){
		var columns = [];
		switch(contactsType){
			case enums.defaultContactsTypes.getName("SIZMEK"):
				columns = [
					{field: 'campaignRole', displayName: 'Campaign Role', isRequired: true, listDataArray:  enums.sizmekCampaignRoles, gridControlType: enums.gridControlType.getName("SelectList"), functionOnCellEdit: columnObj[contactsType].onCellChanged, validationFunction: columnObj[contactsType].displayErrorMsg},
					{field: 'name', displayName: 'Name', isRequired: true, listDataArray: columnObj[contactsType].contacts, gridControlType: enums.gridControlType.getName("SelectList"), functionOnCellEdit: columnObj[contactsType].onCellChanged, validationFunction: columnObj[contactsType].displayErrorMsg, gridSelectSearch: true}
				];
				break;
			case enums.defaultContactsTypes.getName("MEDIA"):
				columns = [
					{field: 'campaignRole', displayName: 'Campaign Role', isRequired: true, listDataArray: enums.mediaAgencyCampaignRoles, gridControlType: enums.gridControlType.getName("SelectList"), functionOnCellEdit: columnObj[contactsType].onCellChanged, validationFunction: columnObj[contactsType].displayErrorMsg},
					{field: 'name', displayName: 'Name', isRequired: true, listDataArray: columnObj[contactsType].contacts, gridControlType: enums.gridControlType.getName("SelectList"), functionOnCellEdit: columnObj[contactsType].onCellChanged, validationFunction: columnObj[contactsType].displayErrorMsg, gridSelectSearch: true }
				];
				break;
			case enums.defaultContactsTypes.getName("CREATIVE"):
				columns = [
					{field: 'campaignRole', displayName: 'Campaign Role', isRequired: true, listDataArray: enums.creativeAgencyCampaignRoles, gridControlType: enums.gridControlType.getName("SelectList"), functionOnCellEdit: columnObj[contactsType].onCellChanged, validationFunction: columnObj[contactsType].displayErrorMsg},
					{field: 'name', displayName: 'Name', isRequired: true, listDataArray: columnObj[contactsType].contacts, gridControlType: enums.gridControlType.getName("SelectList"), functionOnCellEdit: columnObj[contactsType].onCellChanged, validationFunction: columnObj[contactsType].displayErrorMsg, gridSelectSearch: true }
				];
				break;
			case enums.defaultContactsTypes.getName("SITE"):
				columns = [
					{field: 'siteName', displayName: 'Site', isRequired: true, isColumnEdit: columnObj[contactsType].isEdit, listDataArray:  columnObj[contactsType].sites, gridControlType: enums.gridControlType.getName("SelectList"), functionOnCellEdit: columnObj[contactsType].onCellChanged, validationFunction: columnObj[contactsType].displayErrorMsg},
					{field: 'name', displayName: 'Name', isRequired: true, isColumnEdit: columnObj[contactsType].isEdit, gridControlType: enums.gridControlType.getName("SelectList"), functionOnCellEdit: columnObj[contactsType].onCellChanged, validationFunction: columnObj[contactsType].displayErrorMsg, gridSelectSearch: true }
				];
				break;
		}
		return columns;
	}

	function getNewContactObj(contactObj) {
		var contact = {};
		switch(contactObj.type){
			case enums.defaultContactsTypes.getName("SIZMEK"):
				contact = {"type": "DefaultSizmekContact", "clientRefId": contactObj.clientRefId, "contactId": null, "campaignRole": null, "isValid": false, "gridListDataArray": [], contactName : null};
				break;
			case enums.defaultContactsTypes.getName("MEDIA"):
				contact = {"type": "DefaultCampaignManagerContact", "clientRefId": contactObj.clientRefId, "accountId": contactObj.accountId, "contactId": null, "campaignRole": null, "name": null, "isValid": false, contactName : null};
				break;
			case enums.defaultContactsTypes.getName("CREATIVE"):
				contact = {"type": "DefaultCreativeManagerContact", "clientType": enums.defaultContactsTypes.getName("CREATIVE"),"clientRefId": contactObj.clientRefId, "accountId": contactObj.accountId, "contactId": null, "campaignRole": null, "name": null, "isValid": false, contactName : null};
				break;
			case enums.defaultContactsTypes.getName("SITE"):
				contact = {"type": "DefaultSiteContact", "clientRefId": contactObj.clientRefId, "contactId": null, "siteId": null, "siteName": null, "name": null, contactName: null, "isValid": false};
				break;
		}
		return contact;
	}

	function deleteContacts(selectedItems, contacts) {
		if (selectedItems.length > 0) {
			var index = selectedItems.length - 1;
			while (index >= 0) {
				var itemToDelete = selectedItems[index];
				contacts.splice(contacts.indexOf(itemToDelete), 1);
				selectedItems.splice(index, 1);
				index--;
			}
		}
	}

	function getNewErrorObj(errorObj){
		return{
			clientRefId: errorObj.clientRefId,
			contact: errorObj.contact,
			errorMsg: errorObj.error,
			type: errorObj.type,
			invalidType : errorObj.invalidType
		}
	}

	function onCellChanged(contactType, fieldName, row, selectedItem, contacts, invalidContacts, globalContacts, siteContactsIndex, sizmekGlobalContacts){
		var cellErrorObj = {type : '', fieldName : '', msg : ''};
		var result = {};
		result.validation = {};
		switch (fieldName) {
			case "campaignRole":
				cellErrorObj = onCampaignRoleChanged(contactType, result, row, selectedItem, contacts, invalidContacts, globalContacts, sizmekGlobalContacts);
				break;
			case "name":
				cellErrorObj = onNameChanged(contactType, result, row, selectedItem, contacts, invalidContacts, globalContacts);
				break;
			case "siteName":
				cellErrorObj = onSiteNameChanged(contactType, result, row, selectedItem, contacts, invalidContacts, globalContacts, siteContactsIndex);
		}
		contactsValidation(contacts, invalidContacts, contactType);
		return cellErrorObj;
	}

	function onCampaignRoleChanged(contactType, result, row, selectedItem, contacts, invalidContacts, globalContacts, sizmekRoleContacts) {
		if (row.entity.clientType == enums.defaultContactsTypes.getName("SIZMEK")){
			row.entity.gridListDataArray.length = 0;
			sizmekRoleContacts.forEach(function(contact){
				row.entity.gridListDataArray.push(contact);
			});

      mmRest.EC2Restangular.addPagingFunctionality(row.entity.gridListDataArray, sizmekRoleContacts);
		}

		result.campaignRole = selectedItem.id;
		result.name = row.entity.name;
		return contactValidation(result, row, 'campaignRole', contacts, invalidContacts, globalContacts, contactType);
	}

	function onNameChanged(contactType, result, row, selectedItem, contacts, invalidContacts, globalContacts) {
		result.campaignRole = row.entity.campaignRole;
		result.name = selectedItem.name;

		return contactValidation(result, row, 'name', contacts, invalidContacts, globalContacts, contactType);
	}

	function onSiteNameChanged(contactType, result, row, selectedItem, contacts, invalidContacts, globalContacts, siteContactsIndex) {
		row.entity.gridListDataArray = siteContactsIndex[selectedItem.id];//set data list array of the site contacts
		result.siteName = selectedItem.id;
		result.name = row.entity.name;

		return contactValidation(result, row, 'siteName', contacts, invalidContacts, globalContacts, contactType);
	}

	function contactValidation(result, row, colType, contacts, invalidContacts, globalContacts, contactType){
		//add contactId
		var currContactIndex = _.findIndex(contacts, {clientRefId: row.entity.clientRefId});
		var currContact = contacts[currContactIndex];

		currContact.contactId = currContact.name;//id
		currContact.contactName = getContactName(globalContacts, "id", currContact.contactId);
		if(_.isUndefined(currContact.contactName)) currContact.contactName = null;
		var fieldName = 'campaignRole';
		if(currContact.clientType == enums.defaultContactsTypes.getName("SITE")) {
			currContact.siteId = currContact.siteName;
			fieldName = 'siteName';
		}

		var errorMsg = duplicateContactsValidation(currContact, currContactIndex, fieldName, contacts, row, colType, result, invalidContacts, contactType);
		missingFieldsValidation(currContact, row, fieldName, result, invalidContacts, contactType);

		if(!result.validation.duplication.isSuccess || !result.validation.missingFields.isSuccess){
			currContact.isValid = false;
		}
		//new contact is valid, check that it is not in the mmError
		else{
			removeErrorObj(currContact.clientRefId, invalidContacts, contactType);
		}
		return errorMsg;
	}

	function contactsValidation(contacts, invalidContacts, contactsType){
		for (var i = 0 ; i < contacts.length ; i++){
			var contact = contacts[i];
			var isValid = true;
			var invalidType = 'duplicate';
			var msg = 'selected value already exist';
			var fieldName = "campaignRole";
			if(contactsType == enums.defaultContactsTypes.getName("SITE")) fieldName = "siteName";
			for(var j = 0 ; j < contacts.length ; j++){
				var currContact = contacts[j];
				//missing fields validation
				if(_.isNull(contact[fieldName]) || _.isNull(contact.name) || _.isUndefined(contact.name)){
					isValid = false;
					msg = 'please select value';
					invalidType = 'missing';
					break;
				}
				if(i == j){
					continue;
				}
				if (_.isEqual(contact[fieldName], currContact[fieldName]) && _.isEqual(contact.contactId, currContact.contactId)) {
					isValid = false;
					break;
				}
			}
			if(!isValid){
				contact.isValid = false;
				addErrorMessagesToGrid(contact, msg, invalidContacts, contactsType, invalidType);
			}else{
				contact.isValid = true;
				removeErrorObj(contact.clientRefId, invalidContacts);
			}
		}
	}

	function updateValidationHandler(invalidContacts, type, isSaveValidation){
		invalidContacts.validationResult.fields.length = 0;
		invalidContacts.validationResult.isSuccess = true;
		invalidContacts.contacts.forEach(function (errorObj) {
			if (!!isSaveValidation){
				if(errorObj.invalidType == 'missing'){
					if(errorObj.contact.contactId == null || _.isUndefined(errorObj.contact.contactId)){
						if (_.isUndefined(_.find(invalidContacts.validationResult.fields, {'value' : errorObj.contact['contactId']}))) {
							invalidContacts.validationResult.fields.push(new validationResult(errorObj, 'name'));
						}
					}
					var fieldName = 'campaignRole';
					if(type == 'siteContacts') fieldName = 'siteName';
					if(errorObj.contact[fieldName] == null || _.isUndefined(errorObj.contact[fieldName])){
						if (_.isUndefined(_.find(invalidContacts.validationResult.fields, {'value' : errorObj.contact[fieldName], fieldName : fieldName}))) {
							invalidContacts.validationResult.fields.push(new validationResult(errorObj, fieldName));
						}
					}
				}else{
					if (_.isUndefined(_.find(invalidContacts.validationResult.fields, {'value' : errorObj.contact['contactId']}))) {
						invalidContacts.validationResult.fields.push(new validationResult(errorObj, 'name'));
					}
				}
			}else if (!isSaveValidation && errorObj.invalidType != 'missing'){
				if (_.isUndefined(_.find(invalidContacts.validationResult.fields, {'value' : errorObj.contact['contactId']}))) {
					invalidContacts.validationResult.fields.push(new validationResult(errorObj, 'name'));
				}
			}
		});
		if (invalidContacts.validationResult.fields.length > 0){
			invalidContacts.validationResult.isSuccess = false;
			invalidContacts.validationResult.dirtyFlag = !invalidContacts.validationResult.dirtyFlag;
		}
	}

	function validationResult(errorObj, fieldName) {
		return {
			fieldName: fieldName,
			value: errorObj.contact[fieldName] || null,
			message: errorObj.errorMsg
		}
	}

	function duplicateContactsValidation(contact, index, fieldName, contacts, row, colType, result, invalidContacts, contactType){
		var cellErrorObj = {type : '', fieldName : '', msg : ''};
		result.validation.duplication = {};
		result.validation.duplication.isSuccess = true;
		result.validation.duplication.message = "";

		if(_.isNull(contact.name)){
			return cellErrorObj;
		}
		for(var i = 0 ; i < contacts.length ; i++){
			var currContact =  contacts[i];
			if (i !== index && _.isEqual(currContact[fieldName], contact[fieldName]) && _.isEqual(currContact.contactId, contact.contactId)){
				result.validation.duplication.isSuccess = false;
				result.validation.duplication.message = "selected value already exist";
				cellErrorObj.msg = result.validation.duplication.message;
				cellErrorObj.type = 'duplicate';
				cellErrorObj.fieldName = colType;
				addErrorMessagesToGrid(row.entity, result.validation.duplication.message, invalidContacts, contactType, 'duplicate');
			}
		}
		return cellErrorObj;
	}

	function missingFieldsValidation(contact, row, fieldName, result, invalidContacts, contactType){
		result.validation.missingFields = {};
		result.validation.missingFields.isSuccess = true;
		result.validation.missingFields.message = "";
		if(_.isUndefined(contact[fieldName]) || _.isUndefined(contact.name) ||_.isNull(contact[fieldName]) || _.isNull(contact.name)){
			result.validation.missingFields.isSuccess = false;
			result.validation.missingFields.message = "please select value";
			addErrorMessagesToGrid(row.entity, result.validation.missingFields.message, invalidContacts, contactType, 'missing');
		}
	}

	function addErrorMessagesToGrid(contact, errorMsg, invalidContacts, type, invalidType, fieldName){
		var currContact = _.find(invalidContacts.contacts, {"clientRefId": contact.clientRefId});
		if(_.isUndefined(currContact)){
			var obj = {
				clientRefId: contact.clientRefId,
				contact : contact,
				error: errorMsg,
				type: type,
				invalidType : invalidType
			};
			invalidContacts.contacts.push(new getNewErrorObj(obj));
		}
		//update the invalid reason (from 'missing' to 'duplicate')
		else{
			currContact.errorMsg = errorMsg;
			currContact.invalidType = invalidType;
		}
	}

	function removeErrorObj(clientRefId, invalidContacts){
		_.remove(invalidContacts.contacts, function(errorObj) {
			return _.isEqual(errorObj.clientRefId, clientRefId);
		});
	}

	function getContactName(contacts, propertyName, contactId){
		var contact = {};
		if(!_.isUndefined(contacts)){
			if(angular.isArray(contacts)){
				contacts.forEach(function(contactArr){
					contact = findContact(contactArr, propertyName, contactId);
					if(!_.isUndefined(contact) && !_.isEmpty(contact))
						return contact.name;
				});
			}else{
				contact = findContact(contacts, propertyName, contactId);
			}
		}
		if(_.isUndefined(contact) || _.isEmpty(contact)){
			contact = {};
			contact.name = null;
		}
		return contact.name;
	}

	function findContact(contacts, propertyName, contactId){
		var searchObj = {};
		searchObj[propertyName] = contactId;
		//return _.find(contacts, searchObj);
	return $filter('filter')(contacts,searchObj).name;
	}

	/************************ RETRIEVE DATA + INDEXING ************************/

	function indexAccountsUsers(resultIndex) {
		var deferred = $q.defer();
		getAccountsUsers().then(function(results){
			var accounts = results[0];
			var users = results[1];
			for (var i = 0; i < accounts.length; i++) {
				var account = accounts[i];
				resultIndex[account.id] = [];
				for (var j = 0; j < users.length; j++) {
					var user = users[j];
					if (account.id == user.accountId)
						resultIndex[account.id].push(user);
				}
			}
			deferred.resolve();
		},function(error){
			deferred.reject(error);
		});

		return deferred.promise;
	}

	function getAccountsUsers(){
		var deferred = $q.defer();
		var accountsPromise = getAllAccounts();
		var usersPromise = getGlobalContacts();
		$q.all([accountsPromise, usersPromise]).then(function (results) {
			deferred.resolve(results);
		},function(error){
			deferred.reject(error);
		});
		return deferred.promise;
	}

	function getAllAccounts(type) {
		var deferred = $q.defer();
		mmRest.accountsGlobal.getList({"accountType" : type}).then(function (accounts) {
			deferred.resolve(accounts);
		}, function (error) {
			deferred.reject(error);
		});

		return deferred.promise;
	}

	function getAccountsGlobalContacts(accountIds){
		var deferred = $q.defer();
		var promises = [];
		var indexGlobalContacts = {};
		accountIds.forEach(function(id){
			indexGlobalContacts[id] = [];
			promises.push(getGlobalContactsByAccountId(id));
		});
		$q.all(promises).then(function (results) {
			for (var i = 0 ; i < results.length ; i++){
				if(!_.isEmpty(results[i]))
					indexGlobalContacts[results[i][0].accountId] = results[i];
			}
			deferred.resolve(indexGlobalContacts);
		},function(errors){
			deferred.reject(errors);
		});
		return deferred.promise;
	}

	function getGlobalContactsByAccountId(accountId){
		var deferred = $q.defer();
		mmRest.globalContacts.getList({'accountId': accountId}).then(
			function(globalUsers){
				deferred.resolve(globalUsers);
			}, function(error){
				deferred.reject(error);
			});
		return deferred.promise;
	}

	function getGlobalContacts(){
		var deferred = $q.defer();
		mmRest.globalContacts.getList().then(function(users){
			deferred.resolve(users);
		},function(error){
			deferred.reject(error);
		});

		return deferred.promise;
	}


	function getGlobalSizmekContacts(){
    var salesUsers = mmRest.globalSizmekContacts.getList({userTypes: 'SalesManager'});
    var clientServicesUsers = mmRest.globalSizmekContacts.getList({userTypes: 'ClientServices'});
    return [salesUsers, clientServicesUsers];
	}

	function getSitesAndSiteContacts(defaultSiteContacts){
		var resultObj = {sites : [], contacts : [], siteContactsIndex: {}};
		var siteIds = [];

		defaultSiteContacts.forEach(function(contact){
			if(!_.find(siteIds, {id : contact.siteId})) siteIds.push({id : contact.siteId});
		});

		var deferred = $q.defer();
		var promises = [];
		siteIds.forEach(function(site){
			promises.push(mmRest.siteGlobal(site.id).get());
		});

		$q.all(promises).then(function(results){
			resultObj.sites = results;
			results.forEach(function (site) {
				var siteName = site.name;
				var siteId = site.id;
				resultObj.siteContactsIndex[site.id] = [];
				site.siteContacts.siteContacts.forEach(function (contact) {
					contact.siteName = siteName;
					contact.siteId = siteId;
					resultObj.contacts.push(contact);
					resultObj.siteContactsIndex[site.id].push(contact);
				});
			});
			deferred.resolve(resultObj);
		},function(error){
			deferred.reject(error);
		});
		return deferred.promise;
	}

	/************************ SAVE ************************/

	function preSaveValidation($scope, typeIds, invalidContacts, creativeAccounts, tabs, contacts){
		var result = {isValid : true, msg : null};
		var types = enums.defaultContactsTypes;
		for (var i = 0 ; i < typeIds.length ; i++){
			var type = types.getName(typeIds[i]);
			var isValidContacts = true;
			switch(type){
				case enums.defaultContactsTypes.getName("SIZMEK"):
					result.msg = isSizmekValid(contacts.sizmekContacts);
					isValidContacts = !result.msg && invalidContacts[type].contacts.length == 0;
					break;
				case enums.defaultContactsTypes.getName("MEDIA"):
				case enums.defaultContactsTypes.getName("SITE"):
					isValidContacts = invalidContacts[type].contacts.length == 0;
					break;
				case enums.defaultContactsTypes.getName("CREATIVE"):
					isValidContacts = isCreativeContactsValid(invalidContacts[type], creativeAccounts);
					break;
			}
			if(!isValidContacts){
				$scope.$broadcast('mmContactsValidation', {
					type: type
				});
				//add error class on the invalid tabs
				tabs[type] = false;
				result.isValid = false;
			}
		}
		return result;
	}

	function isSizmekValid(contacts){
		var valid = {ClientServicesManager : false, CreativeServicesSpecialist : false, SalesManager: false};
		var msg = null;
		for (var i = 0 ; i < contacts.length ; i++){
			if(contacts[i].campaignRole){
				valid[contacts[i].campaignRole] = true;
			}
			if (valid.SalesManager && (valid.ClientServicesManager || valid.CreativeServicesSpecialist)){
				return msg;
			}
		}
		msg = 'Please add at least one Sizmek contact for Client Services and one Sizmek contact for Sales.';
		return msg;
	}

	function isCreativeContactsValid(contacts, accounts){
		for (var k = 0 ; k < accounts.length ; k++){
			if(contacts[accounts[k].accountId] && contacts[accounts[k].accountId].contacts.length > 0){
				return false;
			}
		}
		return true;
	}

	function postSaveValidation(failedServerContacts, orgContacts, orgInvalidContacts){
		var filteredError = {};
		filteredError.data = {};
		filteredError.data.error = [];
		failedServerContacts.data.error.forEach(function(error){
			//if there are multiple errors on the contact or it's not 60203 (Validation failed on group validations! Some contacts failed, all action failed !")
			if(!_.isEqual(error.errors.length, 1) || !_.isEqual(error.errors[0].code.toString(), "60203")){//TODO find another way to remove contact with 60203
				filteredError.data.error.push(error);
			}
		});

		return filteredError;
	}

	return {
		getAllGridsColumnsDefinition: getAllGridsColumnsDefinition,
		getGridColumnDefinition: getGridColumnDefinition,

		deleteContacts: deleteContacts,
		getNewContactObj: getNewContactObj,
		getNewErrorObj: getNewErrorObj,
		onCellChanged: onCellChanged,
		contactsValidation: contactsValidation,
		updateValidationHandler : updateValidationHandler,
		getContactName: getContactName,
		addErrorMessagesToGrid : addErrorMessagesToGrid,

		indexAccountsUsers: indexAccountsUsers,
		getAllAccounts: getAllAccounts,
		getAccountsGlobalContacts: getAccountsGlobalContacts,
		getGlobalContactsByAccountId: getGlobalContactsByAccountId,
		getGlobalSizmekContacts: getGlobalSizmekContacts,
		getSitesAndSiteContacts: getSitesAndSiteContacts,

		isCreativeContactsValid : isCreativeContactsValid,
		preSaveValidation: preSaveValidation,
		postSaveValidation: postSaveValidation//TODO is in use?
	};
}]);
