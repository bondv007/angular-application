/**
 * Created by atdg on 9/15/14.
 */
'use strict';
app.controller('sampleGridCtrl', ['$scope', '$modalInstance',  'EC2Restangular', 'mmAlertService', 'enums',
	function ($scope, $modalInstance, EC2Restangular, mmAlertService, enums) {

		/*$scope.assets = [];
		var serverAssets = EC2Restangular.all('assetMgmt');
		serverAssets.getList().then(function (data) {
			$scope.assets = $data = data;
			console.log("# assets", $scope.assets.length);
		}, processError);*/

		var getUniqueId = function () {
			function s4() {
				return Math.floor((1 + Math.random()) * 0x10000)
					.toString(16)
					.substring(1);
			}

			return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
				s4() + '-' + s4() + s4() + s4();
		}

		//Pass this array for values to show on grid
		/*var selectListdataArray = [
			{id: "one", name: "Enabled"},
			{id: "two", name: "Disabled"}
		];*/
		var enabled = "Enabled";
		var disabled = "Disabled";
		var selectListdataArray = [
			{id: "one", name: enabled},
			{ id: "two", name: disabled}
		];
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
		var radioButtons = [
			{text: "Zero Zero Zero Zero Zero Zero Zero Zero", Id: 0 },
			{text: "Two Two Two TwoTwoTwo Two Two", Id: 1 },
			{text: "Three Three Three Three Three Three Three", Id: 2 },
			{text: "Four Four", Id: 3 }
		];
		var checkboxes = [
			{Id: 0, text: "test test more test test more test"},
			{Id: 1, text: "test test more test " },
			{Id: 2, text: "test test more " },
			{Id: 3, text: "test test" }
		];

		$scope.data = [
			{"id": getUniqueId(), "name": "test1", "status": "one", selectedRadioButton: 0, selectedCheckboxes: [0, 1], searchableList: searchableListSelecteddataArray, "date": "2014-11-12", "image": "http://photos.appleinsider.com/gallery/9220-695-140510-iPhone_6-Mock-1-l.png", "serial": 12345, "url": "http://testurl.com"},
			{"id": getUniqueId(), "name": "test", "status": "two", selectedRadioButton: 1, selectedCheckboxes: [1, 2], searchableList: searchableListSelecteddataArray, "date": "2014-11-12", "image": {url: "http://picbook.in/wp-content/uploads/2014/07/google_images_-_photos_videos.jpg", externalLink: "www.facebook.com"}, "serial": 34567, "url": "http://testurl.com"},
			{"id": getUniqueId(), "name": "test3", "status": "two", selectedRadioButton: 2, selectedCheckboxes: [2, 3], searchableList: searchableListSelecteddataArray, "date": "2014-11-12", "image": {url: "http://picbook.in/wp-content/uploads/2014/07/happy_diwali__sms_images_.jpg", externalLink: "www.facebook.com"}, "serial": 3454904, "url": "http://www.url.com"},
			{"id": getUniqueId(), "name": "test4", "status": "two", selectedRadioButton: 3, selectedCheckboxes: [1, 3], searchableList: searchableListSelecteddataArray, "date": "2014-11-12", "image": {url: "http://photos.appleinsider.com/gallery/9220-695-140510-iPhone_6-Mock-1-l.png", externalLink: "www.facebook.com"}, "serial": 899, "url": "http://www.url.com"},
			{"id": getUniqueId(), "name": "test5", "status": "one", selectedRadioButton: 0, selectedCheckboxes: [0, 3], searchableList: searchableListSelecteddataArray, "date": "2014-11-12", "image": {url: "http://t3.gstatic.com/images?q=tbn:ANd9GcT9nACnOnonHhqJErp6zEgj6cKd5XHOGYFccVjWdzFt4wvwaBjJ", externalLink: "www.facebook.com"}, "serial": 241234, "url": "http://www.url.com"},
			{"id": getUniqueId(), "name": "test1", "status": "one", selectedRadioButton: 0, selectedCheckboxes: [0, 1], searchableList: searchableListSelecteddataArray, "date": "2014-11-12", "image": {url: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQakIHr76SWWCmn5bFxmfBlUI3hQ7pCtdLFwxU4Cb0wWZyRikKp", externalLink: "www.facebook.com"}, "serial": 12345, "url": "http://testurl.com"},
			{"id": getUniqueId(), "name": "test2", "status": "two", selectedRadioButton: 1, selectedCheckboxes: [1, 2], searchableList: searchableListSelecteddataArray, "date": "2014-11-12", "image": {url: "http://picbook.in/wp-content/uploads/2014/07/happy_diwali__sms_images_.jpg", externalLink: "www.facebook.com"}, "serial": 34567, "url": "http://testurl.com"},
			{"id": getUniqueId(), "name": "test3", "status": "two", selectedRadioButton: 2, selectedCheckboxes: [2, 3], searchableList: searchableListSelecteddataArray, "date": "2014-11-12", "image": {url: "http://photos.appleinsider.com/gallery/9220-695-140510-iPhone_6-Mock-1-l.png", externalLink: "www.facebook.com"}, "serial": 3454904, "url": "http://www.url.com"},
			{"id": getUniqueId(), "name": "test4", "status": "two", selectedRadioButton: 3, selectedCheckboxes: [1, 3], searchableList: searchableListSelecteddataArray, "date": "2014-11-12", "image": {url: "http://photos.appleinsider.com/gallery/9220-695-140510-iPhone_6-Mock-1-l.png", externalLink: "www.facebook.com"}, "serial": 899, "url": "http://www.url.com"},
			{"id": getUniqueId(), "name": "test5", "status": "one", selectedRadioButton: 0, selectedCheckboxes: [0, 3], searchableList: searchableListSelecteddataArray, "date": "2014-11-12", "image": {url: "http://photos.appleinsider.com/gallery/9220-695-140510-iPhone_6-Mock-1-l.png", externalLink: "www.facebook.com"}, "serial": 241234, "url": "http://www.url.com"},
			{"id": getUniqueId(), "name": "test1", "status": "one", selectedRadioButton: 0, selectedCheckboxes: [0, 1], searchableList: searchableListSelecteddataArray, "date": "2014-11-12", "image": {url: "http://photos.appleinsider.com/gallery/9220-695-140510-iPhone_6-Mock-1-l.png", externalLink: "www.facebook.com"}, "serial": 12345, "url": "http://testurl.com"},
			{"id": getUniqueId(), "name": "test2", "status": "two", selectedRadioButton: 1, selectedCheckboxes: [1, 2], searchableList: searchableListSelecteddataArray, "date": "2014-11-12", "image": {url: "http://photos.appleinsider.com/gallery/9220-695-140510-iPhone_6-Mock-1-l.png", externalLink: "www.facebook.com"}, "serial": 34567, "url": "http://testurl.com"},
			{"id": getUniqueId(), "name": "test3", "status": "two", selectedRadioButton: 2, selectedCheckboxes: [2, 3], searchableList: searchableListSelecteddataArray, "date": "2014-11-12", "image": {url: "http://photos.appleinsider.com/gallery/9220-695-140510-iPhone_6-Mock-1-l.png", externalLink: "www.facebook.com"}, "serial": 3454904, "url": "http://www.url.com"},
			{"id": getUniqueId(), "name": "test4", "status": "two", selectedRadioButton: 3, selectedCheckboxes: [1, 3], searchableList: searchableListSelecteddataArray, "date": "2014-11-12", "image": {url: "http://photos.appleinsider.com/gallery/9220-695-140510-iPhone_6-Mock-1-l.png", externalLink: "www.facebook.com"}, "serial": 899, "url": "http://www.url.com"},
			{"id": getUniqueId(), "name": "test5", "status": "one", selectedRadioButton: 0, selectedCheckboxes: [0, 3], searchableList: searchableListSelecteddataArray, "date": "2014-11-12", "image": {url: "http://photos.appleinsider.com/gallery/9220-695-140510-iPhone_6-Mock-1-l.png", externalLink: "www.facebook.com"}, "serial": 241234, "url": "http://www.url.com"}
		];

		$scope.filterOptions = {
			filterText: "",
			useExternalFilter: false
		};
		$scope.item = {selectedItems: []};

		$scope.rowOptions = {
			enableRowSelection: true
		};

		//works with remote data source
		/*$scope.columnDefs = [
			{field: 'id', displayName: 'ID'},
			{field: 'title', displayName: 'Name'},
			{field: 'thumbnails', displayName: 'Thumbnail', gridControlType: enums.gridControlType.getName("ImageNoHover"), cellTemplate: '<div class="centeredImage"><img ng-src="{{row.entity[col.field][0].url}}" height="50" align="center" lazy-src ></div>'},
			{field: 'type', displayName: 'Type'},
			{field: 'mediaType', displayName: 'Media Type'},
			{field: 'status', displayName: 'Status',
			{field: 'formatContext.fileSize', displayName: 'File Size'},
			{field: 'formatContext.format', displayName: 'Format'}
		];*/

		$scope.columnDefs = [
			{field: 'id', displayName: 'ID', isColumnEdit: false, isShowToolTip: true, gridControlType: enums.gridControlType.getName("TextBox"), isPinned: true},
			{field: 'name', displayName: 'Name', isColumnEdit: true, validationFunction: validateName, gridControlType: enums.gridControlType.getName("TextBox"), isShowToolTip: true},
			{field: 'searchableList', displayName: 'Example', listDataArray: searchableListdataArray, gridControlType: enums.gridControlType.getName("SearchableList")},
			/*{field: 'image', displayName: 'Thumbnail', isColumnEdit: false, gridControlType: enums.gridControlType.getName("ImageNoHover"), cellTemplate: '<div class="centeredImage"><img ng-src="{{row.entity[col.field][0].url}}" height="50" align="center" lazy-src ></div>'},*/
			{field: 'status', displayName: 'Status', width: 160, listDataArray: selectListdataArray, gridControlType: enums.gridControlType.getName("SelectList"), isPinned: true},
			{field: 'date', displayName: 'Date', width: 160, isPinned: false, gridControlType: enums.gridControlType.getName("Date") },
			/*{field: 'selectedCheckboxes', displayName: 'Test Checkbox', width: 160, checkboxes: checkboxes, gridControlType: enums.gridControlType.getName("Checkbox")},
			{field: 'selectedRadioButton', displayName: 'Test RadioButton', width: 160, radioButtons: radioButtons, gridControlType: enums.gridControlType.getName("RadioButton"), isShowToolTip: true},
			*/{field: 'serial', displayName: 'Serial #', isColumnEdit: false, gridControlType: enums.gridControlType.getName("TextBox")},
			{field: 'url', displayName: 'Url', isColumnEdit: false, gridControlType: enums.gridControlType.getName("TextBox"), isShowToolTip: true}
		];

		//sample validation function
		function validateName(row) {
			var value = row.entity.name;
			var result =
			{
				isSuccess: false,
				message: ""
			};
			if (check(value)) {
				result.isSuccess = false;
				result.message = "Please enter valid name.";
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

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};

		function processError(error) {
			console.log('ohh no!');
			console.log(error);
			$scope.showSPinner = false;
			$scope.gettingData = false;
			if (error.data.error === undefined) {
        mmAlertService.addError("Server error. Please try again later.");
			} else {
        mmAlertService.addError("Error getting data: " + error.data.error);
			}
		}
	}
]);