/**
 * Created by atdg on 3/27/2014.
 */
'use strict';
app.controller('uploadAssetCtrl', ['$scope', '$modal', '$modalInstance', 'FileUploader', '$rootScope', 'adService', 'enums', 'mmSession', 'assetService', 'EC2Restangular', 'EC2AMSRestangular', 'mmAlertService', '$filter', 'creativeConsts', '$timeout', 'adValidator', 'adDetailsForUpload', 'assetsLibraryService', 'mmMediaTypeIconService',
    function($scope, $modal, $modalInstance, FileUploader, $rootScope, adService, enums, session, assetService, EC2Restangular, EC2AMSRestangular, mmAlertService, $filter, creativeConsts, $timeout, adValidator, adDetailsForUpload, assetsLibraryService, mmMediaTypeIconService) {

        // define data service urls
        var postAssetMetaDataUrl = 'mediaPrep/updateMetadataByCorrelationId/';
        var serverUpdateFolderPath = 'assetMgmt/folders/';
        var serverAssets = EC2Restangular.all('assetMgmt');
        var serverPostAssetMetadata = EC2AMSRestangular.all('mediaPrep/updateMetadataByCorrelationId/');
        var serverSearchAssets = EC2AMSRestangular.all('assetMgmt/search');
        var serverGetFolders = EC2Restangular.all('assetMgmt/folders');
        var serverPostFolders = EC2AMSRestangular.all('assetMgmt/folders');

        // create a uploader with options
        $scope.IsSingleFileUpload = adDetailsForUpload['isSingleFileUpload'];
        var assetUploadUrl = assetService.getAssetUploadUrl();
        var lastAuthorization = session.get('Authorization', 'test default');
        if ($scope.IsSingleFileUpload) {
            var uploader = $scope.uploader = new FileUploader({
                scope: $scope,
                url: assetUploadUrl,
                headers: {
                    'Authorization': lastAuthorization
                },
                queueLimit: 1
            });
        } else {
            var uploader = $scope.uploader = new FileUploader({
                scope: $scope,
                url: assetUploadUrl,
                headers: {
                    'Authorization': lastAuthorization
                }
            });
        }



        function isFolderNameAlreadyExists(name, id, type) {

            if (typeof name != "undefined" && name != "") {

                var allData = $scope.commonModel.foldersData;

                return assetsLibraryService.isFolderNameAlreadyExists(allData, name, id, type, $scope.selectedParentId);
            }
            return true;

        };
        if (typeof $scope.isAssetLibrary == "undefined" && !$scope.Folders) {
            //init if uploader not opened from assetsLibrary
            $scope.selectedFolder = {
                name: '',
                id: ''
            };
            $scope.foldersData = [];
            $rootScope.selectedDestinationFolder = "My Assets";
            $scope.selectedParentId = "1";

            if ($scope.isAdPreview) {
                $scope.foldersData = [];
                $rootScope.selectedDestinationFolder = "Preview Background Images";
                $scope.selectedParentId = "";
            } else {
                $scope.selectedFolder = {
                    name: 'My Assets',
                    id: '1'
                };
            }
        }

        $scope.adFormats = enums.adFormats;
        $scope.ShowProgressContainer = false;
        $scope.showDropzone = true;
        $scope.IsUploadCompleted = false;
        $scope.IsUploadCancelled = false;
        $scope.IsAssetAttached = false;
        $scope.adFormatType = adDetailsForUpload['adFormat'];
        $scope.selectedCreativeType = adDetailsForUpload['selectedCreativeType'];
        //console.log("creative type + ad format", $scope.selectedCreativeType, $scope.adFormatType);
        $scope.fileName = uploader.queue.length > 0 ? uploader.queue[uploader.queue.length - 1].file.name : '';
        $scope.cssClass = [];
        $scope.destinationLocationTree = {};
        if ($scope.showSelectTab == undefined)
            $scope.showSelectTab = adDetailsForUpload['showSelectTab'];
        $scope.isSelectTab = $scope.showSelectTab ? true : false;
        $scope.searchImageText = '';
        $scope.itemAssets = {
            selectedItems: []
        };
        $scope.selectedIndex = "";
        $scope.disabledDestinationFolder = false;
        $scope.metadataInfoList = [];
        $scope.selectedRow = "";
        $scope.previouslyUploadedItemslastIndex = 0;
        $scope.previouslyUploadedItemslastIndex2 = 0;
        $scope.indexOfAsset = 0;
        $scope.uploadAssetIdList = [];
        $scope.uploadFolderIdList = [];
        $scope.uploadedAssetObjects = [];
        $scope.attachingAssetsInProgress = false;
        $scope.selectedRows = [];
        $scope.changeFolderOfAllAssets = true;
        $scope.isUploadError = false;
        $scope.selectAssetList = [];
        $scope.isSelectFiles = false;
        $scope.tempResourcePath = assetService.getTempResourceUrl();
        $scope.foldersTreeData = [];
        $scope.folderOkToAssign = false;
        var storedFolderSelection = $scope.selectedParentId;

        //ad context mode
        if ($scope.showSelectTab) {
            //init select grid
            //infinite scroll
            $scope.totalServerItems = 0;
            $scope.pagingOptions = {
                pageSizes: [50, 100, 200],
                pageSize: 100,
                currentPage: 1
            };

            $scope.selectColumnDefs = [{
                field: 'url',
                displayName: 'Thumbnail',
                isColumnEdit: false,
                gridControlType: enums.gridControlType.getName("Image"),
                isColumnSort: false
            }, {
                field: 'title',
                displayName: 'Name',
                isColumnEdit: false,
                isShowToolTip: true,
                sortFunction: generalSort
            }, {
                field: 'mediaType',
                displayName: 'Type',
                isColumnEdit: false,
                sortFunction: generalSort,
                gridControlType: enums.gridControlType.getName("AssetIcon"),
                width: 70
            }, {
                field: 'dimension',
                displayName: 'Dimensions',
                sortFunction: sortOnDimensions,
                isColumnEdit: false
            }, {
                field: 'displayFileSize',
                displayName: 'Size',
                sortFunction: sortOnFileSize,
                isColumnEdit: false,
                cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{ COL_FIELD.displayFileSize}}</span></div>'
            }];

            $scope.resetSelectAssets = function() {
                $scope.gettingData = false;
                $scope.pagedAssets = [];
                $scope.pagingOptions.currentPage = 1;
                $scope.totalClientItems = 0;
                $scope.totalServerItems = 0;
                $scope.itemAssets = {
                    selectedItems: []
                };
                $scope.lastPage = false;
                $scope.isReset = true;
                $scope.filteredItemCount = "";
                $scope.filterOptions = {
                    filterText: ""
                };
            }
            $scope.searchOptions = {
                searchText: ""
            };

            $scope.getPagedDataAsyncDirective = function(pageSize, page, searchText) {
                $scope.gettingData = true;
                setTimeout(function() {
                    var data;
                    var ft = "*";
                    if (searchText) {
                        ft = searchText.toLowerCase();
                    }
                    var selectedFilterFolder = $scope.selectedParentId;
                    if (selectedFilterFolder == "1" || selectedFilterFolder == "undefined" || selectedFilterFolder == null) {
                        selectedFilterFolder = "";
                    }
                    var pageSearchBody = {};
                    switch ($scope.selectedCreativeType) {
                        case "defaultImage":
                            pageSearchBody = {
                                "searchText": ft,
                                "page": page,
                                "itemsPerPage": pageSize,
                                "indexVersion": 1,
                                "assetType": "source",
                                "currentVersion": true,
                                "fieldTerms": {
                                    "mediaType": ["image"],
                                    "businessMetadata.folderId": [selectedFilterFolder]
                                },
                                "fieldRange": {
                                    "formatContext.fileSize": {
                                        "0": creativeConsts.MAX_ASSET_SIZE_STANDARD
                                    }
                                }
                            };
                            break;
                        case "preloadBanner":
                        case "banner":
                            pageSearchBody = {
                                "searchText": ft,
                                "page": page,
                                "itemsPerPage": pageSize,
                                "indexVersion": 1,
                                "assetType": "source",
                                "currentVersion": true,
                                "fieldTerms": {
                                    "mediaType": ["flash"],
                                    "businessMetadata.folderId": [selectedFilterFolder]
                                },
                                "fieldRange": {
                                    "formatContext.fileSize": {
                                        "0": adValidator.assetMaxSize[$scope.adFormatType].banner
                                    }
                                }
                            };
                            break;
                        case "html5":
                            pageSearchBody = {
                                "searchText": ft,
                                "page": page,
                                "itemsPerPage": pageSize,
                                "indexVersion": 1,
                                "assetType": "source",
                                "currentVersion": true,
                                "fieldTerms": { /*"mediaType": ["archive"],*/
                                    "businessMetadata.folderId": [selectedFilterFolder]
                                },
                                "fieldRange": {
                                    "formatContext.fileSize": {
                                        "0": adValidator.assetMaxSize[$scope.adFormatType].html5
                                    }
                                }
                            };
                            break;
                        case "html5Panels":
                            pageSearchBody = {
                                "searchText": ft,
                                "page": page,
                                "itemsPerPage": pageSize,
                                "indexVersion": 1,
                                "assetType": "source",
                                "currentVersion": true,
                                "fieldTerms": {
                                    "mediaType": ["html"],
                                    "businessMetadata.folderId": [selectedFilterFolder]
                                },
                                "fieldRange": {
                                    "formatContext.fileSize": {
                                        "0": adValidator.assetMaxSize[$scope.adFormatType].html5
                                    }
                                }
                            };
                            break;

                        case "massCreate":
                            pageSearchBody = {
                                "searchText": ft,
                                "page": page,
                                "itemsPerPage": pageSize,
                                "indexVersion": 1,
                                "assetType": "source",
                                "currentVersion": true,
                                "fieldTerms": {
                                    "mediaType": ["flash", "image"],
                                    "businessMetadata.folderId": [selectedFilterFolder]
                                },
                                "fieldRange": {
                                    "formatContext.fileSize": {
                                        "0": creativeConsts.MAX_ASSET_SIZE_STANDARD
                                    }
                                }
                            };
                            break;
                        case "Linear":
                        case "NonLinear":
                            pageSearchBody = {
                                "searchText": ft,
                                "page": page,
                                "itemsPerPage": pageSize,
                                "indexVersion": 1,
                                "assetType": "source",
                                "currentVersion": true,
                                "fieldTerms": {
                                    "mediaType": ["video", "flash", "archive", "image"],
                                    "businessMetadata.folderId": [selectedFilterFolder]
                                },
                                "fieldRange": {
                                    "formatContext.fileSize": {
                                        "0": creativeConsts.MAX_ASSET_SIZE_LINEAR
                                    }
                                }
                            };
                            break;
                        case "LinearNonVpaid":
                            pageSearchBody = {
                                "searchText": ft,
                                "page": page,
                                "itemsPerPage": pageSize,
                                "indexVersion": 1,
                                "assetType": "source",
                                "currentVersion": true,
                                "fieldTerms": {
                                    "mediaType": ["video", "flash", "image"],
                                    "businessMetadata.folderId": [selectedFilterFolder]
                                },
                                "fieldRange": {
                                    "formatContext.fileSize": {
                                        "0": creativeConsts.MAX_ASSET_SIZE_LINEAR
                                    }
                                }
                            };
                            break;
                        case "variantInStreamLinear":
                            pageSearchBody = {
                                "searchText": ft,
                                "page": page,
                                "itemsPerPage": pageSize,
                                "indexVersion": 1,
                                "assetType": "source",
                                "currentVersion": true,
                                "fieldTerms": {
                                    "mediaType": ["video"],
                                    "businessMetadata.folderId": [selectedFilterFolder]
                                },
                                "fieldRange": {
                                    "formatContext.fileSize": {
                                        "0": creativeConsts.MAX_ASSET_SIZE_LINEAR
                                    }
                                }
                            };
                            break;

                        case "Companion":
                        case "AdvancedCompanion":
                            pageSearchBody = {
                                "searchText": ft,
                                "page": page,
                                "itemsPerPage": pageSize,
                                "indexVersion": 1,
                                "assetType": "source",
                                "currentVersion": true,
                                "fieldTerms": {
                                    "mediaType": ["flash", "image"],
                                    "businessMetadata.folderId": [selectedFilterFolder]
                                },
                                "fieldRange": {
                                    "formatContext.fileSize": {
                                        "0": creativeConsts.MAX_ASSET_SIZE_LINEAR
                                    }
                                }
                            };
                            break;
                        default:
                            pageSearchBody = {
                                "searchText": ft,
                                "page": page,
                                "itemsPerPage": pageSize,
                                "indexVersion": 1,
                                "assetType": "source",
                                "currentVersion": true,
                                "fieldTerms": {
                                    "businessMetadata.folderId": [selectedFilterFolder]
                                },
                                "fieldRange": {
                                    "formatContext.fileSize": {
                                        "0": "10526720"
                                    }
                                }
                            };
                            break;
                    }
                    var allClientAssets = [];


                        if (pageSearchBody.fieldTerms != undefined && pageSearchBody.fieldTerms['businessMetadata.folderId'] != undefined && pageSearchBody.fieldTerms['businessMetadata.folderId'][0] == "")
                            delete pageSearchBody.fieldTerms['businessMetadata.folderId'];
                        //use ec2AMSRestangular until we fix backend issue
                        serverSearchAssets.post(pageSearchBody).then(function(data) {
                            if (data.entity != null && data.entity.length > 0) {

                                $scope.validAssets = $filter('filter')(data.entity, $scope.isSelectAsset);
                                //concat new data to end of client data  Array.prototype.push.apply(mergeTo, mergeFrom);
                                allClientAssets.push.apply(allClientAssets, $scope.pagedAssets);
                                allClientAssets.push.apply(allClientAssets, $scope.validAssets);
                                $scope.totalItems = data.total;
                                $scope.pagedAssets = [];

                                $scope.pagedAssets = allClientAssets;
                                $scope.totalClientItems = $scope.pagedAssets.length;
                                $scope.totalServerItems = data.total;
                                //if ($scope.pagedAssets.length > 0) {
                                $scope.isSelectFiles = true;
                                //}
                                $scope.pageCount = Math.ceil($scope.totalServerItems / $scope.pagingOptions.pageSize);
                                if ($scope.pagingOptions.currentPage >= $scope.pageCount) {
                                    $scope.lastPage = true;
                                }
                                $scope.gettingData = false;
                            } else {
                                $scope.gettingData = false;
                                $scope.isSelectFiles = true;
                            }
                        }, function(error) {
                            mmAlertService.addError('Error retrieving assets.');
                            $scope.isSelectFiles = true;
                            processError(error);
                        });
                        //processError);


                }, 100);
            }

            //get folders data
            getFolders();

            //get first page
            $scope.resetSelectAssets();
            //$scope.getPagedDataAsyncDirective($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.searchOptions.searchText);

            $scope.$watch('searchOptions.searchText', function(newVal, oldVal) {
                if (newVal !== oldVal && !$scope.isReset) {
                    $scope.resetSelectAssets();
                    $scope.getPagedDataAsyncDirective($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.searchOptions.searchText);
                    //$scope.getPagedDataAsyncDirective($scope.pagingOptionsDirective.pageSize, $scope.pagingOptionsDirective.currentPage, "*", $scope.searchOptionsDirective.mediaTypeLabel);
                    $scope.isReset = false;
                }
            }, true);

            $scope.scrollBottomEvent = function(gridId) {
                if (!$scope.gettingData && !$scope.lastPage) {
                    $scope.gettingData = true;
                    $scope.pagingOptions.currentPage++;
                    $scope.getPagedDataAsyncDirective($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.searchOptions.searchText);
                } else if ($scope.gettingData) {
                    mmAlertService.addWarning("Already retrieving next data chunk.");
                }
            };
            //} else if ($scope.isAdPreview) {
        } else {
            //get folders data
            getFolders();
        }

        function processError(error) {
            if (error.data === undefined || error.data == null || error.data.error === undefined) {
                mmAlertService.addError("Server error. Please try again later.");
            } else {
                mmAlertService.addError("Error" + error.data.error);
            }
        }

        $scope.selectTreeNode = function(data) {
            //      console.log("selected folder info - select tree node", data);
            if (data == "")
                return;
            //$rootScope.selectedDestinationFolder = data;
            $rootScope.selectedDestinationFolder = data.id;

            if (!$scope.ShowProgressContainer) {
                $scope.selectedFolder = {
                    name: data.name,
                    id: data.id
                };
            }
            if ($scope.changeFolderOfAllAssets) {
                if ($scope.metadataInfoList.length > 0) {
                    $scope.selectedFolder = {
                        name: data.name,
                        id: data.id
                    };
                    for (var i = 0; i < $scope.metadataInfoList.length; i++) {
                        var asset = $scope.metadataInfoList[i];
                        asset.folderId = data.id;
                    }
                }
            } else {
                if ($scope.metadataInfoList.length > 0) {
                    var asset = $scope.metadataInfoList[$scope.indexOfAsset];
                    asset.folderId = data.id;
                }
            }
            if ($scope.metadataInfoList.length > 0 && !$scope.changeFolderOfAllAssets) {
                var folderArray = [];
                for (var i = 0; i < $scope.metadataInfoList.length; i++) {
                    var asset = $scope.metadataInfoList[i];
                    folderArray.push(asset.folderId);
                }
                var allDestinationPathsEqual = $scope.AllValuesEqualInArray(folderArray);
                if (allDestinationPathsEqual) {
                    $scope.selectedFolder = {
                        name: folderArray[0].name,
                        id: folderArray[0].id
                    };
                }
            }
        }

      

        function generalSort(a, b) {
            if (a < b) {
                return -1;
            } else if (a > b) {
                return 1;
            } else {
                return 0;
            }
        }

        function sortOnFileSize(a, b, field) {
            return generalSort(a.fileSize,b.fileSize);
        }

        function sortOnDimensions(a,b)
        {
            var aWidth = a.toLowerCase().split('x')[0],
            bWidth = b.toLowerCase().split('x')[0];
            return generalSort(aWidth,bWidth);
        }

        //create random # for upload file index
        $scope.getUniqueId = function() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }

            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        };

        $scope.assetMetadata = {
            imageName: "",
            folderId: "",
            displayName: "",
            adFormat: "",
            display: "",
            icon: "",
            isUploaded: false,
            isHtml5Folder: "",
            workspaceFolderId: ""
        };

        $scope.findAssetByAssetId = function(assetId) {
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
        };

        $scope.prepareAssetMetadata = function() {

            $scope.previouslyUploadedItemslastIndex2 = $scope.previouslyUploadedItemslastIndex;

            for (var i = $scope.previouslyUploadedItemslastIndex; i < uploader.queue.length; i++) {
                $scope.metadataInfoList.push({
                    assetId: uploader.queue[i].assetId,
                    imageName: uploader.queue[i].file.name,
                    //  folderId: ( $rootScope.selectedDestinationFolder !== '' ? $rootScope.selectedDestinationFolder : $scope.assetMetadata.folderId),
                    folderId: ($scope.selectedFolder.id !== '') ? $scope.selectedFolder.id : "1",
                    displayName: uploader.queue[i].file.name,
                    icon: $scope.getFileTypeIcon(uploader.queue[i].file),
                    isUploaded: $scope.assetMetadata.isUploaded,
                    isHtml5Folder: false,
                    workspaceFolderId: ""
                });
            }

            $scope.previouslyUploadedItemslastIndex = uploader.queue.length;
        };

        $scope.selectRow = function(row, image) {
            $scope.selectedRow = row;
            $scope.fileName = image.file.name;
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

        $scope.removeAssetFromList = function(item) {
            if ($scope.metadataInfoList.length > 0) {
                for (var i = 0; i < $scope.metadataInfoList.length; i++) {
                    if ($scope.metadataInfoList[i].assetId == item.assetId) {
                        $scope.metadataInfoList.splice(i, 1);
                        if ($scope.previouslyUploadedItemslastIndex > 0) {
                            $scope.previouslyUploadedItemslastIndex--;
                        }
                    }
                }
                if ($scope.selectedRows.length > 0) {
                    var ids = $scope.selectedRows.indexOf(item.assetId);
                    // is currently selected
                    if (ids > -1) {
                        $scope.selectedRows.splice(ids, 1);
                    }
                }
                //$scope.queueIndex--;
            }
            return {};
        };

        var removeAssetFromServer = function(asset) {
            if (!asset.isError && asset.isUploaded && typeof asset.correlationId != "undefined") {
                var promise = assetService.deleteAssetById(asset.correlationId);
                promise.then(function(returnData) {
                    console.log(returnData);
                }, function(response) {
                    // error
                });
            }
        };

        $scope.itemsInUploader = uploader.queue;

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
            $rootScope.$broadcast("hideFlyoutProgress");
        };

        $scope.$watchCollection('itemsInUploader', function() {
            $scope.fileName = uploader.queue.length > 0 ? uploader.queue[0].file.name : '';
        });

        $scope.saveDestination = function() {
            if ($scope.destinationLocationTree.currentNode) {
                $scope.metadataInfoList[$scope.indexOfAsset].folderId = $scope.destinationLocationTree.currentNode.label;
            }
        };

        $scope.initUploadState = function() {
            $scope.IsUploadCompleted = false;
            $scope.IsUploadCancelled = false;

            if ($scope.IsSingleFileUpload) {
                if ($scope.selectedFolder != '') {
                    $scope.ShowProgressContainer = true;
                    $scope.disabledDestinationFolder = true;
                    $scope.showDropzone = false;
                    return true;
                } else {
                    uploader.queue = [];
                    mmAlertService.addError("Please choose a destination folder.");
                    return false;
                }
            } else {
                $scope.ShowProgressContainer = true;
                $scope.disabledDestinationFolder = true;
                $scope.showDropzone = false;

                var currentFolder = '';

                if ($scope.storeCurrentNode()) {
                    currentFolder = $scope.storeCurrentNode();
                } else if ($scope.selectedFolder != "") {
                    currentFolder = $scope.selectedFolder;
                }

                if (currentFolder != "") {

                    for (var i = $scope.previouslyUploadedItemslastIndex2 + 1; i < $scope.metadataInfoList.length; i++) {
                        $scope.metadataInfoList[i].folderId = $scope.selectedFolder.id;
                    }
                }
            }
        };

        $scope.startUploading = function() {

            var isMetaDataPropertiesEmpty = false;

            if ($scope.IsSingleFileUpload) {
                //set folder id empty if root folder selected
                if ($scope.selectedFolder.id == "1") {
                    $scope.assetMetadata.folderId = $scope.metadataInfoList[0].folderId = "";
                }
                $scope.queueIndex = 0;
                uploader.uploadAll();
            } else {
                if ($scope.verifyAssetHasValidFolder()) {
                    $scope.queueIndex = 0;
                    uploader.uploadAll();
                }
            }
        };

        var arrangeMetadataOfSingleFile = function() {
            $scope.metadataInfoList[0].folderId = $scope.selectedFolder.id;
            $scope.metadataInfoList[0].displayName = $scope.assetMetadata.displayName;
            $scope.metadataInfoList[0].icon = $scope.getFileTypeIcon(uploader.queue[i].file);
        };

        $scope.VerifyAssetHasDestinationFolder = function() {
            var isValid = true;
            if ($scope.selectedFolder == "") {
                for (var i = 0; i < $scope.metadataInfoList.length; i++) {
                    //          var destinationFolder = $scope.metadataInfoList[i].destinationFolder;
                    //          if (typeof destinationFolder === "undefined") {
                    var folderId = $scope.metadataInfoList[i].folderId;
                    if (typeof folderId === "undefined") {
                        mmAlertService.addError("Please make sure all assets have a destination folder selected.");
                        isValid = false;
                        break;
                    }
                }
            } else {
                for (var i = 0; i < $scope.metadataInfoList.length; i++) {
                    var folderId = $scope.metadataInfoList[i].folderId;
                    if (typeof folderId === "undefined") {
                        $scope.metadataInfoList[i].folderId = $scope.selectedFolder.id;
                    }
                }
            }
            return isValid;
        };

        $scope.verifyAssetHasValidFolder = function() {
            var isValid = true;
            for (var i = 0; i < $scope.metadataInfoList.length; i++) {
                var folderId = $scope.metadataInfoList[i].folderId;
                /*if (folderId === "1" || typeof folderId === "") {
                 mmAlertService.addError("Please make sure all assets have a valid folder selected.");
                 isValid = false;
                 break;
                 }*/
                //set folder id empty if root folder selected
                if (folderId === "1") {
                    $scope.metadataInfoList[i].folderId == "";
                }
            }
            return isValid;
        };

        $scope.removeImage = function() {
            $scope.ShowProgressContainer = false;
            $scope.showDropzone = true;
            uploader.clearQueue()
        };

        $scope.persistAssetMetaData = function() {
            $rootScope.uploadedAssets = $scope.metadataInfoList;
        };

        $scope.closePopup = function() {

            if (uploader.isUploading) {
                $scope.flyLayout();
                return false;
            }

            if ($scope.IsUploadCompleted) {
                $scope.persistAssetMetaData();
                if (!saveMetaDataOnModalClose())
                    return false;

                $scope.FlushObjects();
            }

            $modalInstance.dismiss('cancel');
            $rootScope.$broadcast("hideFlyoutProgress");
        };

        // ADDING UPLOAD FILTERS
        //max size filter on upload
        var maxSize = creativeConsts.MAX_ASSET_SIZE_RICH; //10485760 10280KB
        if ($scope.selectedCreativeType === 'defaultImage' || $scope.adFormatType === 'STANDARD_BANNER_AD') {
            maxSize = creativeConsts.MAX_ASSET_SIZE_STANDARD; //112640  110KB
        }
        uploader.filters.push({
            name: 'filterMaxSize',
            fn: function(item, options) {
                return item.size <= maxSize;
            }
        });
        //file type filter
        if ($scope.selectedCreativeType === 'defaultImage' || $scope.isAdPreview) {
            uploader.filters.push({
                name: 'filterFileType1',
                fn: function(item, options) {
                    return !uploader.isHTML5 ? true : /\/(png|jpeg|jpg|gif)$/.test(item.type);
                }
            });
        }
        if ($scope.selectedCreativeType === 'preloadBanner' || $scope.selectedCreativeType === 'banner') {
            uploader.filters.push({
                name: 'filterFileType2',
                fn: function(item, options) {
                    var ext = item.name.substring(item.name.lastIndexOf('.') + 1);
                    return !uploader.isHTML5 ? true : /(swf)$/.test(ext);
                }
            });
        }
        if ($scope.selectedCreativeType === 'html5') {
            uploader.filters.push({
                name: 'filterFileType3',
                fn: function(item, options) {
                    var ext = item.name.substring(item.name.lastIndexOf('.') + 1);
                    return !uploader.isHTML5 ? true : /(zip)$/.test(ext);
                }
            });
        }

        // REGISTER HANDLERS
        uploader.onAfterAddingFile = function(item) {
            $scope.IsUploadCompleted = false;
            $scope.IsUploadCancelled = false;
            //assign client side unique id to assets that pass filter
            item.assetId = $scope.getUniqueId();
        };

        uploader.onWhenAddingFileFailed = function(item, filter, options) {
            if (filter.name === 'queueLimit') {
                if (uploader.queue.length === 1)
                    mmAlertService.addWarning('Only a single file is allowed to be uploaded.');
            } else if (filter.name === 'filterMaxSize') {
                mmAlertService.addWarning('Please select another file (file too large).');
            } else if (filter.name.search("filterFileType1") != -1) {
                mmAlertService.addWarning('Unsupported file type. Please select an image file (png|jpeg|jpg|gif).');
            } else if (filter.name.search("filterFileType2") != -1) {
                mmAlertService.addWarning('Unsupported file type. Please select a flash file (swf).');
            } else if (filter.name.search("filterFileType3") != -1) {
                mmAlertService.addWarning('Unsupported file type. Please select a compressed folder (zip).');
            }

        };

        uploader.onAfterAddingAll = function(item) {
            $scope.IsUploadCompleted = false;
            $scope.IsUploadCancelled = false;
            var isError = false;

            if ($scope.IsSingleFileUpload) {
                if (uploader.queue.length > 1) {
                    isError = true;
                    mmAlertService.addWarning('Only a single file is allowed to be uploaded.');
                    $scope.disabledDestinationFolder = false;
                    $scope.showDropzone = true;
                    $scope.ShowProgressContainer = false;
                    uploader.queue = [];
                    uploader.clearQueue();
                    uploader.cancelAll();
                    return false;
                }
            }

            if (!isError) {
                $scope.prepareAssetMetadata();
                $scope.initUploadState();
                $scope.IsAssetAttached = true;
                $scope.startUploading();
            }
        };

        uploader.onBeforeUploadItem = function(item) {
            $scope.startIndex = uploader.queue.length > 0 ? uploader.getIndexOfItem(item) + 1 : 0;
        };

        uploader.onProgressItem = function(item, progress) {};

        uploader.onSuccessItem = function(item, response, status, headers) {
            $scope.queueIndex = uploader.queue.length > 0 ? uploader.getIndexOfItem(item) + 1 : 0;
            $scope.isUploadError = false;
            var rep = JSON.parse(response.files);
            var correlationId = rep[0].correlationId;
            var assetMetadata = {};
            assetMetadata = $scope.findAssetByAssetId(item.assetId);
            assetMetadata.correlationId = correlationId;
            if ($scope.IsSingleFileUpload) {
                $scope.assetMetadata.isUploaded = true;
            }
            assetMetadata.isUploaded = true;
            var data = angular.copy(assetMetadata);
            var selectedFilterFolder = $scope.selectedParentId;
            if (selectedFilterFolder == "1" || selectedFilterFolder == "undefined" || selectedFilterFolder == null) {
                selectedFilterFolder = "";
            }
            if (rep[0].folderId && rep[0].folderId != "" && rep[0].folderId != "null") {
                //workspace upload;
                var workspaceFolderId = rep[0].folderId;
                assetMetadata.isHtml5Folder = true;
                assetMetadata.workspaceFolderId = workspaceFolderId;
                $scope.uploadFolderIdList.push(workspaceFolderId);
                var newFolderName = data.displayName.substr(0, data.displayName.lastIndexOf('.')); //trim file extension
                if ($scope.foldersData.length > 0) {
                    var folderNameCount = isFolderNameCount(newFolderName, null, "FOLDER");
                    if (folderNameCount > 0) {
                        newFolderName = newFolderName + "(" + folderNameCount + ")";
                    }
                }
                assetMetadata.displayName = newFolderName;
                //console.log("folder id for folder put", workspaceFolderId, $scope.selectedParentId);
                var saveItem = EC2Restangular.all(serverUpdateFolderPath + workspaceFolderId);
                var postBody = {
                    "_type": "AssetFolder",
                    "id": workspaceFolderId,
                    "folderType": 1,
                    "name": newFolderName,
                    "parentId": selectedFilterFolder,
                    "rootParentId": null
                };
                saveItem.customPUT(postBody).then(function(result) {
                    var modifiedFolder = result;

                }, function(error) {
                    mmAlertService.addError('Server error saving folder. Please trying again later.');
                });
            } else {
                //file upload
                $scope.uploadAssetIdList.push(correlationId);
                assetMetadata.isHtml5Folder = false;
                if (data.folderId == "1" || typeof data.folderId === "undefined") {
                    data.folderId = "";
                }
                delete data.assetId;
                delete data.isUploaded;
                delete data.workspaceFolderId;
                delete data.isHtml5Folder;
                delete data.icon;
                if ($scope.isAdPreview) {
                    data.displayName = data.displayName.substr(0, data.displayName.lastIndexOf('.')); //trim file extension
                    assetMetadata.displayName = data.displayName;
                }
                //use ec2AMSRestangular until we fix backend issue
                //console.log("asset id for metadata post", correlationId);
                assetService.postAssetMetaData(data, correlationId).then(function(returnData) {

                    $scope.itemsSucceeded = $scope.itemsSucceeded ? ($scope.itemsSucceeded + 1) : 1;
                }, function(response) {
                    // error
                    mmAlertService.addWarning('Server error - saving the asset metadata has failed.');
                });
            }
        };

        var getColorObj = function(color, title) {
            var obj = {
                color: color,
                title: title,
                isImage: true,
                isSelected: false,
                isEditable: true,
                isEditMode: false,
                toggle: function() {
                    obj.isSelected = !obj.isSelected;
                    if (obj.isSelected)
                        obj.unSelectOthers();
                },
                unSelectOthers: function() {
                    _.forEach($scope.colors, function(data, index) {
                        if (data.color != obj.color) {
                            data.isSelected = false;
                        }
                    });
                }
            }
            return obj;
        };

        uploader.onCancelItem = function(item, response, status, headers) {
            mmAlertService.addWarning('Canceling upload of ' + item.file.name);
        };

        uploader.onErrorItem = function(item, response, status, headers) {
            $scope.isUploadError = true;
            mmAlertService.addError("Unable to complete upload of file.");
        };

        uploader.onCompleteItem = function(item, response, status, headers) {};

        uploader.onProgressAll = function(progress) {
            setTimeout(function() {
                $rootScope.$broadcast("uploaderProgress", uploader);
            }, 10);
        };

        uploader.onCompleteAll = function() {
            $scope.IsUploadCompleted = true;
            $scope.itemsSucceeded = $scope.itemsSucceeded ? ($scope.itemsSucceeded + 1) : 1;
            if ($scope.itemsSucceeded > 1) {
                mmAlertService.addSuccess($scope.itemsSucceeded + " Files Uploaded successfully.");
            } else {
                mmAlertService.addSuccess("File Uploaded successfully.");
            }
            $scope.itemsSucceeded = 0;
        };

        // Treeview initialization


        $scope.storeCurrentNode = function() {
            if ($scope.destinationLocationTree.currentNode) {
                $scope.selectedFolder = {
                    name: $scope.destinationLocationTree.currentNode.label,
                    id: $scope.destinationLocationTree.currentNode.id
                };
                if (uploader.queue.length > 0) {
                    if ($scope.IsSingleFileUpload) {
                        uploader.queue.length !== 1 && uploader.queue.pop(); // only one file in the queue
                    }
                }
            }
            return $scope.selectedFolder;
        };

        $scope.attachImagesToAd = function() {
            $scope.attachingAssetsInProgress = true;
            $scope.persistAssetMetaData();

            if ($scope.uploadAssetIdList.length > 0) {
                //save metadata
                for (var i = 0; i < $scope.metadataInfoList.length; i++) {
                    var itemToSave = angular.copy($scope.metadataInfoList[i]);
                    if (itemToSave.folderId == "1" || typeof itemToSave.folderId === "undefined") {
                        itemToSave.folderId = "";
                    }
                    delete itemToSave.assetId;
                    delete itemToSave.isUploaded;
                    assetService.postAssetMetaData(itemToSave, $scope.metadataInfoList[i].correlationId);
                }

                var uploadedAssets = [];
                $scope.uploadedAssetObjects = [];

                var assetSearchBody = {
                    "searchText": "*",
                    "page": 1,
                    "itemsPerPage": 100,
                    "indexVersion": 1,
                    "fieldTerms": {
                        "assetId": $scope.uploadAssetIdList
                    }
                };
                //use ec2AMSRestangular until we fix backend issue
                assetService.searchAssets(assetSearchBody).then(function(returnData) {
                    $scope.uploadedAssetObjects = returnData;
                    for (var j = 0; j < $scope.uploadedAssetObjects.length; j++) {
                        for (var i = 0; i < $scope.metadataInfoList.length; i++) {
                            if ($scope.metadataInfoList[i].correlationId == $scope.uploadedAssetObjects[j].assetId) {
                                $scope.uploadedAssetObjects[j].assetCode = $scope.metadataInfoList[i].displayName;
                            }
                        }
                    }
                    var combinedAssets = [];
                    if ($scope.itemAssets.selectedItems.length > 0) {
                        combinedAssets = $scope.itemAssets.selectedItems;
                    } else if ($scope.uploadedAssetObjects) {
                        combinedAssets = $scope.uploadedAssetObjects;
                    }
                    $modalInstance.close(combinedAssets); //return uploaded or selected assets
                    $rootScope.$broadcast("hideFlyoutProgress");

                    if (combinedAssets.length === 1) {
                        mmAlertService.addSuccess("Successfully attached " + combinedAssets.length + " asset to ad.");
                    } else if (combinedAssets.length > 1) {
                        mmAlertService.addSuccess("Successfully attached " + combinedAssets.length + " assets to ad.");
                    } else {
                        mmAlertService.addError("No assets attached to ad.", "");
                    }

                    $scope.attachingAssetsInProgress = false;

                }, function(response) {
                    mmAlertService.addError("Failed to retrieve assets to attach to Ad. Please try again.");
                    $scope.attachingAssetsInProgress = false;
                });
            } else if ($scope.itemAssets.selectedItems.length) {

                $scope.attachingAssetsInProgress = false;

                $modalInstance.close($scope.itemAssets.selectedItems); //return selected assets
                $rootScope.$broadcast("hideFlyoutProgress");

                if ($scope.itemAssets.selectedItems.length === 1) {
                    mmAlertService.addSuccess("Successfully attached " + $scope.itemAssets.selectedItems.length + " selected asset to ad.");
                } else if ($scope.itemAssets.selectedItems.length > 1) {
                    mmAlertService.addSuccess("Successfully attached " + $scope.itemAssets.selectedItems.length + " selected assets to ad.");
                } else {
                    mmAlertService.addError("No assets attached to ad.", "");
                }
            }
        };

        $scope.removeSelectedImages = function() {
            if (typeof $scope.itemAssets.selectedItems != "undefined" && $scope.itemAssets.selectedItems != "") {
                $scope.itemAssets.storeSelection = $scope.itemAssets.selectedItems;
                $scope.itemAssets.selectedItems = [];
            }
        };

        $scope.restoreSelectedImages = function() {
            if (typeof $scope.itemAssets.storeSelection != "undefined" && $scope.itemAssets.storeSelection != "") {
                $scope.itemAssets.selectedItems = $scope.itemAssets.storeSelection;
                $scope.itemAssets.storeSelection = [];
            }
        };

        $scope.flyLayout = function() {
            $rootScope.$broadcast("minimizePopup", uploader);
        };

        // store selected row from upload table selected by checkboxes
        $scope.storeSelectedRow = function(asset, isSelectAll) {
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
                } else
                    $scope.selectedRows.push(currentAssetId);
            }
        };

        $scope.AllValuesEqualInArray = function(array) {
            return !array.some(function(value, index, array) {
                return value !== array[0];
            });
        };


        $scope.openDestinationFolderTreePopup = function(assetIndex) {
            debugger;
            $scope.indexOfAsset = assetIndex;
            $rootScope.isFolderLinkClicked = true;
            $scope.changeFolderOfAllAssets = false;
            var modalInstance = $modal.open({
                templateUrl: './adManagementApp/views/destinationModal.html',
                controller: 'DestinationCtrl',
                backdrop: 'static'
            });
            modalInstance.result.then(function(selectedFolder) {
                //ok
                selectTreeNode(selectedFolder);
            }, function() {
                //cancel
            });
        };

        $scope.FlushObjects = function() {
            $scope.metadataInfoList = [];
            $scope.selectedRows = [];
            //$scope.assetMetadata = {};
            //$rootScope.selectedDestinationFolder = '';
            // $scope.selectedFolder = {id: "", name: ""};
        };

        $scope.safeApply = function(fn) {
            var phase = this.$root.$$phase;
            if (phase == '$apply' || phase == '$digest') {
                if (fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };

        $scope.cancelAllUploading = function() {
            if (!$scope.IsUploadCompleted) {
                for (var i = 0; i < uploader.queue.length; i++) {
                    var item = uploader.queue[i];
                    if (!item.isUploaded && !item.isUploading) {
                        $scope.removeAssetFromList(item);
                        item.remove();
                    }
                    if (item.isUploading) {
                        item.cancel();
                    }
                }
                $scope.IsUploadCancelled = true;
                uploader.cancelAll();
            } else {
                console.log("cancel all - upload already complete", uploader.queue, $scope.queueIndex);
            }
        };

        $rootScope.getTotalAssetsToUpload = function() {
            var assetCount = 0;
            for (var i = 0; i < uploader.queue.length; i++) {
                var item = uploader.queue[i];
                if (!item.isUploaded && typeof item.correlationId == "undefined") {
                    assetCount++;
                }
            }
            return assetCount;
        };

        $scope.closeUploader = function() {
            uploader.cancelAll();
            if (saveMetaDataOnModalClose()) {
                $modalInstance.dismiss('cancel');
            }
        };

        $scope.getFileTypeIcon = function(file) {
            var type = file.type;
            if (type.indexOf('image') != -1) {
                return "assets-icon-Image_icon"
            } else if (type.indexOf('video') != -1) {
                return "assets-icon-Vidao_icon"
            } else if (type.indexOf('audio') != -1) {
                return "assets-icon-Sound_icon"
            } else if (type.indexOf('flash') != -1) {
                return "assets-icon-Flash_icon"
            } else if (type.indexOf('zip') != -1) {
                return "assets-icon-Zip_icon"
            } else if (type.indexOf('html') != -1) {
                return "assets-icon-Code_icon"
            } else {
                return "assets-icon-Text_icon"
            }
        };

        $scope.getFolderName = function(folderid) {
            if (folderid == "" || folderid == "1") {
                return "My Assets";
            } else {
                var folderMatch = _.findWhere($scope.foldersData, {
                    id: folderid
                });
                return folderMatch.name;
            }
        };

        //select list filter - filter assets by size reformat dimension and filesize for display
        $scope.isSelectAsset = function(selectItem) {
            var isValid = true;
            if (isValid) {
                selectItem['dimension'] = assetsLibraryService.getAssetDimension(selectItem);
                var displayFileSize = assetsLibraryService.parseSizeFromBytes(selectItem.formatContext.fileSize);
                selectItem['displayFileSize'] = {
                    fileSize: selectItem.formatContext.fileSize,
                    displayFileSize: displayFileSize
                };
                if (selectItem.thumbnails && selectItem.thumbnails.length > 0) {
                    selectItem['url'] = selectItem.thumbnails[0].url;
                } else {
                    selectItem['url'] = "/ignoreImages/No_pic_thumbnail.png";
                }
            }
            return isValid;
        };

        $scope.$watch("metadataInfoList", function() {
            for (var i = 0; i < $scope.metadataInfoList.length; i++) {
                var asset = $scope.metadataInfoList[i];
                for (var index = 0; index < uploader.queue.length; index++) {
                    var item = uploader.queue[index];
                    if (asset.assetId == item.assetId) {
                        item.destinationFolder = $scope.getFolderName(asset.folderId);
                        item.icon = $scope.getFileTypeIcon(item.file);
                        break;
                    }
                }
            }
        }, true);

        var saveMetaDataOnModalClose = function() {
            var isSuccessfullySaved = true;
            if (typeof $scope.metadataInfoList != "undefined" && $scope.metadataInfoList.length > 0) {
                /*if ($scope.IsSingleFileUpload) {
                 */
                /*if ($scope.metadataInfoList[0].folderId == "") {
                           mmAlertService.addError("Please make sure your asset has a destination folder selected.");
                           isSuccessfullySaved = false;
                           return isSuccessfullySaved;
                           }*/
                /*
                 */
                /*remove folder ID if it is not valid = top node*/
                /*
                          if ($scope.metadataInfoList[0].folderId == "1" || $scope.metadataInfoList[0].folderId == "undefined") {
                            $scope.metadataInfoList[0].folderId == ""
                          }
                        }
                        else {
                          */
                /*if (!$scope.VerifyAssetHasDestinationFolder()) {
                           isSuccessfullySaved = false;
                           return isSuccessfullySaved;
                           }*/
                /*
                          if (!$scope.verifyAssetHasValidFolder()) {
                            isSuccessfullySaved = false;
                            return isSuccessfullySaved;
                          }
                        }*/
                for (var i = 0; i < $scope.metadataInfoList.length; i++) {
                    var asset = $scope.metadataInfoList[i];
                    if (asset.isUploaded && typeof asset.correlationId != "undefined" && !asset.isHtml5Folder) {
                        //save asset metadata
                        if ($scope.isAssetLibrary) {
                            asset.type = "Asset";
                        }
                        var data = angular.copy(asset);
                        if (data.folderId == "1" || typeof data.folderId === "undefined") {
                            data.folderId = "";
                        }
                        delete data.assetId;
                        delete data.isUploaded;
                        delete data.workspaceFolderId;
                        delete data.isHtml5Folder;
                        delete data.icon;
                        //use ec2AMSRestangular until we fix backend issue
                        assetService.postAssetMetaData(data, asset.correlationId).then(function(returnData) {
                            console.log("metadata save on close - success", returnData);
                        }, function(response) {
                            // error
                            console.log("metadata save on close - error", response);
                        });
                    } else if (asset.isUploaded && typeof asset.correlationId != "undefined" && asset.isHtml5Folder) {
                        //save html5 folder
                        var newFolderName = asset.displayName; //keep as is
                        var incrementVariation = false;
                        if (asset.displayName.lastIndexOf('.') >= 0) {
                            newFolderName = asset.displayName.substr(0, asset.displayName.lastIndexOf('.')); //trim file extension
                            incrementVariation = true;
                        } else if (asset.displayName.lastIndexOf('(') < 0) {
                            if (isFolderNameAlreadyExists(newFolderName, asset.folderId, "FOLDER")) {
                                incrementVariation = true;
                            }
                        }
                        if ($scope.foldersData.length > 0 && incrementVariation) {
                            var folderNameCount = isFolderNameCount(newFolderName, null, "FOLDER");
                            if (folderNameCount > 0) {
                                newFolderName = newFolderName + "(" + folderNameCount + ")";
                            }
                        }
                        asset.displayName = newFolderName;
                        //console.log("folder id for folder put", workspaceFolderId, $scope.selectedParentId);
                        var saveItem = EC2Restangular.all(serverUpdateFolderPath + asset.workspaceFolderId);
                        var postBody = {
                            "_type": "AssetFolder",
                            "id": asset.workspaceFolderId,
                            "folderType": 1,
                            "name": newFolderName
                        };
                        saveItem.customPUT(postBody).then(function(result) {
                            var modifiedFolder = result;
                            mmAlertService.addSuccess('Folder successfully saved.');
                        }, function(error) {
                            mmAlertService.addError('Server error saving folder. Please trying again later.');
                        });
                    }
                }
            }
            //get full asset for assets library view
            if ($scope.isAssetLibrary && $scope.uploadAssetIdList.length > 0 && (storedFolderSelection == $scope.selectedParentId)) {
                var assetSearchBody = {
                    "searchText": "*",
                    "page": 1,
                    "itemsPerPage": 100,
                    "indexVersion": 1,
                    "fieldTerms": {
                        "assetId": $scope.uploadAssetIdList
                    }
                };
               
            }
            return isSuccessfullySaved;
        }

        $scope.assetError = {
            text: ""
        };

        $scope.toggleSelectTab = function(tab) {
            $scope.isSelectTab = tab;
            if (!tab) {
                var selFolder = assetsLibraryService.getById.call($scope.foldersData, $scope.selectedParentId);
                if (selFolder) {
                    $scope.selectedFolder.name = selFolder.text;
                    $scope.selectedFolder.id = selFolder.id;
                } else {
                    //no folders retrieved or selected fold
                }
                $scope.folderOkToAssign = false;
            }
        };

        $scope.gridRowDblClick = function(asset) {
            //select asset, attach to ad, close modal
            $scope.itemAssets.selectedItems[0] = asset;
            if ($scope.isAdPreview) {
                $scope.addBackgroundToPreview();
            } else {
                if ($scope.selectedCreativeType == 'html5') {
                    //html5
                    $scope.attachWorkspaceFolderToAd();
                } else {
                    $scope.attachImagesToAd();
                }
            }
        };

        function extendFolderProperties(folder) {
            var viewModel = {
                parent: folder.parentId == null ? "#" : folder.parentId,
                text: folder.name,
                dimensions: "",
                displayFileSize: "",
                isChecked: false,
                title: folder.name,
                toggleCheckState: function() {
                    this.isChecked = !this.isChecked;
                }
            };
            _.extend(folder, viewModel);
            return folder;
        }

        $scope.selectedFolderTreeNodeHandler = function(nodeData) {
            if ($scope.selectedParentId !== nodeData.node.id) {
                $scope.pagedAssets = [];
                $scope.selectedParentId = nodeData.node.id;
                $scope.selectedFolder = {
                    id: nodeData.node.id,
                    name: nodeData.node.text
                };
                $scope.folderOkToAssign = nodeData.node.type == "HTML5" ? true : false;
                $scope.resetSelectAssets();
                $scope.getPagedDataAsyncDirective($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.searchOptions.searchText);
            }
        };

        $scope.addBackgroundToPreview = function() {

            if ($scope.uploadAssetIdList.length > 0) {
                //test
                //        $modalInstance.close(assetsLibraryService.tempAsset[0]);
                //        $rootScope.$broadcast("hideFlyoutProgress");

                //var assetSearchBody = { "searchText": "*", "page": 1, "itemsPerPage": 100, "indexVersion": 1, "assetType":"source","currentVersion":true, "fieldTerms": { "assetId": $scope.uploadAssetIdList }};
                //use ec2AMSRestangular until we fix backend issue
                //assetService.searchAssets(assetSearchBody).then(function (returnData) {
                //search POST not working, use GET for now

                    var getAssetsUrl = 'assetMgmt';
                    EC2Restangular.one(getAssetsUrl, $scope.uploadAssetIdList[0]).get().then(function(returnData) {
                        var uploadedBackgrounds = returnData;
                        for (var j = 0; j < uploadedBackgrounds.length; j++) {
                            for (var i = 0; i < $scope.metadataInfoList.length; i++) {
                                if ($scope.metadataInfoList[i].correlationId == uploadedBackgrounds[j].assetId) {
                                    uploadedBackgrounds[j].assetCode = $scope.metadataInfoList[i].displayName;
                                    uploadedBackgrounds[j].businessMetadata.folderId = $scope.selectedParentId;
                                    if (typeof returnData.thumbnails == "undefined" || !returnData.thumbnails) {
                                        uploadedBackgrounds[j].thumbnails = [];
                                        uploadedBackgrounds[j].thumbnails.push(returnData.publishHostName + returnData.publishPath);
                                    }
                                }
                            }
                        }
                        $modalInstance.close(uploadedBackgrounds); //return uploaded background images
                        $rootScope.$broadcast("hideFlyoutProgress");
                    }, function(response) {
                        mmAlertService.addError("Error retrieving background images to add to preview.");
                    });

            }
        };

        function getFolders() {
            //console.log("get folders");
            serverGetFolders.getList().then(function(result) {
                //TODO should this be just result.length > 0? OR remove it and else below
                if (result.length >= 0) {
                    var cleanFolders = [];
                    var names = [];

                    for (var i = 0; i < result.length; i++) {
                        if (result[i].name != "Test Asset Folder") {
                            names.push(result[i].name);
                            var f = {
                                name: result[i].name,
                                id: result[i].id,
                                parentId: result[i].parentId,
                                rootParentId: result[i].rootParentId,
                                type: result[i].folderType,
                                folders: result[i].folders,
                                files: result[i].files
                            };
                            cleanFolders.push(f);
                        }
                    }

                    $scope.foldersData.length = 0;
                    $scope.foldersTreeData.length = 0;
                    var workspaceFolders = [];

                    var folders = assetsLibraryService.addRootFolder(cleanFolders);

                    if ($scope.selectedCreativeType == "html5") {
                        $scope.initialFolders = folders;
                        if (typeof folders != "undefined" && folders.length > 0) {
                            for (var i = 0, iLen = folders.length; i < iLen; i++) {
                                //workspace specific folder list
                                if (folders[i].id == "1") {
                                    workspaceFolders.push(folders[i]);
                                }
                                if (folders[i].type == "HTML5") {
                                    traverseFolderBackUnique(workspaceFolders, folders[i].id);
                                }
                            }
                            folders = workspaceFolders;
                        }
                    }

                    if (typeof folders != "undefined" && folders.length > 0) {
                        _.forEach(folders, function(d, i) {
                            $scope.foldersData.push(extendFolderProperties(d));
                            var folderValues = {
                                id: d.id,
                                parent: d.parent,
                                text: d.text,
                                type: d.type,
                                state: {
                                    selected: d.state != null ? d.state.selected : false,
                                    opened: d.state != null ? d.state.opened : false
                                }
                            };
                            $scope.foldersTreeData.push(folderValues);

                        });
                    }

                    if (!$scope.isAdPreview) {
                        //regular asset upload
                        if (!$scope.isAssetLibrary) {
                            $scope.selectedParentId = "1";
                            $scope.selectedFolder = {
                                id: $scope.foldersTreeData[0].id,
                                name: $scope.foldersTreeData[0].text
                            };
                        }
                        //get assets with selected folder
                        if ($scope.showSelectTab) {
                            $scope.getPagedDataAsyncDirective($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.searchOptions.searchText);
                            $scope.$broadcast("refreshTree");
                        }
                    } else {
                        //background image upload
                        var bgImageFolder = _.filter($scope.foldersTreeData, function(d, i) {
                            return d.text == 'Preview Background Images';
                        });

                        if (bgImageFolder.length < 1) {
                            //create background image folder
                            //var bckgrndPostBody = {"name":"Preview Background Images", "type": "0"};
                            //use ec2AMSRestangular until we fix backend issue
                            //serverPostFolders.post(bckgrndPostBody).then(function (data) {

                            var saveItem = EC2Restangular.all(serverUpdateFolderPath);
                            folder = {
                                "_type": "AssetFolder",
                                "folderType": 0,
                                "name": "Preview Background Images",
                                "parentId": null,
                                "rootParentId": null
                            };
                            saveItem.customPOST(folder).then(function(result) {
                                if (result.length > 0) {
                                    var newFolder = result[0];
                                    $scope.foldersData.push(extendFolderProperties(newFolder));
                                    var folderValues = {
                                        id: newFolder.id,
                                        parent: newFolder.parent,
                                        text: newFolder.text,
                                        type: newFolder.type,
                                        state: {
                                            selected: newFolder.state != null ? newFolder.state.selected : false,
                                            opened: newFolder.state != null ? newFolder.state.opened : false
                                        }
                                    };
                                    $scope.foldersTreeData.push(folderValues);
                                    $scope.selectedParentId = result[0].id;
                                    $scope.selectedFolder = {
                                        id: result[0].id,
                                        name: result[0].name
                                    };
                                } else {
                                    mmAlertService.addError('Unable to create background image folder.');
                                }
                            }, function(error) {
                                mmAlertService.addError('Error creating background image folder.');
                                processError(error);
                            });
                        } else {
                            //background image folder exists
                            $scope.selectedParentId = bgImageFolder[0].id;
                            $scope.selectedFolder = {
                                id: bgImageFolder[0].id,
                                name: bgImageFolder[0].text
                            };
                        }
                    }
                } else {
                    mmAlertService.addError("Error retrieving folders.");
                    //create root folder
                    var folder = [];
                    var rootFolder = extendFolderProperties(assetsLibraryService.addRootFolder(folder)[0]);
                    var folderValues = {
                        id: rootFolder.id,
                        parent: rootFolder.parentId == null ? "#" : rootFolder.parentId,
                        text: rootFolder.name,
                        type: rootFolder.type,
                        state: {
                            selected: rootFolder.state.selected,
                            opened: rootFolder.state.opened
                        }
                    };
                    $scope.foldersTreeData.push(folderValues);
                    $scope.selectedParentId = "1";
                    $scope.selectedFolder = {
                        id: $scope.foldersTreeData[0].id,
                        name: $scope.foldersTreeData[0].text
                    };
                    //load assets with selected folder
                    if ($scope.showSelectTab) {
                        $scope.getPagedDataAsyncDirective($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.searchOptions.searchText);
                    }
                }

            }, function(error) {
                mmAlertService.addError("Error retrieving folders.");
                //create root folder
                var folder = [];
                var rootFolder = extendFolderProperties(assetsLibraryService.addRootFolder(folder)[0]);
                var folderValues = {
                    id: rootFolder.id,
                    parent: rootFolder.parentId == null ? "#" : rootFolder.parentId,
                    text: rootFolder.name,
                    type: rootFolder.type,
                    state: {
                        selected: rootFolder.state.selected,
                        opened: rootFolder.state.opened
                    }
                };
                $scope.foldersTreeData.push(folderValues);
                $scope.selectedParentId = "1";
                $scope.selectedFolder = {
                    id: $scope.foldersTreeData[0].id,
                    name: $scope.foldersTreeData[0].text
                };
                $scope.$broadcast("refreshTree");
                //load assets with selected folder
                if ($scope.showSelectTab) {
                    $scope.getPagedDataAsyncDirective($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.searchOptions.searchText);
                }
            });
        }

        function traverseFolderBackUnique(arr, id) {
            var folder = assetsLibraryService.getById.call($scope.initialFolders, id);
            if (typeof folder != "undefined") {
                //check if it is already in folder array
                var match = assetsLibraryService.getById.call(arr, id);
                if (typeof match == "undefined") {
                    //new folder
                    arr.push(folder);
                }
                if (folder.parentId != "1") {
                    traverseFolderBackUnique(arr, folder.parent);
                }
            }
            /*setTimeout(function () {
             $scope.$apply();
             }, 1000);*/
        }

        $scope.attachWorkspaceFolderToAd = function() {
            $scope.attachingAssetsInProgress = true;
            $scope.persistAssetMetaData();
            if ($scope.isSelectTab && $scope.uploadFolderIdList.length == 0) {
                //return html5 folder id
                var selFolder = assetsLibraryService.getById.call($scope.foldersData, $scope.selectedParentId);
                console.log("selected html5 folder", selFolder, $scope.showSelectTab, $scope.isSelectTab);
                selFolder.rootParentId = null;
                if (selFolder.parentId == "1") {
                    selFolder.parentId = selFolder.parent = null;
                }
                $scope.attachingAssetsInProgress = false;
                $modalInstance.close($scope.selectedParentId); //return selected folder id
                $rootScope.$broadcast("hideFlyoutProgress");

                if (selFolder) {
                    mmAlertService.addSuccess("Successfully attached workspace folder to ad.");
                } else {
                    mmAlertService.addError("No workspace folder attached to ad.");
                }
            } else {
                //return uploaded bundles folder ids
                if ($scope.uploadFolderIdList.length > 0) {
                    $scope.attachingAssetsInProgress = false;
                    $modalInstance.close($scope.uploadFolderIdList); //return selected folder id array
                    $rootScope.$broadcast("hideFlyoutProgress");
                }
            }

        };

        function isFolderNameCount(name, id, type) {
            var isAlreadyExists = [];
            //var isAlreadyExists = false;
            if (typeof name != "undefined" && name != "") {
                isAlreadyExists = _.filter($scope.foldersData, function(folder) {
                    var mainName = folder.name.substr(0, folder.name.lastIndexOf('(')); //trim file extension
                    var matchName = mainName != "" ? mainName : folder.name;
                    return matchName == name;
                });
            }
            return isAlreadyExists.length;
        };



        $timeout(function() {
            var mainParent = $(".upload-modal").parent().parent();
            mainParent.before("<div id='confirmbackdrop' ng-style='{'z-index': 1040 + index*10}' ng-class='{in: animate}' class='modal-backdrop fade in' modal-backdrop='' style='z-index: 1050;'></div>")
        }, 20);

    }
]);
