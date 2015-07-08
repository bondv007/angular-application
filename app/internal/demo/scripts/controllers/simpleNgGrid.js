/**
 * Created by atdg on 5/30/2014.
 */
app.controller('simpleNgGridCtrl', ['$scope', '$rootScope', 'enums', 'EC2Restangular', 'EC2AMSRestangular', 'mmAlertService',
	function ($scope, $rootScope, enums, EC2Restangular, EC2AMSRestangular, mmAlertService) {

	//NOTE: simpleNGGrid demo refactored for ng-grid to implement infinite scroll

		var mockMDX2Ads = [
			{"itemType": "MDX2AD", "id": "22784672", "name": "Toyotathon_default", "metadataTags": [
				{"type": "APIMetadataTag", "id": "HRA0HT", "tagType": "SYSTEM", "name": "Sys Tag1", "color": "yellow"},
				{"type": "APIMetadataTag", "id": "HRA0HU", "tagType": "SYSTEM", "name": "Sys Tag 2", "color": "blue"}
			], "width": 300, "height": 250, "defaultImage": "https://secure-ds.serving-sys.com/BurstingRes/Site-83864/Thumbnails/64341eaf-2b97-48bc-a55d-65b4e634e667.jpeg", "displayTag": "<script type='text/javascript' src='http://bs.preview.serving-sys.com/BurstingPipe/adServer.bs?cn=rsb&amp;c=28&amp;pli=&amp;PluID=0&amp;pr=1&amp;ai=22784672&amp;w=300&amp;h=250&amp;ord=&amp;p=&amp;npu=$$$$&amp;ncu=$$$$'></script>", "additionalMetadata": {"adType": "PoliteBanner", "size": "478"}},
			{"itemType": "MDX2AD", "id": "22780673", "name": "TC_180x150_2", "metadataTags": [
				{"type": "APIMetadataTag", "id": "HRA0HT", "tagType": "SYSTEM", "name": "Sys Tag1", "color": "yellow"}
			], "width": 180, "height": 150, "defaultImage": "https://secure-ds.serving-sys.com/BurstingRes/Site-12932/Thumbnails/thumb_9a2f074f-319f-428e-b2d8-541deb0ae8ff.jpeg", "displayTag": "<script type='text/javascript' src='http://bs.preview.serving-sys.com/BurstingPipe/adServer.bs?cn=rsb&amp;c=28&amp;pli=&amp;PluID=0&amp;pr=1&amp;ai=22780673&amp;w=180&amp;h=150&amp;ord=&amp;p=&amp;npu=$$$$&amp;ncu=$$$$'></script>", "additionalMetadata": {"adType": "PoliteBanner", "size": "123"}},
			{"itemType": "MDX2AD", "id": "22780671", "name": "TC_300x250_3", "metadataTags": [
				{"type": "APIMetadataTag", "id": "HRA0HW", "tagType": "SYSTEM", "name": "Sys Tag 3", "color": "red"}
			], "width": 300, "height": 250, "defaultImage": "https://secure-ds.serving-sys.com/BurstingRes/Site-12932/Thumbnails/thumb_c367e381-4b1e-4710-8a0b-dd2ae4fa97d2.jpeg", "displayTag": "<script type='text/javascript' src='http://bs.preview.serving-sys.com/BurstingPipe/adServer.bs?cn=rsb&amp;c=28&amp;pli=&amp;PluID=0&amp;pr=1&amp;ai=22780671&amp;w=300&amp;h=250&amp;ord=&amp;p=&amp;npu=$$$$&amp;ncu=$$$$'></script>", "additionalMetadata": {"adType": "PoliteBanner", "size": "442"}},
			{"itemType": "MDX2AD", "id": "22805056", "name": "EnterpriseIT970x90", "metadataTags": [
				{"type": "APIMetadataTag", "id": "HRA0HU", "tagType": "SYSTEM", "name": "Sys Tag 2", "color": "blue"}
			], "width": 970, "height": 90, "defaultImage": "https://secure-ds.serving-sys.com/BurstingRes/Site-845/Thumbnails/thumb_59179a96-cd88-441b-afe9-e4181c101d7b.jpeg", "displayTag": "<script type='text/javascript' src='http://bs.preview.serving-sys.com/BurstingPipe/adServer.bs?cn=rsb&amp;c=28&amp;pli=&amp;PluID=0&amp;pr=1&amp;ai=22805056&amp;w=970&amp;h=90&amp;ord=&amp;p=&amp;npu=$$$$&amp;ncu=$$$$'></script>", "additionalMetadata": {"adType": "PoliteBanner", "size": "135"}},
			{"itemType": "MDX2AD", "id": "22784682", "name": "Toyotathon_default", "metadataTags": [
				{"type": "APIMetadataTag", "id": "HRA0HT", "tagType": "SYSTEM", "name": "Sys Tag1", "color": "yellow"},
				{"type": "APIMetadataTag", "id": "HRA0HU", "tagType": "SYSTEM", "name": "Sys Tag 2", "color": "blue"}
			], "width": 300, "height": 250, "defaultImage": "https://secure-ds.serving-sys.com/BurstingRes/Site-83864/Thumbnails/64341eaf-2b97-48bc-a55d-65b4e634e667.jpeg", "displayTag": "<script type='text/javascript' src='http://bs.preview.serving-sys.com/BurstingPipe/adServer.bs?cn=rsb&amp;c=28&amp;pli=&amp;PluID=0&amp;pr=1&amp;ai=22784672&amp;w=300&amp;h=250&amp;ord=&amp;p=&amp;npu=$$$$&amp;ncu=$$$$'></script>", "additionalMetadata": {"adType": "PoliteBanner", "size": "478"}},
			{"itemType": "MDX2AD", "id": "22780683", "name": "TC_180x150_2", "metadataTags": [
				{"type": "APIMetadataTag", "id": "HRA0HT", "tagType": "SYSTEM", "name": "Sys Tag1", "color": "yellow"}
			], "width": 180, "height": 150, "defaultImage": "https://secure-ds.serving-sys.com/BurstingRes/Site-12932/Thumbnails/thumb_9a2f074f-319f-428e-b2d8-541deb0ae8ff.jpeg", "displayTag": "<script type='text/javascript' src='http://bs.preview.serving-sys.com/BurstingPipe/adServer.bs?cn=rsb&amp;c=28&amp;pli=&amp;PluID=0&amp;pr=1&amp;ai=22780673&amp;w=180&amp;h=150&amp;ord=&amp;p=&amp;npu=$$$$&amp;ncu=$$$$'></script>", "additionalMetadata": {"adType": "PoliteBanner", "size": "123"}},
			{"itemType": "MDX2AD", "id": "22780681", "name": "TC_300x250_3", "metadataTags": [
				{"type": "APIMetadataTag", "id": "HRA0HW", "tagType": "SYSTEM", "name": "Sys Tag 3", "color": "red"}
			], "width": 300, "height": 250, "defaultImage": "https://secure-ds.serving-sys.com/BurstingRes/Site-12932/Thumbnails/thumb_c367e381-4b1e-4710-8a0b-dd2ae4fa97d2.jpeg", "displayTag": "<script type='text/javascript' src='http://bs.preview.serving-sys.com/BurstingPipe/adServer.bs?cn=rsb&amp;c=28&amp;pli=&amp;PluID=0&amp;pr=1&amp;ai=22780671&amp;w=300&amp;h=250&amp;ord=&amp;p=&amp;npu=$$$$&amp;ncu=$$$$'></script>", "additionalMetadata": {"adType": "PoliteBanner", "size": "442"}},
			{"itemType": "MDX2AD", "id": "22805086", "name": "EnterpriseIT970x90", "metadataTags": [
				{"type": "APIMetadataTag", "id": "HRA0HU", "tagType": "SYSTEM", "name": "Sys Tag 2", "color": "blue"}
			], "width": 970, "height": 90, "defaultImage": "https://secure-ds.serving-sys.com/BurstingRes/Site-845/Thumbnails/thumb_59179a96-cd88-441b-afe9-e4181c101d7b.jpeg", "displayTag": "<script type='text/javascript' src='http://bs.preview.serving-sys.com/BurstingPipe/adServer.bs?cn=rsb&amp;c=28&amp;pli=&amp;PluID=0&amp;pr=1&amp;ai=22805056&amp;w=970&amp;h=90&amp;ord=&amp;p=&amp;npu=$$$$&amp;ncu=$$$$'></script>", "additionalMetadata": {"adType": "PoliteBanner", "size": "135"}}
		];
		var mockTags = [
			{"type": "APIMetadataTag", "id": "HRA0HT", "tagType": "SYSTEM", "name": "Sys Tag 1", "color": "yellow"},
			{"type": "APIMetadataTag", "id": "HRA0HU", "tagType": "SYSTEM", "name": "Sys Tag 2", "color": "blue"},
			{"type": "APIMetadataTag", "id": "HRA0HW", "tagType": "SYSTEM", "name": "Sys Tag 3", "color": "red"}
		];

		$scope.ads = [];
		$scope.tags = [];
		$scope.searchCriteria = {search: ''};
		var additionalAdProp = function (ad) {
			ad.showCommentBox = false;
			ad.showAdDetailBox = false;
			//properties for Grid view
			ad.showCommentBoxOnGridView = false;
			ad.isChecked = false;
			//properties for Live view
			ad.showCommentBoxOnLiveView = false;
			ad.isHide = false;
			ad.isCheckedOnLiveView = false;
			ad.showAdDetailBoxOnLiveView = false;
			ad.showAddTagContainer = false;
			ad.showMoreTagsContainer = false;
			ad.isCreateNewClicked = false;
			ad.playAd = true;
			ad.iconClass = "fa-plus";
			ad.maxTagToVisible = 2;
			ad.placement = ad.placement ? enums.placementStatuses.getName(ad.placement.id) : '';
			ad.dimension = ad.defaultImage.asset.dimensions;
			ad.clickthrough = (ad.defaultImageClickthrough) ? ad.defaultImageClickthrough.url : '';
			var dimensions = ad.dimension.split('X');
			if (typeof dimensions != "undefined" && dimensions.length > 1) {
				ad.imageHeight = _.parseInt(dimensions[1]);
				ad.imageWidth = _.parseInt(dimensions[0]);
			}
			else {
				ad.imageHeight = 0;
				ad.imageWidth = 0;
			}
		};

		/*$scope.searchOptions = {
			mediaType: 0,
			mediaTypeLabel: "image"
		}
		$scope.searchOptions.mediaTypeList = [
			{"name": "image", "id": 0},
			{"name": "video", "id": 1},
			{"name": "flash", "id": 2},
			{"name": "audio", "id": 3}
		];*/

		$scope.filterOptions = {
			filterText: "",
			useExternalFilter: true
		};

		$scope.totalServerItems = 0;
		/*$scope.pagingOptions = {
			pageSizes: [50, 100, 200],
			pageSize: 50,
			currentPage: 1
		};*/

		$scope.getPagedDataAsync = function (pageSize, page, searchText, mediaType) {
			setTimeout(function () {
				var data;
				var ft = "*";
				var pageSearchBody = {"searchText": "*", "page": 1, "itemsPerPage": 50, "indexVersion": 1, "assetType": "source", "currentVersion": true};
				if (searchText) {
					ft = searchText.toLowerCase();
				}

				$scope.pagedAssets = [];
				//var serverSearchAssets = EC2Restangular.all('assetMgmt/search'); 		//not working for POSTs right now
				var serverSearchAssets = EC2AMSRestangular.all('assetMgmt/search');

				if (mediaType) {
					pageSearchBody = {"searchText": ft, "page": page, "itemsPerPage": pageSize, "indexVersion": 1, "assetType": "source", "currentVersion": true, "fieldTerms": {"mediaType": [mediaType]}};
				} else {
					pageSearchBody = {"searchText": ft, "page": page, "itemsPerPage": pageSize, "indexVersion": 1, "assetType": "source", "currentVersion": true };
				}
				console.log("search body", pageSearchBody);
				serverSearchAssets.post(pageSearchBody).then(function (data) {
					$scope.pagedAssets = data.entity;
					$scope.totalServerItems = data.total;
					console.log("paged assets + total assets", $scope.pagedAssets.length, $scope.totalServerItems);
				}, processError);
			}, 100);
		};

		//get first page
		$scope.selectedItems = [];
		//init data calls
		fetchTags();
		fetchAds();
		//$scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, "*", $scope.searchOptions.mediaTypeLabel);

		/*$scope.$watch('pagingOptions', function (newVal, oldVal) {
			if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
				$scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText, $scope.searchOptions.mediaTypeLabel);
			}
		}, true);
		$scope.$watch('filterOptions', function (newVal, oldVal) {
			if (newVal !== oldVal) {
				$scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText, $scope.searchOptions.mediaTypeLabel);
			}
		}, true);
		$scope.$watch('searchOptions', function (newVal, oldVal) {
			if (newVal !== oldVal) {
				$scope.searchOptions.mediaTypeLabel = $scope.searchOptions.mediaTypeList[$scope.searchOptions.mediaType]['name'];
				$scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText, $scope.searchOptions.mediaTypeLabel);
			}
		}, true);*/

		function fetchTags() {
			$scope.tags = mockTags;
		}

		function fetchAds() {
			prepareMockAds();
		}

		function prepareMockAds() {
			convertPreviewItemsToAdModel(mockMDX2Ads);
			attachCustomPropertiesToAdObject();
			$scope.showSpinner = false;
		}

		function convertPreviewItemsToAdModel(items) {
			for (var i = 0; i < items.length; i++) {
				var model = {
					type: items[i].additionalMetadata.adType,
					id: items[i].id,
					name: items[i].name,
					adFormat: items[i].additionalMetadata.adType,
					size: items[i].additionalMetadata.size,
					clickthrough: items[i].additionalMetadata.clickThrough,
					masterAdId: items[i].additionalMetadata.masterAdId,
					segment: items[i].additionalMetadata.segment,
					defaultImage: {
						asset: {
							dimensions: items[i].width + "X" + items[i].height,
							url: items[i].defaultImage
						}
					},
					displayTag: items[i].displayTag,
					tags: []
				}
				if (items[i].metadataTags != undefined) {
					for (var j = 0; j < items[i].metadataTags.length; j++) {
						var tag = {
							id: items[i].metadataTags[j].id,
							tagName: items[i].metadataTags[j].name,
							tagColor: items[i].metadataTags[j].color,
							toolTip: items[i].metadataTags[j].name,
							isColorTag: false,
							isClicked: false,
							toggleClick: function () {
								this.isClicked = !this.isClicked;
							}
						}
						model.tags.push(tag);
					}
				}
				$scope.ads.push(model);
			}
		}

		function attachCustomPropertiesToAdObject() {
			for (var index = 0; index < $scope.ads.length; index++) {
				var ad = $scope.ads[index];
				var additionalAdProperties = new additionalAdProp(ad);
				_.extend(true, ad, additionalAdProperties);
			}
		}

		$scope.clearSearch = function () {
			$scope.searchCriteria.search = '';
		};

		$scope.searchByTag = function (tag) {
			console.log("tag search clicked", tag);
			$scope.searchCriteria.search = tag.isClicked ? tag.tagName : '';
			clearOrHighlightSelectedTags($scope.ads, tag.tagName, true);
		};

		function clearOrHighlightSelectedTags(ads, tagName, isSelected) {
			console.log("tag action");
		}

		var tagTemplate = '<ul class="tags"><li tooltip="{{tag.toolTip}}" ng-repeat="tag in row.entity[col.field]"><a ng-click="tag.toggleClick();searchByTag(tag)" data-ng-class="{active:tag.isClicked}" class="color-{{tag.tagColor}}"><i class="fa fa-tag"></i> {{tag.tagName}}</a></li></ul>'
		//var tagTemplate = "<ul class='tags'> <li tooltip='{{tag.toolTip}}' ng-repeat='tag in ad.tags'><a ng-click='tag.toggleClick();searchByTag(tag)' data-ng-class='{\"active\":tag.isClicked}' class='color-{{tag.tagColor}}'><i class='fa fa-tag'></i> {{tag.tagName}}</a></li></ul>"
		var thumbTemplate = '<div class="centeredImage"><img ng-src="{{row.entity[col.field]}}" height="50" align="center" lazy-src ></div>';

		$scope.gridOptions = {
			data: 'ads',
			columnDefs: [
				{field: 'name', displayName: 'Name'},
				{field: 'id', displayName: 'Id'},
				{field: 'defaultImage.asset.url', displayName: 'Thumbnail', cellTemplate: thumbTemplate },
				{field: 'dimension', displayName: 'Dimension'},
				{field: 'adFormat', displayName: 'Status'},
				{field: 'tags', displayName: 'Tags', cellTemplate: tagTemplate }
			],
			showFooter: true,
			enableSorting: true,
			enablePaging: false,
			selectedItems: $scope.selectedItems,
			totalServerItems: 'totalServerItems',
			/*pagingOptions: $scope.pagingOptions,*/
			filterOptions: $scope.filterOptions,
			rowHeight: 60,
			headerRowHeight: 34
		};

		//infinite scroll with mmGrid directive

		$scope.searchOptionsDirective = {
			mediaType: 0,
			mediaTypeLabel: "image"
		}
		$scope.searchOptionsDirective.mediaTypeList = [
			{"name": "image", "id": 0},
			{"name": "video", "id": 1},
			{"name": "flash", "id": 2},
			{"name": "audio", "id": 3}
		];

		$scope.filterOptionsDirective = {
			filterText: ""
		};

		$scope.totalServerItemsDirective = 0;
		$scope.pagingOptionsDirective = {
			pageSizes: [50, 100, 200],
			pageSize: 100,
			currentPage: 1
		};

		$scope.resetAssetsDS = function () {
			$scope.gettingDataDS = false;
			$scope.pagingOptionsDirective.currentPage = 1;
			$scope.pagedAssetsDirective.length = 0;
			$scope.totalClientItemsDirective = 0;
			$scope.totalServerItemsDirective = 0;
			$scope.itemDS = {selectedItems: []};
			$scope.lastPageDS = false;
			$scope.isResetDS = true;
			$scope.filteredItemCount = "";
		}

		$scope.getPagedDataAsyncDirective = function (pageSize, page, searchText, mediaType) {
			$scope.gettingDataDS = true;
			setTimeout(function () {
				var data;
				var ft = "*";
				var pageSearchBody = {"searchText": "*", "page": 1, "itemsPerPage": 200, "indexVersion": 1, "assetType": "source", "currentVersion": true};
				if (searchText) {
					ft = searchText.toLowerCase();
				}

				//var serverSearchAssets = EC2Restangular.all('assetMgmt/search');		//not working for POSTs right now
				var serverSearchAssets = EC2AMSRestangular.all('assetMgmt/search');

				if (mediaType) {
					pageSearchBody = {"searchText": ft, "page": page, "itemsPerPage": pageSize, "indexVersion": 1, "assetType": "source", "currentVersion": true, "fieldTerms": {"mediaType": [mediaType]}};
				} else {
					pageSearchBody = {"searchText": ft, "page": page, "itemsPerPage": pageSize, "indexVersion": 1, "assetType": "source", "currentVersion": true };
				}
				var allClientAssets = [];
				serverSearchAssets.post(pageSearchBody).then(function (data) {
					//concat new data to end of client data
					allClientAssets.push.apply(allClientAssets, $scope.pagedAssetsDirective);
					allClientAssets.push.apply(allClientAssets, data.entity);
					$scope.pagedAssetsDirective = allClientAssets;
					$scope.totalClientItemsDirective = $scope.pagedAssetsDirective.length;
					$scope.totalServerItemsDirective = data.total;
					$scope.pageCountDS = Math.ceil($scope.totalServerItemsDirective/$scope.pagingOptionsDirective.pageSize);
					if ($scope.pagingOptionsDirective.currentPage >= $scope.pageCountDS) {
						$scope.lastPageDS = true;
					}
					console.log("paged assets + total assets + client assets", $scope.pagedAssetsDirective.length, $scope.totalServerItemsDirective, $scope.totalClientItemsDirective);
					$scope.gettingDataDS = false;
				}, processError);
			}, 100);
		};

		//get first page
		$scope.gettingDataDS = false;
		$scope.pagedAssetsDirective = [];
		$scope.itemDS = {selectedItems: []};
		$scope.lastPageDS = false;
		$scope.isResetDS = false;
		$scope.filteredItemCount = "";
		$scope.getPagedDataAsyncDirective($scope.pagingOptionsDirective.pageSize, $scope.pagingOptionsDirective.currentPage, "*", $scope.searchOptionsDirective.mediaTypeLabel);

		$scope.$watch('pagingOptionsDirective', function (newVal, oldVal) {
			if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
				if ($scope.pagingOptionsDirective.currentPage > 1) {
					$scope.getPagedDataAsyncDirective($scope.pagingOptionsDirective.pageSize, $scope.pagingOptionsDirective.currentPage, "*", $scope.pagingOptionsDirective.mediaTypeLabel);
				}
			}
		}, true);
		$scope.$watch('searchOptionsDirective.mediaType', function (newVal, oldVal) {
			if (newVal !== oldVal && !$scope.isReset) {
				$scope.resetAssetsDS();
				$scope.searchOptionsDirective.mediaTypeLabel = $scope.searchOptionsDirective.mediaTypeList[$scope.searchOptionsDirective.mediaType]['name'];
				$scope.getPagedDataAsyncDirective($scope.pagingOptionsDirective.pageSize, $scope.pagingOptionsDirective.currentPage, "*", $scope.searchOptionsDirective.mediaTypeLabel);
				$scope.isResetDS = false;
			}
		}, true);

		$scope.scrollBottomEvent = function (gridId) {
			console.log("scroll event - passed paging function", $scope.pagingOptionsDirective.currentPage, gridId);
			if (!$scope.gettingDataDS && !$scope.lastPageDS) {
				$scope.gettingDataDS = true;
				$scope.pagingOptionsDirective.currentPage++;
			} else if ($scope.gettingDataDS) {
        mmAlertService.addWarning("Already retrieving next data chunk.");
			}
		};

		$scope.columnDefsDS = [
			{field: 'id', displayName: 'ID'},
			{field: 'title', displayName: 'Name'},
			{field: 'thumbnails', displayName: 'Thumbnail', gridControlType: enums.gridControlType.getName("ImageNoHover"), cellTemplate: '<div class="centeredImage"><img ng-src="{{row.entity[col.field][0].url}}" height="50" align="center" lazy-src ></div>'},
			{field: 'type', displayName: 'Type'},
			{field: 'mediaType', displayName: 'Media Type'},
			{field: 'status', displayName: 'Status'},
			{field: 'formatContext.fileSize', displayName: 'File Size'},
			{field: 'formatContext.format', displayName: 'Format'}
		];

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
	}]);