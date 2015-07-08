/**
 * Created by Ofir.Fridman on 8/24/14.
 */
'use strict';

app.service('siteContactsGrid', ['enums', function (enums) {
	function getColumnDefinition(columnObj) {
		return [
			{field: 'name', displayName: 'Name', isRequired: true, isColumnEdit: true, gridControlType: enums.gridControlType.getName("TextBox"),functionOnCellEdit:columnObj.onCellChanged},
			{field: 'email', displayName: 'Email', isRequired: true, isColumnEdit: true, gridControlType: enums.gridControlType.getName("TextBox"), validationFunction: columnObj.emailValidation},
			{field: 'phone', displayName: 'Phone', isColumnEdit: true, gridControlType: enums.gridControlType.getName("TextBox")}
		];
	}

	function getNewContactObj() {
		return {"id": null, "name": null, "email": null, "phone": null, "type": "SiteContact"};
	}

	function deleteContacts(selectedItems, siteContacts) {
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

	function convertContactToUser(selectedItem, siteContact, site){

	}

	return {
		getColumnDefinition: getColumnDefinition,
		deleteContacts:deleteContacts,
		getNewContactObj:getNewContactObj,
		convertContactToUser: convertContactToUser
	};
}]);

