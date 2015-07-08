/**
 * Created by atd on 6/18/2014.
 */

app.controller('advanceNgGridCtrl', ['$scope', 'enums', 'EC2Restangular', 'mmAlertService', 'mmModal',
	function ($scope, enums, EC2Restangular, mmAlertService, mmModal) {


		$scope.prototypalResolver = {
			textValue: ""
		};
		//region FOR BUGS
		$scope.gridSelectActionsBUGS = [
			{
				name: "Actions",
				isDisable: false,
				childActions: [
					{
						name: "Alert",
						func: alertTest
					},
					{
						name: "Child2",
						func: changeStatus
					},
					{
						name: "Child2",
						func: changeStatus
					},
					{
						name: "Child2",
						func: changeStatus
					},
					{
						name: "Child2",
						func: changeStatus
					},
					{
						name: "Child2",
						func: changeStatus
					}

				]
			}
		];


		function alertTest() {
			alert("BUG2 - Set the HTML in comment to stop that!!!");
		}

		//endregion


		$scope.isEditMode = true;
		//this is external status select list
		$scope.selectLisData = [
			{id: 1, value: "Enabled"},
			{id: 2, value: "Disabled"}
		];

		var getUniqueId = function () {
			function s4() {
				return Math.floor((1 + Math.random()) * 0x10000)
					.toString(16)
					.substring(1);
			}

			return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
				s4() + '-' + s4() + s4() + s4();
		}

		$scope.obj = {isGridLoading: true};


		var searchableListSelecteddataArray = [
			{"id": "1", "name": "a"},
			{"id": "2", "name": "b"}
		];

		var searchableListdataArray = [
			{"id": "1", "name": "a"},
			{"id": "2", "name": "b"},
			{"id": "3", "name": "c"},
			{"id": "4", "name": "d"},
			{"id": "5", "name": "e"},
			{"id": "6", "name": "f"},
			{"id": "7", "name": "g"},
			{"id": "8", "name": "h"}
		];

		//Pass this array for values to show on grid
		var radioButtons = [
			{text: "Zero Zero Zero Zero Zero Zero Zero Zero", Id: 0 },
			{text: "Two Two Two TwoTwoTwo Two Two", Id: 1 },
			{text: "Three Three Three Three Three Three Three", Id: 2 },
			{text: "Four Four", Id: 3 }
		];
		//Pass this array for values to show on grid
		var checkboxes = [
			{Id: 0, text: "test test more test test more test"},
			{Id: 1, text: "test test more test " },
			{Id: 2, text: "test test more " },
			{Id: 3, text: "test test" }
		];
		var selectListdataArray = [
			{id: "one", name: "Enabled"},
			{ id: "two", name: "Disabled"},
			{ id: "three", name: "Invalid"},
			{ id: "four", name: "Hold"}
		];

		$scope.data = [
			{"id": getUniqueId(), "name": "This is editable", "status": "one", selectedRadioButton: 0, selectedCheckboxes: [0, 1], searchableList: searchableListSelecteddataArray, "rowLocked": true, "selectEnabled": true, "date": "2014-11-12T15:02", "image": "http://photos.appleinsider.com/gallery/9220-695-140510-iPhone_6-Mock-1-l.png", "serial": 3, "url": "http://testurl.com", "filename": "image.jpg", "amount": 123.45, "showChild": false},
			{"id": getUniqueId(), "name": "test", "status": "two", selectedRadioButton: 1, selectedCheckboxes: [1, 2], searchableList: searchableListSelecteddataArray, "rowLocked": false, "selectEnabled": true, "date": "2014-11-12T15:02", "image": {url: "http://picbook.in/wp-content/uploads/2014/07/google_images_-_photos_videos.jpg", externalLink: "www.facebook.com"}, "serial": '', "url": "http://testurl.com", "filename": "movie.mp4", "amount": 123.45, "showChild": false},
			{"id": getUniqueId(), "name": "test3", "status": "two", selectedRadioButton: 2, selectedCheckboxes: [2, 3], searchableList: searchableListSelecteddataArray, "rowLocked": true, "selectEnabled": false, "date": "2014-11-12", "image": {url: "http://picbook.in/wp-content/uploads/2014/07/happy_diwali__sms_images_.jpg", externalLink: "www.facebook.com"}, "serial": '', "url": "http://www.url.com", "filename": "", "amount": 123.45, "showChild": false},
			{"id": getUniqueId(), "name": "test4", "status": "", selectedRadioButton: 3, selectedCheckboxes: [1, 3], searchableList: searchableListSelecteddataArray, "rowLocked": false, "selectEnabled": false, "date": "2014-11-12T08:29", "image": {url: "http://photos.appleinsider.com/gallery/9220-695-140510-iPhone_6-Mock-1-l.png", externalLink: "www.facebook.com"}, "serial": 899, "url": "http://www.url.com", "amount": 123.45, "showChild": false},
			{"id": getUniqueId(), "name": "test5", "status": "one", selectedRadioButton: 0, selectedCheckboxes: [0, 3], searchableList: searchableListSelecteddataArray, "rowLocked": false, "selectEnabled": false,  "date": "2014-11-12", "image": {url: "http://t3.gstatic.com/images?q=tbn:ANd9GcT9nACnOnonHhqJErp6zEgj6cKd5XHOGYFccVjWdzFt4wvwaBjJ", externalLink: "www.facebook.com"}, "serial": '', "url": "http://www.url.com", "filename": "image.jpg", "amount": 123.45, "showChild": false},
			{"id": getUniqueId(), "name": "test1", "status": "one", selectedRadioButton: 0, selectedCheckboxes: [0, 1], searchableList: searchableListSelecteddataArray, "rowLocked": false, "selectEnabled": true,  "date": "2014-11-13", "image": {url: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQakIHr76SWWCmn5bFxmfBlUI3hQ7pCtdLFwxU4Cb0wWZyRikKp", externalLink: "www.facebook.com"}, "serial": 12345, "url": "http://testurl.com", "filename": "movie.mp4", "amount": 123.45, "showChild": false},
			{"id": getUniqueId(), "name": "test2", "status": "two", selectedRadioButton: 1, selectedCheckboxes: [1, 2], searchableList: searchableListSelecteddataArray, "rowLocked": false, "selectEnabled": true,  "date": "2014-11-12", "image": {url: "http://picbook.in/wp-content/uploads/2014/07/happy_diwali__sms_images_.jpg", externalLink: "www.facebook.com"}, "serial": 34567, "url": "http://testurl.com", "filename": "image.jpg", "amount": 123.45, "showChild": false},
			{"id": getUniqueId(), "name": "test3", "status": "three", selectedRadioButton: 2, selectedCheckboxes: [2, 3], searchableList: searchableListSelecteddataArray, "rowLocked": false, "selectEnabled": true,  "date": "2014-11-12", "image": {url: "http://photos.appleinsider.com/gallery/9220-695-140510-iPhone_6-Mock-1-l.png", externalLink: "www.facebook.com"}, "serial": 3454904, "url": "http://www.url.com", "filename": "movie.mp4", "amount": 123.45, "showChild": false},
			{"id": getUniqueId(), "name": "test4", "status": "two", selectedRadioButton: 3, selectedCheckboxes: [1, 3], searchableList: searchableListSelecteddataArray, "rowLocked": true, "selectEnabled": true,  "date": "2014-11-12", "image": {url: "http://photos.appleinsider.com/gallery/9220-695-140510-iPhone_6-Mock-1-l.png", externalLink: "www.facebook.com"}, "serial": 899, "url": "http://www.url.com", "filename": "movie.mp4", "amount": 123.45, "showChild": false},
			{"id": getUniqueId(), "name": "test5", "status": "one", selectedRadioButton: 0, selectedCheckboxes: [0, 3], searchableList: searchableListSelecteddataArray, "rowLocked": false, "selectEnabled": true,  "date": "2014-11-12", "image": {url: "http://photos.appleinsider.com/gallery/9220-695-140510-iPhone_6-Mock-1-l.png", externalLink: "www.facebook.com"}, "serial": 241234, "url": "http://www.url.com", "filename": "image.jpg", "amount": 123.45, "showChild": false},
			{"id": getUniqueId(), "name": "test1", "status": "one", selectedRadioButton: 0, selectedCheckboxes: [0, 1], searchableList: searchableListSelecteddataArray, "rowLocked": false, "selectEnabled": true,  "date": "2014-11-12", "image": {url: "http://photos.appleinsider.com/gallery/9220-695-140510-iPhone_6-Mock-1-l.png", externalLink: "www.facebook.com"}, "serial": 12345, "url": "http://testurl.com", "filename": "image.jpg", "amount": 123.45, "showChild": false},
			{"id": getUniqueId(), "name": "test2", "status": "two", selectedRadioButton: 1, selectedCheckboxes: [1, 2], searchableList: searchableListSelecteddataArray, "rowLocked": false, "selectEnabled": true,  "date": "2014-11-12", "image": {url: "http://photos.appleinsider.com/gallery/9220-695-140510-iPhone_6-Mock-1-l.png", externalLink: "www.facebook.com"}, "serial": 34567, "url": "http://testurl.com", "filename": "image.jpg", "amount": 123.45, "showChild": false},
			{"id": getUniqueId(), "name": "test3", "status": "two", selectedRadioButton: 2, selectedCheckboxes: [2, 3], searchableList: searchableListSelecteddataArray, "rowLocked": false, "selectEnabled": true,  "date": "2014-11-12", "image": {url: "http://photos.appleinsider.com/gallery/9220-695-140510-iPhone_6-Mock-1-l.png", externalLink: "www.facebook.com"}, "serial": 3454904, "url": "http://www.url.com", "filename": "movie.mp4", "amount": 123.45, "showChild": false},
			{"id": getUniqueId(), "name": "test4", "status": "two", selectedRadioButton: 3, selectedCheckboxes: [1, 3], searchableList: searchableListSelecteddataArray, "rowLocked": true, "selectEnabled": true,  "date": "2014-11-12", "image": {url: "http://photos.appleinsider.com/gallery/9220-695-140510-iPhone_6-Mock-1-l.png", externalLink: "www.facebook.com"}, "serial": 899, "url": "http://www.url.com", "filename": "movie.mp4", "amount": 123.45, "showChild": false},
			{"id": getUniqueId(), "name": "test5", "status": "one", selectedRadioButton: 0, selectedCheckboxes: [0, 3], searchableList: searchableListSelecteddataArray, "rowLocked": true, "selectEnabled": true,  "date": "2014-11-12", "image": {url: "http://photos.appleinsider.com/gallery/9220-695-140510-iPhone_6-Mock-1-l.png", externalLink: "www.facebook.com"}, "serial": 241234, "url": "http://www.url.com", "filename": "image.jpg", "amount": 123.45, "showChild": false}
		];

		//add icons to dataset
		var newListDataArray = selectListdataArray.slice(0,2);
		for (var index = 0; index < $scope.data.length; index++) {
			var item = $scope.data[index];
			var showButton = (item.filename && item.filename != "") ? false : true;
			item.actions = [
				{field: item.filename, actionFieldType: enums.actionFieldType.getName("Text"), cssClass: ""},
//				{field: 'fa fa-search', actionFieldType: enums.actionFieldType.getName("Icon"), function: searchFunc, showControl: !showButton, cssClass: "hideIcon", tooltip: "Search"},
//				{field: 'fa fa-eye', actionFieldType: enums.actionFieldType.getName("Icon"), function: editFunc, showControl: !showButton, cssClass: "hideIcon", tooltip: "Preview"},
//				{field: '/ignoreImages/si_close_entity_normal.png', actionFieldType: enums.actionFieldType.getName("Image"), height: "16", width: "16", function: deleteFunc, showControl: !showButton, cssClass: "hideIcon", tooltip: "Remove"}/*,
        {field: '/ignoreImages/preview_n.png', actionFieldType: enums.actionFieldType.getName("Image"), function: deleteFunc, showControl: !showButton, cssClass: " hideIcon", tooltip: "Preview"},
        {field: '/ignoreImages/edit_n.png', actionFieldType: enums.actionFieldType.getName("Image"), function: deleteFunc, showControl: !showButton, cssClass: " hideIcon", tooltip: "Edit"},
        {field: '/ignoreImages/delete_n.png', actionFieldType: enums.actionFieldType.getName("Image"), function: deleteFunc, showControl: !showButton, cssClass: " hideIcon", tooltip: "Remove"},
//        {field: 'button', title: 'Add File', actionFieldType: enums.actionFieldType.getName("Button"), function: addFile, showControl: showButton}
        {field: 'link', title: 'Add File', actionFieldType: enums.actionFieldType.getName("Link"), function: addFile, showControl: showButton}
			];
      item.showIcons = true;
			item.iconPanel = [{/*field: "fa fa-ellipsis-v fa-lg", */template: "internal/demo/views/testPanelTemplate.html", function: togglePanel, showControl: true, cssClass: "overrideHide"}];
			item.gridListDataArray = newListDataArray;			//the property gridListDataArray is required to be used to attach a dynamic dropdown list to the mm-grid
		}

    $scope.showIcons = true;
    var showLink = false;
    $scope.testIconOutsideGrid = [
      {field: '/ignoreImages/si_close_entity_normal.png', actionFieldType: enums.actionFieldType.getName("Image"), height: "16", width: "18", function: deleteFunc, showControl: !showLink, cssClass: "hideIcon", tooltip: "Original"},
      {field: '/ignoreImages/preview_n.png', actionFieldType: enums.actionFieldType.getName("BckgrndImage"), function: deleteFunc, showControl: !showLink, cssClass: "emptyDivPreview", tooltip: "Preview"},
      {field: '/ignoreImages/edit_n.png', actionFieldType: enums.actionFieldType.getName("BckgrndImage"), function: deleteFunc, showControl: !showLink, cssClass: "emptyDivEdit", tooltip: "Edit"},
      {field: '/ignoreImages/delete_n.png', actionFieldType: enums.actionFieldType.getName("BckgrndImage"), function: deleteFunc, showControl: !showLink, cssClass: "emptyDivDelete", tooltip: "Remove"},
      {field: 'Test Link', actionFieldType: enums.actionFieldType.getName("Link"), function: clickLink, showControl: showLink, cssClass: "inlineLink", tooltip: "Test Link"}
    ];

		$scope.testingEmptyArrayWithGrid = [];

		/*var enabled = "Enabled";
		 var disabled = "Disabled";
		 var selectListdataArray = [
		 {id: "one", value: enabled},
		 {id: "two", value: disabled}
		 ];*/

		//disable cell edit state
		//try these as the variable for cellEditableCondition in columnDefs
		//only available on editable gridControlTypes --> TextBox, SearchableList, SelectList
		//var enableNameEdit = 'row.entity[col.field] == \'This is editable\'';
		//var enableNameEdit = 'row.entity[\'serial\'] >= 900';
		var rowLock = 'row.entity[\'rowLocked\'] == false';
		//custom cell templates (angular filter, icon)
		var currencyTemplate = '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity[col.field] | currency}}</span></div>';
		var iconTemplate = '<div class="actionIcons"><i ng-if="row.entity[\'rowLocked\'] == true" class="fa fa-check"></i></div>';

		$scope.columnDefs = [
			{field: 'iconPanel', displayName: '', isRequired: false, width: 50, isColumnEdit: false, gridControlType: enums.gridControlType.getName("Tooltip")},
			{field: 'id', displayName: 'ID', isRequired: false, width: 200, isColumnEdit: false, isShowToolTip: true, gridControlType: enums.gridControlType.getName("TextBox")},
			{field: 'rowLocked', displayName: 'Row Lock', width: 100, isColumnEdit: false, gridControlType: enums.gridControlType.getName("SingleCheckbox")},
			/*{field: 'lock', displayName: 'Lock Icon', width: 100, isColumnEdit: false, gridControlType: enums.gridControlType.getName("TextBox"), cellTemplate: iconTemplate},*/
      {field: 'date', displayName: 'Date', width: 200, validationFunction: validateDate, isColumnEdit: false, gridControlType: enums.gridControlType.getName("Date"), gridDateFormat: "yyyy-MM-dd h:mm a" },
      {field: 'name', displayName: 'Name', isRequired: false, width: 140, validationFunction: validateName, gridControlType: enums.gridControlType.getName("TextBox"), isColumnEdit: true, isShowToolTip: false, cellEditableCondition: rowLock},
			{field: 'serial', displayName: 'Serial #', isRequired: true, width: 140, isColumnEdit: true, sortFunction: customizedSortFunction, gridControlType: enums.gridControlType.getName("TextBox"), cellEditableCondition: rowLock},
			/*{field: 'searchableList', displayName: 'Example', width: 140, listDataArray: searchableListdataArray, gridControlType: enums.gridControlType.getName("SearchableList"), cellEditableCondition: rowLock},
			{field: 'image', displayName: 'Thumbnail', width: 100, isColumnEdit: false, gridControlType: enums.gridControlType.getName("Image")},*/
			{field: 'status', displayName: 'Status', width: 150, /*listDataArray: selectListdataArray,*/ /*functionGetDataModel: getSelectListData,*/ validationFunction: validateSelect, gridControlType: enums.gridControlType.getName("SelectList"), cellEditableCondition: rowLock, gridSelectSearch: true},
			/*{field: 'selectedCheckboxes', displayName: 'Test Checkbox', width: 200, checkboxes: checkboxes, isColumnEdit: false, gridControlType: enums.gridControlType.getName("Checkbox"), isShowToolTip: true},
			{field: 'selectedRadioButton', displayName: 'Test RadioButton', width: 200, radioButtons: radioButtons, isColumnEdit: false, gridControlType: enums.gridControlType.getName("RadioButton"), isShowToolTip: true},
			*/{field: 'url', displayName: 'Url', width: 150, isColumnEdit: true, validationFunction: validateUrl, gridControlType: enums.gridControlType.getName("TextBox"), isShowToolTip: true},
			{field: 'actions', displayName: 'Actions', width: 200, isColumnEdit: false, isShowToolTip: false, isPinned: false, gridControlType: enums.gridControlType.getName("Action")},
			{field: 'amount', displayName: 'Amount', width: 120, isColumnEdit: false, gridControlType: enums.gridControlType.getName("TextBox"), cellTemplate: currencyTemplate}
		];

		function editFunc(row, col, action) {
			console.log("editFunc : row", row);
			console.log("editFunc : col", col);
		};

		function deleteFunc(row, col, action) {
			console.log("deleteFunc : row", row);
			console.log("deleteFunc : col", col);
		};

		function searchFunc(row, col, action) {
			console.log("searchFunc : row", row);
			console.log("searchFunc : col", col);
		};

		function showHideFunc(row, col, action) {
			console.log("showHideFunc : Bye bye i am hiding");
			//Put your row add logic or any other logic here.
			action.showControl = false;// now force the button to be invisible.
		};

    function clickLink(row, col, action) {
      console.log("clickLink : row", row);
      console.log("clickLink : col", col);
      //Put your row add logic or any other logic here.
      action.showControl = false;// now force the button to be invisible.
      action.showButton = false;
    };

		//start expand row panel example
		function openTooltip(row, col, action) {
			console.log("tooltip opened", row, col, action);
		};
		$scope.expandRow = {show: false};
		$scope.expandRow.popItems = [{name: "apple"}, {name:"banana"}, {name:"orange"}, {name:"kiwi"}];
		function togglePanel(row, col, action) {
			console.log("toggle row panel", $scope, row, col, row.entity.showChild);
			var openPanelRow = _.findWhere($scope.data, {showChild: true});
			if (openPanelRow === undefined) {
				//nothing opened
				row.entity.showChild = !row.entity.showChild;
			} else if (openPanelRow != undefined && row.entity.showChild) {
				row.entity.showChild = !row.entity.showChild;
			} else if (openPanelRow != undefined && !row.entity.showChild) {
				row.entity.showChild = !row.entity.showChild;
				openPanelRow.showChild = false;
			}
		}

		$scope.openTestDiv = function () {
			console.log("test div toggle", $scope.expandRow.show);
			$scope.expandRow.show = !$scope.expandRow.show;
		}
		//end expand row panel example

		//start dynamic select list data model
		function getSelectListData(col, field, row) {
			var testListArray = [
				{id: "one", name: "Enabled"},
				{ id: "two", name: "Disabled"}
			];
			return testListArray;
		}
		//end dynamic select list data model

		function addFile(row, col, action) {
			console.log("add file example", row);
			var d = new Date();
			var modifyItem = row.entity;
			if(modifyItem != undefined){
				modifyItem.filename='newfile.jpg';
				modifyItem.serial=10;
				modifyItem.date = d;
			}
			//update actions
			var showButton = (modifyItem.filename && modifyItem.filename != "") ? false : true;
			modifyItem.actions = [
				{field: modifyItem.filename, actionFieldType: enums.actionFieldType.getName("Text"), cssClass: ""},
				{field: 'fa fa-search', actionFieldType: enums.actionFieldType.getName("Icon"), function: searchFunc, showControl: !showButton},
				{field: 'fa fa-eye', actionFieldType: enums.actionFieldType.getName("Icon"), function: editFunc, showControl: !showButton},
				{field: '/ignoreImages/si_close_entity_normal.png', actionFieldType: enums.actionFieldType.getName("Image"), height: "16", width: "16", function: deleteFunc, cssClass: "", showControl: !showButton},
				{field: 'Add File', title: 'Add File', actionFieldType: enums.actionFieldType.getName("Button"), function: addFile, showControl: showButton}
			]
			var showRowLock = modifyItem.isSelected;
			modifyItem.lock = [
				{field: 'fa fa-check', actionFieldType: enums.actionFieldType.getName("Icon"), showControl: showRowLock}
			]
		};

		$scope.checkBoxHandler = function (row, selectedCheckBoxes) {
			console.log("checkBoxHandler : row", row);
			console.log("checkBoxHandler : selectedCheckBoxes", selectedCheckBoxes);
		};

		$scope.radioButtonHandler = function (row, selectedRadio) {
            debugger;
			console.log("radioButtonHandler : row", row);
			console.log("radioButtonHandler : selectedRadio", selectedRadio);
		};

		$scope.singleCheckBoxHandler = function (row, col, isChecked) {
			console.log("checkBoxHandler : row", row);
			console.log("checkBoxHandler : col", col);
			console.log("checkBoxHandler : isChecked", isChecked);
		};

		$scope.txtValue = "";
		$scope.selectedVal = "";
		$scope.columns = [
			{ id: "name", name: "name"},
			{id: "serial", name: "serial"},
			{ id: "url", name: "url"}
		];

		$scope.selectColumn = function (selected) {
			$scope.selectedVal = selected;
		};

		$scope.changeBulkValues = function () {
			if ($scope.selectedVal != "") {
				for (var index = 0; index < $scope.item.selectedItems.length; index++) {
					var item = $scope.item.selectedItems[index];
					item[$scope.selectedVal] = $scope.prototypalResolver.txtValue;
				}
			}
			else {
        mmAlertService.addError("Please choose column");
			}
		};

		$scope.selectStatus = function (selected) {
			if (selected != "") {
				var statusObj = _.find($scope.statuses, function (x) {
					return x.id == selected;
				});
				if ($scope.item.selectedItems.length > 0) {
					for (var index = 0; index < $scope.item.selectedItems.length; index++) {
						var itemToChange = $scope.item.selectedItems[index];
						var data = getDataById(itemToChange.id);
						if (data != null) {
							//data.status = status;
							data.status = statusObj.id;
						}
					}
				}
			}
		};

		$scope.selectedStatus = "";
		$scope.statuses = [
			{id: "one", name: "Enabled"},
			{ id: "two", name: "Disabled"}
		];

    var results = [];
    results.push({
      'fieldName': 'name',
      'value': 'test1'
    });
    results.push({
      'fieldName': 'name',
      'value': 'test3'
    });
    $scope.selectedRow = function () {
      // prepare a selected row object array,
      // the format would be [{"fieldName": "", "value": ""}, ... {"fieldName": "", "value": ""}]
      // you can pass as many object as you want in the array.  The value must be identical to grid datea
      return results;
    };

    var obj = {
      'fieldName': 'serial',
      'value': '15'
    }
    $scope.selectedCell = function () {
      return obj;
    };

    $scope.changeSelectedRow = function () {
      //uncomment below to select a row that matches above object
      /*results.push({
       'fieldName': 'name',
       'value': 'test'
       });
       $scope.selectedRow();*/
      //uncomment below to select a cell that matches the row and cell from above object obj with value property changed below
      obj.value = 899;
      $scope.selectedCell();
    };
		var validationResult = {
			isSuccess: false,
			fields: [
				{'fieldName': 'name', 'value': 'test3', message: 'Please correct this error on name field'},
				{'fieldName': 'serial', 'value': '2', message: 'Please correct this error on serial field'}
			]
		};
		$scope.validationHandler = function () {
			$scope.count = $scope.count + 1;
			return validationResult;
		};
		$scope.validate = function () {
			validationResult.fields.push({'fieldName': 'date', 'value': '2014-11-12', message: 'Please correct this error on date field'});
			$scope.count = 0;
			$scope.validationHandler();
		};

		$scope.requireValidationTest = function () {
			validationResult = {
				isSuccess: false,
				fields: []
			};
			var requiredCols = _.where($scope.columnDefs, function (col) {
				return typeof col.isRequired != "undefined" && col.isRequired;
			});
			for (var index = 0; index < $scope.data.length; index++) {
				var item = $scope.data[index];
				if (item) {
					for (var j = 0; j < requiredCols.length; j++) {
						var col = requiredCols[j];
						if (item[col.field] == "") {
							validationResult.fields.push({'fieldName': col.field, 'value': item[col.field], message: 'This field can not be empty.'})
						}
//						if (item.serial == "") {
//							validationResult.fields.push({'fieldName': 'serial', 'value': item.serial, message: 'This field can not be empty.'})
//						}
					}
				}
			}
			if (validationResult.fields.length > 0)
				$scope.validationHandler();
		};

		function validateDate(data, row, col) {
			console.log("validateDate : dateObject : row : col :", data, row, col);
			//data = {mmModel:mmModel,mmMinDate:$scope.mmMinDate,mmMaxDate:$scope.mmMaxDate}
			var date = new Date(data.mmModel);
			var result =
			{
				isSuccess: true,
				message: ""
			};
			if (date.getTime() <= new Date().getTime()) {
				result =
				{
					isSuccess: false,
					message: "Please enter date greater than today."
				};
			}
			return result;
		};

		function validateSelect(data, row, col) {
			console.log("validateSelect : data : row : col :", data, row, col);
			var result =
			{
				isSuccess: true,
				message: ""
			};
			if (data != "one" && data != "two") {
				result =
				{
					isSuccess: false,
					message: "This is an illegal selection."
				};
			}
			return result;
		};

		//remote data examples
		/*$scope.sites = [];
		 var serverSite = EC2Restangular.all('sites');
		 serverSite.getList().then(function(data){
		 $scope.sites = $scope.data = data;
		 }, processError);
		 $scope.columnDefs2 = [
		 {field: 'id', displayName: 'ID', isColumnEdit: false, isShowToolTip: true},
		 {field: 'name', displayName: 'Name', functionOnCellEdit: changeMultipleColumnValues, gridControlType: enums.gridControlType.getName("TextBox")},
		 {field: 'type', displayName: 'Type', isColumnEdit: false,  gridControlType: enums.gridControlType.getName("TextBox")},
		 {field: 'status', displayName: 'Status', functionOnCellEdit: changeMultipleSelectValues, dataArray: selectListdataArray, gridControlType: enums.gridControlType.getName("SelectList")}
		 ];*/

		/*$scope.sitesections = [];
		 var serverSitesection = EC2Restangular.all('sites/sitesection');
		 serverSitesection.getList().then(function(data){
		 $scope.sitesections = $scope.data = data;
		 }, processError);
		 $scope.columnDefs3 = [
		 {field: 'id', displayName: 'ID', isColumnEdit: false, isShowToolTip: true, width: 250},
		 {field: 'name', displayName: 'Name', isShowToolTip: true, functionOnCellEdit: changeMultipleColumnValues, gridControlType: enums.gridControlType.getName("TextBox")},
		 {field: 'type', displayName: 'Type', isColumnEdit: false, gridControlType: enums.gridControlType.getName("TextBox")},
		 {field: 'siteId', displayName: 'Site ID', isColumnEdit: false, gridControlType: enums.gridControlType.getName("TextBox")},
		 {field: 'url', displayName: 'Url', functionOnCellEdit: changeMultipleColumnValues, validationFunction: validateUrl, gridControlType: enums.gridControlType.getName("TextBox"), width: 200}
		 ];*/

		/*$scope.advertisers = $scope.data = [];
		 var serverAdvertisers = EC2Restangular.all('advertisers');
		 serverAdvertisers.getList().then(function(data){
		 $scope.advertisers = $scope.data = data;
		 }, processError);
		 $scope.columnDefs4 = [
		 {field: 'id', displayName: 'ID', isColumnEdit: false, isPinned: true, isShowToolTip: true},
		 {field: 'name', displayName: 'Name', isShowToolTip: true, functionOnCellEdit: changeMultipleColumnValues, gridControlType: enums.gridControlType.getName("TextBox")},
		 {field: 'type', displayName: 'Type', isColumnEdit: false, gridControlType: enums.gridControlType.getName("TextBox")},
		 {field: 'vertical', displayName: 'Vertical', isColumnEdit: false, gridControlType: enums.gridControlType.getName("TextBox")},
		 {field: 'status', displayName: 'Status', isColumnEdit: false, gridControlType: enums.gridControlType.getName("TextBox")}
		 ];*/
		function processError(error) {
			console.log('ohh no!');
			console.log(error);
			$scope.showSPinner = false;
			if (error.data.error === undefined) {
        mmAlertService.addError("Server error. Please try again later.");
			} else {
        mmAlertService.addError(error.data.error);
			}
		}

		//any custom sort function here.
		function customizedSortFunction(a, b) {
			if (a > 10000)
				return true;
		}

		//These are the items which are selected in grid. Two way binding with grid.
		$scope.item = {selectedItems: []};//Must pass in following the Dot notation rule.
		// https://github.com/angular/angular.js/issues/3928
		// https://github.com/angular/angular.js/wiki/Understanding-Scopes
		$scope.filteredItemCount = "";

		//used to render buttons above grid
		$scope.gridButtonActions = [
			{
				name: "Delete",
				func: deleteRow,
				isDisable: false
			},
			{
				name: "Delete1",
				func: deleteRow,
				isDisable: true
			}
		];
		//used to render selectlist above grid
		$scope.gridSelectActions = [
			{
				name: "Actions",
				isDisable: false,
				childActions: [
					{
						name: "Child1",
						func: changeStatus
					},
					{
						name: "Child2",
						func: changeStatus
					},
					{
						name: "Child2",
						func: changeStatus
					}
				]
			}
		];
		//used to render selectlist above grid
		$scope.oldGridSelectActions = [
			{
				name: "statusDropdown",
				data: $scope.selectLisData,
				func: changeStatus
			}
		];

		function dataArrayFunction() {
			return [
				{id: 1, value: "Enabled"},
				{id: 2, value: "Disabled"}
			];
		};

		//to pass multiple validation messages to the grid, use an array in the form result.message = ["a", "b"]
		function validateName(row) {
			var value = row.entity.name;
			var result =
			{
				isSuccess: false,
				message: []
			};
			var num = _.parseInt(value);
//			result.message = "Test. " +  "<br/>";
			result.message.push("Test.");
			if (num > 0) {
				result.isSuccess = false;
				result.message.push("Name cannot be a number.");
//				result.message += "Numbers not allowed in name. ";
			}
			else if (check(value)) {
				result.isSuccess = false;
				result.message.push("Only alphanumeric characters allowed in name.");
//				result.message.push("This is a test.");
//				result.message += "Please enter valid name without special characters. ";
			}
			else {
				result.isSuccess = true;
			}
			return result;
		}

		var specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,./~`-="
		var check = function (string) {
			for (var i = 0; i < specialChars.length; i++) {
				if (string.indexOf(specialChars[i]) > -1) {
					return true
				}
			}
			return false;
		}

		function validateUrl(row) {
			var value = row.entity.url;
			var result =
			{
				isSuccess: true,
				message: ""
			};
			var validUrl = /^(http|https):\/\/[^ "]+$/;
			if (!validUrl.test(value)) {
				result.isSuccess = false;
				result.message = "Please enter valid url.";
			}
			/*		else {
			 result.isSuccess = true;
			 }*/
			return result;
		}

		//this method call when selectlist changes
		function changeMultipleSelectValues(col, selectedId, index, field) {
			/*var selectedObject = _.findWhere(selectListdataArray, {"id": selectedId});
			 var item = $scope.data[index];
			 if (item != null) {
			 item[field] = selectedObject.value;
			 }*/
		};


		//this method called when searchable list changes
		function changeSearchableListValues(col, selectedArray, index, field) {
			//means we are editing one or more than one row and check box is selected.
//			for (var index = 0; index < $scope.item.selectedItems.length; index++) {
//				var item = $scope.item.selectedItems[index];
//				var data = getDataById(item.id);
//				if (data != null) {
//					data.searchableList = selectedArray;
//				}
//			}
			var item = $scope.data[index];
			if (item != null) {
				item[field] = selectedArray;
				//TODO save to server..
			}
		}

		//This method called when text column value changes
		function changeMultipleColumnValues(col, value, index, field) {
			var result =
			{
				isSuccess: false,
				message: ""
			};
			//TODO validate here and return response as false and message, if validation fails.
			//means we are editing one or more than one row and check box is selected.
			//This changes all the selected text value It totally depends on end user whether he wants to change all selected items values or only a single item value
			//If you want to change multiple items then simply loop through on selected Items and change their values like we did below.
			for (var index = 0; index < $scope.item.selectedItems.length; index++) {
				var item = $scope.item.selectedItems[index];
				item[field] = value;
				//TODO save to server if successfully validated..
			}
			var item = $scope.data[index];
			if (item != null) {
				item[field] = value;
				//TODO save to server..
			}
			//in case of success only return isSuccess true.
			result.isSuccess = true;
			return result;
		};

		//This function is for gridSelectActions
		function changeStatus(status) {
			if (status && status.value != "undefined") {
				var statusValue = getStatusById(status);
				if ($scope.item.selectedItems.length > 0) {
					for (var index = 0; index < $scope.item.selectedItems.length; index++) {
						var itemToChange = $scope.item.selectedItems[index];
						var data = getDataById(itemToChange.id);
						if (data != null) {
							//data.status = status;
							data.status = statusValue;
						}
					}
				}
			}
		}

		//This function is for gridButtonActions
		function deleteRow() {
			console.log("$scope.selectedItems", $scope.item.selectedItems);
			if ($scope.item.selectedItems.length > 0) {
				var index = $scope.item.selectedItems.length - 1;
				while (index >= 0) {
					var itemToDelete = $scope.item.selectedItems[index];
					$scope.data.splice($scope.data.indexOf(itemToDelete), 1);
					$scope.item.selectedItems.splice(index, 1);
					index--;
				}
			}
		};

		var getIndexById = function (id) {
			var indexToReturn = null;
			for (var index = 0; index < $scope.data.length; index++) {
				var innerData = $scope.data[index];
				if (innerData.id == id) {
					indexToReturn = index;
					break;
				}
			}
			return indexToReturn;
		};

		var getDataById = function (id) {
			var data = null;
			for (var index = 0; index < $scope.data.length; index++) {
				var innerData = $scope.data[index];
				if (innerData.id == id) {
					data = innerData;
					break;
				}
			}
			return data;
		};

		//translate id returned by mmMultiselect back to value
		var getStatusById = function (id) {
			var status = null;
			for (var index = 0; index < $scope.selectLisData.length; index++) {
				var innerData = $scope.selectLisData[index];
				if (innerData.id == id) {
					status = innerData.value;
					break;
				}
			}
			return status;
		};

		$scope.testSelectionChange = function (item) {

		}

		$scope.openGridModal = function () {
			console.log("opening grid modal");
			if ($scope.isModalOpen) {
				return;
			}
			$scope.isModalOpen = true;

			var modalInstance = mmModal.open({
				templateUrl: './internal/demo/views/sampleGridModal.html',
				controller: 'sampleGridCtrl',
				title: "Sample Grid",
				modalWidth: 900, /*
				 bodyHeight: 600,*/
				discardButton: { name: "Close", funcName: "cancel" }
			});
			modalInstance.result.then(function () {
				$scope.isModalOpen = false;
			}, function () {
				$scope.isModalOpen = false;
			});
		}

	}]);