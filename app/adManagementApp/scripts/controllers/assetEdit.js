/**
 * Created by atdg on 4/3/2014
 */
'use strict';

app.controller('assetEditCtrl', ['$scope', '$sce', '$state', '$stateParams', 'configuration', 'assetService', 'enums', 'mmAlertService', 'EC2Restangular', 'EC2AMSRestangular', '$timeout', '$modal', 'assetsLibraryService',
    function($scope, $sce, $state, $stateParams, conf, assetService, enums, mmAlertService, EC2Restangular, EC2AMSRestangular, $timeout, $modal, assetsLibraryService) {

        var assetId = $stateParams.assetId;
        $scope.showSPinner = false;
        $scope.asset = [];
        $scope.type = 'asset';
        $scope.isStartOpen = true;
        var serverAssets = EC2Restangular.all('assetMgmt');
        //folder definitions
        var serverFolders = EC2Restangular.all('assetMgmt/folders');
        var moveTemplate = './adManagementApp/views/assetLibrary/moveFolder.html';
        var currentlySelectedId = "";
        $scope.commonModel = {
            foldersData: [],
            selectedParentId: ""
        };
        var folderToMoveToId = 0;

        var accountId = 1;
        $scope.entityId = accountId;
        $scope.isVideo = false;
        $scope.isEditMode = !!$stateParams.assetId || !!$scope.isEntral;

        $scope.folderClicked = function(folderId) {

            folderId = folderId ? folderId : 1;

            $state.go("spa.creativeCentralMain.assetsLibrary.tile", {
                folderId: folderId,
                viewType: 'tile',
                search: false
            });
        }

        function sizeToString(size) {

            if (size < 1048576) {
                return (size / 1024).toFixed(2) + "Kb";
            }
            return (size / 1024 / 1024).toFixed(2) + "Mb";
        }



        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        }
        $scope.embedSwf = function(src) {
            $("object embed").attr("src", src);
            if ($scope.asset.swfContext) {
                swfobject.embedSWF($scope.trustSrc(src), "swfObject", $scope.asset.swfContext.width, $scope.asset.swfContext.height, "9.0.115");
            } else {
                mmAlertService.addError("Error configuring SWF. No SWF context data.");
            }
        };

        if ($scope.isEntral == false && _.filter($scope.entityLayoutButtons, {
                'name': 'ASSIGN'
            }).length === 0) {
            $scope.entityLayoutButtons.push({
                name: 'MOVE',
                func: showMoveModal
            }, {
                name: 'DELETE',
                func: placeholderFunc,
                isDisabled: true,
                ref: null
            }, {
                name: 'PREVIEW',
                func: redirectToPreviewView,
                ref: null
            });
        }

        $scope.entityLayoutInfraButtons.discardButton = {
            name: 'discard',
            func: updateState,
            ref: null,
            nodes: []
        };
        $scope.entityLayoutInfraButtons.saveButton = {
            name: 'save',
            func: save,
            ref: null,
            nodes: [],
            isPrimary: true
        };

        var assetMetaData = [{
            key: 'assetId',
            text: 'ID'
        }, {
            key: 'assetType',
            text: 'Asset Type'
        }, {
            key: 'mediaType',
            text: 'Media Type'
        }, {
            key: 'mimeType',
            text: 'Mime Type'
        }, {
            key: 'status',
            text: 'Status'
        }];

        //dummy data for proxy variants
        $scope.variants = {
            selectedProxies: [],
            assetProxies: [{
                "proxyAssetId": 1000003322,
                "proxyMediaType": "video",
                "proxyVideoFormat": "h264/aac",
                "proxyAudioFormat": "h264/aac",
                "proxyVideoCodec": "h264",
                "proxyAudioCodec": "aac",
                "proxyAudioChannels": 2,
                "proxyHeight": 512,
                "proxyWidth": 720,
                "proxyBitRate": 1116338,
                "proxyFileSize": 5249719,
                "proxyFileName": "e7e00421-a548-438f-a9bc-8efe758ffa4f.mp4"
            }, {
                "proxyAssetId": 1000003323,
                "proxyMediaType": "video",
                "proxyVideoFormat": "h264/aac",
                "proxyAudioFormat": "h264/aac",
                "proxyVideoCodec": "h264",
                "proxyAudioCodec": "aac",
                "proxyAudioChannels": 2,
                "proxyHeight": 512,
                "proxyWidth": 720,
                "proxyBitRate": 1116338,
                "proxyFileSize": 5249719,
                "proxyFileName": "anotherfile.mp4"
            }]
        };
        $scope.proxySelectedItems = [];
        $scope.proxyColumnDefs = [{
            field: 'proxyAssetId',
            displayName: 'Proxy ID',
            isColumnEdit: false,
            isShowToolTip: true,
            isPinned: true
        }, {
            field: 'proxyMediaType',
            displayName: 'Media Type',
            isColumnEdit: false,
            isShowToolTip: true,
            isPinned: true
        }, {
            field: 'proxyVideoFormat',
            displayName: 'Video',
            isColumnEdit: false,
            isShowToolTip: true,
            isPinned: true
        }, {
            field: 'proxyAudioFormat',
            displayName: 'Audio',
            isColumnEdit: false,
            isShowToolTip: true,
            isPinned: true
        }, {
            field: 'proxyHeight',
            displayName: 'Height',
            isColumnEdit: false,
            isShowToolTip: true,
            isPinned: true
        }, {
            field: 'proxyWidth',
            displayName: 'Width',
            isColumnEdit: false,
            isShowToolTip: true,
            isPinned: true
        }];

        $scope.metaLabelMap = [{
            key: "audioStreamCount",
            value: "Audio Streams"
        }, {
            key: "bitRate",
            value: "Bit Rate"
        }, {
            key: "decodingFailed",
            value: "hide"
        }, {
            key: "duration",
            value: "Duration"
        }, {
            key: "fileSize",
            value: "Size"
        }, {
            key: "format",
            value: "Format"
        }, {
            key: "streamCount",
            value: "Streams"
        }, {
            key: "videoStreamCount",
            value: "Video Streams"
        }, {
            key: "compressionType",
            value: "Compression"
        }, {
            key: "dataPrecision",
            value: "Data Precision"
        }, {
            key: "extendedProperties",
            value: "Extended Properties"
        }, {
            key: "height",
            value: "Height"
        }, {
            key: "width",
            value: "Width"
        }, {
            key: "asversion",
            value: "AS Version"
        }, {
            key: "backgroundColor",
            value: "Background Color"
        }, {
            key: "clickTags",
            value: "Click Tags"
        }, {
            key: "customInteractions",
            value: "Custom Interactions"
        }, {
            key: "dcforms",
            value: "DC Forms"
        }, {
            key: "dynamicContentData",
            value: "Dynamic Content"
        }, {
            key: "ebDcVersion",
            value: "EB DC Version"
        }, {
            key: "ebVersion",
            value: "EB Version"
        }, {
            key: "eyeblasterBlocks",
            value: "EB Blocks"
        }, {
            key: "frameRate",
            value: "Frame Rate"
        }, {
            key: "includeDynamicCIName",
            value: "Dynamic CI"
        }, {
            key: "includeSV",
            value: "SV"
        }, {
            key: "isCompressed",
            value: "Compressed"
        }, {
            key: "isEBStdExist",
            value: "EB Std Exist"
        }, {
            key: "isMobile",
            value: "Mobile"
        }, {
            key: "minVersion",
            value: "Minimum Version"
        }, {
            key: "simpleExpX",
            value: "Simple Exp X"
        }, {
            key: "simpleExpY",
            value: "Simple Exp Y"
        }, {
            key: "states",
            value: "States"
        }];

        $scope.lookupMetaLabelMap = function(data) {
            for (var i = 0; i < $scope.metaLabelMap.length; i++) {
                if ($scope.metaLabelMap[i].key === data)
                    return $scope.metaLabelMap[i].value;
            }
            return '';
        }

        $scope.metaFormatMap = [{
                key: "audioStreamCount",
                value: "audio video"
            }, {
                key: "bitRate",
                value: "audio video"
            }, {
                key: "decodingFailed",
                value: "hide"
            }, {
                key: "duration",
                value: "audio video"
            }, {
                key: "fileSize",
                value: "all"
            }, {
                key: "format",
                value: "all"
            }, {
                key: "streamCount",
                value: "audio video"
            }, {
                key: "videoStreamCount",
                value: "video"
            }, {
                key: "compressionType",
                value: "image"
            }, {
                key: "dataPrecision",
                value: "image"
            }, {
                key: "extendedProperties",
                value: "hide"
            }, {
                key: "height",
                value: "all"
            }, {
                key: "width",
                value: "all"
            }, {
                key: "asversion",
                value: "flash"
            }, {
                key: "backgroundColor",
                value: "flash"
            }, {
                key: "clickTags",
                value: "flash"
            },
            /*{key: "customInteractions", value: "flash"},*/
            {
                key: "dcforms",
                value: "flash"
            }, {
                key: "dynamicContentData",
                value: "flash"
            }, {
                key: "ebDcVersion",
                value: "flash"
            }, {
                key: "ebVersion",
                value: "flash"
            }, {
                key: "eyeblasterBlocks",
                value: "flash"
            }, {
                key: "frameRate",
                value: "flash"
            }, {
                key: "includeDynamicCIName",
                value: "flash"
            }, {
                key: "includeSV",
                value: "flash"
            }, {
                key: "isCompressed",
                value: "flash"
            }, {
                key: "isEBStdExist",
                value: "flash"
            }, {
                key: "isMobile",
                value: "flash"
            }, {
                key: "minVersion",
                value: "flash"
            }, {
                key: "simpleExpX",
                value: "flash"
            }, {
                key: "simpleExpY",
                value: "flash"
            }, {
                key: "states",
                value: "flash"
            }
        ];

        $scope.lookupMetaFormatMap = function(key, value) {
            for (var i = 0; i < $scope.metaFormatMap.length; i++) {
                if ($scope.metaFormatMap[i].key === key && ($scope.metaFormatMap[i].value.indexOf(value) > -1 || $scope.metaFormatMap[i].value === 'all'))
                    return true;
            }
            return false;
        }

        if (!$scope.asset.relatedProxies) {
            $scope.asset.relatedProxies = [];
        }

        function updateState() {

            if ($scope.$parent.mainEntity != null) {
                $scope.showCI = false;
                $scope.showHTML5Manifest = false;
                $scope.asset = $scope.$parent.mainEntity;
                $scope.asset.formatContext.fileSize = sizeToString($scope.asset.formatContext.fileSize);

                if ($scope.asset != undefined) {
                    fillFolder();
                    $scope.asset['dimension'] = getAssetDimension($scope.asset);
                    $scope.asset['mediaType'] = $scope.asset.mediaType.toLowerCase();
                    $scope.asset['displayName'] = $scope.asset.businessMetadata.displayName != "" ? $scope.asset.businessMetadata.displayName : $scope.asset.title;
                    $scope.showCI = $scope.asset.formatContext.format == "swf" ? true : false;
                    $scope.showHTML5Manifest = $scope.asset.formatContext.format == "html5" ? true : false;
                }
                $scope.assetEdit = EC2Restangular.copy($scope.$parent.mainEntity);
                $scope.$parent.mainEntity.id = $scope.asset.assetId;
                $scope.$parent.mainEntity.name = $scope.asset.title;
                $scope.isEditMode = true;
                $scope.contentAvailable = true;
                prepareInteractionArray();
                if ($scope.asset && $scope.asset.mediaType == "video") {
                    $scope.isVideo = true;
                }

                if ($scope.asset.formatContext.format != undefined && $scope.asset.formatContext.format === 'html5' && $scope.asset.archiveManifest != undefined) {
                    for (var i = 0; i < $scope.asset.archiveManifest.length; i++) {
                        if ($scope.asset.archiveManifest[i].name.indexOf("png") > 0 || $scope.asset.archiveManifest[i].name.indexOf("gif") > 0 || $scope.asset.archiveManifest[i].name.indexOf("jpg") > 0)
                            $scope.asset.archiveManifest[i].thumbnail = $scope.asset.publishHostName + $scope.asset.archiveManifest[i].path;
                        else $scope.asset.archiveManifest[i].thumbnail = '';
                    }
                }
                /*if ($scope.asset.mediaType === 'flash') {
				 setTimeout(function () {
				 $scope.$apply(function () {
				 $scope.embedSwf($scope.asset.publishHostName + $scope.asset.publishPath);
				 });
				 }, 500);
				 }*/
            } else {
                $scope.assetEdit = $scope.asset = {
                    assetType: "",
                    title: "",
                    parentAssetId: "",
                    isChanged: false,
                    status: "Enabled",
                    assetCode: "",
                    mediaType: "",
                    createUserId: null,
                    createDateTime: null,
                    modifyUserId: null,
                    modifyDateTime: null,
                    businessMetadata: {
                        advertiserId: null,
                        brandId: null,
                        campaignId: null
                    },
                    formatContext: {},
                    audioStreamContext: null,
                    videoStreamContext: null,
                    swfContext: null,
                    imageContext: null,
                    thumbnails: [],
                    relatedProxies: null,
                    extendedAdProperties: null
                }
                $scope.isEditMode = false;
            }
        }

        function fillFolder() {
            if ($scope.asset.businessMetadata.folderId != undefined && $scope.asset.businessMetadata.folderId != '') {
                serverFolders.get($scope.asset.businessMetadata.folderId).then(function(folder) {
                    $scope.folder = folder;
                    currentlySelectedId = $scope.folder.id;
                    $scope.commonModel.selectedParentId = currentlySelectedId;

                    $scope.asset['folderName'] = $scope.folder.name;
                    $scope.asset['folderId'] = $scope.folder.id;;

                }, {})
            } else {
                $scope.asset['folderId'] = null;
            }
        }

        function redirectToPreviewView() {
            var url = $state.href('assetPreview', {
                adId: "",
                sid: 'mdx3',
                mdx2: false,
                assetId: $scope.asset.assetId
            });
            window.open(url,'_blank');
        }

        function showMoveModal() {
            if ($scope.commonModel.foldersData.length <= 0) {
                prepareFolders();
            } else {
                showModal(moveTemplate);
            }
        }

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

        function mapToViewModel(data) {
            if (typeof data != "undefined" && data.length > 0) {
                for (var k = 0; k < data.length; k++) {
                    $scope.commonModel.foldersData.push(assetsLibraryService.extendFolderProperties(data[k]));
                }
            }
        }

        function prepareFolders() {
            serverFolders.withHttpConfig({
                cache: false
            }).getList().then(function(result) {
                var cleanFolders = [];
                var names = [];
                for (var i = 0; i < result.length; i++) {
                    var cont = true;
                    for (var j = 0; j < names.length; j++) {
                        if (names[j] == result[i].name) cont = false;
                    }
                    if (cont && result[i].name != "Test Asset Folder") {
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
                        //console.log("type", f.type, result[i].folderType);
                    }
                }
                var folders = assetsLibraryService.addRootFolder(cleanFolders);
                $scope.commonModel.foldersData.length = 0;
                mapToViewModel(folders);
                //select default folder
                if ($scope.commonModel.foldersData.length > 0 && $scope.commonModel.selectedParentId == "") {
                    currentlySelectedId = $scope.commonModel.foldersData[0].id;
                    $scope.commonModel.selectedParentId = currentlySelectedId;
                }
                //open modal with folders populated
                showModal(moveTemplate);
            }, function(error) {
                mmAlertService.addError("Error retrieving folders.");
                //create root folder
                var folder = [];
                var rootFolder = assetsLibraryService.extendFolderProperties(assetsLibraryService.addRootFolder(folder)[0]);
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
                //select default folder
                currentlySelectedId = $scope.commonModel.foldersData[0].id;
                $scope.commonModel.selectedParentId = currentlySelectedId;
            });
        }

        $scope.moveFolder = function() {
            if (folderToMoveToId == "" || folderToMoveToId <= 0) {
                mmAlertService.addError('Please select a destination folder.');
                return false;
            } else {
                currentlySelectedId = folderToMoveToId;
                $scope.commonModel.selectedParentId = currentlySelectedId;
                var newFolder = _.filter($scope.commonModel.foldersData, function(d) {
                    return d.id == folderToMoveToId;
                });
                $scope.$root.isDirtyEntity = true;
                $scope.asset['folderName'] = newFolder[0].text;
                mmAlertService.addSuccess('Asset successfully moved to folder ' + newFolder[0].text + ".");
                $scope.close(true);
            }
        };

        $scope.close = function(refreshTree) {
            $scope.modalInstance.close();
            $scope.isModalAlreadyOpen = false;
        };

        $scope.selectedNodeHandlerInModal = function(nodeData) {
            folderToMoveToId = nodeData.node.id;
        };

        function deleteAsset(list, selectedItems) { //TODO update when backend services
            var f = [];
            for (var i = 0; i < selectedItems.length; i++) {
                f[i] = function(k) {
                    var ad = selectedItems[i];
                    var promise = assetService.deleteAsset(asset);
                    promise.then(function(asset) {
                            var index = _.indexOf(list, asset);
                            list.splice(index, 1);
                            mmAlertService.addSuccess('Asset has been deleted successfully.');
                        },
                        function(error) {
                            mmAlertService.addError("Error deleting asset.");
                            processError(error);
                        });
                }(i);
            }
        }

        /*Custom interaction section starts*/
        $scope.interactionTypes = angular.copy(enums.customInteractionAssetTypes);
        $scope.interactionTypes.push({
            "id": "0",
            "name": "All"
        })
        $scope.allInteractionsData = [];
        $scope.currentTabName = $scope.interactionTypes[0].name;
        $scope.maxCI = 500;
        $scope.showCI = (typeof $scope.asset != "undefined" && typeof $scope.asset.swfContext != "undefined");

        function prepareInteractionArray() {
            $scope.allInteractionsData = [];
            if ($scope.showCI) {
                if ($scope.asset.swfContext.customInteractions) {
                    for (var index = 0; index < $scope.asset.swfContext.customInteractions.length; index++) {
                        var ci = $scope.asset.swfContext.customInteractions[index];
                        var modelCi = {
                            "Id": ci.classificationID,
                            "Name": ci.cname,
                            "Type": enums.customInteractionAssetTypes.getName(ci.type),
                            "TypeId": ci.type,
                            CanEdit: false
                        };
                        $scope.allInteractionsData.push(modelCi);
                    }
                    updateAllGrids();
                } else {
                    $scope.asset.swfContext['customInteractions'] = [];
                }
            }
        };
        prepareInteractionArray();
        var interactionsList = [];
        for (var index = 0; index < enums.customInteractionAssetTypes.length; index++) {
            var type = enums.customInteractionAssetTypes[index];
            interactionsList.push({
                "id": type.id,
                "name": type.name
            });
        }

        $scope.columnDefsForAllTab = [{
            field: 'Name',
            functionOnCellEdit: createName,
            validationFunction: validateName,
            gridControlType: enums.gridControlType.getName("TextBox")
        }, {
            field: 'TypeId',
            displayName: "Type",
            functionOnCellEdit: changeInteractionType,
            listDataArray: interactionsList,
            gridControlType: enums.gridControlType.getName("SelectList")
        }, {
            field: 'CanEdit',
            visible: false
        }, {
            field: 'Id',
            visible: false
        }];

        $scope.columnDefs = [{
            field: 'Name',
            functionOnCellEdit: createName,
            validationFunction: validateName,
            gridControlType: enums.gridControlType.getName("TextBox")
        }, {
            field: 'Type',
            isColumnEdit: false
        }, {
            field: 'CanEdit',
            visible: false
        }, {
            field: 'Id',
            visible: false
        }];

        $scope.columnDefsHTML5Manifest = [{
            field: 'name',
            displayName: 'Name',
            isColumnEdit: false,
            isShowToolTip: true
        }, {
            field: 'height',
            displayName: 'Height',
            width: 100,
            isColumnEdit: false,
            isShowToolTip: true
        }, {
            field: 'width',
            displayName: 'Width',
            width: 100,
            isColumnEdit: false,
            isShowToolTip: true
        }, {
            field: 'size',
            displayName: 'Size',
            width: 100,
            isColumnEdit: false,
            isShowToolTip: true
        }, {
            field: 'path',
            displayName: 'Path',
            isColumnEdit: false,
            isShowToolTip: true
        }];
        $scope.ciGrid = {
            isGridLoading: true
        };

        //used to render buttons above grid
        $scope.gridButtonActions = [{
            name: "Add",
            func: addCI,
            isDisable: false
        }, {
            name: "Remove",
            func: removeCI,
            isDisable: false
        }];

        $scope.typeByName = function(name) {
            return _.find($scope.interactionTypes, function(data) {
                return data.name == name;
            });
        };

        $scope.typeById = function(id) {
            return _.find($scope.interactionTypes, function(data) {
                return data.id == id;
            });
        };

        function addCI() {
            if (!canAddCI()) {
                mmAlertService.addError("Message", 'You can not add more than ' + $scope.maxCI + ' Custom interactions!', false);
                return false;
            }
            var ci = $scope.typeByName($scope.currentTabName);
            var ciToPush = {
                "Name": "",
                "Type": ci.name.toLowerCase() == "all" ? "" : ci.name,
                "TypeId": ci.name.toLowerCase() == "all" ? "0" : ci.id,
                CanEdit: true
            };
            $scope.allInteractionsData.push(ciToPush);
            updateAllGrids();
        };

        function removeCI() {
            var ci = $scope.typeByName($scope.currentTabName);
            if (ci.selectedItems.length > 0) {
                var index = ci.selectedItems.length - 1;
                while (index >= 0) {
                    var itemToDelete = ci.selectedItems[index];
                    if (itemToDelete.CanEdit) {
                        $scope.allInteractionsData.splice($scope.allInteractionsData.indexOf(itemToDelete), 1);
                        ci.selectedItems.splice(index, 1);
                    }
                    index--;
                }
                updateAllGrids();
            }
        };

        $scope.getInteractionsByType = function(type) {
            if (type.toLowerCase().toString() == "all") {
                return $scope.allInteractionsData;
            }
            var data = [];
            data = _.filter($scope.allInteractionsData, function(data) {
                return data.Type.toLowerCase().toString() == type.toLowerCase().toString();
            });
            if (data == undefined)
                data = [];
            return data;
        }

        $scope.changeTabName = function(name) {
            $scope.currentTabName = name;
        }

        $scope.startCellEditFunction = function(parameter) {
            var col = parameter.col.colDef;
            var entity = parameter.row.entity;
            var ci = $scope.typeByName($scope.currentTabName);
            if (ci.name.toLocaleLowerCase() != "all") {
                if (col.gridControlType == enums.gridControlType.getName("SelectList"))
                    return false;
            }
            if (!entity.CanEdit || entity.Id > 0)
                return false;
            return true;
        };

        function updateAllGrids() {
            if (typeof $scope.interactionTypes != "undefined") {
                for (var index = 0; index <= $scope.interactionTypes.length; index++) {
                    var type = $scope.interactionTypes[index];
                    if (typeof type != "undefined")
                        type.interactionData = type.id == "0" ? $scope.allInteractionsData : $scope.getInteractionsByType(type.name);
                }
            }
        };
        updateAllGrids();

        function checkName(value) {

            var result = {
                isSuccess: true,
                message: ""
            };
            if (typeof value != "undefined") {
                if (check(value)) {
                    result.isSuccess = false;
                    result.message = "Please enter valid name.";
                } else if (!canAddCI()) {
                    result.isSuccess = false;
                    result.message = 'You can not add more than ' + $scope.maxCI + ' Custom interactions!';
                } else if (!isUniqueName(value)) {
                    result.isSuccess = false;
                    result.message = "A custom interaction with this name already exists!";
                }
            }
            return result;
        };

        function validateName(row) {
            var value = row.entity.Name;
            return checkName(value);
        }

        function canAddCI() {
            return ($scope.allInteractionsData.length < $scope.maxCI);
        }

        function isUniqueName(name) {
            if (typeof name != "undefined") {
                var allNames = getAllNames();
                var result = _.filter(allNames, function(data) {
                    return data.toLowerCase().toString() == name.toLowerCase().toString();
                });
                return result.length <= 1;
            }
            return true;
        }

        var specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,./~`-="
        var check = function(str) {
            if (typeof str != "undefined") {
                for (var i = 0; i < specialChars.length; i++) {
                    if (str.indexOf(specialChars[i]) > -1) {
                        return true;
                    }
                }
            }
            return false;
        }

        function attachCustomInteractionsToAsset() {
            if (typeof $scope.interactionTypes == "undefined")
                return false;

            if ($scope.asset.swfContext == null) {
                $scope.asset.swfContext = {};
            }
            if ($scope.asset.swfContext.customInteractions == undefined || $scope.asset.swfContext.customInteractions == null) {
                $scope.asset.swfContext.customInteractions = [];
            }

            for (var i = 0; i < $scope.interactionTypes.length; i++) {
                var type = $scope.interactionTypes[i];
                if (type.interactionData) {
                    for (var index = 0; index < type.interactionData.length; index++) {
                        var data = type.interactionData[index];
                        if (data.CanEdit) {
                            var prepareInteractionObjectToSave = {
                                "interactionSign": enums.customInteractionAssetTypes.getId(data.Type),
                                "closeFlag": "0",
                                "countAsClick": "0",
                                "jumpURL": "",
                                "editableType": "0",
                                "cname": data.Name,
                                "classificationID": enums.customInteractionAssetTypes.getId(data.Type),
                                "type": enums.customInteractionAssetTypes.getId(data.Type)
                            };
                            $scope.asset.swfContext.customInteractions.push(prepareInteractionObjectToSave);
                            data.CanEdit = false;
                        }
                    }
                }
            }
        }

        function createName(col, value, index, field) {
            var result = {
                isSuccess: false,
                message: ""
            };
            var ci = $scope.typeByName($scope.currentTabName);
            if (ci.selectedItems.length > 0) {
                for (var index = 0; index < ci.selectedItems.length; index++) {
                    result = checkName(value);
                    if (result.isSuccess) {
                        var item = ci.selectedItems[index];
                        item[field] = value;
                    } else {
                        return result;
                    }
                }
                updateAllGrids();
            } else {
                var item = ci.interactionData[index];
                if (item != null) {
                    item[field] = value;
                }
                updateAllGrids();
            }
            result.isSuccess = true;
            return result;
        };

        function getAllNames() {
            var allNames = [];
            for (var i = 0; i < $scope.interactionTypes.length; i++) {
                var item = $scope.interactionTypes[i];
                if ($scope.currentTabName.toLowerCase().toString() == "all") {
                    if (item.name.toLowerCase().toString() != "all") {
                        continue;
                    }
                } else {
                    if (item.name.toLowerCase().toString() == "all") {
                        continue;
                    }
                }
                var ci = $scope.typeByName(item.name);
                var nonEmptyNames = [];
                if (typeof ci.interactionData != "undefined") {
                    var names = [];
                    names = _.pluck(ci.interactionData, 'Name');
                    nonEmptyNames = _.filter(names, function(data) {
                        return data != "";
                    });
                    if (nonEmptyNames.length > 0) {
                        for (var index = 0; index < nonEmptyNames.length; index++) {
                            var obj = nonEmptyNames[index];
                            if (typeof obj != "undefined")
                                allNames.push(obj);
                        }
                    }
                }
            }
            return allNames;
        }

        function changeInteractionType(col, selectedId, index, field) {
            var currentType = $scope.typeByName($scope.currentTabName);
            var ci = $scope.typeById(selectedId);
            var currentField = currentType.name !== "All" ? field : "Type";
            if (currentType.selectedItems.length > 1) {
                for (var i = 0; i < currentType.selectedItems.length; i++) {
                    var item = currentType.selectedItems[i];
                    if (item != null) {
                        item[currentField] = ci.name;
                    }
                }
                updateAllGrids();
            } else {
                var item = currentType.interactionData[index];
                if (item != null) {
                    item[currentField] = ci.name;
                }
                updateAllGrids();
            }
        };

        function saveValidation() {
            var valid = true;
            return valid;
        }

        function save() {

            if (saveValidation()) {
                attachCustomInteractionsToAsset();
                if ($scope.isEditMode) {
                    //save metadata
                    var metadata = {
                        folderId: $scope.commonModel.selectedParentId,
                        displayName: $scope.asset.title
                    };
                    if (metadata.folderId == "1" || typeof metadata.folderId === "undefined") {
                        metadata.folderId = "";
                    }
                    //console.log("metadata to post", metadata);
                    //use ec2AMSRestangular until we fix backend issue
                    assetService.postAssetMetaData(metadata, $scope.asset.assetId).then(function(returnData) {
                        mmAlertService.addSuccess('You successfully updated the asset metadata.');
                        $scope.$root.isDirtyEntity = false;
                        console.log("metadata save on close - success", returnData);
                    }, function(response) {
                        // error
                        mmAlertService.addError('Updating the asset metadata has failed');
                        console.log("metadata save on close - error", response);
                    });

                    //save existing
                    /*$scope.assetEdit = $scope.asset;
          delete $scope.assetEdit.dimension;
          delete $scope.assetEdit.mediaType;
          delete $scope.assetEdit.displayName;
          delete $scope.assetEdit.folderName;
          return serverAssets.customPUT($scope.assetEdit).then(
					//return $scope.assetEdit.put().then(
						function (data) {
              console.log("returned data", data);
              $scope.$root.isDirtyEntity = false;
							$scope.$parent.mainEntity = $scope.assetEdit;
							$scope.showSPinner = false;
							mmAlertService.addSuccess('You successfully updated the asset.');
						},
						function (error) {
							mmAlertService.addError('Updating the asset has failed');
							//processError(error);
						});*/

                } else {
                    //create new - placeholder but shouldn't go this path
                    mmAlertService.addError('Use the uploader to create a new asset.');
                    /*return serverAssets.post($scope.assetEdit).then(
						function (data) {
							$scope.$root.mmIsPageDirty = 0;
							mmAlertService.addSuccess('You successfully created the asset.');
							if ($scope.$parent.isEntral) {
								$scope.$parent.mainEntity = data;
								return data;
							} else {
								$state.go("spa.asset.assetEdit", {assetId: data.id});
							}
						},
						function (error) {
							mmAlertService.addError('Creating the asset has failed');
							processError(error);
						});*/
                }
                prepareInteractionArray();
            }
        }

        function processError(error) {
            console.log(error);
            if (error.data.error === undefined) {
                mmAlertService.addError("Server error. Please try again later.");
            } else {
                mmAlertService.addError("Error" + error.data.error);
            }
        }

        function getAssetDimension(asset) {
            if (asset && asset.formatContext && asset.formatContext.format) {
                if (asset.formatContext.format.toUpperCase() == "SWF") {
                    if (asset.swfContext) {
                        return asset.swfContext.width + 'X' + asset.swfContext.height;
                    }
                } else if (asset.imageContext) {
                    return asset.imageContext.width + 'X' + asset.imageContext.height;
                }
                return "";
            }
        }

        function placeholderFunc() {
            console.log("Function not implemented yet");
            mmAlertService.addWarning("Function not implemented yet.");
        }

        var entityWatcher = $scope.$watch('$parent.mainEntity', function(newValue, oldValue) {
            updateState();
        });

        $scope.$on('$destroy', function() {
            $scope.asset = null;
            if (entityWatcher) entityWatcher();
        });

    }
]);
