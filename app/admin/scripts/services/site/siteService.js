/**
 * Created by Ofir.Fridman on 8/24/14.
 */
'use strict';

app.service('siteService', ['enums', 'validationHelper', function (enums, validationHelper) {
	function _setContactsColumnDefinition(columns, columnObj) {
		columns.push({field: 'name', displayName: 'Name', isRequired: true, isColumnEdit: true, gridControlType: enums.gridControlType.getName("TextBox"), functionOnCellEdit:columnObj.onCellChanged});
		columns.push({field: 'email', displayName: 'Email', isRequired: true, isColumnEdit: true, gridControlType: enums.gridControlType.getName("TextBox"), functionOnCellEdit:columnObj.onCellChanged});
		columns.push(	{field: 'phone', displayName: 'Phone', isColumnEdit: true, gridControlType: enums.gridControlType.getName("TextBox")});
	}

	function _setContactsButtonsDefinition(btnsArr, funcs){
		btnsArr.push({name: "New Contact", func: funcs.new, isDisable: false});
		btnsArr.push({name: "Delete", func: funcs.remove, isDisable: true});
	}

	function _getNewContactObj() {
		return {type: "SiteContact", id: null, name: null, email: null, phone: null, isValid : false};
	}

	function _deleteContacts(selectedItems, siteContacts) {
		if (selectedItems.length > 0) {
			var index = selectedItems.length - 1;
			while (index >= 0) {
				var itemToDelete = selectedItems[index];
				siteContacts.splice(siteContacts.indexOf(itemToDelete), 1);
				selectedItems.splice(index, 1);
				index--;
			}
		}
	}

	function _onContactsCellChanged(col, value, colIndex, fieldName, row, contacts){
		var result = {isSuccess : true, message : ''};
		switch(fieldName){
			case "email":
				result = _onEmailChangeDoValidation(row, result, contacts);
				break;
		}

		return result;
	}

	function _onPhoneChangedDoValidation(row, result) {
		var phone = row.entity.phone;
		//phone format validation (for the validation helper)
		var fieldObj = {};
		fieldObj.value = phone;
		fieldObj.fieldName = phone;
		fieldObj.error = {};
		if(!validationHelper.isValidPhoneNumber(fieldObj)){
			result.isSuccess = false;
			result.message = fieldObj.error.text;
		}
	}

	function _onEmailChangeDoValidation(row, result, contacts) {
		//email format validation (for the validation helper)
		_emailValidation(row.entity, result, false);
		//email duplication validation
		if(isDuplicateEmail(row.entity, row.rowIndex, contacts)){
			result.isSuccess = false;
			result.message = 'email already exist';
		}
		return result;
	}

	function _emailValidation(contact, result, isSave){
		var fieldObj = {};
		var isValid = true;
		fieldObj.value = contact.email;
		fieldObj.fieldName = contact.email;
		fieldObj.error = {};
		if(contact.email || isSave){
			if(!validationHelper.isValidEmailFormat(fieldObj)){
				if(!!result) {
					result.isSuccess = false;
					result.message = fieldObj.error.text;
				}
				isValid = false;
			}
		}
		return isValid;
	}

	function _contactsValidation(contacts, invalidContacts, toggleHandler, toggleName, isSave){
		var isValid = true;
		invalidContacts.isSuccess = true;
		invalidContacts.fields.length = 0;
		contacts.forEach(function(contact, index){
			var isContactValid = true;
			var isEmailDuplication = isDuplicateEmail(contact, index, contacts);
			var isValidEmailFormat = true;
			if(contact.email) isValidEmailFormat = _emailValidation(contact, null, true);
			if(isEmailDuplication || !isValidEmailFormat){
				isContactValid = false;
				if (_.isUndefined(_.find(invalidContacts.fields, {'value' : contact.email, fieldName : 'email'}))) {
					var emailMsg = 'please insert email';
					if(isEmailDuplication) emailMsg = 'email already exist';
					if(!isValidEmailFormat) emailMsg = contact.email + ' invalid email format';
					invalidContacts.fields.push(new validationResult('email', contact.email, emailMsg));
				}
			}
			if(isSave){
				if(!contact.email){
					isContactValid = false;
					if (_.isUndefined(_.find(invalidContacts.fields, {'value' : contact.email, fieldName : 'email'}))) {
						var emailMsg = 'please insert email';
						invalidContacts.fields.push(new validationResult('email', contact.email, emailMsg));
					}
				}
				if(!contact.name){
					isContactValid = false;
					if (_.isUndefined(_.find(invalidContacts.fields, {'value' : contact.name, fieldName : 'name'}))) {
						var nameMsg = 'please insert name';
						invalidContacts.fields.push(new validationResult('name', contact.name, nameMsg));
					}
				}
			}
			contact.isValid = isContactValid;
		});
		if (invalidContacts.fields.length > 0){
			invalidContacts.isSuccess = false;
			isValid = false;
			invalidContacts.dirtyFlag = !invalidContacts.dirtyFlag;
			toggleHandler[toggleName] = true;
		}
		return isValid;
	}

	function validationResult(fieldName, value, msg) {
		return {
			fieldName: fieldName,
			value: value,
			message: msg
		}
	}

	function isDuplicateEmail(contact, contactsIndx, contacts){
		var isDuplicateEmail = false;
		for (var k = 0 ; k < contacts.length ; k++){
			if(contact.email){
				if(k != contactsIndx && contact.email == contacts[k].email){
					isDuplicateEmail = true;
					break;
				}
			}
		}
		return isDuplicateEmail;
	}

	function _settingsValidation(site, validationObj, toggleHandler, toggleName, tabsHandlerObj){
		var isValid = true;
		if(_.isUndefined(site.siteTagSettings.protocol) || _.isNull(site.siteTagSettings.protocol)){
			validationObj.tagSettings.protocol = "Please Select protocol";
			isValid = false;
			tabsHandlerObj[toggleName]['tagSettings'].isValid = false;
		}

		if(_.isUndefined(site.siteTagSettings.tagTypes) || _.isNull(site.siteTagSettings.tagTypes) || site.siteTagSettings.tagTypes.length == 0){
			validationObj.tagSettings.tagType = "Please Select at least one tag type";
			isValid = false;
			tabsHandlerObj[toggleName]['tagSettings'].isValid = false;
		}

		if(_.isUndefined(site.siteAdDelivery.minZIndex) || _.isNull(site.siteAdDelivery.minZIndex) ||
			_.isEmpty(site.siteAdDelivery.minZIndex.toString())){
			validationObj.adDelivery.minZIndex = "Please Enter Z index";
			isValid = false;
			tabsHandlerObj[toggleName]['adDelivery'].isValid = false;
		}

		if(_.isUndefined(site.siteTrackingAndTargeting.cacheBustingToken.tokenString) || _.isNull(site.siteTrackingAndTargeting.cacheBustingToken.tokenString) ||
			_.isEmpty(site.siteTrackingAndTargeting.cacheBustingToken.tokenString)){
			validationObj.trackingTargeting.cacheBustingToken = "Please Enter Token";
			isValid = false;
			tabsHandlerObj[toggleName]['trackingTargeting'].isValid = false;
		}

		_tabValidation(toggleHandler, toggleName, tabsHandlerObj[toggleName]);

		return isValid;
	}

	function _tabValidation(toggleHandler, toggleName, tabsHandlerObj){
		for(var tab in tabsHandlerObj){
			if(!tabsHandlerObj[tab].isValid){
				toggleHandler[toggleName] = true;
				tabsHandlerObj[tab].isActive = true;
			}
		}
	}

	function _isTabValid(validationObj){
		var isValid = true;
		for(var prop in validationObj){
			if(!_.isEmpty(validationObj[prop])){
				isValid = false;
				break;
			}
		}
		return isValid;
	}

	function _zIndexValidation(validationObj, minZIndex, tabHandler){
		validationObj.minZIndex = '';
		if(_.isUndefined(minZIndex) || _.isNull(minZIndex) || !regIsNumber(minZIndex)){
			validationObj.minZIndex = "Invalid z index. Only numbers accepted";
			validationObj.isValid = false;
			tabHandler.isValid = false;
			return false;
		}
		return true;
	}

	function regIsNumber(fData){
		var reg = /^\s*?\d+\s*$/;
		if(_.isEmpty(fData)) return true;
		return String(fData).search(reg) != -1
	}

	function _setInstreamColumnsDefinition(columns){
		columns.push({field: 'sectionName', displayName: 'Section', isColumnEdit: false, isShowToolTip: true, gridControlType: enums.gridControlType.getName("TextBox"), isPinned: true});
		columns.push({field: 'templateName', displayName: 'In-stream Template', isColumnEdit: false, isShowToolTip: false, gridControlType: enums.gridControlType.getName("TextBox")});
	}

	function _setInstreamButtonsDefinition(btnsArr, funcs){
		btnsArr.push({name: "Add  New Rule", func: funcs.new, isDisable: false});
		btnsArr.push({name: "Edit Rule", func: funcs.edit, isDisable: true});
		btnsArr.push({name: "Delete Rule", func: funcs.delete, isDisable: true});
	}

	return {
		setContactsColumnDefinition: _setContactsColumnDefinition,
		setContactsButtonsDefinition: _setContactsButtonsDefinition,
		getNewContactObj: _getNewContactObj,
		deleteContacts: _deleteContacts,
		onContactsCellChanged : _onContactsCellChanged,
		onEmailChangeDoValidation : _onEmailChangeDoValidation,
		contactsValidation: _contactsValidation,
		settingsValidation : _settingsValidation,
		isTabValid : _isTabValid,
		zIndexValidation : _zIndexValidation,
		setInstreamColumnsDefinition : _setInstreamColumnsDefinition,
		setInstreamButtonsDefinition : _setInstreamButtonsDefinition
	};
}]);