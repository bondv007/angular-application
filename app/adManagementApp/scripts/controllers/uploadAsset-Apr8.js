/**
 * Created by atdg on 3/27/2014.
 */
'use strict';
app.controller('uploadAssetCtrl', ['$scope', '$modalInstance', '$fileUploader', '$rootScope', 'configuration','adService', function ($scope, $modalInstance, $fileUploader, $rootScope, configuration,adService) {

    $scope.tempResourcePath = configuration.resource;
    // create a uploader with options
    var uploader = $scope.uploader = $fileUploader.create({
        scope: $scope,                          // to automatically update the html. Default: $rootScope
        url: '/',                                //Give service url here to save assets
        formData: [
            { key: 'value' }
        ],
        filters: [
            function (item) {                    // first user filter
                console.info('filter1');
                return true;
            }
        ]
    });

    $scope.imageList=[
        {imageSrc:$scope.tempResourcePath+'image.jpg',description:'This is image 1',id:'1',size:'12kb'},
        {imageSrc:$scope.tempResourcePath+'image.jpg',description:'Image2',id:'2',size:'12kb'},
        {imageSrc:$scope.tempResourcePath+'image.jpg',description:'Image3',id:'3',size:'120kb'},
        {imageSrc:$scope.tempResourcePath+'image.jpg',description:'Image4',id:'4',size:'10kb'},
        {imageSrc:$scope.tempResourcePath+'image.jpg',description:'Image5',id:'5',size:'18kb'},
        {imageSrc:$scope.tempResourcePath+'image.jpg',description:'Image6',id:'6',size:'20kb'}
    ];

    $scope.adFormats = adService.getAdFormats();
    $scope.filebrowseCssClass = 'col-sm-12';
    $scope.ShowProgressContainer = false;
    $scope.ShowUploadControl = true;
    $scope.IsSingleFileUpload = $rootScope.IsSingleFileUpload;
    $scope.rowColor = "whiteColor";
    $scope.fileName = uploader.queue.length > 0 ? uploader.queue[uploader.queue.length - 1].file.name : '';
    $scope.cssClass = [];
    $scope.showTree = false;
    $scope.destinationLocationTree = {};
    $scope.selectedFolder = '';
    $scope.searchImageText='';
    $scope.showAttachImageBtn=false;
    $scope.selectedImages=[];
    $scope.selectedImageCssClass='whiteColor';

    $scope.itemsInUploader = uploader.queue;

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.$watchCollection('itemsInUploader', function () {
        $scope.fileName = uploader.queue.length > 0 ? uploader.queue[0].file.name : '';
    });

    $scope.highlightRow = function (file, index) {
        if (file) {
            $scope.fileName = file.name;
            $scope.cssClass.splice(index, 0, "greyColor");
        }
        return $scope.fileName;
    };

    $scope.uploadImage = function () {
        if ($scope.destinationLocationTree.currentNode && $scope.selectedFolder!='') {
            $scope.ShowProgressContainer = true;
            $scope.ShowUploadControl = false;
            /*cfw - check queue*/
            var uploadList = uploader.queue;
            console.log("queue items", uploadList);
            uploader.uploadAll();
        }
        else {
            alert("Please choose destination location");
        }
    };

    $scope.removeImage = function () {
        $scope.ShowProgressContainer = false;
        $scope.ShowUploadControl = true;
        uploader.clearQueue()
    };

    $scope.back = function () {
        this.removeImage();
    };

    $scope.closePopup = function () {
        $modalInstance.dismiss('cancel');
    };

    // ADDING FILTERS

    uploader.filters.push(function (item) { // second user filter
        console.info('filter2');
        return true;
    });

    // REGISTER HANDLERS

    uploader.bind('afteraddingfile', function (event, item) {
        console.info('After adding a file', item);
        if ($scope.IsSingleFileUpload) {
            uploader.queue.length !== 1 && uploader.queue.pop(); // only one file in the queue
        }
    });

    uploader.bind('whenaddingfilefailed', function (event, item) {
        console.info('When adding a file failed', item);
    });

    uploader.bind('afteraddingall', function (event, items) {
        console.info('After adding all files', items);
    });

    uploader.bind('beforeupload', function (event, item) {
        console.info('Before upload', item);
    });

    uploader.bind('progress', function (event, item, progress) {
        console.info('Progress: ' + progress, item);
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
    });

    uploader.bind('progressall', function (event, progress) {
        console.info('Total progress: ' + progress);
    });

    uploader.bind('completeall', function (event, items) {
        console.info('Complete all', items);
    });

    // Treeview initialization

    //test tree model
    $scope.roleList = [
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

    $scope.showTreeControl = function () {
        $scope.filebrowseCssClass = 'col-sm-6';
        $scope.showTree = true;
    };

    $scope.storeCurrentNode = function () {
        if ($scope.destinationLocationTree.currentNode) {
            $scope.selectedFolder = $scope.destinationLocationTree.currentNode.label;
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

    $scope.attachImagesToAd=function(){
        alert("images attached successfully");
    }

}]);

