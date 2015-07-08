/**
 * Created by atd on 4/28/2014.
 */

'use strict';
app.controller('DestinationCtrl', ['$rootScope', '$scope', '$modalInstance', '$timeout', 'assetsLibraryService', 'mmAlertService', 'EC2Restangular',
    function($rootScope, $scope, $modalInstance, $timeout, assetsLibraryService, mmAlertService, EC2Restangular) {

        $scope.treeId = "dvTreeView";
        $scope.foldersToAdd = [];
        $timeout(function() {
            //add modal backdrop
            var mainParent = $(".select-file-dest").parent().parent();
            mainParent.before("<div id='destbackdrop' ng-style='{'z-index': 1040 + index*10}' ng-class='{in: animate}' class='modal-backdrop fade in' modal-backdrop='' style='z-index: 1050;'></div>")
                //$(".folder-search-area").mCustomScrollbar();
            mainParent.css({
                "margin-top": "31px",
                "width": "630px"
            });
            //$(".select-file-dest .expanded").parent().find("div[data-tree-model] ul li:first-child").css("margin-top", "10px");
            //$(".select-file-dest #mCSB_1_dragger_vertical").css({"right": "-5px"});
        }, 20);

        $scope.renameNode = function(nodeData) {
            //console.log("renameNode : nodeData", nodeData);
        };

        $scope.newNode = function(parentId) {

            console.log("newNode : parentId", parentId);
            var folder = {
                "tileType": "AssetFolder",
                "clientRefId": null,
                "folderType": "DEFAULT",
                "name": "New Folder",
                "parentId": parentId,
                "rootParentId": 1
            };
            if (typeof parentId != "undefined") {
                $('#dvTreeView').jstree('create_node', parentId, {
                    "type": "FOLDER",
                    "name": "New Folder"
                });
            }
        };

        $scope.newNodeHandler = function(nodeData) {
            console.log("newNode handler called : nodeData", nodeData);
            var newItem = nodeData.node;
            if (newItem) {
                $('#dvTreeView').jstree('edit', newItem, "Enter a folder name");
            }
            $scope.foldersToAdd.push(newItem);
        }


        $scope.selectedNode = function(nodeData) {
            console.log("select a new folder", nodeData.node);
            //$scope.selectedFolder = nodeData.node.text;
            $scope.selectedFolder = {
                name: nodeData.node.text,
                id: nodeData.node.id
            };

            if ($scope.isAssetLibrary) {
                /*$('#' + $scope.selectedParentId + '_anchor').removeClass('jstree-clicked');
                $scope.selectedNodeHandler(nodeData);
                $('#' + nodeData.node.id + '_anchor').addClass('jstree-clicked');
                $scope.selectedParentId = nodeData.node.id;
                */
            }
        };

        /*$scope.storeCurrentNode = function () {

          if ($scope.destinationLocationTree.currentNode) {
            //$scope.selectedFolder = $scope.destinationLocationTree.currentNode.label;
            $scope.selectedFolder = {name: $scope.destinationLocationTree.currentNode.label, id: $scope.destinationLocationTree.currentNode.id };
            //$rootScope.destinationSelectedNode = $scope.destinationLocationTree.currentNode;
          }
          return $scope.selectedFolder;
        };*/

        $scope.ok = function() {
            var foldersList = _.map($scope.data, function(x) {
                return {
                    id: x.id,
                    parentId: x.parent,
                    name: x.text
                }
            });
            var duplicateFolders = _.chain($scope.foldersToAdd).filter(function(x) {
                return assetsLibraryService.isFolderNameAlreadyExists(foldersList, x.text, null, x.type, x.parent)
            }).map(function(x) {
                return x.text;
            }).value();

            if (duplicateFolders.length == 1) {
                mmAlertService.addError('folder ' + duplicateFolders.join(',') + ' already exists.  Please choose a different name.');
                return false;
            }
            if (duplicateFolders.length > 1) {
                mmAlertService.addError('folders ' + duplicateFolders.join(',') + ' already exist.  Please choose different names.');
                return false;
            }
            var count = 0;
            $rootScope.isFolderLinkClicked = false;
            if ($scope.foldersToAdd.length > 0) {
                for (var i = 0; i < $scope.foldersToAdd.length; i++) {
                    var newFoldereId;
                    var newFolder = $scope.foldersToAdd[i];
                    if (newFolder.type == "DEFAULT") {
                        if (assetsLibraryService.isFolderNameAlreadyExists($scope.data, newFolder.text, null, newFolder.type)) {
                            mmAlertService.addError(newFolder.type.toLowerCase() + ' with this name already exists.  Please choose another name.');
                            return false;
                        }
                    }
                    var serverUpdateFolderPath = 'assetMgmt/folders/';
                    var saveItem = EC2Restangular.all(serverUpdateFolderPath);
                    var folder = {
                        "_type": "AssetFolder",
                        "folderType": 0,
                        "name": newFolder.text,
                        "parentId": newFolder.parent,
                        "rootParentId": null
                    };
                    saveItem.customPOST(folder).then(function(result) {

                        mmAlertService.addSuccess('Folder created successfully.');
                        $modalInstance.close(result[0]);

                    }, function(error) {
                        mmAlertService.addError('Server error creating new folder. Please trying again later.');
                    })
                }
            } else {
                $modalInstance.close($scope.selectedFolder);
            }
        };

        $scope.cancel = function() {
            $rootScope.isFolderLinkClicked = false;
            $modalInstance.dismiss('cancel');
        };
        if ($scope.data) {

            var foldersData = [];
            _.forEach($scope.data, function(d, i) {
                var fdat = {};
                fdat.id = d.id;
                fdat.parent = d.parent;
                fdat.text = d.text;
                fdat.type = d.type;
                fdat.state = {
                    selected: d.state != null ? d.state.selected : false,
                    opened: d.state != null ? d.state.opened : false
                };

                foldersData.push(fdat);
            });

            $scope.data = foldersData;
            $scope.newFolders = [];

            if (!$scope.selectedFolder)
                $scope.selectedFolder = {
                    id: $scope.data[0].id,
                    name: $scope.data[0].text
                };

        } else {
            $scope.selectedFolder = {
                name: '',
                id: ''
            };

        }
    }
]);
