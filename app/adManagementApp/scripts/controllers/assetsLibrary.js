'use strict';
app.controller('assetsLibraryCtrl', ['$scope', '$rootScope', '$stateParams', '$timeout', '$http', 'EC2Restangular', 'EC2AMSRestangular', 'assetsLibraryService', '$modal', 'mmAlertService', 'enums', 'adService', '$state', '$location', 'mmUtils',
        function($scope, $rootScope, $stateParams, $timeout, $http, EC2Restangular, EC2AMSRestangular, assetsLibraryService, $modal, mmAlertService, $enums, adService, $state, $location, mmUtils) {

            $scope.dblClick = function(asset) {
                if (asset.mediaType.indexOf("FOLDER") > -1) {
                    goToFolder(asset);
                } else {
                    $state.go('spa.asset.assetEdit', {
                        assetId: asset.id
                    });
                }

                function goToFolder(nodeData) {
                    var parentId = nodeData.id;
                    currentlySelectedId = $scope.selectedParentId = parentId;
                    $scope.commonModel.isSearchView = false;
                    $scope.commonModel.searchText = "";
                    var data = {
                        "node": {
                            id: currentlySelectedId
                        }
                    };
                    $scope.selectedNodeHandler(data);
                }
            }
            $scope.showMoveModal = function() {

                $scope.data = $scope.foldersData;
                $scope.roleList = assetsLibraryService.prepareFolders($scope.data);
                var selFolder = assetsLibraryService.getById.call($scope.foldersData, $scope.selectedParentId);
                $scope.selectedFolder = {
                    name: selFolder.text,
                    id: selFolder.id
                };

                $scope.changeFolderOfAllAssets = true;
                var modalInstance = $modal.open({
                    templateUrl: './adManagementApp/views/destinationModal.html',
                    controller: 'DestinationCtrl',
                    backdrop: 'static',
                    scope: $scope
                });
                modalInstance.result.then(function(selectedFolder) {
                    //ok
                    selectTreeNode(selectedFolder);
                }, function() {
                    //cancel
                });
            };
            $scope.getAssetTileThumbnail = function(asset) {
                var defaultImgUrl = './ignoreImages/default_image_big.png';
                if (!asset.thumbnails) {
                    return defaultImgUrl;
                }
                var currentUrl = asset.thumbnails[0].url;
                if (!mmUtils.utilities.IsImageUrl(currentUrl)) {
                    return defaultImgUrl;
                }
                return currentUrl;
            }
            if (typeof $scope.commonModel == "undefined") {
                $scope.commonModel = {
                    checkedAssets: [],
                    checkedFolders: [],
                    checkedData: [],
                    filteredAssets: [],
                    filteredFolders: [],
                    allData: [],
                    foldersData: [],
                    newFolder: "",
                    renameFolder: {},
                    isShowTree: true,
                    selectedParentId: "",
                    breadCrumbArray: [],
                    searchText: "",
                    totalServerItems: 0
                };
                $scope.commonModel.isSearchView = false;
                $scope.searchOptions = {
                    searchText: ""
                };
                $scope.isChildView = false;
                $scope.gettingData = false;
                $scope.showCentralSpinner = true;
                $scope.revertToStdView = false;
                //init assets paging
                //infinite scroll
                $scope.pagingOptions = {
                    pageSizes: [50, 100, 200],
                    pageSize: 100,
                    currentPage: 1
                };

            } else {

                $scope.commonModel.newFolder = "";
                if (typeof $stateParams.folderId == "undefined" || $stateParams.folderId == "" || $scope.commonModel.selectedParentId != $stateParams.folderId || $scope.revertToStdView) {
                    $scope.commonModel.filteredAssets = [];
                    $scope.commonModel.filteredFolders = [];
                    $scope.commonModel.allData = [];
                    $scope.commonModel.foldersData = [];
                    $scope.commonModel.selectedParentId = "";
                    $scope.isChildView = false;
                    $scope.revertToStdView = false;
                    $scope.commonModel.showCentralSpinner = true;
                    $scope.enableMove = $scope.enableRename = false;

                } else {

                    $scope.isChildView = true;
                    $scope.revertToStdView = false;
                    if ($scope.commonModel.isSearchView) {
                        $scope.gettingData = true;
                        $scope.commonModel.showCentralSpinner = true;
                    } else {
                        $scope.gettingData = false;
                        $scope.commonModel.showCentralSpinner = false;
                    }
                }

            }

            $scope.enableMoveAndRename = function() {

                return $scope.selectedFolder != 1;
            }

            $scope.allAssets = [];
            $scope.folders = [];
            $scope.type = 'masterAd';
            $scope.modalInstance = null;
            $scope.isModalAlreadyOpen = false;
            $scope.sideTreeWidth = "17.5%";
            $scope.assetContentAreaWidth = "82%";
            $scope.showGridView = false;
            $scope.showTileView = true;
            $scope.showListView = false;
            $scope.viewBy = 'tile';

            //used for search view
            $scope.searchAssets = [];

            //used in uploadAsset
            $scope.isAssetLibrary = true;
            $scope.Folders = [];
            $scope.selectedFolder = {
                name: "",
                id: ""
            };

            //var serverFolders = EC2Restangular.all('assetMgmt/folders');
            var serverGetFolders = EC2Restangular.all('assetMgmt/folders');
            var serverAssets = EC2Restangular.all('assetMgmt/');
            var serverUpdateAssetPath = 'mediaPrep/updateMetadataByCorrelationId/';
            var serverUpdateFolderPath = 'assetMgmt/folders/';
            var serverSearchAssets = EC2AMSRestangular.all('assetMgmt/search');
            var newTemplate = './adManagementApp/views/assetLibrary/newFolder.html';
            var renameTemplate = './adManagementApp/views/assetLibrary/renameFolder.html';
            var moveTemplate = './adManagementApp/views/assetLibrary/moveFolder.html';
            //var uploadTemplate = "./adManagementApp/views/assetLibrary/uploadAsset.html";
            var editTemplate = "./adManagementApp/views/assetLibrary/assetEdit.html";
            var currentlySelectedId = 0;
            var currentlySelectedFolder = 0;
            var folderToMoveToId = 0;
            var initialPageLoaded = false;

            var urlParams = $location.path().split("/");

            if (!$scope.isChildView) {

                if (typeof urlParams[4] != "undefined") {
                    currentlySelectedId = urlParams[4];
                    $scope.commonModel.selectedParentId = currentlySelectedId;
                    angular.element('.jstree-anchor').removeClass('jstree-clicked');
                    angular.element('#' + currentlySelectedId + '_anchor').addClass("jstree-clicked");
                }

                if (typeof urlParams[6] != "undefined") {
                    if (urlParams[6] == "true") {
                        //if ($scope.commonModel.searchText != "") {
                        $scope.commonModel.isSearchView = true;
                        //} else {
                        //  $scope.commonModel.isSearchView = false;
                        //}
                    }
                } else {
                    $scope.commonModel.isSearchView = false;
                    $scope.commonModel.searchText = "";
                }
            }

            if (typeof urlParams[5] != "undefined") {
                $scope.viewBy = urlParams[5];
                $scope.$parent.viewBy = urlParams[5];
            }

            //this is only for demo purpose, remove it when services are ready.
            var getUniqueId = function() {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            }

            function prepareAssetsToRender() {

                attachExtendedPropsToAsset();

                $scope.commonModel.filteredFolders.sort(sortOnDisplayName);
                $scope.commonModel.filteredAssets.sort(sortOnDisplayName);

                $scope.commonModel.allData = $scope.commonModel.filteredFolders.concat($scope.commonModel.filteredAssets);
                $scope.commonModel.allData.gridAddName = 'ASSETS';
                $scope.commonModel.allData.gridAddLink = $scope.showUploadAssetModal;

                var arr = [];
                var selectedAsset = [];

                for (var k = 0; k < $scope.commonModel.checkedData.length; k++) {
                    $scope.commonModel.checkedData[k].isChecked = true;
                    arr.push($scope.commonModel.checkedData[k].id);

                    if ($scope.commonModel.checkedData[k].type == "Asset") {
                        selectedAsset.push($scope.commonModel.checkedData[k]);
                    }
                }
                $scope.commonModel.checkedAssets = selectedAsset;

                if (arr.length > 0) {
                    var fillAssets = [];
                    //update property of checked assets
                    for (var k = 0; k < $scope.commonModel.filteredAssets.length; k++) {
                        if (in_array($scope.commonModel.filteredAssets[k].id, arr)) {
                            $scope.commonModel.filteredAssets[k].isChecked = true;
                        } else {
                            $scope.commonModel.filteredAssets[k].isChecked = false;
                        }
                        fillAssets.push($scope.commonModel.filteredAssets[k]);
                    }
                    $scope.commonModel.filteredAssets = fillAssets;
                }
            }

            function attachExtendedPropsToAsset() {
                for (var k = 0; k < $scope.commonModel.filteredAssets.length; k++) {
                    assetsLibraryService.extendAssetProperties($scope.commonModel.filteredAssets[k]);
                    $scope.commonModel.filteredAssets[k].parentFolderName = assetsLibraryService.getParentFolder($scope.commonModel.foldersData, $scope.commonModel.filteredAssets[k].businessMetadata.folderId);
                }
            }

            function resetViewAssets() {
                $scope.gettingData = false;
                $scope.commonModel.filteredAssets.length = 0;
                $scope.pagingOptions.currentPage = 1;
                $scope.totalClientItems = 0;
                $scope.commonModel.totalServerItems = 0;
                $scope.lastPage = false;
            }
            if (!$scope.isChildView) {
                resetViewAssets();
            }

            function setupLoadForNonSearch(pageSize, page, searchText) {
                var data;

                var selectedFilterFolder = $scope.commonModel.selectedParentId;
                if (selectedFilterFolder == "1" || selectedFilterFolder == "undefined" || selectedFilterFolder == null) {
                    selectedFilterFolder = "";
                }
                var assetsSearchBody = {
                    "searchText": "*",
                    "page": page,
                    "itemsPerPage": pageSize,
                    "indexVersion": 1,
                    "assetType": "source",
                    "currentVersion": true,
                    "fieldTerms": {
                        "businessMetadata.folderId": [selectedFilterFolder]
                    },
                    accountId: $scope.$root.loggedInUserAccountId
                };
                return assetsSearchBody;
            }

            function setupLoadForSearch(pageSize, page, searchText) {
                if ($scope.commonModel.searchText != "") {
                    $scope.searchAssets.length = 0;
                    $scope.commonModel.isSearchView = true;
                    var arr = [];
                    var selectedFolderId = [];

                    if (currentlySelectedId != "1") {
                        selectedFolderId.push(currentlySelectedId);
                        traverseFolder(arr, $scope.commonModel.foldersData, currentlySelectedId);
                        for (var k = 0; k < arr.length; k++) {
                            selectedFolderId.push(arr[k].id);
                        }
                    } else {
                        selectedFolderId.push("");
                    }
                    var searchText = "*" + $scope.commonModel.searchText.toLowerCase() + "*";

                        var pageSearchBody = {
                            "searchText": searchText,
                            "page": 1,
                            "itemsPerPage": 100,
                            "indexVersion": 1,
                            "assetType": "source",
                            "currentVersion": true
                        };
                        if (selectedFolderId != "") {
                            pageSearchBody.fieldTerms = {
                                "businessMetadata.folderId": selectedFolderId
                            }
                        }

                    return pageSearchBody;
                } else {
                    $scope.commonModel.isSearchView = false;
                    $state.go("spa.creativeCentralMain.assetsLibrary." + $scope.viewBy, {
                        folderId: $scope.commonModel.selectedParentId,
                        viewType: $scope.viewType,
                        search: false
                    });
                    return false;
                }
            }

            function loadAssets(pageSize, page, searchText) {

                if ($scope.commonModel.isSearchView) {
                    var assetsSearchBody = setupLoadForSearch(pageSize, page, searchText);
                } else {
                    var assetsSearchBody = setupLoadForNonSearch(pageSize, page, searchText);
                }

                var allAssets = [];
                var newAssets = [];


                    serverSearchAssets.post(assetsSearchBody).then(function(result) {
                        //console.log("assets", result);
                        newAssets = result.entity;
                        if (newAssets && newAssets.length > 0) {
                            for (var k = 0; k < newAssets.length; k++) {
                                if (newAssets[k].businessMetadata.folderId == undefined || newAssets[k].businessMetadata.folderId.length == 0) {
                                    newAssets[k].businessMetadata.folderId = '1';
                                }
                            }
                            //commonModel.filteredAssets.length
                            //concat new data to end of view data  Array.prototype.push.apply(mergeTo, mergeFrom);
                            allAssets.push.apply(allAssets, $scope.commonModel.filteredAssets);
                            allAssets.push.apply(allAssets, newAssets);
                            $scope.commonModel.filteredAssets.length = 0;
                            $scope.commonModel.filteredAssets = allAssets;
                            $scope.totalClientItems = $scope.commonModel.filteredAssets.length;
                            $scope.commonModel.totalServerItems = result.total;
                            $scope.pageCount = Math.ceil($scope.commonModel.totalServerItems / $scope.pagingOptions.pageSize);
                            if ($scope.pagingOptions.currentPage >= $scope.pageCount) {
                                $scope.lastPage = true;
                            }
                            $scope.gettingData = false;
                            $scope.commonModel.showCentralSpinner = false;
                            if (!$scope.commonModel.isSearchView) {
                                prepareAssetsToRender();
                            } else {
                                attachExtendedPropsToAsset();
                            }
                        } else {
                            //no assets but setup grid
                            $scope.gettingData = false;
                            $scope.commonModel.showCentralSpinner = false;
                            prepareAssetsToRender();
                        }
                    }, function(error) {
                        console.log(error);
                        mmAlertService.addError("Error retrieving assets.");
                        $scope.gettingData = false;
                        $scope.commonModel.showCentralSpinner = false;
                    });

            }

            /*$scope.$watch("commonModel.filteredFolders", function (newVal, oldVal) {
             if (newVal != "undefined") {
              loadAssets();

             }
             }, true);*/

            $scope.foldersInCheckState = function() {
                return _.filter($scope.commonModel.filteredFolders, function(d) {
                    return d.isChecked;
                }).length;
            };

            function mapToViewModel(data) {

                if (typeof data != "undefined" && data.length > 0) {
                    for (var k = 0; k < data.length; k++) {
                        $scope.commonModel.foldersData.push(extendFolderProperties(data[k]));
                    }
                }
            };

            function extendFolderProperties(folder) {
                var viewModel = {
                    parent: folder.parentId == null ? "#" : folder.parentId,
                    text: folder.name,
                    dimensions: "",
                    displayFileSize: {
                        fileSize: "",
                        displayFileSize: ""
                    },
                    isChecked: false,
                    displayName: folder.name,
                    mediaType: folder.type != "HTML5" ? "FOLDER" : "HTML5FOLDER",
                    parentFolderName: assetsLibraryService.getParentFolder($scope.commonModel.foldersData, folder.parentId),
                    tileType: "AssetFolder",
                    createdOn: "",
                    displayField: '<span>' + folder.name + '</span>',
                    toggleCheckState: function() {
                        this.isChecked = !this.isChecked;
                    },
                    state: {
                        selected: folder.state != null ? folder.state.selected : false,
                        opened: folder.state != null ? folder.state.opened : false
                    }
                };
                _.extend(folder, viewModel);
                if (folder.mediaType == "HTML5FOLDER") {
                    folder.thumbnail = "./ignoreImages/folder-h5.png";
                    folder.imageIcon = "assets-icon-Html5_folder";
                } else {
                    folder.thumbnail = "./ignoreImages/new-folder.png";
                    folder.imageIcon = "assets-icon-Html_folder";
                }
                return folder;
            };

            $scope.editObj = {
                templateUrl: "adManagementApp/views/adEdit.html",
                controller: 'adEditCtrl'
            }

            function prepareFolders() {
                serverGetFolders.withHttpConfig({
                    cache: false
                }).getList().then(function(result) {
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
                    var folders = addRootFolder(cleanFolders);
                    $scope.commonModel.foldersData.length = 0;
                    mapToViewModel(folders);
                    selectDefaultFolder();
                    if (!initialPageLoaded) initialPageLoaded = true;
                    $scope.$broadcast("refreshTree");
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
                    $scope.commonModel.foldersData.push(folderValues);
                    selectDefaultFolder();
                    $scope.$broadcast("refreshTree");
                });
            }

            if (!$scope.isChildView) {
                prepareFolders();
            }

            $scope.renameNodeHandler = function(nodeData) {

                var folder = getById.call($scope.commonModel.foldersData, nodeData.node.id);
                folder.name = nodeData.node.text;
            };

            $scope.newNodeHandler = function(nodeData) {

                var parentId = nodeData.parent;
                var folder = {
                    "tileType": "AssetFolder",
                    "id": getUniqueId(),
                    "clientRefId": null,
                    "folderType": "DEFAULT",
                    "name": "Parent 2",
                    "parentId": parentId,
                    "rootParentId": null,
                    "folders": 0,
                    "files": 0

                };
            };

            function isFolderNameAlreadyExists(name, id, type) {

                if (typeof name != "undefined" && name != "") {
                    var allData = $scope.commonModel.foldersData;
                    return assetsLibraryService.isFolderNameAlreadyExists(allData, name, id, type, currentlySelectedId);
                }
                return true;

            };

            $scope.createNewFolder = function() {

                currentlySelectedFolder = 0;

                if ($scope.commonModel.checkedFolders.length > 0) {
                    if ($scope.commonModel.checkedFolders.length > 1) {
                        mmAlertService.addError('Please select single destination folder.');
                        return false;
                    } else {
                        currentlySelectedFolder = $scope.commonModel.checkedFolders[0].id;
                    }

                } else {
                    currentlySelectedFolder = currentlySelectedId;
                }

                /*if (currentlySelectedFolder <= 0) {
                 mmAlertService.addError('Please select a destination folder.');
                 return false;
                 }*/
                if ($scope.commonModel.newFolder == "") {
                    mmAlertService.addError('Please enter a folder name.');
                    return false;
                }
                if (isFolderNameAlreadyExists($scope.commonModel.newFolder, null, "FOLDER")) {
                    mmAlertService.addError('Folder with this name already exists, please choose another name.');
                    return false;
                }
                //TODO remove - mock folder data
                var folder = {
                    "tileType": "AssetFolder",
                    "id": getUniqueId(),
                    "clientRefId": null,
                    "folderType": "DEFAULT",
                    "name": $scope.commonModel.newFolder,
                    "parentId": currentlySelectedFolder,
                    "rootParentId": null,
                    "folders": 0,
                    "files": 10
                };

                    var rootFolderId = '';

                    if (currentlySelectedFolder != '1') {
                        for (var k = 0; k < $scope.commonModel.foldersData.length; k++) {
                            if ($scope.commonModel.foldersData[k].id == currentlySelectedFolder) {
                                rootFolderId = $scope.commonModel.foldersData[k].rootParentId;
                            }
                        }
                    }
                    var saveItem = EC2Restangular.all(serverUpdateFolderPath);
                    folder = {
                        "_type": "AssetFolder",
                        "folderType": 0,
                        "name": $scope.commonModel.newFolder,
                        "parentId": currentlySelectedFolder == 0 || currentlySelectedFolder == '1' ? null : currentlySelectedFolder,
                        "rootParentId": (rootFolderId == "" || rootFolderId == "1") ? null : rootFolderId
                    };
                    saveItem.customPOST(folder).then(function(result) {
                        setTimeout(function() {
                            //get new folders list and update view
                            prepareFolders();
                            mmAlertService.addSuccess('Folder created successfully.');
                            $scope.close(true);
                        }, 500);
                    }, function(error) {
                        mmAlertService.addError('Server error creating new folder. Please try again later.');
                        console.log(error);
                        $scope.close(false);
                    });

            };

            $scope.renameFolder = function(item) {

                if (item.name == "") {
                    mmAlertService.addError('Please enter folder name.');
                    return false;
                }
                if (item.type == "FOLDER") {
                    if (isFolderNameAlreadyExists(item.name, item.id, item.type)) {
                        mmAlertService.addError(item.type.toLowerCase() + ' with this name already exists.  Please choose another name.');
                        return false;
                    }
                }

                    if (item.type == "ASSET") {
                        var asset = getById.call($scope.commonModel.filteredAssets, item.id);
                        var saveItem = EC2AMSRestangular.all(serverUpdateAssetPath + item.id);
                        var postBody = {
                            "correlationId": item.id,
                            "displayName": item.name
                        };
                        saveItem.customPOST(postBody).then(function(result) {
                            asset.displayName = item.name;
                            mmAlertService.addSuccess('Successfully renamed ' + item.type.toLowerCase() + '.');
                            $scope.close(true);
                        }, function(error) {
                            mmAlertService.addError('Server error renaming asset. Please try again later.');
                            console.log("Error renaming asset", error);
                            $scope.close(false);
                        });

                    } else {
                        var folder = getById.call($scope.commonModel.foldersData, item.id);

                        var rootFolderId = '';
                        for (var k = 0; k < $scope.commonModel.foldersData.length; k++) {
                            if ($scope.commonModel.foldersData[k].id == folder.parentId) {
                                rootFolderId = $scope.commonModel.foldersData[k].rootParentId;
                            }
                        }
                        var saveItem = EC2Restangular.all(serverUpdateFolderPath + folder.id);
                        var postBody = {
                            "_type": "AssetFolder",
                            "id": folder.id,
                            "folderType": folder.type == "HTML5" ? 1 : 0,
                            "name": item.name,
                            "parentId": folder.parentId == "1" ? null : folder.parentId,
                            "rootParentId": rootFolderId == "1" ? null : rootFolderId
                        };
                        saveItem.customPUT(postBody).then(function(result) {
                            var modifiedFolder = result;
                            folder.name = folder.text = folder.displayName = item.name;
                            /*for (var k = 0; k < $scope.commonModel.foldersData.length; k++) {
                             if ($scope.commonModel.foldersData[k].id == folder.id) {
                             $scope.commonModel.foldersData[k].name = $scope.commonModel.renameFolder;
                             }
                             }*/
                            mmAlertService.addSuccess('Folder successfully renamed.');
                            $scope.close(true);
                        }, function(error) {
                            mmAlertService.addError('Server error renaming folder. Please try again later.');
                            console.log("Error modifying folder - rename", error);
                            $scope.close(false);
                        });
                    }

            };

            function showDestinationModal() {
                $scope.data = $scope.commonModel.foldersData;
                $scope.roleList = assetsLibraryService.prepareFolders($scope.commonModel.foldersData);
                var selFolder = getById.call($scope.commonModel.foldersData, currentlySelectedId);
                $scope.selectedFolder = {
                    name: selFolder.text,
                    id: selFolder.id
                };

                $scope.changeFolderOfAllAssets = true;
                var modalInstance = $modal.open({
                    templateUrl: './adManagementApp/views/destinationModal.html',
                    controller: 'DestinationCtrl',
                    backdrop: 'static',
                    scope: $scope
                });
                return modalInstance;
            }


            $scope.showDestinationForMove = function(mode) {

                showDestinationModal().result.then(function(selectedFolder) {

                    moveFolder(selectedFolder.id);
                }, function() {
                    //cancel
                });
            };

            $scope.showDestinationForUpload = function(mode) {
                showDestinationModal().result.then(function(selectedFolder) {
                    $timeout(prepareFolders, 1000);

                    $scope.selectedFolder.name = selectedFolder.name;
                    $scope.selectedFolder.id = selectedFolder.id;
                }, function() {
                    //cancel
                });
            };




            function moveFolder(folderToMoveToId) {


                var is_move_done = 0;

                if ($scope.commonModel.checkedAssets.length > 0) {
                    var count = 0;
                    for (var k = 0; k < $scope.commonModel.checkedAssets.length; k++) {
                        var updateAsset = _.find($scope.commonModel.filteredAssets, function(f) {
                            return f.id == $scope.commonModel.checkedAssets[k].id;
                        });
                        $scope.commonModel.checkedAssets[k].businessMetadata.folderId = updateAsset.businessMetadata.folderId = folderToMoveToId;
                        $scope.commonModel.filteredAssets.splice(_.indexOf($scope.commonModel.filteredAssets, _.findWhere($scope.commonModel.filteredAssets, {
                            id: $scope.commonModel.checkedAssets[k].id
                        })), 1);

                            var saveItem = EC2AMSRestangular.all(serverUpdateAssetPath + $scope.commonModel.checkedAssets[k].id);
                            var postBody = {
                                "correlationId": $scope.commonModel.checkedAssets[k].id,
                                "folderId": folderToMoveToId
                            };
                            saveItem.customPOST(postBody).then(function(result) {
                                count++;
                                if (count == $scope.commonModel.checkedAssets.length) {
                                    $scope.commonModel.checkedAssets = [];
                                    //  reRenderFolders(currentlySelectedId);
                                    // traverseFolderBack($scope.commonModel.breadCrumbArray, currentlySelectedId);
                                    // prepareAssetsToRender();
                                    mmAlertService.addSuccess('Asset(s) moved successfully.');

                                }
                            }, function(error) {
                                mmAlertService.addError('Server error moving asset(s). Please try again later.');
                                console.log("Error moving assets - move", error);
                            });

                    }
                    is_move_done = 1;
                }

                if ($scope.commonModel.checkedFolders.length > 0) {
                    //checked folders
                    var count = 0;
                    for (var k = 0; k < $scope.commonModel.checkedFolders.length; k++) {
                        if ($scope.commonModel.checkedFolders[k].id == folderToMoveToId) {
                            mmAlertService.addError("Cannot move folder into itself.  Folder" + $scope.commonModel.checkedFolders[k].name + "will not be moved.");
                            count++;
                            continue;
                        }

                            var rootFolder = '';
                            for (var l = 0; l < $scope.commonModel.foldersData.length; l++) {
                                if ($scope.commonModel.foldersData[l].id == $scope.commonModel.checkedFolders[k].parentId) {
                                    rootFolder = $scope.commonModel.foldersData[l].rootParentId;
                                }
                            }

                            var saveItem = EC2Restangular.all(serverUpdateFolderPath + $scope.commonModel.checkedFolders[k].id);
                            var postBody = {
                                "_type": "AssetFolder",
                                "id": $scope.commonModel.checkedFolders[k].id,
                                "folderType": $scope.commonModel.checkedFolders[k].type == "HTML5" ? 1 : 0,
                                "name": $scope.commonModel.checkedFolders[k].name,
                                "parentId": folderToMoveToId == "1" ? null : folderToMoveToId,
                                "rootParentId": rootFolder == "1" ? null : rootFolder
                            };
                            saveItem.customPUT(postBody).then(function(result) {
                                var updateCheckedFolder = _.find($scope.commonModel.checkedFolders, function(f) {
                                    return f.id == result[0].id;
                                });
                                var updateFolder = _.find($scope.commonModel.foldersData, function(f) {
                                    return f.id == result[0].id;
                                });
                                updateCheckedFolder.parent = updateCheckedFolder.parentId = updateFolder.parent = updateFolder.parentId = folderToMoveToId;
                                count++;
                                if (count == $scope.commonModel.checkedFolders.length) {
                                    reRenderFolders(currentlySelectedId);
                                    $scope.commonModel.breadCrumbArray = [];
                                    traverseFolderBack($scope.commonModel.breadCrumbArray, currentlySelectedId);
                                    prepareAssetsToRender();
                                    mmAlertService.addSuccess('Folder(s) moved successfully.');
                                    $scope.close(true);
                                }
                            }, function(error) {
                                mmAlertService.addError('Server error moving folder(s). Please try again later.');
                                console.log("Error moving folders - move", error);
                                $scope.close(false);
                            });

                    }
                    is_move_done = 1;
                }

                if (is_move_done == 0) {
                    //selected folder in folder tree
                    var folder = getById.call($scope.commonModel.foldersData, currentlySelectedId);
                    if (folderToMoveToId == currentlySelectedId) {
                        mmAlertService.addError("Cannot move folder into itself.  Please select another destination folder.");
                        return false;
                    }

                        var rootFolder = '';
                        for (var k = 0; k < $scope.commonModel.foldersData.length; k++) {
                            if ($scope.commonModel.foldersData[k].id == folder.parentId) {
                                rootFolder = $scope.commonModel.foldersData[k].rootParentId;
                            }
                        }

                        var saveItem = EC2Restangular.all(serverUpdateFolderPath + folder.id);
                        var postBody = {
                            "type": "AssetFolder",
                            "id": folder.id,
                            "folderType": folder.type == "HTML5" ? 1 : 0,
                            "name": folder.name,
                            "parentId": folderToMoveToId == "1" ? null : folderToMoveToId,
                            "rootParentId": rootFolder == "1" ? null : rootFolder
                        };
                        saveItem.customPUT(postBody).then(function(result) {
                            folder.parent = folder.parentId = folderToMoveToId;
                            reRenderFolders(currentlySelectedId);
                            $scope.commonModel.breadCrumbArray = [];
                            traverseFolderBack($scope.commonModel.breadCrumbArray, currentlySelectedId);
                            prepareAssetsToRender();
                            mmAlertService.addSuccess('Folder moved successfully.');
                            $scope.close(true);
                        }, function(error) {
                            mmAlertService.addError('Server error moving folder. Please try again later.');
                            console.log("Error moving folder - move", error);
                            $scope.close(false);
                        });

                }
            };

            $scope.selectedNodeHandler = function(nodeData) {
                currentlySelectedId = nodeData.node.id; //use for search
                $scope.gettingData = true;
                if (currentlySelectedId != $scope.commonModel.selectedParentId) {
                    $scope.commonModel.showCentralSpinner = true;
                }
                if (!$scope.commonModel.isSearchView) {
                    $state.go("spa.creativeCentralMain.assetsLibrary." + $scope.viewBy, {
                        folderId: nodeData.node.id,
                        viewType: $scope.viewBy,
                        search: false
                    });
                } else {
                    //$scope.commonModel.selectedParentId = nodeData.node.id;
                    $scope.commonModel.isSearchView = false;
                    $scope.commonModel.searchText = "";
                    $scope.revertToStdView = true;
                    $state.go("spa.creativeCentralMain.assetsLibrary." + $scope.viewBy, {
                        folderId: nodeData.node.id,
                        viewType: $scope.viewBy,
                        search: false
                    });
                    var node = {
                        id: currentlySelectedId
                    };
                    $scope.breadCrumbNodeHandler(node);
                }
            };

            $scope.breadCrumbNodeHandler = function(nodeData) {
                currentlySelectedId = nodeData.id;

                var nodeData = {
                    "node": nodeData
                };
                $scope.selectedNodeHandler(nodeData);

                angular.element('.jstree-anchor').removeClass('jstree-clicked');
                angular.element('#' + nodeData.node.id + '_anchor').addClass('jstree-clicked');
            };

            $scope.gridDoubleClickHandler = function() {
                var arr = _.filter($scope.commonModel.checkedData, function(d) {
                    return d.tileType == "AssetFolder";
                });
                if (arr.length > 0) {
                    var folder = arr[arr.length - 1];
                    $scope.breadCrumbNodeHandler(folder);
                }
            }




            $scope.selectedNodeHandlerInModal = function(nodeData) {
                folderToMoveToId = nodeData.node.id;
            };

            $scope.dragDropHandler = function(nodeData) {
                var parentId = nodeData.parent;
                var id = nodeData.node.id;
                var folderTodrag = getById.call($scope.commonModel.foldersData, id);
                folderTodrag.parent = parentId;
                folderTodrag.parentId = parentId;
                if (currentlySelectedId > 0)
                    reRenderFolders(currentlySelectedId);
                return true;
            };

            $scope.showNewModal = function() {
                showModal(newTemplate);
            };

            $scope.showEditModal = function() {
                $state.go('spa.asset.assetEdit', {
                    assetId: $scope.commonModel.checkedAssets[0].assetId
                });
            };

            $scope.showRenameModal = function() {

                var item_to_rename = {};

                if ($scope.viewBy == "tile") {

                    if ($scope.commonModel.checkedFolders.length == 1 && $scope.commonModel.checkedAssets.length == 0) {
                        //1 folder selected from content area
                        item_to_rename = {
                            "type": "AssetFolder",
                            "id": $scope.commonModel.checkedFolders[0].id,
                            "name": $scope.commonModel.checkedFolders[0].displayName
                        };
                    } else if ($scope.commonModel.checkedFolders.length == 0 && $scope.commonModel.checkedAssets.length == 1) {
                        //1 asset selected from content area
                        item_to_rename = {
                            "type": "Asset",
                            "id": $scope.commonModel.checkedAssets[0].id,
                            "name": $scope.commonModel.checkedAssets[0].displayName
                        };
                    } else if ($scope.commonModel.checkedFolders.length == 0 && $scope.commonModel.checkedAssets.length == 0) {
                        //no asset and folder selected from content area. Rename folder selected in tree div
                        var folder = getById.call($scope.commonModel.foldersData, currentlySelectedId);
                        item_to_rename = {
                            "type": "AssetFolder",
                            "id": folder.id,
                            "name": folder.displayName
                        };
                    } else {
                        mmAlertService.addError('Please select single folder or folder to rename.');
                        return false;
                    }

                } else {
                    if ($scope.commonModel.checkedData.length > 0) {

                        var is_single = 0;
                        var currentlySel = 0;
                        for (var k = 0; k < $scope.commonModel.checkedData.length; k++) {
                            currentlySel = $scope.commonModel.checkedData[k];
                            is_single++;
                        }

                        if (is_single > 1) {
                            mmAlertService.addError('Please select single folder or asset.');
                            return false;
                        } else {
                            item_to_rename = {
                                "type": currentlySel.type,
                                "id": currentlySel.id,
                                "name": currentlySel.displayName
                            };
                        }
                    } else {
                        //no asset and folder selected from content area. Rename folder selected in tree div
                        var folder = getById.call($scope.commonModel.foldersData, currentlySelectedId);
                        item_to_rename = {
                            "type": "AssetFolder",
                            "id": folder.id,
                            "name": folder.displayName
                        };
                    }
                }

                if (item_to_rename == null) {
                    mmAlertService.addError('Please select an asset or folder to rename.');
                    return false;
                } else if (item_to_rename.id == "1" && item_to_rename.type == "AssetFolder") {
                    mmAlertService.addError('The root folder cannot be renamed.');
                    return false;
                }

                $scope.commonModel.renameFolder = {
                    "id": item_to_rename.id,
                    "name": item_to_rename.name,
                    "type": (item_to_rename.type == "Asset") ? "ASSET" : "FOLDER"
                };
                showModal(renameTemplate);
            };

            $scope.showMoveModal = function() {
                if ($scope.commonModel.checkedFolders.length <= 0 && $scope.commonModel.checkedAssets.length <= 0 && (currentlySelectedFolder == null || currentlySelectedFolder == '1')) {
                    mmAlertService.addError('Please select a folder or asset to move.');
                    return false;
                }
                showModal(moveTemplate);
            };



            $scope.showUploadAssetModal = function() {

                if ($scope.isModalOpen) {
                    return;
                }
                $scope.isModalOpen = true;

                $scope.roleList = $scope.Folders = assetsLibraryService.prepareFolders($scope.commonModel.foldersData);
                var selected = getById.call($scope.commonModel.foldersData, $scope.commonModel.selectedParentId);
                $scope.selectedFolder = {
                    name: selected.name,
                    id: selected.id
                };
                $rootScope.selectedDestinationFolder = selected.name;
                $scope.selectedParentId = selected.id; //TODO check this with uploader
                $scope.foldersData = $scope.data = $scope.commonModel.foldersData;

                var adDetails = adService.getAdDetailsForUpload(false, false, null, null, null);
                var modalInstance = $modal.open({
                    templateUrl: './adManagementApp/views/uploadAsset.html',
                    controller: 'uploadAssetCtrl',
                    windowClass: 'upload-newux',
                    backdrop: 'static',
                    scope: $scope,
                    resolve: {
                        adDetailsForUpload: function() {
                            return adDetails;
                        }
                    }
                });
                modalInstance.result.then(function() {
                    $scope.isModalOpen = false;


                }, function() {
                    $scope.isModalOpen = false;
                }).finally(function() {
                    resetViewAssets();
                    prepareFolders();
                   
                });
            }

            $scope.moveSelectedItems = function() {
                var selectedItems = _.filter($scope.commonModel.foldersData, function(d) {
                    return d.isChecked;
                });
                if (selectedItems.length > 0) {

                }
            };

            $scope.selectFolder = function() {

            };

            $scope.close = function(refreshTree) {
                $scope.modalInstance.close();
                $scope.isModalAlreadyOpen = false;
                if (typeof refreshTree != "undefined" && refreshTree)
                    $scope.$broadcast("refreshTree");
            };

            function showModal(template) {
                if ($scope.isModalAlreadyOpen) return false;
                $scope.modalInstance = $modal.open({
                    templateUrl: template,
                    backdrop: 'static',
                    scope: $scope,
                    windowClass: ''
                });
                $scope.isModalAlreadyOpen = true;
            }

            function reRenderFolders(id) {
                $scope.commonModel.filteredFolders = [];
                var parentId = getById.call($scope.commonModel.foldersData, id);
                traverseFolderCustom($scope.commonModel.filteredFolders, $scope.commonModel.foldersData, id, parentId);
                setTimeout(function() {
                    $scope.$apply();
                }, 1000);
            };

            function getById(id) {
                return _.find(this, function(d) {
                    return d.id == id;
                });
            };

            function traverseFolderBack(arr, id) {
                var folder = getById.call($scope.commonModel.foldersData, id);
                if (typeof folder != "undefined") {
                    arr.push(folder);
                    if (folder.parent != "#") {
                        traverseFolderBack(arr, folder.parent);
                    }
                }
                setTimeout(function() {
                    $scope.$apply();
                }, 1000);

            }

            function traverseFolder(arr, entities, id) {

                if (typeof entities != "undefined" && entities.length > 0) {
                    var hasChild = _.some(entities, function(f) {
                        return f.parentId == id;
                    });
                    if (hasChild) {
                        var childs = _.filter(entities, function(f) {
                            return f.parentId == id;
                        });

                        if (childs) {
                            for (var k = 0; k < childs.length; k++) {
                                arr.push(childs[k]);
                                traverseFolder(arr, entities, childs[k].id);
                            }
                        }
                    }
                }
            };

            function traverseFolderCustom(arr, entities, id, parentData) {
                if (typeof entities != "undefined" && entities.length > 0 && typeof parentData != "undefined") {
                    var hasChild = _.some(entities, function(f) {
                        return f.parentId == id;
                    });
                    if (hasChild) {
                        var childs = _.filter(entities, function(f) {
                            return f.parentId == id;
                        });

                        if (childs) {
                            for (var k = 0; k < childs.length; k++) {
                                if (childs[k].parentId == parentData.id && typeof parentData != "undefined") {
                                    arr.push(childs[k]);
                                    traverseFolderCustom(arr, entities, childs[k].id, parentData);
                                }
                            }
                        }
                    }
                }
            };

            $scope.toggleViews = function(type) {

                if (type == 'tile') {
                    $scope.showGridView = false;
                    $scope.showListView = false;
                    $scope.showTileView = true;
                    $scope.viewBy = "tile";

                    $timeout(function() {
                        $scope.adjustTileView();
                    }, 500);

                } else if (type == 'grid') {
                    $scope.showGridView = true;
                    $scope.showTileView = false;
                    $scope.showListView = false;
                    $scope.viewBy = "grid";
                } else {
                    $scope.showListView = true;
                    $scope.showGridView = false;
                    $scope.showTileView = false;
                    $scope.viewBy = "list";
                }

                if ($scope.viewBy == 'grid' || $scope.viewBy == 'list') {

                    for (var k = 0; k < $scope.commonModel.filteredAssets.length; k++) {
                        for (var l = 0; l < $scope.commonModel.checkedAssets.length; l++) {
                            if ($scope.commonModel.checkedAssets[l].id == $scope.commonModel.filteredAssets[k].id) {
                                $scope.commonModel.filteredAssets[k].isChecked = true;
                                break;
                            }
                        }
                    }

                    for (var k = 0; k < $scope.commonModel.foldersData.length; k++) {
                        for (var l = 0; l < $scope.commonModel.checkedData.length; l++) {
                            if ($scope.commonModel.checkedData[l].id == $scope.commonModel.foldersData[k].id) {
                                $scope.commonModel.foldersData[k].isChecked = true;
                                break;
                            }
                        }
                    }

                } else if ($scope.viewBy == 'tile') {

                    var fillAssets = [];
                    var selectedAsset = [];

                    var arr = [];
                    for (var k = 0; k < $scope.commonModel.checkedData.length; k++) {
                        $scope.commonModel.checkedData[k].isChecked = true;
                        arr.push($scope.commonModel.checkedData[k].id);
                    }

                    if (arr.length > 0) {
                        //update property of checked folders
                        for (var k = 0; k < $scope.commonModel.filteredFolders.length; k++) {
                            if (in_array($scope.commonModel.filteredFolders[k].id, arr)) {
                                $scope.commonModel.filteredFolders[k].isChecked = true;
                            } else {
                                $scope.commonModel.filteredFolders[k].isChecked = false;
                            }
                        }

                        //update property of checked assets
                        for (var k = 0; k < $scope.commonModel.filteredAssets.length; k++) {
                            if (in_array($scope.commonModel.filteredAssets[k].id, arr) && !in_array($scope.commonModel.filteredAssets[k].id, selectedAsset)) {
                                selectedAsset.push($scope.commonModel.filteredAssets[k]);
                                $scope.commonModel.filteredAssets[k].isChecked = true;
                            } else {
                                $scope.commonModel.filteredAssets[k].isChecked = false;
                            }
                            fillAssets.push($scope.commonModel.filteredAssets[k]);
                        }
                        $scope.commonModel.filteredAssets = fillAssets;
                    } else {
                        for (var k = 0; k < $scope.commonModel.filteredFolders.length; k++) {
                            $scope.commonModel.filteredFolders[k].isChecked = false;
                        }
                    }
                    $scope.commonModel.checkedAssets = selectedAsset;
                }

                $state.go("spa.creativeCentralMain.assetsLibrary." + type, {
                    folderId: $scope.commonModel.selectedParentId,
                    viewType: type,
                    search: $scope.commonModel.isSearchView
                });
            };
            //var linkTemplate = '<div ng-class="col.colIndex()" class="textBoxControl linkControl"><span ng-if="row.entity.tileType==\'AssetFolder\'">{{row.entity[col.field]}}</span><a ng-if="row.entity.tileType==\'Asset\'" class="grid-anchor" ng-click="redirectToPage(\'spa.asset.assetEdit\', \'assetId\', row.entity[\'assetId\']); $event.stopPropagation();">{{row.entity[col.field]}}</a></div>';

            $scope.$watch("commonModel.isSearchView", function(newVal, oldVal) {
                var imageIconTemplate = '<i class="{{row.entity[col.field]}}"></i>';
                var displayFileSizeTemplate = '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{COL_FIELD.displayFileSize}}</span></div>';
                var dateTemplate = '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity[col.field] | date : col.colDef.gridDateFormat }}</span></div>';
                if ($scope.commonModel.isSearchView) {
                    $scope.columnDefs = [{
                        field: 'imageIcon',
                        displayName: 'Type',
                        isColumnSort: false,
                        width: 50,
                        isColumnEdit: false,
                        cellTemplate: imageIconTemplate,
                        isPinned: false,
                        enableDragDrop: false,
                        gridControlType: $enums.gridControlType.getName("ImageNoHover")
                    }, {
                        field: 'displayName',
                        displayName: 'Title',
                        isColumnEdit: false,
                        isShowToolTip: false,
                        width: 350,
                        isPinned: false,
                        gridControlType: $enums.gridControlType.getName("Link"),
                        textCondition: "row.entity.tileType=='AssetFolder'",
                        linkCondition: "row.entity.tileType=='Asset'",
                        linkClickMethod: "redirectToPage(\'spa.asset.assetEdit\', \'assetId\', row.entity[\'assetId\']); $event.stopPropagation();"
                    }, {
                        field: 'parentFolderName',
                        displayName: 'Folder',
                        isColumnEdit: false,
                        isShowToolTip: false,
                        isPinned: false,
                        /*gridControlType: $enums.gridControlType.getName("TextBox")*/
                        cellTemplate: '<a class="grid-anchor" ng-click="onDblClickRow(row); $event.stopPropagation();">{{row.entity.parentFolderName}}</a>',
                        visible: $scope.commonModel.isSearchView
                    }, {
                        field: 'dimensions',
                        displayName: 'Dimensions',
                        isColumnEdit: false,
                        isShowToolTip: false,
                        isPinned: false,
                        gridControlType: $enums.gridControlType.getName("TextBox")
                    }, {
                        field: 'displayFileSize',
                        displayName: 'Size',
                        isColumnEdit: false,
                        sortFunction: sortOnFileSize,
                        isShowToolTip: false,
                        isPinned: false,
                        cellTemplate: displayFileSizeTemplate
                    }, {
                        field: 'createdOn',
                        displayName: 'Created On',
                        isColumnEdit: false,
                        sortFunction: sortOnDate,
                        isShowToolTip: false,
                        isPinned: false,
                        gridControlType: $enums.gridControlType.getName("TextBox"),
                        cellTemplate: dateTemplate,
                        gridDateFormat: 'yyyy-MM-dd h:mm a'
                    }];

                    $scope.columnDefsListView = [{
                        field: 'thumbnail',
                        displayName: 'Thumbnail',
                        isColumnSort: false,
                        width: 110,
                        isColumnEdit: false,
                        gridControlType: $enums.gridControlType.getName("Image"),
                        isPinned: false,
                        enableDragDrop: false,
                        noPreviewCondition: "row.entity.tileType=='AssetFolder'",
                        previewCondition: "row.entity.tileType=='Asset'"
                    }, {
                        field: 'displayName',
                        displayName: 'Title',
                        isColumnEdit: false,
                        isShowToolTip: false,
                        width: 350,
                        isPinned: false,
                        gridControlType: $enums.gridControlType.getName("Link"),
                        textCondition: "row.entity.tileType=='AssetFolder'",
                        linkCondition: "row.entity.tileType=='Asset'",
                        linkClickMethod: "redirectToPage(\'spa.asset.assetEdit\', \'assetId\', row.entity[\'assetId\']); $event.stopPropagation();"
                    }, {
                        field: 'imageIcon',
                        displayName: 'Type',
                        isColumnSort: false,
                        width: 70,
                        isColumnEdit: false,
                        cellTemplate: imageIconTemplate,
                        isPinned: false,
                        enableDragDrop: false
                    }, {
                        field: 'parentFolderName',
                        displayName: 'Folder',
                        isColumnEdit: false,
                        isShowToolTip: false,
                        isPinned: false,
                        gridControlType: $enums.gridControlType.getName("TextBox"),
                        visible: $scope.commonModel.isSearchView
                    }, {
                        field: 'dimensions',
                        displayName: 'Dimensions',
                        isColumnEdit: false,
                        isShowToolTip: false,
                        isPinned: false,
                        gridControlType: $enums.gridControlType.getName("TextBox")
                    }, {
                        field: 'displayFileSize',
                        displayName: 'Size',
                        isColumnEdit: false,
                        sortFunction: sortOnFileSize,
                        isShowToolTip: false,
                        isPinned: false,
                        cellTemplate: displayFileSizeTemplate
                    }, {
                        field: 'createdOn',
                        displayName: 'Created On',
                        isColumnEdit: false,
                        sortFunction: sortOnDate,
                        isShowToolTip: false,
                        isPinned: false,
                        gridControlType: $enums.gridControlType.getName("TextBox"),
                        cellTemplate: dateTemplate,
                        gridDateFormat: 'yyyy-MM-dd h:mm a'
                    }];
                } else {
                    $scope.columnDefs = [{
                        field: 'imageIcon',
                        displayName: 'Type',
                        isColumnSort: false,
                        width: 50,
                        isColumnEdit: false,
                        cellTemplate: imageIconTemplate,
                        isPinned: false,
                        enableDragDrop: false,
                        gridControlType: $enums.gridControlType.getName("ImageNoHover")
                    }, {
                        field: 'displayName',
                        displayName: 'Title',
                        isColumnEdit: false,
                        isShowToolTip: false,
                        width: 350,
                        isPinned: false,
                        gridControlType: $enums.gridControlType.getName("Link"),
                        textCondition: "row.entity.tileType=='AssetFolder'",
                        linkCondition: "row.entity.tileType=='Asset'",
                        linkClickMethod: "redirectToPage(\'spa.asset.assetEdit\', \'assetId\', row.entity[\'assetId\']); $event.stopPropagation();"
                    }, {
                        field: 'dimensions',
                        displayName: 'Dimensions',
                        isColumnEdit: false,
                        isShowToolTip: false,
                        isPinned: false,
                        gridControlType: $enums.gridControlType.getName("TextBox")
                    }, {
                        field: 'displayFileSize',
                        displayName: 'Size',
                        isColumnEdit: false,
                        sortFunction: sortOnFileSize,
                        isShowToolTip: false,
                        isPinned: false,
                        cellTemplate: displayFileSizeTemplate
                    }, {
                        field: 'createdOn',
                        displayName: 'Created On',
                        isColumnEdit: false,
                        sortFunction: sortOnDate,
                        isShowToolTip: false,
                        isPinned: false,
                        gridControlType: $enums.gridControlType.getName("TextBox"),
                        cellTemplate: dateTemplate,
                        gridDateFormat: 'yyyy-MM-dd h:mm a'
                    }];

                    $scope.columnDefsListView = [{
                        field: 'thumbnail',
                        displayName: 'Thumbnail',
                        isColumnSort: false,
                        width: 110,
                        isColumnEdit: false,
                        gridControlType: $enums.gridControlType.getName("Image"),
                        isPinned: false,
                        enableDragDrop: false,
                        noPreviewCondition: "row.entity.tileType=='AssetFolder'",
                        previewCondition: "row.entity.tileType=='Asset'"
                    }, {
                        field: 'displayName',
                        displayName: 'Title',
                        isColumnEdit: false,
                        isShowToolTip: false,
                        width: 350,
                        isPinned: false,
                        gridControlType: $enums.gridControlType.getName("Link"),
                        textCondition: "row.entity.tileType=='AssetFolder'",
                        linkCondition: "row.entity.tileType=='Asset'",
                        linkClickMethod: "redirectToPage(\'spa.asset.assetEdit\', \'assetId\', row.entity[\'assetId\']); $event.stopPropagation();"
                    }, {
                        field: 'imageIcon',
                        displayName: 'Type',
                        isColumnSort: false,
                        width: 70,
                        isColumnEdit: false,
                        cellTemplate: imageIconTemplate,
                        isPinned: false,
                        enableDragDrop: false
                    }, {
                        field: 'dimensions',
                        displayName: 'Dimensions',
                        isColumnEdit: false,
                        isShowToolTip: false,
                        isPinned: false,
                        gridControlType: $enums.gridControlType.getName("TextBox")
                    }, {
                        field: 'displayFileSize',
                        displayName: 'Size',
                        isColumnEdit: false,
                        sortFunction: sortOnFileSize,
                        isShowToolTip: false,
                        isPinned: false,
                        cellTemplate: displayFileSizeTemplate
                    }, {
                        field: 'createdOn',
                        displayName: 'Created On',
                        isColumnEdit: false,
                        sortFunction: sortOnDate,
                        isShowToolTip: false,
                        isPinned: false,
                        gridControlType: $enums.gridControlType.getName("TextBox"),
                        cellTemplate: dateTemplate,
                        gridDateFormat: 'yyyy-MM-dd h:mm a'
                    }];
                }

            });

            $scope.selectedAssetNodeHandler = function(nodeData) {

                var asset = nodeData;
                //outer box clicked
                $scope.commonModel.checkedAssets = [];
                $scope.commonModel.checkedFolders = [];
                $scope.commonModel.checkedData = [];

                for (var k = 0; k < $scope.commonModel.filteredFolders.length; k++) {
                    $scope.commonModel.filteredFolders[k].isChecked = false;
                }

                for (var k = 0; k < $scope.commonModel.filteredAssets.length; k++) {
                    $scope.commonModel.filteredAssets[k].isChecked = false;
                }

                asset.isChecked = !asset.isChecked;

                if (asset.isChecked) {
                    $scope.commonModel.checkedAssets.push(asset);
                    $scope.commonModel.checkedData.push(asset);
                } else {

                    var selected = [];
                    var selectedAsset = [];
                    for (var k = 0; k < $scope.commonModel.checkedAssets.length; k++) {
                        if ($scope.commonModel.checkedAssets[k].id != asset.id) {
                            selectedAsset.push($scope.commonModel.checkedAssets[k]);
                        }
                    }
                    for (var k = 0; k < $scope.commonModel.checkedData.length; k++) {
                        if ($scope.commonModel.checkedData[k].id != asset.id) {
                            selected.push($scope.commonModel.checkedData[k]);
                        }
                    }
                    $scope.commonModel.checkedAssets = selectedAsset;
                    $scope.commonModel.checkedData = selected;
                }
            }

            $scope.selectedFolderNodeHandler = function(nodeData) {
                var folder = getById.call($scope.commonModel.foldersData, nodeData.id);

                if (arguments.length < 2) {
                    //outer box clicked
                    $scope.commonModel.checkedAssets = [];
                    $scope.commonModel.checkedFolders = [];
                    $scope.commonModel.checkedData = [];

                    for (var k = 0; k < $scope.commonModel.filteredFolders.length; k++) {
                        if ($scope.commonModel.filteredFolders[k].id != folder.id)
                            $scope.commonModel.filteredFolders[k].isChecked = false;
                        else
                            $scope.commonModel.filteredFolders[k].isChecked = true;
                    }

                    for (var k = 0; k < $scope.commonModel.filteredAssets.length; k++) {
                        $scope.commonModel.filteredAssets[k].isChecked = false;
                    }
                } else {
                    folder.isChecked = !folder.isChecked;
                }


                if (folder.isChecked) {
                    $scope.commonModel.checkedFolders.push(folder);
                    $scope.commonModel.checkedData.push(folder);
                } else {

                    var selectedTemp = [];
                    var selFolder = [];
                    for (var k = 0; k < $scope.commonModel.checkedFolders.length; k++) {
                        if ($scope.commonModel.checkedFolders[k].id != folder.id) {
                            selectedTemp.push($scope.commonModel.checkedFolders[k]);
                            selFolder.push($scope.commonModel.checkedFolders[k]);
                        }
                    }
                    for (var k = 0; k < $scope.commonModel.checkedData.length; k++) {
                        if ($scope.commonModel.checkedData[k].id != folder.id) {
                            selectedTemp.push($scope.commonModel.checkedData[k]);
                        }
                    }
                    $scope.commonModel.checkedData = selectedTemp;
                    $scope.commonModel.checkedFolders = selFolder;
                }
            }

            function in_array(needle, haystack) {
                for (var i in haystack) {
                    if (haystack[i] == needle) return true;
                }
                return false;
            }

            //search keyword - mock data search all function
            function searched(pageSearchBody) {

                return _.filter($scope.allAssets,
                    function(i) {
                        return searchUtil(i, pageSearchBody.searchText, pageSearchBody.folderId);
                    });

            };

            function searchUtil(item, toSearch, folderIds) {

                /* Search Text by Id name and type*/
                if (folderIds.length > 0) {
                    return ((item.displayName.toLowerCase().indexOf(toSearch.toLowerCase()) > -1 ||
                        item.type.toLowerCase().indexOf(toSearch.toLowerCase()) > -1 ||
                        item.id == toSearch) && folderIds.indexOf(item.businessMetadata.folderId) > -1) ? true : false;
                } else {
                    return (item.displayName.toLowerCase().indexOf(toSearch.toLowerCase()) > -1 ||
                        item.type.toLowerCase().indexOf(toSearch.toLowerCase()) > -1 ||
                        item.id == toSearch) ? true : false;
                }
            };


            $scope.getSearchData = function() {
                $state.go("spa.creativeCentralMain.assetsLibrary." + $scope.viewBy, {
                    folderId: $scope.commonModel.selectedParentId,
                    viewType: $scope.viewType,
                    search: true
                });
                $scope.searchAssetLibrary();
                $scope.toggleViews($scope.viewBy);
            }

            $scope.searchAssetLibrary = function() {

                if ($scope.commonModel.searchText != "") {
                    $scope.searchAssets.length = 0;
                    $scope.commonModel.isSearchView = true;
                    resetViewAssets();
                    loadAssets($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.commonModel.searchText);
                } else {
                    $scope.commonModel.isSearchView = false;
                    $state.go("spa.creativeCentralMain.assetsLibrary." + $scope.viewBy, {
                        folderId: $scope.commonModel.selectedParentId,
                        viewType: $scope.viewType,
                        search: false
                    });
                }
            }

            function selectDefaultFolder() {

                if ($scope.commonModel.foldersData.length > 0 && typeof $stateParams.folderId == "undefined" && currentlySelectedId == 0) {
                    currentlySelectedId = $scope.commonModel.foldersData[0].id;
                    $scope.commonModel.selectedParentId = currentlySelectedId;
                }
                //get assets for folder
                reRenderFolders(currentlySelectedId);
                $scope.commonModel.breadCrumbArray = [];
                traverseFolderBack($scope.commonModel.breadCrumbArray, currentlySelectedId);
                resetViewAssets();
                $scope.gettingData = true;
                $scope.commonModel.showCentralSpinner = true;
                loadAssets($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.commonModel.searchText);

            }

            function addRootFolder(foldersData) {
                var allFolders = [];
                var rootFolder = {
                    name: 'My Assets',
                    id: '1',
                    type: "DEFAULT",
                    parentId: null,
                    rootParentId: null,
                    folders: 0,
                    files: 0,
                    state: {
                        selected: true,
                        opened: true
                    }
                };
                allFolders.push(rootFolder);

                if (foldersData.length > 0) {
                    for (var k = 0; k < foldersData.length; k++) {
                        foldersData[k].rootParentId = "1";
                        if (foldersData[k].parentId == null || foldersData[k].parentId == "") {
                            foldersData[k].parentId = "1";
                        }
                        allFolders.push(foldersData[k]);
                    }
                }
                return allFolders;
            }

            $scope.clearAssetSearch = function() {
                $scope.commonModel.searchText = "";
                $scope.searchAssets.length = 0;
                $scope.commonModel.isSearchView = false;
                var nodeData = {
                    node: {
                        id: $scope.commonModel.selectedParentId
                    }
                };
                $scope.revertToStdView = true;
                $scope.selectedNodeHandler(nodeData);
            }

            $scope.$watch("commonModel.checkedData", function(newVal, oldVal) {
                if (newVal != "undefined") {
                    var checkedAssets = [];
                    var checkedFolders = [];

                    for (var k = 0; k < newVal.length; k++) {
                        if (newVal[k].tileType == "Asset") {
                            checkedAssets.push(newVal[k]);
                        } else if (newVal[k].tileType == "AssetFolder") {
                            checkedFolders.push(newVal[k]);
                        }
                    }
                    if (checkedAssets.length > 0 || checkedFolders.length > 0) {
                        $scope.commonModel.checkedAssets = checkedAssets;
                        $scope.commonModel.checkedFolders = checkedFolders;
                    }

                }
            }, true);

            $scope.toggleTree = function() {
                $scope.commonModel.isShowTree = !$scope.commonModel.isShowTree;
                if (!$scope.commonModel.isShowTree) {
                    angular.element("#sidebar-resizer").css({
                        left: '35px'
                    });
                    angular.element(".list-container").css({
                        width: '97.8%'
                    });
                    /*angular.element(".bottom-details").css({
                      width: '97.8%'
                    });*/

                } else {
                    angular.element("#tree_left_sidebar").css({
                        width: '17.5%'
                    });
                    angular.element(".list-container").css({
                        width: '82%'
                    });
                    /*angular.element(".bottom-details").css({
                      width: '81.9%'
                    });*/
                    angular.element("#sidebar-resizer").css({
                        left: '17.5%'
                    });
                }

                if ($scope.showGridView || $scope.showListView) {
                    angular.element('.ngGrid').trigger('resize');
                } else {
                    $scope.adjustTileView();
                }

            }

            $scope.adjustTileView = function() {
                var containerWidth = angular.element(".tile-container").width();
                var max_width = null;
                if (containerWidth >= 1877) {
                    max_width = 1742;
                } else if (containerWidth >= 1564 && containerWidth < 1742) {
                    max_width = 1451;
                } else if (containerWidth >= 1301 && containerWidth < 1564) {
                    max_width = 1160;
                } else if (containerWidth >= 1049 && containerWidth < 1301) {
                    max_width = 870;
                } else if (containerWidth >= 885 && containerWidth < 1049) {
                    max_width = 580;
                }
                angular.element(".set-center-align").css({
                    "max-width": max_width
                });
            };

            $scope.redirectToAssetEdit = function(assetId) {
                $state.go('spa.asset.assetEdit', {
                    assetId: assetId
                });
            }

            $scope.scrollBottomEvent = function(gridId) {
                //console.log("hit end - grab next", gridId);
                if (!$scope.gettingData && !$scope.lastPage) {
                    $scope.pagingOptions.currentPage++;
                    $scope.gettingData = true;
                    $scope.commonModel.showCentralSpinner = true;
                    loadAssets($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.searchOptions.searchText);
                } else if ($scope.gettingData) {
                    //mmAlertService.addWarning("Already retrieving next data chunk.");
                }
            };

            $scope.trackEvent = function($event, func, params) {
                if ($event.keyCode == 13) {
                    func(params);
                }
            }

            function sortOnFileSize(a, b) {
                //compare formatContext.fileSize property of the object
                if (a.fileSize < b.fileSize) {
                    return -1;
                } else if (a.fileSize > b.fileSize) {
                    return 1;
                } else {
                    return 0;
                }
            }

            function sortOnDate(a, b) {
                //date number
                var timeA = (a && a != "") ? a : 0;
                var timeB = (b && b != "") ? b : 0;
                return timeA - timeB;
            }

            function sortOnDisplayName(a, b) {
                var nameA = a.displayName.toLowerCase(),
                    nameB = b.displayName.toLowerCase()
                if (nameA < nameB) //sort string ascending
                    return -1
                if (nameA > nameB)
                    return 1
                return 0 //default return value (no sorting)
            }

            $timeout(function() {
                $scope.adjustTileView();
            });

            $(window).resize(function() {
                if ($scope.showTileView) {
                    $scope.adjustTileView();
                }
            });

            $(window).keydown(function(e) {
                if (e.keyCode == 65 && e.ctrlKey && $scope.viewBy == 'tile') {

                    for (var k = 0; k < $scope.commonModel.filteredAssets.length; k++) {
                        $scope.commonModel.filteredAssets[k].isChecked = true;
                    }

                    for (var k = 0; k < $scope.commonModel.filteredFolders.length; k++) {
                        $scope.commonModel.filteredFolders[k].isChecked = true;
                    }

                    $timeout(function() {
                        $scope.$apply();
                    }, 100);
                }
            });

        }
    ]).filter('reverse', function() {
        return function(items) {
            return items.slice().reverse();
        };
    })
    .directive('resizer', ['$document', function($document) {

        return function($scope, $element, $attrs) {

            $element.on('mousedown', function(event) {
                event.preventDefault();
                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            });

            function mousemove(event) {
                // Handle resizer
                var x = event.pageX;
                var parentX = $element.parent()[0].offsetWidth;

                var diff = (x / parentX) * 100;
                var rwidth = 97.8 - diff;

                if (diff <= parseInt($attrs.resizerMax) && diff >= parseInt($attrs.resizerMin) && (!angular.isDefined($scope.commonModel) || $scope.commonModel.isShowTree)) {
                    if ($attrs.resizerMax && diff > $attrs.resizerMax) {
                        x = parseInt($attrs.resizerMax);
                    }
                    $element.css({
                        left: (diff - 0.2) + '%'
                    });
                    angular.element(document.querySelector($attrs.resizerLeft)).css({
                        width: diff + '%'
                    });
                    angular.element(document.querySelector($attrs.resizerRight)).css({
                        width: rwidth + '%'
                    });

                    /*angular.element('.bottom-details').css({
                      width: (rwidth -0.1) + '%'
                    });*/

                    if ($scope.showGridView || $scope.showListView) {
                        angular.element('.ngGrid').trigger('resize');
                    } else {
                        try {
                            $scope.adjustTileView();
                        } catch (ex) {}

                    }

                }
            }

            function mouseup() {
                $document.unbind('mousemove', mousemove);
                $document.unbind('mouseup', mouseup);
            }
        };
    }]).directive('focus', ['$timeout', function($timeout) {
        return {
            link: function(scope, element) {
                $timeout(function() {
                    element[0].focus();
                }, 100);
            }
        };
    }]);
