/**
 * Created by atdg on 3/27/2014.
 */
'use strict';
app.controller('uploadAssetCtrl', ['$scope', '$modal', '$modalInstance', '$fileUploader', '$rootScope', 'adService' , 'mmSession', 'toaster', 'assetService', 'EC2Restangular', 'mmMessages',
	function ($scope, $modal, $modalInstance, $fileUploader, $rootScope, adService, session, toaster, assetService, EC2Restangular, mmMessages) {

		// define data service urls
		var brandAdvertiserAccountsUrl = "brands/brandadvertiseraccounts";
		var brandUrl = "brands";
		var campaignUrl = "campaigns";
		var advertiserUrl = "advertisers";
		var advertisers = EC2Restangular.all(advertiserUrl);
		var brands = EC2Restangular.all(brandUrl);
		var campaigns = EC2Restangular.all(campaignUrl);
		var brandAdvertiserAccounts = EC2Restangular.all(brandAdvertiserAccountsUrl);

		// create a uploader with options
		var assetUploadUrl = assetService.getAssetUploadUrl();
		var lastAuthorization = session.get('Authorization', 'test default');
		var uploader = $scope.uploader = $fileUploader.create({
			scope: $scope,                          // to automatically update the html. Default: $rootScope
			url: assetUploadUrl,
			headers: {
				'Authorization': lastAuthorization
			}/*,
			 withCredentials: true*/
		});
		$scope.items = [];

//		$scope.$watchCollection("uploader.queue",function(){
//			prepareGridItems();
//		});

		$scope.convertToMB =
			function (bytes, precision) {
				if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
				if (typeof precision === 'undefined') precision = 1;
				var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
					number = Math.floor(Math.log(bytes) / Math.log(1024));
				return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
			};

		var prepareGridItems = function () {
			$scope.items = [];
			for (var index = 0; index < uploader.queue.length; index++) {
				var item = uploader.queue[index];
				var size = $scope.convertToMB(item.file.size,2);
				$scope.items.push({
					"assetId": item.assetId,
					"name": item.file.name,
					"destination": item.destinationFolder,
					"size": size,
					"progress": item.progress,
					"icon": item.icon,
					"isUploading": item.isUploading,
					"action": ""
				});
			}
		};
		$scope.selectedItems = [];

		var actionCellTemplate = '<span class="cursorPointer" ng-click="removeUploaderItem(row.entity.assetId)" ng-if="!row.entity.isUploading" ng-disabled="row.entity.progress==100"><i class="fa fa-times"></i></span><span class="cursorPointer" ng-click="cancelUploaderItem(row.entity.assetId)" ng-if="row.entity.isUploading"><i class="fa fa-times"></i></span>';
		$scope.columnDefs = [
			{field: 'name', displayName: 'File Name'},
			{field: 'icon', displayName: 'Type', cellTemplate: '<i class="{{row.entity.icon}}"></i>'},
			{field: 'destination', displayName: 'Destination', cellTemplate: '<div><a class="cursorPointer" ng-click="openDestinationFolderTreePopup(row.entity.assetId)">{{row.getProperty(col.field)}}</a> </div>'},
			{field: 'size', displayName: 'Size'},
			{field: 'progress', displayName: 'Progress', cellTemplate: '<div class="progress uploadProgress"><div class="progress uploadProgress"> <div class="progress-bar" role="progressbar" ng-style="{ "width": row.entity.progress + ' % ' }"><b>{{row.entity.progress}}%</b></div></div></div>'},
			{field: 'assetId', displayName: 'assetid', visible: false},
			{field: 'isUploading', displayName: 'isUploading', visible: false},
			{field: 'action', displayName: 'Action', cellTemplate: actionCellTemplate}
		];

		$scope.filterOptions = {
			filterText: "",
			useExternalFilter: true
		};

		$scope.gridOptions = {
			columnDefs: 'columnDefs',
			data: 'items',
			showSelectionCheckbox: true,
			showFooter: true,
			showColumnMenu: true,
			selectedItems: $scope.selectedItems,
			showGroupPanel: true,
			showFilter: true,
			enableColumnResize: true,
			filterOptions: $scope.filterOptions,
			beforeSelectionChange: function (rowItem, event) {
				console.log("beforeCheckboxSelectionChange", rowItem)
				if (rowItem.length) {
//					var isAllChecked = true;
//					for (var index = 0; index < rowItem.length; index++) {
//						var chkBox = rowItem[index];
//						console.log("check", chkBox);
//						if (chkBox.selected == "false") {
//							isAllChecked = false;
//							break;
//						}
//					}
//					if (isAllChecked) {
//						_.each(rowItem, function (item) {
//							console.log("rowentity", item.entity);
//							$scope.selectRow1(item);
//						});
//					}
//					else {
//						$scope.clearAll();
//					}
				} else {
					if (!rowItem.selected)
						$scope.allSelected = false;
					$scope.selectRow1(rowItem);
				}
				return true;
			},
			checkboxHeaderTemplate: '<input class="ngSelectionHeader" type="checkbox" ng-show="true" ng-model="allSelected" ng-change="selectedRows.length!=metadataInfoList.length?selectAllAsset():unSelectAllAsset()"/>',
			afterSelectionChange: function (row) {
//				console.log("row", row);
			}
		};

//		$scope.removeUploaderItemFromAssetList = function (assetId) {
//			console.log("Method", "removeUploaderItemFromAssetList - " + assetId);
//			var item = $scope.getUploaderItemByAssetId(assetId);
//			console.log("item", item);
//				$scope.removeAssetFromList(item);
//			prepareGridItems();
//		};
		$scope.removeUploaderItem = function (assetId) {
			console.log("Method", "removeUploaderItem - " + assetId);
			var item = $scope.getUploaderItemByAssetId(assetId);
			if (item != null) {
				$scope.removeAssetFromList(item);
				item.remove();
			}
			prepareGridItems();
		};

//		$scope.cancelUploaderItem = function (assetId) {
//			console.log("Method", "removeUploaderItem- " + assetId);
//			var item = $scope.getUploaderItemByAssetId(assetId);
//			if (item != null) {
//				item.cancel();
//			}
//			prepareGridItems();
//		};

		$scope.getUploaderItemByAssetId = function (assetId) {
			var item = null;
			console.log("Method", "getUploaderItemByAssetId - " + assetId);
			for (var i = 0; i < uploader.queue.length; i++) {
				var queueItem = uploader.queue[i];
				console.log("Method", "in loop - " + queueItem.assetId);
				if (queueItem.assetId == assetId) {
					console.log("assetId", assetId);
					item = queueItem;
					break;
				}
			}
			console.log("Method", "getUploaderItemByAssetId- " + item);
			return item;
		};

//		$scope.$watch("selectedItems", function (newVal, oldVal) {
//			console.log("selectedItems", $scope.selectedItems);
//			$scope.selectedRows = [];
//			if ($scope.selectedItems.length > 0) {
//				for (var index = 0; index < $scope.selectedItems.length; index++) {
//					var rowItem = $scope.selectedItems[index];
//					$scope.selectedRows.push(rowItem.assetId);
//				}
//			}
//		}, true);

		$scope.selectAllAsset = function () {
			$scope.allSelected = true;
			$scope.gridOptions.selectAll(true);
			$scope.selectAll();
		};
		$scope.unSelectAllAsset = function () {
			$scope.allSelected = false;
			$scope.gridOptions.selectAll(false);
			$scope.clearAll();
		};

		$scope.selectRow1 = function (row) {
			$scope.fileName = row.entity.name;
			//store or remove selected row
			var asset = $scope.findAssetByAssetId(row.entity.assetId);
			$scope.storeSelectedRow(asset, false);
			var assetId = asset.assetId;
			if ($scope.selectedRows.length == 1) {
				assetId = assetId;
			}
			for (var i = 0; i < $scope.metadataInfoList.length; i++) {
				if ($scope.metadataInfoList[i].assetId == assetId) {
					$scope.indexOfAsset = i;
					return;
				}
			}
			return $scope.indexOfAsset = 0;
		};

		$scope.tempResourcePath = assetService.getTempResourceUrl();
		$scope.multipleValues = "Multiple Values";
		//static list
		$scope.imageList = [
			{imageSrc: $scope.tempResourcePath + 'image.jpg', description: 'This is image 1', id: '1', size: '12kb'},
			{imageSrc: $scope.tempResourcePath + 'image.jpg', description: 'Image2', id: '2', size: '12kb'},
			{imageSrc: $scope.tempResourcePath + 'image.jpg', description: 'Image3', id: '3', size: '120kb'},
			{imageSrc: $scope.tempResourcePath + 'image.jpg', description: 'Image4', id: '4', size: '10kb'},
			{imageSrc: $scope.tempResourcePath + 'image.jpg', description: 'Image5', id: '5', size: '18kb'},
			{imageSrc: $scope.tempResourcePath + 'image.jpg', description: 'Image6', id: '6', size: '20kb'}
		];
		$scope.dummyAdvertisers = [
			{id: '1', name: "Advert1"},
			{id: '2', name: "Advert2"},
			{id: '3', name: "Advert3"},
			{id: '4', name: "Advert4"},
			{id: '5', name: "Advert5"}
		];
		$scope.dummyBrands = [
			{id: '1', name: "Brand1", advertiserId: "1"},
			{id: '2', name: "brand2", advertiserId: "2"},
			{id: '3', name: "brand3", advertiserId: "3"},
			{id: '4', name: "brand4", advertiserId: "4"},
			{id: '5', name: "brand5", advertiserId: "5"}
		];
		$scope.loadFilteredCampaigns = function (brand) {
			$scope.filteredCampaigns = [];
			if (brand != null) {
				angular.forEach($scope.brandAdvertiserAccounts, function (value, key) {
					if (value.brandId == brand.id) {
						//console.log("brandAdvertiserAccounts", value);
						angular.forEach($scope.campaigns, function (value2, key2) {
							if (value.id == value2.brandAccountAdvertiserId) {
								$scope.filteredCampaigns.push(value2);
								//console.log("filteredCampaigns", value2);
							}
						});
					}
				});
			}
			return $scope.filteredCampaigns;
		};

		$scope.selectAssetList = [];
		$scope.isSelectFiles = false;
		$scope.selectedAdvertiser = {};
		$scope.selectedBrand = {};
		$scope.selectedCampaign = {};
		//get assets for select list
		if ($scope.showSelectTab) {
			console.log("cfw - getting asset list for select");
			console.log("ad - campaign id", $rootScope.campaignId);
			//$scope.campaignId = $rootScope.campaignId;
			//hard code until data is better
			if (!$rootScope.campaignId) {
				$scope.campaignId = "VEBAJGK7PC";
			}
			//$scope.campaignId = "K8UVGDPH4X";		//went away
			$('.selectDataInfo').show('fast');
			if (typeof $scope.campaignId != "undefined") {
				EC2Restangular.one(campaignUrl, $scope.campaignId).get().then(function (campaign) {
					$scope.selectedCampaign = campaign;
					console.log("selected campaign", campaign);
					if (typeof campaign != "undefined" && campaign.brandAccountAdvertiserId != null) {
						EC2Restangular.one(brandAdvertiserAccountsUrl, $scope.selectedCampaign.brandAccountAdvertiserId).get().then(function (brandadvertiseraccount) {
							if (typeof brandadvertiseraccount != "undefined" && brandadvertiseraccount.brandId != null) {
								EC2Restangular.one(brandUrl, brandadvertiseraccount.brandId).get().then(function (brand) {
									if (typeof brand != "undefined" && brand.advertiserId != null) {
										$scope.selectedBrand = brand;
										EC2Restangular.one(advertiserUrl, $scope.selectedBrand.advertiserId).get().then(function (advertiser) {
											$scope.selectedAdvertiser = advertiser;
										}, processError);
									}
								}, processError);
							}
						}, processError);
					}
				}, processError);
			}

			if (typeof $scope.selectedBrand == "undefined" || typeof $scope.selectedBrand.id == "undefined") {
				$scope.selectedBrand.id = "";
				$scope.selectedBrand.name = "Not defined in the Ad yet.";
			}
			if (typeof $scope.selectedCampaign == "undefined" || typeof $scope.selectedCampaign.id == "undefined") {
				$scope.selectedCampaign.id = "";
				$scope.selectedCampaign.name = "Not defined in the Ad yet.";
			}
			if (typeof $scope.selectedAdvertiser == "undefined" || typeof $scope.selectedAdvertiser.id == "undefined") {
				$scope.selectedAdvertiser.id = "";
				$scope.selectedAdvertiser.name = "Not defined in the Ad yet.";
			}
			//Get assets using service
			/*var assetSearchBody = {
			 "searchText": "*",        //return all for now
			 "page": 1,
			 "itemsPerPage": 1000,
			 "indexVersion": 1
			 }
			 assetService.searchAssets(assetSearchBody).then(function(returnData) {
			 // successfully saved;
			 //console.log('select asset list', returnData);
			 var selectAssetList = returnData.entity;
			 if (selectAssetList.length > 0 ) {
			 _.each(selectAssetList, function(asset) {asset.id = asset.assetId;});     //create id for now
			 }
			 $scope.selectAssetList = selectAssetList;
			 //console.log('new select asset list', $scope.selectAssetList);
			 }, function(response) {
			 // error
			 console.log("error", response);
			 });*/

			assetService.getAllAssets().then(function (returnData) {
				// successfully saved;
				console.log('select asset list', returnData);
				var selectAssetList = returnData;
				$scope.selectAssetList = selectAssetList;
				$('.selectDataInfo').hide('fast');
				$scope.isSelectFiles = true;
			}, function (response) {
				// error
				console.log("error", response);
				$scope.isSelectFiles = true;			//tried to get them on upload open
			})

		}

		$scope.advertisers = [];
		$scope.brands = [];
		$scope.campaigns = [];
		$scope.brandAdvertiserAccounts = [];
		$scope.advertisers = $scope.dummyAdvertisers;
		$scope.brands = $scope.dummyBrands;

		if (!$scope.showSelectTab) {
			advertisers.getList().then(function (all) {
				//Temporary - give it a better name so we can find it
				_.each(all, function (adv) {
					if (adv.id === "QS6XU3D496") {
						console.log("find adv?", adv.id);
						adv.name = "TEST ATDG Advertiser";
					}
				});
				$scope.advertisers = all;
				console.log("adv", $scope.advertisers);
			}, processError);

			brands.getList().then(function (all) {
				$scope.brands = all;
				console.log("brands", $scope.brands);
			}, processError);

			campaigns.getList().then(function (all) {
				$scope.campaigns = all;
				console.log("camps", $scope.campaigns);
			}, processError);

			brandAdvertiserAccounts.getList().then(function (all) {
				$scope.brandAdvertiserAccounts = all;
				console.log("baas", $scope.brandAdvertiserAccounts);
			}, processError);
		}

		$scope.hasBrand = false;
		$scope.hasCampaign = false;
		$scope.dropDownType = {
			Advertiser: 1,
			Brand: 2,
			Campaign: 3
		};
		//$scope.selectedAdvertiser=$scope.advertisers[0];

		$scope.advertiserChange = function (item) {
			console.log("advertiserChange", item);
			if (item != null && typeof item !== undefined && item.id != "") {
				$scope.hasBrand = true;
				$scope.selectedAdvertiser = item;
			}
			else {
				$scope.hasBrand = false;
				$scope.selectedAdvertiser = {};
			}
			$scope.assignSelectedDropdownsDataToAssets($scope.selectedAdvertiser, $scope.dropDownType.Advertiser);
		};

		$scope.filteredCampaigns = [];

		$scope.brandChange = function (item) {
			console.log("brandChange", item);
			if (item != null && typeof item !== undefined && item.id != "") {
				$scope.hasCampaign = true;
				$scope.selectedBrand = item;
//				loadFilteredBrands(item);
			}
			else {
				$scope.hasCampaign = false;
				$scope.selectedBrand = {};
				$scope.filteredCampaigns = [];
			}
			$scope.assignSelectedDropdownsDataToAssets($scope.selectedBrand, $scope.dropDownType.Brand);
		};

		$scope.campaignChange = function (item) {
			console.log("campaignChange", item);
			if (item != null && typeof item !== undefined && item.id != "") {
				$scope.hasCampaign = true;
				$scope.selectedCampaign = item;
			}
			else {
				$scope.hasCampaign = false;
				$scope.selectedCampaign = {};
			}
			$scope.assignSelectedDropdownsDataToAssets($scope.selectedCampaign, $scope.dropDownType.Campaign);
		};

		$scope.assignSelectedDropdownsDataToAssets = function (selectedItem, dropDownType) {
			if (typeof $scope.metadataInfoList != "undefined" && $scope.metadataInfoList.length > 0) {
				console.log("assignSelectedDropdownsDataToAssets", "Total assets - " + $scope.metadataInfoList.length);
				if (!$scope.isMultipleAssetsSelected()) {
					console.log("assignSelectedDropdownsDataToAssets", "assetIndex - " + $scope.selectedRows[0]);
					var metadataInfo = $scope.findAssetByAssetId($scope.selectedRows[0]);
					console.log("assignSelectedDropdownsDataToAssets - metadataInfo", metadataInfo);
					console.log("assignSelectedDropdownsDataToAssets - selectedItem.id", selectedItem.id);
					console.log("assignSelectedDropdownsDataToAssets - selectedItem.name", selectedItem.name);
					if (!metadataInfo.isUploaded && typeof metadataInfo.correlationId === "undefined") {
						if (dropDownType == $scope.dropDownType.Advertiser) {
							metadataInfo.advertiserId = selectedItem.id;
							metadataInfo.advertiser = selectedItem.name;
							//reset brand and campaign on advertiser selection;
							resetBrand(metadataInfo);
							resetCampaign(metadataInfo);
						}
						else if (dropDownType == $scope.dropDownType.Brand) {
							metadataInfo.brand = selectedItem.name;
							metadataInfo.brandId = selectedItem.id;
							resetCampaign(metadataInfo);
						}
						else if (dropDownType == $scope.dropDownType.Campaign) {
							metadataInfo.campaignName = selectedItem.name;
							metadataInfo.campaignId = selectedItem.id;
						}
						$scope.processAsset();
					}
					return;
				}
				for (var index = 0; index < $scope.metadataInfoList.length; index++) {
					var metadataInfo = $scope.metadataInfoList[index];
					//change those assets metadata which are not uploaded yet.
					console.log("assignSelectedDropdownsDataToAssets", "metadataInfo.isUploaded - " + metadataInfo.isUploaded);
					console.log("assignSelectedDropdownsDataToAssets", "typeof metadataInfo.correlationId - " + typeof metadataInfo.correlationId);
					if (!metadataInfo.isUploaded && typeof metadataInfo.correlationId === "undefined") {
						if ($scope.selectedRows.indexOf(metadataInfo.assetId) == -1) {
							continue;
						}
						if (dropDownType == $scope.dropDownType.Advertiser) {
							metadataInfo.advertiserId = selectedItem.id;
							metadataInfo.advertiser = selectedItem.name;
							//reset brand and campaign on advertiser selection;
							resetBrand(metadataInfo);
							resetCampaign(metadataInfo);
						}
						else if (dropDownType == $scope.dropDownType.Brand) {
							metadataInfo.brand = selectedItem.name;
							metadataInfo.brandId = selectedItem.id;
							resetCampaign(metadataInfo);
						}
						else if (dropDownType == $scope.dropDownType.Campaign) {
							metadataInfo.campaignName = selectedItem.name;
							metadataInfo.campaignId = selectedItem.id;
						}
						$scope.processAsset();
					}
				}
			}
		};

		var resetBrand = function (metadataInfo) {
			metadataInfo.brand = "";
			metadataInfo.brandId = "";
			$scope.selectedBrand = {};
		};
		var resetCampaign = function (metadataInfo) {
			metadataInfo.campaignName = "";
			metadataInfo.campaignId = "";
			$scope.selectedCampaign = {};
		};

		//test tree model
		$scope.Folders = [
			{ label: "Folder1", id: "role1", children: [
				{ label: "Folder1-1", id: "role11", children: [] },
				{ label: "Folder1-2", id: "role12", children: [
					{ label: "Folder1-2-1", id: "role121", children: [
						{ label: "Folder1-2-1-1", id: "role1211", children: [] },
						{ label: "Folder1-2-1-2", id: "role1212", children: [] }
					]}
				]}
			]},
			{ label: "Folder2", id: "role2", children: [] },
			{ label: "Folder3", id: "role2", children: [] },
			{ label: "Folder4", id: "role2", children: [] },
			{ label: "Folder5", id: "role2", children: [] }

		];

		function processError(error) {
			console.log("ERROR: " + JSON.stringify(error));
			toaster.pop("error", JSON.stringify(error));
		}

		$scope.adFormats = adService.getAdFormats();
		$scope.filebrowseCssClass = 'col-sm-12';
		$scope.ShowProgressContainer = false;
		$scope.ShowUploadControl = true;

		$scope.IsEditAllFilesMeta = true;
		$scope.IsEditSingleFileMeta = true;

		$scope.IsUploadCompleted = false;
		$scope.IsAssetAttached = false;
		$scope.IsSingleFileUpload = $rootScope.IsSingleFileUpload;
		//$scope.leftClassDestination = !$scope.IsSingleFileUpload ? "left-align-format" : "left-align-singlefileupload";

		$scope.rowColor = "whiteColor";
		$scope.fileName = uploader.queue.length > 0 ? uploader.queue[uploader.queue.length - 1].file.name : '';
		$scope.cssClass = [];
		$scope.showTree = false;
		$scope.destinationLocationTree = {};
		$scope.showSelectTab = $rootScope.showSelectTab;
		$scope.selectedFolder = $scope.Folders[0].label;//assign base folder on pop up initialization
		$rootScope.selectedDestinationFolder = $scope.Folders[0].label;
		$scope.searchImageText = '';
		$scope.showAttachImageBtn = false;
		$scope.selectedImages = [];
		$scope.selectedIndex = "";
		$scope.selectedImageCssClass = 'whiteColor';
		//$scope.toggleClass = "col-sm-8";
		$scope.disabledDestinationFolder = false;
		$scope.metadataInfoList = [];
		$scope.selectedRow = "";
		$scope.previouslyUploadedItemslastIndex = 0;
		$scope.previouslyUploadedItemslastIndex2 = 0;
		$scope.indexOfAsset = 0;
		$scope.uploadIdList = [];
		$scope.uploadAssetList = [];
		$scope.selectedRows = [];
		$scope.changeFolderOfAllAssets = true;
		$scope.metaObjForMultipleSelection = {
			advertiser: '',
			brand: '',
			agency: '',
			campaignName: ''
		};


		$scope.$on("SelectTreeNode", function (event, data) {
			if (data == "")
				return;
			$rootScope.selectedDestinationFolder = data;

			if (!$scope.ShowProgressContainer) {
				$scope.selectedFolder = data;
			}
			if ($scope.changeFolderOfAllAssets) {
				if ($scope.metadataInfoList.length > 0) {
					$scope.selectedFolder = data;
					for (var i = 0; i < $scope.metadataInfoList.length; i++) {
						var asset = $scope.metadataInfoList[i];
						if (!asset.isError && asset.isUploaded && typeof asset.correlationId != "undefined")
							continue;
						asset.destinationFolder = data;
					}
				}
			}
			else {
				if ($scope.metadataInfoList.length > 0) {
					var asset = $scope.metadataInfoList[$scope.indexOfAsset];
					if (!(!asset.isError && asset.isUploaded && typeof asset.correlationId != "undefined"))
						asset.destinationFolder = data;
				}
			}
			if ($scope.metadataInfoList.length > 0 && !$scope.changeFolderOfAllAssets) {
				var folderArray = [];
				for (var i = 0; i < $scope.metadataInfoList.length; i++) {
					var asset = $scope.metadataInfoList[i];
					if (!asset.isError && asset.isUploaded && typeof asset.correlationId != "undefined")
						continue;
					folderArray.push(asset.destinationFolder);
				}
				var allDestinationPathsEqual = $scope.AllValuesEqualInArray(folderArray);
				if (allDestinationPathsEqual) {
					$scope.selectedFolder = folderArray[0];
				}
			}

		});

		$scope.allFileMetaObj = {
			advertiser: '',
			brand: '',
			agency: '',
			campaignName: ''
		};

		function doEmptyAllFileMetaObj() {

			$scope.IsEditAllFilesMeta = true;
			$scope.IsEditSingleFileMeta = true;

			$scope.allFileMetaObj.advertiser = '';
			$scope.allFileMetaObj.brand = '';
			$scope.allFileMetaObj.agency = '';
			$scope.allFileMetaObj.campaignName = '';
		}

		//create random # for upload file index
		$scope.getUniqueId = function () {
			function s4() {
				return Math.floor((1 + Math.random()) * 0x10000)
					.toString(16)
					.substring(1);
			}

			return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
				s4() + '-' + s4() + s4() + s4();
		}

		$scope.classDisableAllFileMeta = function () {
			if (!$scope.IsEditAllFilesMeta) {
				return 'disabled'; //'ng-isolate-scope disabled'
			}
			return '';
		};

		$scope.getMetaDataListCount = function () {
			var count = 0;

			for (var i = 0; i < $scope.metadataInfoList.length; i++) {
				if (!$scope.metadataInfoList[i].isUploaded) ++count;
			}

			return count;
		}

		$scope.IsEmptyAllFilesMeta = function () {

			if ($scope.allFileMetaObj.advertiser === '' && $scope.allFileMetaObj.brand === '' &&
				$scope.allFileMetaObj.agency === '' && $scope.allFileMetaObj.campaignName === '') {
				return true;
			}
			else {
				return false;
			}
		};

		$scope.$watch(
			"allFileMetaObj",
			function (newValue, oldValue) {

				if (!$scope.IsEditSingleFileMeta) {
					for (var i = 0; i < $scope.metadataInfoList.length; i++) {
						console.log($scope.metadataInfoList[i].isUploaded);

						if ($scope.metadataInfoList[i].isUploaded) continue;

						for (var prop in $scope.metadataInfoList[i]) {
							if (prop === 'advertiser') $scope.metadataInfoList[i][prop] = newValue.advertiser;
							if (prop === 'brand') $scope.metadataInfoList[i][prop] = newValue.brand;
							if (prop === 'agency') $scope.metadataInfoList[i][prop] = newValue.agency;
							if (prop === 'campaignName') $scope.metadataInfoList[i][prop] = newValue.campaignName;
						}
					}
				}

			}, true);

		$scope.IsEditingFileMeta = function (event) {

			// console.log(event);

			var isAllFileMetaEmpty = $scope.IsEmptyAllFilesMeta();
			var isSingleFileMetaEmpty = true;

			for (var i = 0; i < $scope.metadataInfoList.length; i++) {
				var obj = $scope.metadataInfoList[i];

				if ($scope.metadataInfoList[i].isUploaded) continue;

				if (obj.advertiser !== '' || obj.brand !== '' ||
					obj.agency !== '' || obj.campaignName !== '') {
					isSingleFileMetaEmpty = false;
					break;
				}
			}

			if (isAllFileMetaEmpty && isSingleFileMetaEmpty) {
				$scope.IsEditAllFilesMeta = true;
				$scope.IsEditSingleFileMeta = true;
			}
			else if (isAllFileMetaEmpty && !isSingleFileMetaEmpty) {
				$scope.IsEditAllFilesMeta = false;
				$scope.IsEditSingleFileMeta = true;
			}
			else if (!isAllFileMetaEmpty && isSingleFileMetaEmpty) {
				$scope.IsEditAllFilesMeta = true;
				$scope.IsEditSingleFileMeta = false;
			}

		};

		$scope.assetMetadata = {
			imageName: "",
			advertiser: "",
			advertiserId: "",
			brand: "",
			brandId: "",
			agency: "",
			campaignName: "",
			campaignId: "",
			destinationFolder: "",
			displayName: "",
			adFormat: "",
			display: "",
			dimension: "",
			isUploaded: false
		};

		$scope.getDestinationFolder = function (assetId) {
			console.log("getting destination folder for asset - id ", assetId);
			var destination = $scope.findByAssetId(assetId);
			if (destination == "") {
				/*if($scope.selectedFolder=="")*/
				return '';
				/*return $scope.selectedFolder;*/
			}

			return destination;
		};

		$scope.findAssetByAssetId = function (assetId) {
			var asset = null;
			if ($scope.metadataInfoList.length > 0) {
				for (var i = 0; i < $scope.metadataInfoList.length; i++) {
					if ($scope.metadataInfoList[i].assetId == assetId) {
						asset = $scope.metadataInfoList[i];
						break;
					}
				}
			}
			return asset;
		}

		$scope.findByAssetId = function (assetId) {
			var destinationFolder = null;
			if ($scope.metadataInfoList.length > 0) {
				for (var i = 0; i < $scope.metadataInfoList.length; i++) {
					if ($scope.metadataInfoList[i].assetId == assetId) {
						destinationFolder = $scope.metadataInfoList[i].destinationFolder;
						break;
					}
				}
			}
			return destinationFolder;
		}

		$scope.prepareAssetMetadata = function () {

			$scope.previouslyUploadedItemslastIndex2 = $scope.previouslyUploadedItemslastIndex;
			//set metadata from dropdowns.
			if ($scope.showSelectTab) {
				$scope.assetMetadata.advertiser = $scope.selectedAdvertiser.name;
				$scope.assetMetadata.advertiserId = $scope.selectedAdvertiser.id;
				$scope.assetMetadata.brand = $scope.selectedBrand.name;
				$scope.assetMetadata.brandId = $scope.selectedBrand.id;
				$scope.assetMetadata.campaignName = $scope.selectedCampaign.name;
				$scope.assetMetadata.campaignId = $scope.selectedCampaign.id;
			}

			for (var i = $scope.previouslyUploadedItemslastIndex; i < uploader.queue.length; i++) {
				$scope.metadataInfoList.push({
					assetId: uploader.queue[i].assetId,
					imageName: uploader.queue[i].file.name,
					advertiser: $scope.assetMetadata.advertiser,
					advertiserId: $scope.assetMetadata.advertiserId,
					brand: $scope.assetMetadata.brand,
					brandId: $scope.assetMetadata.brandId,
					agency: $scope.assetMetadata.agency,
					campaignName: $scope.assetMetadata.campaignName,
					campaignId: $scope.assetMetadata.campaignId,
					destinationFolder: ( $rootScope.selectedDestinationFolder !== '' ? $rootScope.selectedDestinationFolder : $scope.assetMetadata.destinationFolder), // ($scope.storeCurrentNode()!=='' || $scope.storeCurrentNode() !== 'undefined'? $scope.storeCurrentNode(): $scope.assetMetadata.DestinationFolder),
					displayName: $scope.assetMetadata.displayName,
					isUploaded: $scope.assetMetadata.isUploaded
				});
				//console.log("metadata", $scope.assetMetadata);
				//console.log("meta list", $scope.metadataInfoList);
			}

			$scope.previouslyUploadedItemslastIndex = uploader.queue.length;
		};

		$scope.selectRow = function (row, image) {
			$scope.selectedRow = row;
			$scope.fileName = image.file.name;
			//store or remove selected row
			$scope.storeSelectedRow(image, false);
			var assetId = image.assetId;
			if ($scope.selectedRows.length == 1) {
				assetId = $scope.findAssetByAssetId($scope.selectedRows[0]).assetId;
			}
			for (var i = 0; i < $scope.metadataInfoList.length; i++) {
				if ($scope.metadataInfoList[i].assetId == assetId) {
					$scope.indexOfAsset = i;
					return;
				}
			}
			return $scope.indexOfAsset = 0;
		};

		$scope.removeAssetFromList = function (item) {
			console.log("Method", "removeAssetFromList- " + item.assetId);
			if ($scope.metadataInfoList.length > 0) {
				for (var i = 0; i < $scope.metadataInfoList.length; i++) {
					if ($scope.metadataInfoList[i].assetId == item.assetId) {
						$scope.metadataInfoList.splice(i, 1);
						if ($scope.previouslyUploadedItemslastIndex > 0) {
							$scope.previouslyUploadedItemslastIndex--;
						}
						break;
					}
				}
				if ($scope.selectedRows.length > 0) {
					var ids = $scope.selectedRows.indexOf(item.assetId);
					// is currently selected
					if (ids > -1) {
						$scope.selectedRows.splice(ids, 1);
					}
				}
				//delete asset from server also.
				removeAssetFromServer(item);
			}
			return {};
		}

		var removeAssetFromServer = function (asset) {
			if (!asset.isError && asset.isUploaded && typeof asset.correlationId != "undefined") {
				console.log("going to delete asset from server -", item);
				var promise = assetService.deleteAssetById(asset.correlationId);
				promise.then(function (returnData) {
					console.log(returnData);
					// successfully deleted;
				}, function (response) {
					// error
				});
			}
		};

		$scope.itemsInUploader = uploader.queue;

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
			$rootScope.$broadcast("hideFlyoutProgress");
		};

		$scope.$watchCollection('itemsInUploader', function () {
			$scope.fileName = uploader.queue.length > 0 ? uploader.queue[0].file.name : '';
		});

		$scope.saveDestination = function () {
			if ($scope.destinationLocationTree.currentNode) {
				$scope.metadataInfoList[$scope.indexOfAsset].destinationFolder = $scope.destinationLocationTree.currentNode.label;
			}
		};

		$scope.uploadImage = function () {
			$scope.IsUploadCompleted = false;

			if ($scope.IsSingleFileUpload) {
				//console.log("selected folder",$scope.selectedFolder );
				if ($scope.selectedFolder != '') {
					$scope.ShowProgressContainer = true;
					$scope.disabledDestinationFolder = true;
					$scope.ShowUploadControl = false;
					return true;
				}
				else {
					//alert("Please choose destination location");
					uploader.queue = [];
					toaster.pop("error", "Please choose a destination folder.");
					return false;
				}
			}
			else {
				$scope.ShowProgressContainer = true;
				$scope.disabledDestinationFolder = true;
				$scope.ShowUploadControl = false;

				//($scope.storeCurrentNode()!=='' || $scope.storeCurrentNode() !== 'undefined'? $scope.storeCurrentNode(): $scope.assetMetadata.destinationFolder)

				var currentFolder = '';

				if ($scope.storeCurrentNode()) {
					currentFolder = $scope.storeCurrentNode();
				}
				else if ($scope.selectedFolder != "") {
					currentFolder = $scope.selectedFolder;
				}

				if (currentFolder != "") {

					for (var i = $scope.previouslyUploadedItemslastIndex2 + 1; i < $scope.metadataInfoList.length; i++) {
						$scope.metadataInfoList[i].destinationFolder = $scope.selectedFolder;
					}

//          angular.forEach($scope.metadataInfoList, function (value, key) {
//            value.destinationFolder=$scope.selectedFolder;
//          });
				}
			}
		};

		$scope.startUploading = function () {

			var isMetaDataPropertiesEmpty = false;
			$('.singleFileErrorInfo').hide('fast');

			if ($scope.IsSingleFileUpload) {
				$scope.assetMetadata.destinationFolder = $scope.metadataInfoList[0].destinationFolder = $scope.selectedFolder;
				if ($scope.metadataInfoList[0].destinationFolder == "") {
					console.log("no destination folder");
					toaster.pop("error", "Please make sure your asset has a destination folder selected.");
				} else {

					// Fill asset meta data - single asset
					$scope.metadataInfoList[0].displayName = $scope.assetMetadata.displayName;
					$scope.metadataInfoList[0].advertiser = $scope.assetMetadata.advertiser;
					$scope.metadataInfoList[0].brand = $scope.assetMetadata.brand;
					$scope.metadataInfoList[0].agency = $scope.assetMetadata.agency;
					$scope.metadataInfoList[0].campaignName = $scope.assetMetadata.campaignName;
					$scope.metadataInfoList[0].dimension = $scope.assetMetadata.dimension;
					uploader.uploadAll();
				}
			}
			else {
				if ($scope.VerifyAssetHasDestinationFolder()) {
					uploader.uploadAll();
				}
			}
		};

		$scope.VerifyAssetHasDestinationFolder = function () {
			var isValid = true;
			if ($scope.selectedFolder == "") {
				for (var i = 0; i < $scope.metadataInfoList.length; i++) {
					var destinationFolder = $scope.metadataInfoList[i].destinationFolder;
					if (typeof destinationFolder === "undefined") {
						toaster.pop("error", "Please make sure all assets have a destination folder selected.");
						isValid = false;
						break;
					}
				}
			}
			else {
				for (var i = 0; i < $scope.metadataInfoList.length; i++) {
					var destinationFolder = $scope.metadataInfoList[i].destinationFolder;
					if (typeof destinationFolder === "undefined") {
						$scope.metadataInfoList[i].destinationFolder = $scope.selectedFolder;
					}
				}
			}
			return isValid;
		};

		$scope.removeImage = function () {
			$scope.ShowProgressContainer = false;
			$scope.ShowUploadControl = true;
			uploader.clearQueue()
		};

		$scope.back = function () {
			this.removeImage();
		};

		$scope.persistAssetMetaData = function () {
			$rootScope.uploadedAssets = $scope.metadataInfoList;
		};
		$scope.showAttachAd = function () {
			return true
		}
		$scope.closePopup = function () {

			if (uploader.isUploading) {
				$scope.flyLayout();
				return false;
			}

			if ($scope.IsUploadCompleted) {
				$scope.persistAssetMetaData();
				$scope.FlushObjects();

			}
			else {
				if ($scope.metadataInfoList.length > 0) {
					var confirmModal = window.confirm("Are you sure you want to close Upload Asset modal?");
					if (!confirmModal) {
						return false;
					}
					else {
						$scope.FlushObjects();
					}
				}
			}

			$modalInstance.dismiss('cancel');
			/*$modalInstance.close('test done return');*/
			$rootScope.$broadcast("hideFlyoutProgress");
		};

		// ADDING FILTERS

		uploader.filters.push(function (item) { // second user filter
			console.info('filter2');
			return true;
		});

		// REGISTER HANDLERS

		uploader.bind('afteraddingfile', function (event, item) {
			console.info('After adding a file', item);
			var isError = false;
			$('.singleFileErrorInfo').hide('fast');

			if ($scope.IsSingleFileUpload) {
				if (uploader.queue.length > 1) {
					isError = true;
					toaster.pop("error", "Only one file is allowed to be uploaded.");
					$('.singleFileErrorInfo').show('fast');
					//stay on initial screen and clear uploader queue
					$scope.ShowProgressContainer = false;
					$scope.disabledDestinationFolder = false;
					$scope.ShowUploadControl = true;
					uploader.queue = [];
					return false;
				}
			}

			if (!isError) {
				console.info('After adding a file', item);
				item.assetId = $scope.getUniqueId();
				if (uploader.queue.length == 1 || ($scope.ShowProgressContainer)) {
					if ($scope.IsSingleFileUpload) {
						uploader.queue.length !== 1 && uploader.queue.pop(); // only one file in the queue
					}
				}

				$scope.prepareAssetMetadata();
				$scope.uploadImage();
				$scope.IsAssetAttached = true;
			}

		});

		uploader.bind('whenaddingfilefailed', function (event, item) {
			console.info('When adding a file failed', item);
		});

		uploader.bind('afteraddingall', function (event, items) {
			console.info('After adding all files', items);
			$scope.IsUploadCompleted = false;
			doEmptyAllFileMetaObj();
		});

		uploader.bind('beforeupload', function (event, item) {
			console.info('Before upload', item);
			$scope.IsUploadCompleted = false;
		});

		uploader.bind('progress', function (event, item, progress) {
			console.info('Progress: ' + progress, item);
			console.log(item);
		});

		uploader.bind('success', function (event, xhr, item, response) {
			console.info('Success', xhr, item, response);
		});

		uploader.bind('cancel', function (event, xhr, item) {
			console.info('Cancel', xhr, item);
		});

		uploader.bind('error', function (event, xhr, item, response) {
			console.info('Error', xhr, item, response);
		});

		uploader.bind('complete', function (event, xhr, item, response) {
			console.info('Complete', xhr, item, response);

			/*	alert($scope.IsUploadCompleted);*/

			//TODO: Comment o
			// r delete below code when uploading to server
			/* BEGIN */
			/*var assetMetadata = $scope.findAssetByAssetId(item.assetId);
			 assetMetadata.isUploaded = true;

			 if($scope.IsSingleFileUpload)
			 {
			 $scope.assetMetadata.isUploaded = true;
			 }*/
			/* END */
			if (xhr.status === 200) {

				var rep = JSON.parse(response.files);
				var correlationId = rep[0].correlationId;

				// Send metadata info of Asset
				var assetMetadata = $scope.findAssetByAssetId(item.assetId);

				if ($scope.IsSingleFileUpload) {
					$scope.assetMetadata.isUploaded = true;
				}

				assetMetadata.correlationId = correlationId;
				assetMetadata.isUploaded = true;

				// New copy to pass data to server
				var data = angular.copy(assetMetadata);

				//remove UI-only properties
				delete data.assetId;
				delete data.isUploaded;

				//create upload ID list to use to return assets on attach to ad
				$scope.uploadIdList.push(correlationId);

				var promise = assetService.postAssetMetaData(data, correlationId);
				promise.then(function (returnData) {
					console.log(returnData);
					// successfully saved;
				}, function (response) {
					// error
				});
			}
		});

		uploader.bind('progressall', function (event, progress) {
			console.info('Total progress: ' + progress);
			$rootScope.$broadcast("uploaderProgress", uploader);
		});

		uploader.bind('completeall', function (event, items) {
			console.info('Complete all', items);
			$scope.IsUploadCompleted = true;
			doEmptyAllFileMetaObj();
		});
		// Treeview initialization

		$scope.showTreeControl = function () {
			if (uploader.isUploaded) {
				toaster.pop("error", "You can not change folder location of uploaded assets", "");
			}
			else if (uploader.isUploading) {
				toaster.pop("error", "You can not change folder location as uploading assets is in progress", "");
			}
			else {
				$scope.changeFolderOfAllAssets = true;
				var modalInstance = $modal.open({
					templateUrl: './adManagementApp/views/destinationModal.html',
					controller: 'DestinationCtrl',
					backdrop: 'static'
				});
			}

			/*$scope.filebrowseCssClass = 'col-sm-6';
			 $scope.showTree = true;*/
		};

		$scope.storeCurrentNode = function () {
			if ($scope.destinationLocationTree.currentNode) {
				$scope.selectedFolder = $scope.destinationLocationTree.currentNode.label;
				//console.log("selected folder", $scope.selectedFolder);
				if (uploader.queue.length > 0) {
					if ($scope.IsSingleFileUpload) {
						uploader.queue.length !== 1 && uploader.queue.pop(); // only one file in the queue
					}
					/* $scope.uploadImage();*/
				}
			}
			return $scope.selectedFolder;
		};

		// store image ids selected by checkboxes
		$scope.storeSelectedImages = function (id) {
			var ids = $scope.selectedImages.indexOf(id);
			// is currently selected
			if (ids > -1) {
				$scope.selectedImages.splice(ids, 1);
			}
			// is newly selected
			else {
				$scope.selectedImages.push(id);
			}
		};

		// store assets selected by checkboxes
		$scope.storeMultipleAssets = function (asset) {
			var ids = $scope.selectedImages.indexOf(asset);
			// is currently selected
			if (ids > -1) {
				$scope.selectedImages.splice(ids, 1);
			}
			// is newly selected
			else {
				$scope.selectedImages.push(asset);
			}
		};

		//store asset by row click for single select
		$scope.storeSingleAsset = function (index, asset) {
			//console.log("single select", index, asset);
			$scope.selectedImages[0] = asset;
			$scope.selectedIndex = index;
		}

		$scope.attachImagesToAd = function () {

			// TODO: ATTACH uploaded ASSET META to Ad

			$scope.persistAssetMetaData();

			//return selected and uploaded assets
			console.log("selected assets", $scope.selectedImages.length);
			console.log("uploaded assets", $scope.uploadIdList.length);

			if ($scope.uploadIdList.length > 0) {
				var uploadedAssets = [];
				$scope.uploadAssetList = [];

				//single service call using search --> use this OR above multiple get
				var assetSearchBody = { "searchText": "*", "page": 1, "itemsPerPage": 100, "indexVersion": 1, "fieldTerms": { "assetId": $scope.uploadIdList }};
				//console.log("asset search body", assetSearchBody);
				assetService.searchAssets(assetSearchBody).then(function (returnData) {
					$scope.uploadAssetList = returnData;
					//console.log("promise returned", $scope.uploadAssetList);
					//when data returned use it
					var combinedAssets = [];
					if ($scope.selectedImages.length > 0) {
						combinedAssets = $scope.selectedImages;
					} else if ($scope.uploadAssetList) {
						combinedAssets = $scope.uploadAssetList;
					}
					//console.log("return data", combinedAssets);
					$modalInstance.close(combinedAssets);				//return uploaded or selected assets
					$rootScope.$broadcast("hideFlyoutProgress");

					console.log("# select assets: ", $scope.selectedImages.length);
					console.log("# upload assets: ", $scope.uploadAssetList.length);
					if (combinedAssets.length > 0) {
						toaster.pop("success", "Successfully attached " + combinedAssets.length + " selected assets to ad.", "");
					} else {
						toaster.pop("error", "No selected assets attached to ad.", "");
					}

				}, function (response) {
					console.log('error', response);
				});
			} else if ($scope.selectedImages.length > 0) {
				//no upload just select

				$modalInstance.close($scope.selectedImages);				//return selected assets
				$rootScope.$broadcast("hideFlyoutProgress");

				console.log("# select assets: ", $scope.selectedImages.length);
				console.log("# upload assets: ", $scope.uploadAssetList.length);
				if ($scope.selectedImages.length > 0) {
					toaster.pop("success", "Successfully attached " + $scope.selectedImages.length + " assets to ad.", "");
				} else {
					toaster.pop("error", "No assets attached to ad.", "");
				}
			}

			/*$modalInstance.close($scope.selectedImages);				//return selected assets
			 $rootScope.$broadcast("hideFlyoutProgress");
			 console.log("# select assets: ", $scope.selectedImages.length);
			 console.log("# upload assets: ", $scope.upLoadList.length);
			 toaster.pop("success", "Successfully attached " + $scope.selectedImages.length + " assets to ad", "");*/

		}

		$scope.removeSelectedImages = function () {
			$scope.selectedImages = [];
		};

		$scope.ChangeElementColorOnClick = function (id, colorClass) {
			if ($scope.IsSingleFileUpload) {
				var ids = $scope.selectedImages.indexOf(id);
				// is currently selected
				if (ids > -1) {
					$scope.selectedImages.splice(ids, 1);
				}
				// is newly selected
				else {
					$scope.selectedImages = [];
					$scope.selectedImages.push(id);
				}
			}
		};

		$scope.flyLayout = function () {
			$rootScope.$broadcast("minimizePopup", uploader);
		};


		// store selected row from multiple file table selected by checkboxes
		$scope.storeSelectedRow = function (asset, isSelectAll) {
			var currentAssetId = asset.assetId;
			var ids = $scope.selectedRows.indexOf(currentAssetId);
			// is currently selected
			if (ids > -1 && isSelectAll == false) {
				$scope.selectedRows.splice(ids, 1);
			}
			// is newly selected
			else {
				if (isSelectAll) {
					if (ids == -1) {
						$scope.selectedRows.push(currentAssetId);
					}
				}
				else
					$scope.selectedRows.push(currentAssetId);
			}
			if (!isSelectAll)
				$scope.processAsset();
		};

		$scope.processAsset = function () {
			resetAssetMetaData();
			var asset = {};
			if (!$scope.showSelectTab) {
				if ($scope.selectedRows.length == 1) {
					asset = $scope.findAssetByAssetId($scope.selectedRows[0]);
					console.log("processAsset -assetId", asset.assetId)
					if (typeof asset.advertiserId != "undefined") {
						console.log("processAsset -asset.advertiserId", asset.advertiserId)
						if (asset.advertiserId == "") {
							$scope.selectedAdvertiser = {};
							$scope.assetMetadata.advertiser = "";
						}
						else {
							for (var index = 0; index < $scope.advertisers.length; index++) {
								var value = $scope.advertisers[index];
								if (value.id == asset.advertiserId) {
									$scope.selectedAdvertiser = value;
									$scope.assetMetadata.advertiser = "";
									break;
								}
							}
						}
					}
				}
				else {
					$scope.selectedAdvertiser = {};
				}

				if (typeof asset.brandId != "undefined") {
					if (asset.brandId == "") {
						$scope.selectedBrand = {};
						$scope.assetMetadata.brand = "";
					}
					else {
						for (var index = 0; index < $scope.brands.length; index++) {
							var value = $scope.brands[index];
							if (value.id == asset.brandId) {
								$scope.selectedBrand = value;
								$scope.assetMetadata.brand = "";
								break;
							}
						}
					}
				}
				else {
					$scope.selectedBrand = {};
				}
				if (typeof asset.campaignId != "undefined") {
					if (asset.campaignId == "") {
						$scope.selectedCampaign = {};
						$scope.assetMetadata.campaignName = "";
					}
					else {
						for (var index = 0; index < $scope.campaigns.length; index++) {
							var value = $scope.campaigns[index];
							if (value.id == asset.campaignId) {
								$scope.selectedCampaign = value;
								$scope.assetMetadata.campaignName = "";
								break;
							}
						}
					}
				}
				else {
					$scope.selectedCampaign = {};
				}
			}
			if ($scope.selectedRows.length > 1) {
				var assets = [];
				var displayNames = [];
				var advertisers = [];
				var brands = [];
				var agencies = [];
				var campaignNames = [];
				var campaignIds = [];
				for (var i = 0; i < $scope.selectedRows.length; i++) {
					asset = $scope.findAssetByAssetId($scope.selectedRows[i]);
					if (asset != 'undefined') {
						if (typeof asset.advertiserId == "undefined") {
							advertisers.push(undefined);
						}
						if (typeof asset.brandId == "undefined") {
							brands.push(undefined);
						}
						if (typeof asset.campaignId == "undefined") {
							campaignIds.push(undefined);
						}
						for (var prop in asset) {
							if (prop === 'advertiserId') {
								advertisers.push(asset[prop]);
							}
							if (prop === 'brandId') {
								brands.push(asset[prop]);
							}
							if (prop === 'agency') {
								agencies.push(asset[prop]);
							}
							if (prop === 'campaignId') {
								campaignIds.push(asset[prop]);
							}
							if (prop === 'displayName') {
								displayNames.push(asset[prop]);
							}
						}
					}
				}
				var areDisplayNamesEqual = $scope.AllValuesEqualInArray(displayNames);
				var areAdvertisersEqual = $scope.AllValuesEqualInArray(advertisers);
				var areBrandsEqual = $scope.AllValuesEqualInArray(brands);
				var areAgenciesEqual = $scope.AllValuesEqualInArray(agencies);
				var areCampaignIdsEqual = $scope.AllValuesEqualInArray(campaignIds);
				if (areDisplayNamesEqual) {
					$scope.assetMetadata.displayName = displayNames[0];
				}
				else {
					$scope.assetMetadata.displayName = $scope.multipleValues;
				}
				console.log("areAdvertisersEqual", advertisers, areAdvertisersEqual);
				if (areAdvertisersEqual) {

					if (typeof advertisers[0] == "undefined" || advertisers[0] == "") {
						console.log("empty entries in advertisers");
						$scope.selectedAdvertiser = {};
						$scope.assetMetadata.advertiser = "";
					}
					else {
						for (var index = 0; index < $scope.advertisers.length; index++) {
							var value = $scope.advertisers[index];
							if (value.id == advertisers[0]) {
								$scope.selectedAdvertiser = value;
								$scope.assetMetadata.advertiser = "";
								console.log("selectedAdvertiser", $scope.selectedAdvertiser);
								break;
							}
						}
					}
//					$scope.assetMetadata.advertiser = advertisers[0];
				}
				else {
					$scope.assetMetadata.advertiser = $scope.multipleValues;
				}
				console.log("areBrandsEqual", brands, areBrandsEqual);
				if (areBrandsEqual) {
					if (typeof brands[0] == "undefined" || brands[0] == "") {
						console.log("empty entries in brands");
						$scope.selectedBrand = {};
						$scope.assetMetadata.brand = "";
					}
					else {
						for (var index = 0; index < $scope.brands.length; index++) {
							var value = $scope.brands[index];
							if (value.id == brands[0]) {
								$scope.selectedBrand = value;
								$scope.assetMetadata.brand = "";
								console.log("selectedBrand", $scope.selectedBrand);
								break;
							}
						}
					}
//					$scope.assetMetadata.brand = brands[0];
				}
				else {
					$scope.assetMetadata.brand = $scope.multipleValues;
				}
				if (areAgenciesEqual) {
					$scope.assetMetadata.agency = agencies[0];
				}
				else {
					$scope.assetMetadata.agency = $scope.multipleValues;
				}
				console.log("areCampaignIdsEqual", campaignIds, areCampaignIdsEqual);
				if (areCampaignIdsEqual) {
					if (typeof campaignIds[0] == "undefined" || campaignIds[0] == "") {
						console.log("empty entries in campaign ids");
						$scope.selectedCampaign = {};
						$scope.assetMetadata.campaignName = "";
					}
					else {
						for (var index = 0; index < $scope.campaigns.length; index++) {
							var value = $scope.campaigns[index];
							if (value.id == campaignIds[0]) {
								$scope.selectedCampaign = value;
								$scope.assetMetadata.campaignName = "";
								console.log("selectedCampaign", $scope.selectedCampaign);
								break;
							}
						}
					}
//					$scope.assetMetadata.campaignName = campaignNames[0];
				}
				else {
					$scope.assetMetadata.campaignName = $scope.multipleValues;
				}
			}
			else {
//				if ($scope.selectedRows.length > 1) {
//					var assets = [];
//					var displayNames = [];
//					var advertisers = [];
//					var brands = [];
//					var products = [];
//					var campaignNames = [];
//					for (var i = 0; i < $scope.selectedRows.length; i++) {
//						asset = $scope.findAssetByAssetId($scope.selectedRows[i]);
//						if (asset != 'undefined') {
//							for (var prop in asset) {
//								if (prop === 'advertiser') {
//									advertisers.push(asset[prop]);
//								}
//								if (prop === 'brand') {
//									brands.push(asset[prop]);
//								}
//								if (prop === 'product') {
//									products.push(asset[prop]);
//								}
//								if (prop === 'campaignName') {
//									campaignNames.push(asset[prop]);
//								}
//								if (prop === 'displayName') {
//									displayNames.push(asset[prop]);
//								}
//							}
//						}
//					}
//					var areDisplayNamesEqual = $scope.AllValuesEqualInArray(displayNames);
//					var areAdvertisersEqual = $scope.AllValuesEqualInArray(advertisers);
//					var areBrandsEqual = $scope.AllValuesEqualInArray(brands);
//					var areProductsEqual = $scope.AllValuesEqualInArray(products);
//					var areCampaignNamesEqual = $scope.AllValuesEqualInArray(campaignNames);
//					if (areDisplayNamesEqual) {
//						$scope.assetMetadata.displayName = displayNames[0];
//					}
//					else {
//						$scope.assetMetadata.displayName = $scope.multipleValues;
//					}
//					if (areAdvertisersEqual) {
//						$scope.assetMetadata.advertiser = advertisers[0];
//					}
//					else {
//						$scope.assetMetadata.advertiser = $scope.multipleValues;
//					}
//					if (areBrandsEqual) {
//						$scope.assetMetadata.brand = brands[0];
//					}
//					else {
//						$scope.assetMetadata.brand = $scope.multipleValues;
//					}
//					if (areProductsEqual) {
//						$scope.assetMetadata.product = products[0];
//					}
//					else {
//						$scope.assetMetadata.product = $scope.multipleValues;
//					}
//					if (areCampaignNamesEqual) {
//						$scope.assetMetadata.campaignName = campaignNames[0];
//					}
//					else {
//						$scope.assetMetadata.campaignName = $scope.multipleValues;
//					}
//				}
			}
		}
		;

		var resetAssetMetaData = function () {
			console.log("resetAssetMetaData");
			$scope.assetMetadata.campaignName = "";
			$scope.assetMetadata.advertiser = "";
			$scope.assetMetadata.brand = "";
			$scope.assetMetadata.agency = "";
			$scope.assetMetadata.displayName = "";
		};

//change meta data if user changes meta data fields during multiple selection
		$scope.setMetaData = function (event) {
			if ($scope.selectedRows.length > 1) {
				var propertyToSet = $(event.target).attr('name');
				//dont change metadata of those assets which are already uploaded.
				var alreadyUploadedAsset = $scope.alreadyUploadedAsset();
				for (var i = 0; i < $scope.selectedRows.length; i++) {
					var asset = $scope.findAssetByAssetId($scope.selectedRows[i]);
					if (asset && alreadyUploadedAsset.indexOf(asset.assetId) == -1) {
						for (var prop in asset) {
							if (prop === propertyToSet) {
								if ($scope.assetMetadata[propertyToSet] != "MultipleValues") {
									asset[prop] = $scope.assetMetadata[propertyToSet];
								}
							}
						}
					}
				}
			}
		}

//to check all values are same in array
		$scope.AllValuesEqualInArray = function (array) {
			return !array.some(function (value, index, array) {
				return value !== array[0];
			});
		}

		$scope.isMultipleAssetsSelected = function () {
			return $scope.selectedRows.length > 1;
		};


		$scope.findIndexOfAssetByAssetId = function (assetId) {
			var assetIndex = null;
			if ($scope.metadataInfoList.length > 0) {
				for (var i = 0; i < $scope.metadataInfoList.length; i++) {
					if ($scope.metadataInfoList[i].assetId == assetId) {
						assetIndex = i;
						break;
					}
				}
			}
			return assetIndex;
		}

		$scope.openDestinationFolderTreePopup = function (assetId) {
			$scope.indexOfAsset = $scope.findIndexOfAssetByAssetId(assetId);
			$rootScope.isFolderLinkClicked = true;
			var asset = $scope.findAssetByAssetId(assetId);
			var isUploading = false;
			var isUploaded = false;
			for (var i = 0; i < uploader.queue.length; i++) {
				var item = uploader.queue[i];
				if (item.assetId == asset.assetId) {
					if (!asset.isError && asset.isUploaded && typeof asset.correlationId != "undefined") {
						isUploaded = true;
						break;
					}
					else if (item.isUploading) {
						isUploading = true;
						break;
					}
				}
			}
			if (isUploaded) {
				toaster.pop("error", "You can not change folder location of uploaded assets", "");
				return false;
			}
			else if (isUploading) {
				toaster.pop("error", "You can not change folder location of asset when uploading is in progress", "");
				return false;
			}
			$scope.changeFolderOfAllAssets = false;
			var modalInstance = $modal.open({
				templateUrl: './adManagementApp/views/destinationModal.html',
				controller: 'DestinationCtrl',
				backdrop: 'static'
			});
		};

//		$scope.openDestinationFolderTreePopup = function (assetIndex) {
//			$scope.indexOfAsset = assetIndex;
//			$rootScope.isFolderLinkClicked = true;
//			var asset = $scope.metadataInfoList[assetIndex];
//			var isUploading = false;
//			var isUploaded = false;
//			for (var i = 0; i < uploader.queue.length; i++) {
//				var item = uploader.queue[i];
//				if (item.assetId == asset.assetId) {
//					if (!asset.isError && asset.isUploaded && typeof asset.correlationId != "undefined") {
//						isUploaded = true;
//						break;
//					}
//					else if (item.isUploading) {
//						isUploading = true;
//						break;
//					}
//				}
//			}
//			if (isUploaded) {
//				toaster.pop("error", "You can not change folder location of uploaded assets", "");
//				return false;
//			}
//			else if (isUploading) {
//				toaster.pop("error", "You can not change folder location of asset when uploading is in progress", "");
//				return false;
//			}
//			$scope.changeFolderOfAllAssets = false;
//			var modalInstance = $modal.open({
//				templateUrl: './adManagementApp/views/destinationModal.html',
//				controller: 'DestinationCtrl',
//				backdrop: 'static'
//			});


//		};

		$scope.selectAll = function ($event) {
			for (var i = 0; i < $scope.metadataInfoList.length; i++) {
				$scope.storeSelectedRow($scope.metadataInfoList[i], true);
			}
			if ($scope.metadataInfoList.length > 0)
				$scope.processAsset();
		};

		$scope.FlushObjects = function () {
			$scope.metadataInfoList = [];
			$scope.selectedRows = [];
			$scope.selectedFolder = '';
			$scope.assetMetadata = {};
			$rootScope.selectedDestinationFolder = '';
		};
//get assets which have been uploaded.
		$scope.alreadyUploadedAsset = function () {
			var alreadyUploadedAsset = [];
			for (var i = 0; i < uploader.queue.length; i++) {
				var item = uploader.queue[i];
				if (item.isUploaded && typeof item.correlationId != "undefined") {
					alreadyUploadedAsset.push(item.assetId);
				}
			}
			return alreadyUploadedAsset;
		}

		$scope.safeApply = function (fn) {
			var phase = this.$root.$$phase;
			if (phase == '$apply' || phase == '$digest') {
				if (fn && (typeof(fn) === 'function')) {
					fn();
				}
			} else {
				this.$apply(fn);
			}
		};

//cancel all
		$scope.cancelAllUploading = function () {
			console.log("cancel all uploading");
			for (var i = 0; i < uploader.queue.length; i++) {
				var item = uploader.queue[i];
				if (!item.isUploading) {
					$scope.removeAssetFromList(item);
				}
				if (item.isUploading) {
					item.cancel();
				}
			}
			uploader.queue = [];
			$scope.FlushObjects();
			uploader.cancelAll();
		}

		$scope.clearAll = function ($event) {
			$scope.selectedRows = [];
		};
		$rootScope.getTotalAssetsToUpload = function () {
			var assetCount = 0;
			for (var i = 0; i < uploader.queue.length; i++) {
				var item = uploader.queue[i];
				if (!item.isUploaded && typeof item.correlationId == "undefined") {
					assetCount++;
				}
			}
			return assetCount;
		};

		$scope.dontHighLightRow = function () {
			$rootScope.isFolderLinkClicked = true;
		};

		$scope.closeModel = function () {
			var modalInstance = $modal.open({
				templateUrl: './adManagementApp/views/closeUploadAssetModel.html',
				controller: 'closeUploadAssetModelCtrl'
			});
		};

		$scope.$on("DismissModel", function (event, data) {
			uploader.cancelAll();
			$modalInstance.dismiss('cancel');
		});

		$scope.getFileTypeIcon = function (file) {
			var type = file.type;
			console.log("cfw file type", file.type);
			if (type.indexOf('image') != -1) {
				return "fa fa-file-image-o";
			}
			else if (type.indexOf('video') != -1) {

				return "fa fa-file-video-o";
			}
			else {
				return "fa fa-file-o";
			}
		};

		$scope.$watch("metadataInfoList", function () {
			for (var i = 0; i < $scope.metadataInfoList.length; i++) {
				var asset = $scope.metadataInfoList[i];
				if (!asset.isUploaded && typeof asset.correlationId == "undefined") {
					for (var index = 0; index < uploader.queue.length; index++) {
						var item = uploader.queue[index];
						if (asset.assetId == item.assetId) {
							item.destinationFolder = asset.destinationFolder;
							item.icon = $scope.getFileTypeIcon(item.file);
							break;
						}
					}
				}
			}
			prepareGridItems();
		}, true);
	}
])
;