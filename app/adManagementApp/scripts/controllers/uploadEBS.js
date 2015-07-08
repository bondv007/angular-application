/**
 * Created by atdg on 6/20/2014.
 */
'use strict';
app.controller('uploadEBSCtrl', ['$scope', '$modal', '$modalInstance', 'FileUploader', '$rootScope', 'adService' , 'enums', 'mmSession', 'assetService', 'EC2Restangular', 'mmAlertService', 'adDetailsForUpload', 'assetsLibraryService',
  function ($scope, $modal, $modalInstance, FileUploader, $rootScope, adService, enums, session, assetService, EC2Restangular, mmAlertService, adDetailsForUpload, assetsLibraryService) {

    // create a uploader with options
    var assetUploadUrl = assetService.getAssetUploadUrl();
    var serverGetFolders = EC2Restangular.all('assetMgmt/folders');
    var lastAuthorization = session.get('Authorization', 'test default');
    $scope.IsSingleFileUpload = adDetailsForUpload['isSingleFileUpload'];
    var uploader = $scope.uploader = new FileUploader({
      scope: $scope,
      url: assetUploadUrl,
      headers: {
        'Authorization': lastAuthorization
      }
    });
    //$scope.tempResourcePath = assetService.getTempResourceUrl();
    //$scope.multipleValues = "Multiple Values";

    //$scope.selectAssetList = [];
    //$scope.isSelectFiles = false;

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
    $scope.foldersData = [];

    function processError(error) {
      console.log("ERROR: " + JSON.stringify(error));
      mmAlertService.addError(JSON.stringify(error));
    }

    $scope.adFormats = enums.adFormats;
    $scope.filebrowseCssClass = 'col-sm-12';
    $scope.ShowProgressContainer = false;
    $scope.showDropzone = true;
    $scope.ShowUploadControl = true;

    $scope.IsEditAllFilesMeta = true;
    $scope.IsEditSingleFileMeta = true;

    $scope.IsUploadCompleted = false;
    $scope.IsUploadCancelled = false;
    $scope.IsAssetAttached = false;
    $scope.fileName = uploader.queue.length > 0 ? uploader.queue[uploader.queue.length - 1].file.name : '';
    $scope.cssClass = [];
    $scope.showTree = false;
    $scope.destinationLocationTree = {};
    $scope.searchImageText = '';
    $scope.showAttachImageBtn = false;
    $scope.selectedIndex = "";
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

    function extendFolderProperties(folder) {
      var viewModel = {
        parent: folder.parentId == null ? "#" : folder.parentId,
        text: folder.name
      };
      _.extend(folder, viewModel);
      return folder;
    }

    function getFolders() {
      console.log("getting folders");
      serverGetFolders.getList().then(function (result) {
        console.log("folders", result);
        if (result.length > 0) {
          var cleanFolders = [];
          var names = [];
          for (var i = 0; i < result.length; i++) {
            var res = result[i];
            var cont = true;
            for (var j = 0; j < names.length; j++) {
              if (names[j] == res.name) cont = false;
            }

            if (cont && res.name != "Test Asset Folder") {
              names.push(res.name);
              var f = {name: res.name, id: res.id, parentId: res.parentId, rootParentId: res.rootParentId, folders: res.folders, files: res.files, type: res.folderType};
              cleanFolders.push(f);
            }
          }
          $scope.foldersData.length = 0;
          var folders = assetsLibraryService.addRootFolder(cleanFolders);
          $scope.foldersData = folders;
          if (typeof folders != "undefined" && folders.length > 0) {
            _.forEach(folders, function (d, i) {
              $scope.foldersData.push(extendFolderProperties(d));
              var folderValues = { id: d.id, parent: d.parent, text: d.text, type: d.type, state: {selected: d.state != null ? d.state.selected : false, opened: d.state != null ? d.state.opened : false}};
              $scope.foldersData.push(folderValues);

            });
          }
          //init selected folder
          $scope.selectedFolder = {name: $scope.foldersData[0].name, id: $scope.foldersData[0].id};
          $rootScope.selectedDestinationFolder = $scope.foldersData[0].name;
          $scope.selectedParentId = $scope.foldersData[0].id;
        } else {
          mmAlertService.addError("Error retrieving folders.");
        }
      }, function (error) {
        mmAlertService.addError("Error retrieving folders.");
      });
    }
    getFolders();

    function selectTreeNode(data) {
//      console.log("selected folder info - select tree node", data);
      if (data == "")
        return;
      //$rootScope.selectedDestinationFolder = data;
      $rootScope.selectedDestinationFolder = data.id;

      if (!$scope.ShowProgressContainer) {
        $scope.selectedFolder = {name: data.name, id: data.id};
      }
      if ($scope.changeFolderOfAllAssets) {
        if ($scope.metadataInfoList.length > 0) {
          //$scope.selectedFolder = data;
          $scope.selectedFolder = {name: data.name, id: data.id};
          for (var i = 0; i < $scope.metadataInfoList.length; i++) {
            var asset = $scope.metadataInfoList[i];
            //asset.destinationFolder = data;
            asset.folderId = data.id;
          }
        }
      }
      else {
        if ($scope.metadataInfoList.length > 0) {
          var asset = $scope.metadataInfoList[$scope.indexOfAsset];
          //asset.destinationFolder = data;
          asset.folderId = data.id;
        }
      }
      if ($scope.metadataInfoList.length > 0 && !$scope.changeFolderOfAllAssets) {
        var folderArray = [];
        for (var i = 0; i < $scope.metadataInfoList.length; i++) {
          var asset = $scope.metadataInfoList[i];
          //folderArray.push(asset.destinationFolder);
          folderArray.push(asset.folderId);
        }
        var allDestinationPathsEqual = $scope.AllValuesEqualInArray(folderArray);
        if (allDestinationPathsEqual) {
          $scope.selectedFolder = {name: folderArray[0].name, id: folderArray[0].id};
          //$scope.selectedFolder = folderArray[0];
        }
      }
    }

    /*		$scope.$on("SelectTreeNode", function (event, data) {
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

     });*/

    $scope.allFileMetaObj = {
      advertiser: '',
      brand: '',
      agency: '',
      campaignName: ''
    };

    /*function doEmptyAllFileMetaObj() {

     $scope.IsEditAllFilesMeta = true;
     $scope.IsEditSingleFileMeta = true;

     $scope.allFileMetaObj.advertiser = '';
     $scope.allFileMetaObj.brand = '';
     $scope.allFileMetaObj.agency = '';
     $scope.allFileMetaObj.campaignName = '';
     }*/

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
        return 'disabled';
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

    /*$scope.IsEmptyAllFilesMeta = function () {

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
     //console.log($scope.metadataInfoList[i].isUploaded);

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

     };*/

    $scope.assetMetadata = {
      destinationFolder: "",
      displayName: "",
      imageName: "",
      isUploaded: false
    };

    /*$scope.getDestinationFolder = function (assetId) {
     console.log("getting destination folder for asset - id ", assetId);
     var destination = $scope.findByAssetId(assetId);
     if (destination == "") {
     return '';
     }

     return destination;
     };*/

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

    /*$scope.findFolderByAssetId = function (assetId) {
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
     }*/

    $scope.prepareAssetMetadata = function () {

      $scope.previouslyUploadedItemslastIndex2 = $scope.previouslyUploadedItemslastIndex;

      for (var i = $scope.previouslyUploadedItemslastIndex; i < uploader.queue.length; i++) {
        $scope.metadataInfoList.push({
          assetId: uploader.queue[i].assetId,
          imageName: uploader.queue[i].file.name,
          folderId: ( $scope.selectedFolder.id !== '') ? $scope.selectedFolder.id : "1",
          displayName: uploader.queue[i].file.name,
          isUploaded: $scope.assetMetadata.isUploaded
        });
        //console.log("metadata", $scope.assetMetadata);
        //console.log("meta list", $scope.metadataInfoList);
      }

      $scope.previouslyUploadedItemslastIndex = uploader.queue.length;
    };

    /*$scope.selectRow = function (row, image) {
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
     };*/

    $scope.removeAssetFromList = function (item) {
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
          if (ids > -1) {
            $scope.selectedRows.splice(ids, 1);
          }
        }

        removeAssetFromServer(item);

        if (uploader.queue.length === 0) {
          $('.ebsFileErrorInfo').hide('fast');
          $scope.ShowProgressContainer = false;
          $scope.ShowUploadControl = true;
          //$scope.showDropzone = true;
        }
      }
      return {};
    }

    var removeAssetFromServer = function (asset) {
      if (!asset.isError && asset.isUploaded && typeof asset.correlationId != "undefined") {
        var promise = assetService.deleteAssetById(asset.correlationId);
        promise.then(function (returnData) {
          console.log(returnData);
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
        //$scope.metadataInfoList[$scope.indexOfAsset].destinationFolder = $scope.destinationLocationTree.currentNode.label;
        $scope.metadataInfoList[$scope.indexOfAsset].folderId = $scope.destinationLocationTree.currentNode.label;
      }
    };

    $scope.uploadImage = function () {
      $scope.IsUploadCompleted = false;

      $scope.ShowProgressContainer = true;
      $scope.disabledDestinationFolder = true;
      $scope.ShowUploadControl = false;

      var currentFolder = '';

      if ($scope.storeCurrentNode()) {
        currentFolder = $scope.storeCurrentNode();
      }
      else if ($scope.selectedFolder != "") {
        currentFolder = $scope.selectedFolder;
      }

      if (currentFolder != "") {
        for (var i = $scope.previouslyUploadedItemslastIndex2 + 1; i < $scope.metadataInfoList.length; i++) {
          $scope.metadataInfoList[i].folderId = $scope.selectedFolder;
        }
      }
    };

    $scope.startUploading = function () {

      var isMetaDataPropertiesEmpty = false;
      $('.singleFileErrorInfo').hide('fast');
      if ($scope.VerifyAssetHasDestinationFolder()) {
        $scope.queueIndex = 0;
        uploader.uploadAll();
      }
    };

    $scope.VerifyAssetHasDestinationFolder = function () {
      var isValid = true;
      if ($scope.selectedFolder == "") {
        for (var i = 0; i < $scope.metadataInfoList.length; i++) {
          //var destinationFolder = $scope.metadataInfoList[i].destinationFolder;
          var folderId = $scope.metadataInfoList[i].folderId;
          if (typeof folderId === "undefined") {
            mmAlertService.addError("Please make sure all assets have a destination folder selected.");
            isValid = false;
            break;
          }
        }
      }
      else {
        for (var i = 0; i < $scope.metadataInfoList.length; i++) {
          var folderId = $scope.metadataInfoList[i].folderId;
          if (typeof folderId === "undefined") {
            $scope.metadataInfoList[i].folderId = $scope.selectedFolder;
          }
        }
      }
      return isValid;
    };

    $scope.verifyAssetHasValidFolder = function () {
      var isValid = true;
      for (var i = 0; i < $scope.metadataInfoList.length; i++) {
        var folderId = $scope.metadataInfoList[i].folderId;
        /*if (folderId === "1" || typeof folderId === "") {
         mmAlertService.addError("Please make sure all assets have a valid folder selected.");
         isValid = false;
         break;
         }*/
        //set folder id empty if root folder selected
        if (folderId === "1" ) {
          $scope.metadataInfoList[i].folderId == "";
        }
      }
      return isValid;
    };

    $scope.removeImage = function () {
      $scope.ShowProgressContainer = false;
      //$scope.ShowUploadControl = true;
      $scope.showDropzone = true;
      uploader.clearQueue()
    };

    $scope.back = function () {
      this.removeImage();
    };

    $scope.persistAssetMetaData = function () {
      $rootScope.uploadedAssets = $scope.metadataInfoList;
    };

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
          var confirmModal = window.confirm("Are you sure you want to close the bundle import tool?");
          if (!confirmModal) {
            return false;
          }
          else {
            $scope.FlushObjects();
          }
        }
      }

      $modalInstance.dismiss('cancel');
      $rootScope.$broadcast("hideFlyoutProgress");
    };

    $scope.saveAdName = function (item) {
      console.info("saving ad name", item);
      item.isSaving = true;
    };

    // ADDING UPLOAD FILTERS
    /*uploader.filters.push({
     name: 'filterFileType',
     fn: function (item, options) {
     var ext = item.name.substring(item.name.lastIndexOf('.') + 1);
     return !uploader.isHTML5 ? true : /(ebs)$/.test(ext);
     }
     });*/

    // REGISTER HANDLERS

    //uploader.bind('afteraddingfile', function (event, item) {
    uploader.onAfterAddingFile = function (item) {
      //console.info('After adding file', item);
      $scope.IsUploadCompleted = false;
      $scope.IsUploadCancelled = false;
      item.hasAdNameError = false;

      if (item.file.name.indexOf('.ebs') === -1) {
        /*toaster.pop("error", "Only EBS files may be imported.");
         $('.ebsFileErrorInfo').show('fast');*/
        mmAlertService.addWarning('Only EBS files may be imported.');
        item.remove();
        $scope.removeAssetFromList(item);
        return false;
      }

      item.assetId = $scope.getUniqueId();
      if (uploader.queue.length == 1 || ($scope.ShowProgressContainer)) {
        if ($scope.IsSingleFileUpload) {
          uploader.queue.length !== 1 && uploader.queue.pop(); // only one file in the queue
        }
      }

      $scope.prepareAssetMetadata();
      $scope.showDropzone = false;
      $scope.uploadImage();

      $scope.IsAssetAttached = true;
    };

    uploader.onWhenAddingFileFailed = function (item, filter, options) {
      //console.info('When adding a file failed', item);
      /*if (filter.name==='queueLimit') {
       if (uploader.queue.length === 1)
       mmAlertService.addWarning('Only a single file is allowed to be uploaded.');
       } else if (filter.name==='filterFileType') {
       mmAlertService.addWarning('Please select another file (unsupported file type).');
       }*/
    };

    uploader.onAfterAddingAll = function (item) {
      //console.info('After adding all files', items);
      $scope.IsUploadCompleted = false;
      $scope.IsUploadCancelled = false;
      $scope.IsAssetAttached = true;
      $scope.startUploading();
      //doEmptyAllFileMetaObj();
    };

    uploader.onBeforeUploadItem = function (item) {
      //$scope.queueIndex = uploader.queue.length > 0 ? uploader.getIndexOfItem(item) + 1 : 0;
      $scope.startIndex = uploader.queue.length > 0 ? uploader.getIndexOfItem(item) + 1 : 0;
      console.info('Before upload', item, $scope.startIndex);
      $scope.IsUploadCompleted = false;
    };

    uploader.onProgressItem = function (item, progress) {
      //console.info('Progress: ' + progress, item);
    };

    uploader.onSuccessItem = function (item, response, status, headers) {
      //console.info('Success', status, item, response);
      $scope.queueIndex = uploader.queue.length > 0 ? uploader.getIndexOfItem(item) + 1 : 0;
      $scope.isUploadError = false;
      //if (xhr.status === 200) {
      var clean = response.files.split("\"ads\":\"[{").join("\"ads\":[{");
      clean = clean.split("}]\"}]").join("}]}]");
      var rep = JSON.parse(clean);
      var correlationId = rep[0].correlationId;
      var assetMetadata = $scope.findAssetByAssetId(item.assetId);
      assetMetadata.correlationId = rep[0].correlationId;
      if (rep[0].ads.length > 0) {
        item.adId = typeof typeof rep[0].ads[0].id != "undefined" ? rep[0].ads[0].id : "unknown";
        item.adName = typeof rep[0].ads[0].fileName != "undefined" ? rep[0].ads[0].fileName : "unknown";
      } else {
        item.adId = "unknown";
        item.adName = "unknown";
      }
      item.hasAdNameError = typeof rep[0].hasAdNameError != "undefined" ? rep[0].hasAdNameError : false;
      item.hasAdNameErrorMsg = typeof rep[0].hasAdNameErrorMsg != "undefined" ? rep[0].hasAdNameErrorMsg : "An ad with the same name already exists. Your ad name has been updated to be unique. Please update the name if needed.";
      //	}
    };

    uploader.onCancelItem = function (item, response, status, headers) {
      //console.info('Cancel', status, item);
      mmAlertService.addWarning('Canceling upload of ' + item.file.name);
    };

    uploader.onErrorItem = function (item, response, status, headers) {
      //console.info('Error', xhr, item, response);
      $scope.isUploadError = true;
      mmAlertService.addError("Unable to complete upload of file.");
    };

    uploader.onCompleteItem = function (item, response, status, headers) {
      //console.info('Complete', xhr, item, response);
    };

    uploader.onProgressAll = function (progress) {
      //console.info('Total progress: ' + progress);
      $rootScope.$broadcast("uploaderProgress", uploader);
    };

    uploader.onCompleteAll = function () {
      //console.info('Complete all', items);
      $scope.IsUploadCompleted = true;
      mmAlertService.addSuccess("Upload completed successfully.");
      //doEmptyAllFileMetaObj();
    };

    // Treeview initialization
    $scope.showTreeControl = function () {
      if (uploader.isUploaded) {
        mmAlertService.addError("You can not change folder location of uploaded assets", "");
      }
      else if (uploader.isUploading) {
        mmAlertService.addError("You can not change folder location as uploading assets is in progress", "");
      }
      else {
        $scope.data = $scope.foldersData;
        $scope.changeFolderOfAllAssets = true;
        var modalInstance = $modal.open({
          templateUrl: './adManagementApp/views/destinationModal.html',
          controller: 'DestinationCtrl',
          backdrop: 'static',
          scope: $scope
        });
        modalInstance.result.then(function (selectedFolder) {
          //ok
          selectTreeNode(selectedFolder);
        }, function () {
          //cancel
        });
      }
    };

     $scope.storeCurrentNode = function () {
      if ($scope.destinationLocationTree.currentNode) {
        //$scope.selectedFolder = $scope.destinationLocationTree.currentNode.label;
        $scope.selectedFolder = {name: $scope.destinationLocationTree.currentNode.label, id: $scope.destinationLocationTree.currentNode.id};
        if (uploader.queue.length > 0) {
          if ($scope.IsSingleFileUpload) {
            uploader.queue.length !== 1 && uploader.queue.pop(); // only one file in the queue
          }
        }
      }
      return $scope.selectedFolder;
    };

    $scope.removeSelectedImages = function () {
      $scope.itemAssets = {selectedItems: []};
    };

    $scope.flyLayout = function () {
      $rootScope.$broadcast("minimizePopup", uploader);
    };

    //to check all values are same in array
    $scope.AllValuesEqualInArray = function (array) {
      return !array.some(function (value, index, array) {
        return value !== array[0];
      });
    }

    $scope.isMultipleAssetsSelected = function () {
      return $scope.selectedRows.length > 1;
    };

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
//      $scope.selectedFolder = '';
//      $scope.assetMetadata = {};
//      $rootScope.selectedDestinationFolder = '';
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
        //uploader.queue = [];
        //$scope.FlushObjects();
        uploader.cancelAll();
      }

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

    /*$scope.dontHighLightRow = function () {
     $rootScope.isFolderLinkClicked = true;
     };*/

//		$scope.closeModal = function () {
//			var modalInstance = $modal.open({
//				templateUrl: './adManagementApp/views/closeUploadAssetModal.html',
//				controller: 'closeUploadAssetModalCtrl'
//			});
//      modalInstance.result.then(function (result) {
//        //close
//        uploader.cancelAll();
//        $modalInstance.dismiss('cancel');
//      }, function () {
//        //cancel
//      });
//		};
    $scope.closeModal = function () {
      uploader.cancelAll();
      if (saveMetaDataOnModalClose()) {
        $modalInstance.dismiss('cancel');
      }
    };

//		$scope.$on("DismissModal", function (event, data) {
//			uploader.cancelAll();
//			$modalInstance.dismiss('cancel');
//		});

    $scope.getFileTypeIcon = function (file) {
      var type = file.type;
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

    $scope.getFolderName = function (folderid) {
      if (folderid == "" || folderid == "1") {
        return "My Assets";
      } else {
        var folderMatch = _.findWhere($scope.foldersData, {id: folderid});
        return folderMatch.name;
      }
    };

    $scope.$watch("metadataInfoList", function () {
      for (var i = 0; i < $scope.metadataInfoList.length; i++) {
        var asset = $scope.metadataInfoList[i];
        if (!asset.isUploaded && typeof asset.correlationId == "undefined") {
          for (var index = 0; index < uploader.queue.length; index++) {
            var item = uploader.queue[index];
            if (asset.assetId == item.assetId) {
              item.destinationFolder = $scope.getFolderName(asset.folderId);
              item.icon = $scope.getFileTypeIcon(item.file);
              break;
            }
          }
        }
      }
    }, true);

    var saveMetaDataOnModalClose = function () {
      var isSuccessfullySaved = true;
      if (typeof $scope.metadataInfoList != "undefined" && $scope.metadataInfoList.length > 0) {
        if ($scope.IsSingleFileUpload) {
          //if ($scope.metadataInfoList[0].destinationFolder == "") {
          /*if ($scope.metadataInfoList[0].folderId == "") {
           mmAlertService.addError("Please make sure your asset has a destination folder selected.");
           isSuccessfullySaved = false;
           return isSuccessfullySaved;
           }*/
          /*remove folder ID if it is not valid = top node*/
          if ($scope.metadataInfoList[0].folderId == "1" || $scope.metadataInfoList[0].folderId == "undefined"  ) {
            $scope.metadataInfoList[0].folderId == ""
          }
        }
        else {
          /*if (!$scope.VerifyAssetHasDestinationFolder()) {
           isSuccessfullySaved = false;
           return isSuccessfullySaved;
           }*/
          if (!$scope.verifyAssetHasValidFolder()) {
            isSuccessfullySaved = false;
            return isSuccessfullySaved;
          }
        }
        for (var i = 0; i < $scope.metadataInfoList.length; i++) {
          var asset = $scope.metadataInfoList[i];
          if (asset.isUploaded && typeof asset.correlationId != "undefined") {
            //Assign asset to folder
            if ($scope.isAssetLibrary) {
              asset.type = "Asset";
            }
            var data = angular.copy(asset);
            if (data.folderId == "1" || typeof data.folderId === "undefined") {
              data.folderId = "";
            }
            delete data.assetId;
            delete data.isUploaded;
            //use ec2AMSRestangular until we fix backend issue
            assetService.postAssetMetaData(data, asset.correlationId).then(function (returnData) {
              console.log("metadata save on close - success", returnData);
            }, function (response) {
              // error
              console.log("metadata save on close - error", response);
            });
          }
        }
      }
      return isSuccessfullySaved;
    }

  }
]);